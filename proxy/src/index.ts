// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;



async function selectProxyHost() {
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
    return "http://localhost:3002/api/mstring";
  }
  console.log("Primary server is up");
  return "http://localhost:3001/api/mstring/";

}
app.use(express.json(), cors());

app.use("/api/mstring", cors(), proxy("http://localhost:3001/api/mstring", {
  proxyReqPathResolver: async function() {
    const response = await selectProxyHost();
    return response;
  }
}));


app.listen(port, () => {
  console.log(`[proxy]: Proxy is running at http://localhost:${port}`);
});
