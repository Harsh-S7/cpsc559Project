require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocketServer = require('ws').Server;
const Y = require('yjs');
const { MongodbPersistence } = require('y-mongodb-provider');
const { setPersistence, setupWSConnection } = require('./websocket/utils.js');

// Create an instance of Express
const app = express();

// Use Express to handle JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a simple API endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Create an HTTP server and pass the Express app
const server = http.createServer(app);

// Existing code for WebSocket server setup
const wss = new WebSocketServer({ server });
wss.on('connection', setupWSConnection);

// y-mongodb-provider setup
if (!process.env.MONGO_URL) {
  throw new Error('Please define the MONGO_URL environment variable');
}

const mdb = new MongodbPersistence(process.env.MONGO_URL, {
collectionName: 'documents',
  flushSize: 100,
  multipleCollections: false,
});

setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc);
    mdb.storeUpdate(docName, newUpdates);
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
    ydoc.on('update', async (update) => {
      mdb.storeUpdate(docName, update);
    });
  },
  writeState: () => {
    return new Promise((resolve) => {
      resolve(true);
    });
  },
});

// Server listening setup, now including Express routes and WebSocket server
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
