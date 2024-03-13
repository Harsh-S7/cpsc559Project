require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocketServer = require('ws').Server;
const Y = require('yjs');
const { MongodbPersistence } = require('y-mongodb-provider');
const { setPersistence, setupWSConnection } = require('../websocket/utils.js');

// Create an instance of Express
const app = express();

// API: login user, logout, share documents, getCurrentUsersDocuments

// Use Express to handle JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a simple API endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Create an HTTP server and pass the Express app
const server = http.createServer(app);

// BELOW IS SET UP THE YJS WEBSOCKET FOR DOCUMENT EDITING

// Existing code for WebSocket server setup
const wss = new WebSocketServer({ server });
wss.on('connection', setupWSConnection);
console.log('WebSocket server is listening');

// y-mongodb-provider setup
if (!process.env.MONGO_URL) {
  throw new Error('Please define the MONGO_URL environment variable');
}
else {
    console.log('MONGO_URL is defined');
}

const mdb = new MongodbPersistence(process.env.MONGO_URL, {
collectionName: 'documents',
  flushSize: 100,
  multipleCollections: false,
});

setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc); // Insert or Delete
    mdb.storeUpdate(docName, newUpdates); // Stores it in the datbase
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc)); // applies the db to the doc on the server
    ydoc.on('update', async (update) => {
      mdb.storeUpdate(docName, update);
    }); // Listens for updates and stores them in the db
  },
  writeState: () => {
    return new Promise((resolve) => {
      resolve(true);
    }); // This promise sends the state to all the clients
  },
});

// Server listening setup, now including Express routes and WebSocket server
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
