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
const PORT = 4001;

// BELOW IS SET UP THE YJS WEBSOCKET FOR DOCUMENT EDITING

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


// TESTTTT

const nodes = [
  { id: 4000, address: 'http://localhost:4000' },
  { id: 4001, address: 'http://localhost:4001' },
  { id: 4002, address: 'http://localhost:4002' },
  // Add other nodes with their IDs and addresses
];
const myId = PORT; // Node ID is set in the environment variable
let isPrimary = false;

async function sendHttpRequestWithRetry(url, data, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await axios.post(url, data);
      return; // Success, exit the function
    } catch (error) {
      console.error(`Attempt ${i + 1}: Error sending request to ${url}, retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.error(`Failed to send request to ${url} after ${retries} attempts.`);
}

async function startElection() {
  console.log('Starting election');
  const electionTimeout = 5000; // Timeout in milliseconds
  const electionPromises = [];

  // Send election messages to nodes with higher IDs
  for (const node of nodes) {
    if (node.id > myId) {
      electionPromises.push(
        new Promise(async (resolve, reject) => {
          try {
            await sendHttpRequestWithRetry(`${node.address}/election`, { senderId: myId });
            console.log(`Election message sent to ${node.address}`);
            resolve(); // Resolve promise if message sent successfully
          } catch (error) {
            reject(error); // Reject promise if error occurs
          }
        })
      );
    }
  }

  // Wait for responses within the election timeout period
  try {
    await Promise.race([Promise.all(electionPromises), new Promise(resolve => setTimeout(resolve, electionTimeout))]);
  } catch (error) {
    console.error('Error occurred during election process:', error.message);
  }

  // If no responses received, declare itself as the primary node
  if (!isPrimary) {
    console.log('No response received within election timeout, declaring victory');
    declareVictory();
  }
}


function declareVictory() {
  isPrimary = true;
  console.log('I am the primary now');
  nodes.filter(node => node.id < myId).forEach(node => {
    sendHttpRequestWithRetry(`${node.address}/victory`, { newPrimaryId: myId })
      .then(() => console.log(`Victory message sent to ${node.address}`))
      .catch(err => console.error(`Error sending victory message to ${node.address}: ${err}`));
  });
}

let primaryId = null; // Track the current primary node's ID

// Function to check the health of the primary node
function checkPrimaryNodeHealth() {
  console.log("CHECKING PRIMARY NODE HEALTH")

  if (isPrimary) {
    return
  }

  if (primaryId === null) {
    startElection();
    return; // If this node is primary or no primary is known, do nothing
  }

  const primaryNode = nodes.find(node => node.id === primaryId);
  if (!primaryNode) {
    console.error('Primary node info not found');
    return;
  }

  axios.get(`${primaryNode.address}/health`)
    .then(response => {
      if (response.status !== 200 || response.data.status !== 'ok') {
        throw new Error('Primary node is not healthy');
      }
    })
    .catch(() => {
      console.log('Primary node is down, starting election');
      startElection();
    });
}

app.get('/health', (req, res) => {
  console.log("IS PRIMARY: ", isPrimary)
  res.json({ status: 'ok' });
});

app.get('/isPrimary', (req, res) => {
  // console.log("IS PRIMARY: ", isPrimary)
  res.json({ isPrimary: isPrimary });
});

// Start the health check interval
setInterval(checkPrimaryNodeHealth, 5000); // Check every 5 seconds

app.post('/victory', (req, res) => {
  const { newPrimaryId } = req.body;
  console.log(`Received victory message from ${newPrimaryId}`);
  primaryId = newPrimaryId; // Update the primary ID
  if (newPrimaryId !== myId) {
    isPrimary = false;
  }
  res.json({ message: 'Victory message acknowledged' });
});

// Server listening setup, now including Express routes and WebSocket server
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
