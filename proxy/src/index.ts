// src/index.js
import express, { Express, Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;


app.use(express.json(), cors());
// Primary server URL
const primaryServerUrl = 'http://backend:3001';
// Secondary server URL
const secondaryServerUrl = 'http://backend:3002';


// Function to create a proxy middleware
function createProxy(target: string): RequestHandler {
  return proxy(target, {
    proxyReqPathResolver: async function(req: Request) {
      const param = req.params.endpoint;
      return `${target}/api/${param}`;
    },
    proxyErrorHandler: function(err, res, next) {
      console.error('Primary server error:', err);
      // If there's an error with the primary server, switch to the secondary server
      if (target === primaryServerUrl) {
        console.log('Switching to secondary server...');
        return createProxy(secondaryServerUrl)(res.req, res, next);
      }
      // If already switched to secondary and still error, proceed with error handling
      return next(err);
    }
  });
}

const proxyMiddleware = createProxy(primaryServerUrl);

app.use('/api/:endpoint', (req: Request, res: Response, next: NextFunction) => {
  proxyMiddleware(req, res, next);
},cors());

app.get("/server-down", (req: Request, res: Response) => {
  res.status(500).send("Servers are down");
});

app.listen(port, () => {
  console.log(`[proxy]: Proxy is running at http://backend:${port}`);
});
