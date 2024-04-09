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
let primaryServerUrl: string = '';
// Primary server user URL
const primaryServerUserUrl = process.env.PRIMARY_SERVER_USER_URL || 'http://localhost:3003';
let actualWebSocket: WebSocket;

// Function to create a WebSocket connection to the primary or secondary server
const connectToWebSocketServer = (documentNumber: string, ws: WebSocket) => {

  if (primaryServerUrl == '') {
    console.log('Primary server not set');
  }
  else {
    console.log('Primary server set:', primaryServerUrl);
  }
  if (!actualWebSocket) {
    console.log("NEW SERVER WEBSOCKET IS CREATED")
    actualWebSocket = new WebSocket(`${primaryServerUrl}/${documentNumber}`);
  }

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
    actualWebSocket.close();
    // If the primary server fails, try connecting to the secondary server
    console.log('Trying again server...');
    connectToWebSocketServer(documentNumber, ws);
  });

  actualWebSocket.on('close', () => {
    console.log(`[Server] Disconnected from actual WebSocket server for document number ${documentNumber}`);
  });

};

wsApp.ws('/:documentNumber', (ws: WebSocket, req: Request) => {
  const documentNumber = req.params.documentNumber;

  // Create a WebSocket connection to the primary server
  connectToWebSocketServer(documentNumber, ws);

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

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  console.log(req.originalUrl)
  console.log('Proxying request to primary server...');
  proxyMiddleware(req, res, next);
}, cors());

app.get("/server-down", (req: Request, res: Response) => {
  res.status(500).send("Servers are down");
});

app.post("/primary-update", (req: Request, res: Response) => {
  const primary = req.body.id;

  if (primary != primaryServerUrl) {
    primaryServerUrl = primary;
    console.log("PRIMARY SERVER UPDATED", primary);
    res.status(200).send('Primary server updated');
  }
  else {
    res.status(202).send('Primary server already set');
  }
});

app.listen(port, () => {
  console.log(`[proxy]: Proxy is running at http://proxy:${port}`);
});
