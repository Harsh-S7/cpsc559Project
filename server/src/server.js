require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocketServer = require('ws').Server;
const Y = require('yjs');
const { MongodbPersistence } = require('y-mongodb-provider');
const { setPersistence, setupWSConnection } = require('../websocket/utils.js');
const WebSocket = require('ws');
const axios = require('axios');

// Create an instance of Express
const app = express();

// API: login user, logout, share documents, getCurrentUsersDocuments

// Use Express to handle JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create an HTTP server and pass the Express app
const server = http.createServer(app);
// const PORT = process.env.PORT || 3000;
const PORT = 4002;

// Existing code for WebSocket server setup
const wss = new WebSocketServer({ server });
wss.on('connection', setupWSConnection);
console.log('WebSocket server is listening');

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

const nodes = [
  { id: 4000, address: 'http://localhost:4000' },
  { id: 4001, address: 'http://localhost:4001' },
  { id: 4002, address: 'http://localhost:4002' },
];
const myId = PORT; // Node ID is set in the environment variable

let isPrimary = false;
let primaryId = null
let heartbeatTimeout = null;
const heartbeatInterval = 15000; // 15 seconds

function startElection() {
  isPrimary = false;
  primaryId = null;
  const higherNodes = nodes.filter(n => n.id > myId);
  if (higherNodes.length === 0) {
    becomeLeader();
  } else {
    higherNodes.forEach(node => {
      axios.post(`${node.address}/election`, { from: myId }).catch(e => console.log(`Node ${node.id} is down`));
    });
    // Set a timeout to become the leader if no one responds
    electionTimeout = setTimeout(becomeLeader, 5000); // 5 seconds timeout for simplicity
  }
}

function becomeLeader() {
  if (!isPrimary) {
    isPrimary = true;
    primaryId = myId;
    console.log(`Node ${myId} is now the leader`);
    clearTimeout(heartbeatTimeout);
    // Announce leadership to all nodes
    nodes.forEach(node => {
      if (node.id !== myId) {
        axios.post(`${node.address}/new-leader`, { leaderId: myId }).catch(e => console.log(`Node ${node.id} is down`));
      }
    });
  }
}

// Reset leader if a new leader is announced
app.post('/new-leader', (req, res) => {
  const { leaderId } = req.body;
  clearTimeout(electionTimeout);
  isPrimary = false;
  primaryId = leaderId;
  console.log(`New leader is ${leaderId}`);
  res.send('Leader acknowledged');
});

app.post('/election', (req, res) => {
  const { from } = req.body;
  console.log(`Election message received from ${from}`);
  // Respond to signal active status and start own election
  res.send('OK');
  startElection();
});

setInterval(() => {
  if (isPrimary) {
    // Leader sends heartbeat to all
    nodes.forEach(node => {
      if (node.id !== myId) {
        axios.post(`${node.address}/heartbeat`, { leaderId: myId })
          .catch(e => console.log(`Node ${node.id} is down`));
      }
    });
  }
}, 5000); // 10 seconds for simplicity
 
app.post('/heartbeat', (req, res) => {
  const { leaderId } = req.body;
  // Reset any election timeout upon receiving a heartbeat
  clearTimeout(electionTimeout);
  clearTimeout(heartbeatTimeout); // Reset the heartbeat timeout
  
  primaryId = leaderId;
  console.log(`Received heartbeat from leader ${leaderId}`);
  
  // Restart the heartbeat timeout
  heartbeatTimeout = setTimeout(() => {
    console.log('Heartbeat missed. Starting election.');
    startElection();
  }, heartbeatInterval);
  
  res.send('Heartbeat acknowledged');
});

app.get('/isPrimary', (req, res) => {
  console.log("IS PRIMARY: ", isPrimary)
  res.json({ isPrimary: isPrimary });
 });
 

 server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  startElection(); // Start an election when the server starts
  // Initialize heartbeat timeout for replicas
  if (!isPrimary) {
    heartbeatTimeout = setTimeout(() => {
      console.log('Heartbeat missed at startup. Starting election.');
      startElection();
    }, heartbeatInterval);
  }
});