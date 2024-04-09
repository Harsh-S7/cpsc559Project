// src/index.js
import express, { Express, Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import expressWs from 'express-ws';
import WebSocket from 'ws';
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const { app: wsApp } = expressWs(app);
let webSocket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let  primaryServerUrl: string = '';
// Primary server user URL
const primaryServerUserUrl = 'http://localhost:3003';

// Function to create a WebSocket connection to the primary or secondary server
const connectToWebSocketServer = (documentNumber: string, ws: WebSocket) => {

  let actualWebSocket = new WebSocket(`${primaryServerUrl}/${documentNumber}`);

  // Handle WebSocket client events
  actualWebSocket.on('open', () => {
    console.log(`[Server] Connected to actual WebSocket server for document number ${documentNumber}`);
  });

  actualWebSocket.on('message', (message: WebSocket.Data) => {
    console.log('[Server] Received message from actual WebSocket server:', message);
    // Forward the message to the client
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });

  actualWebSocket.on('error', (error) => {
    console.error('WebSocket error:', error);
    // If the primary server fails, try connecting to the secondary server
    console.log('Trying again server...');
    connectToWebSocketServer(documentNumber, ws);
  });

  actualWebSocket.on('close', () => {
    console.log(`[Server] Disconnected from actual WebSocket server for document number ${documentNumber}`);
  });

  return actualWebSocket;
};

wsApp.ws('/:documentNumber', (ws: WebSocket, req: Request) => {
  const documentNumber = req.params.documentNumber;

  // Create a WebSocket connection to the primary server
  let actualWebSocket = connectToWebSocketServer(documentNumber, ws);
  console.log('actualWebSocket:', actualWebSocket);

  ws.on('open', () => {
    console.log(`[client] WebSocket connection opened for document number ${documentNumber}`);
    ws.send('WebSocket connection opened to proxy server');
  });

  // Forward messages received from the client to the actual WebSocket server
  ws.on('message', (message: WebSocket.Data) => {
    console.log('[client] Received message from client:', message);
    // Forward the message to the WebSocket server
    if (actualWebSocket.readyState === WebSocket.OPEN) {
      console.log('Forwarding message to actual WebSocket server:', message);
      actualWebSocket.send(message);
    }
    else {
      ws.send('WebSocket server is not connected. Please try again');
    }
  });

  // Handle WebSocket close event
  ws.on('close', () => {
    console.log(`[client] WebSocket connection closed for document number ${documentNumber}`);
  });

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});

app.use(express.json(), cors());


// Function to create a proxy middleware
function createProxy(target: string): RequestHandler {
  return proxy(target, {
    proxyReqPathResolver: async function(req: Request) {
      const param = req.originalUrl;;
      return `${target}${param}`;
    },
    proxyErrorHandler: function(err, res, next) {
      console.error('Primary server error:', err);
      // If already switched to secondary and still error, proceed with error handling
      return next(err);
    }
  });
}

const proxyMiddleware = createProxy(primaryServerUserUrl);

app.use('/api/:endpoint', (req: Request, res: Response, next: NextFunction) => {
  console.log(req.originalUrl)
  console.log('Proxying request to primary server...');
  proxyMiddleware(req, res, next);
}, cors());

app.get("/server-down", (req: Request, res: Response) => {
  res.status(500).send("Servers are down");
});

app.post("/primary-update", (req: Request, res: Response) => {
  const primary = req.body.id;

  if (primary) {
    primaryServerUrl = primary;
    res.status(200).send('Primary server updated');
  }
  else {
    res.status(400).send('Primary server URL not provided');
    throw new Error('Primary server URL not provided');
  }
});

app.listen(port, () => {
  console.log(`[proxy]: Proxy is running at http://proxy:${port}`);
});
