import express, { Express, Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import expressWs from 'express-ws';
import WebSocket from 'ws';
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const { app: wsApp } = expressWs(app);
let primaryServerUrl: string = '';
let primaryServerUserUrl: string = 'https://shaggy-symbols-laugh.loca.lt/';
let actualWebSocket: WebSocket;


// Map of Editor Server url to the corresponding User Server url
let serverUrlMap: Record<string, string> = {
  'https://wild-banks-rush.loca.lt/': 'https://shaggy-symbols-laugh.loca.lt/',
  'https://deep-tigers-push.loca.lt/': 'https://smooth-taxes-fold.loca.lt/',
  'https://good-moons-sniff.loca.lt/': 'https://huge-ads-act.loca.lt/',
};

// Function to create a WebSocket connection to the primary or secondary server
const connectToWebSocketServer = (documentNumber: string, ws: WebSocket) => {

  // Logging the primary server url
  if (primaryServerUrl == '') {
    console.log('Primary server not set');
  }
  else {
    console.log('Primary server set:', primaryServerUrl);
  }

  // If the WebSocket instance has not been created, create a new WebSocket connection with the primary url
  if (!actualWebSocket) {
    console.log("NEW SERVER WEBSOCKET IS CREATED")
    actualWebSocket = new WebSocket(`${primaryServerUrl}/${documentNumber}`);
  }

  // Handle WebSocket client events
  actualWebSocket.on('open', () => {
    console.log(`[Server] Connected to actual WebSocket server for document number ${documentNumber}`);
  });

  // Handle WebSocket message event
  actualWebSocket.on('message', (message: WebSocket.Data) => {
    console.log('[Server] Received message from actual WebSocket server:', message);
    // Forward the message to the client
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });

  // Handle WebSocket error event
  actualWebSocket.on('error', (error) => {
    console.error('WebSocket error:', error);
    actualWebSocket.close();
    // If the primary server fails, try connecting to the primary server
    console.log('Trying again server...');
    connectToWebSocketServer(documentNumber, ws);
  });

  // Handle WebSocket close event
  actualWebSocket.on('close', () => {
    console.log(`[Server] Disconnected from actual WebSocket server for document number ${documentNumber}`);
  });

};

wsApp.ws('/:documentNumber', (ws: WebSocket, req: Request) => {
  const documentNumber = req.params.documentNumber;

  // Create a WebSocket connection to the primary server
  connectToWebSocketServer(documentNumber, ws);

  // Handle WebSocket open event
  ws.on('open', () => {
    console.log(`[client] WebSocket connection opened for document number ${documentNumber}`);
    ws.send('WebSocket connection opened to proxy server');
  });

  // Forward messages received from the client to the actual WebSocket server
  ws.on('message', (message: WebSocket.Data) => {
    console.log('[client] Received message from client:', message);
    // Forward the message to the WebSocket server if the connection is open
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

  // Handle WebSocket error event
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
    proxyErrorHandler: function(err: Error, _, next) {
      console.error('Primary server error:', err);
      console.error('Current Server URL is:', primaryServerUserUrl)
      return next(err);
    }
  });
}

const proxyMiddleware = createProxy(primaryServerUserUrl);

/**
 * GET /api
 * Proxy the request to the primary User Server
 */
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  console.log(req.originalUrl)
  console.log('Proxying request to primary server...');
  proxyMiddleware(req, res, next);
}, cors());

/**
 * GET /server-down
 * Simulate the primary server being down
 */
app.get("/server-down", (_, res: Response) => {
  res.status(500).send("Servers are down");
});

/**
 * POST /primary-update
 * Receive the update the primary server url from the Editor Server
 */
app.post("/primary-update", (req: Request, res: Response) => {
  const primary = req.body.id;

  if (primary != primaryServerUrl) {
    primaryServerUrl = primary;
    primaryServerUserUrl = serverUrlMap[primaryServerUrl];
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
