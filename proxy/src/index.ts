// src/index.js
import express, { Express, Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;


app.use(express.json(), cors());
// Primary server URL
const primaryServerUrl = 'ws://backend:3001/';
// Secondary server URL
const secondaryServerUrl = 'ws://backend:3002';


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


// Function to create a WebSocket proxy middleware
const createWsProxy = (target: string) => {
  console.log('Creating WebSocket proxy to', target);
  return createProxyMiddleware({
    target,
    ws: true, // enable WebSocket proxy
    changeOrigin: true,
    onError: function(err, req, res) {
      console.error(`Error with ${target}:`, err);
      // If there's an error with the current server, switch to the secondary server
      proxyWsMiddleware = createWsProxy(secondaryServerUrl);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('WebSocket proxying failed');
    }
  });
}


// Proxy WebSocket connections
app.use('/', (req: Request, res: Response, next: NextFunction) => {
  console.log('Proxying WebSocket request to primary server...');
  proxyWsMiddleware(req, res, next);
}, cors());


app.use('/api/:endpoint', (req: Request, res: Response, next: NextFunction) => {
  console.log('Proxying request to primary server...');
  proxyMiddleware(req, res, next);
}, cors());

app.get("/server-down", (req: Request, res: Response) => {
  res.status(500).send("Servers are down");
});
// Create a WebSocket proxy middleware targeting the primary server initially
let proxyWsMiddleware = createWsProxy(primaryServerUrl);

app.listen(port, () => {
  console.log(`[proxy]: Proxy is running at http://proxy:${port}`);
});
