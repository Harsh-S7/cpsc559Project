// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;



async function selectProxyHost(param:string) {
  console.log("Selecting proxy host");
  const response = await fetch("http://localhost:3001/api/mstring");
  if (!response.ok) {
    console.log("Primary server is down");
    // Refresh primary server.
    // redirect to secondary server
    const response = await fetch("http://localhost:3002/api/mstring");

    if (!response.ok) {
      // Both servers are down
      console.log("Both servers are down");
      return "http://localhost:3000/server-down";
    }
    console.log("Secondary server is up");
    return `http://localhost:3002/api/${param}`;
  }
  console.log("Primary server is up");
  return `http://localhost:3001/api/${param}`;

}
app.use(express.json(), cors());

app.use("/api/:endpoint", cors(), proxy("http://localhost:3001/api/", {
  proxyReqPathResolver: async function(req: Request ) {
    const param = req.params.endpoint; 
    const response = await selectProxyHost(param);
    return response;
  }
}));

app.listen(port, () => {
  console.log(`[proxy]: Proxy is running at http://localhost:${port}`);
});
