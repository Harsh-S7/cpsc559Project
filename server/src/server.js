require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocketServer = require('ws').Server;
const Y = require('yjs');
const { MongodbPersistence } = require('y-mongodb-provider');
const { setPersistence, setupWSConnection } = require('../websocket/utils.js');
const WebSocket = require('ws');
const axios = require('axios');
const { MongoClient, ObjectId, Binary } = require('mongodb');
const heartbeatInterval = 15000; // 15 seconds
let electionTimeout = null;
const nodes = [];


function parseNodesFromEnv() {
  let i = 1;
  while (true) {
      const idKey = `NODE_${i}_ID`;
      const addressKey = `NODE_${i}_ADDRESS`;

      if (!process.env[idKey] || !process.env[addressKey]) {
          break;
      }

      nodes.push({
          id: parseInt(process.env[idKey]),
          address: process.env[addressKey]
      });

      i++;
  }
}

parseNodesFromEnv();

let isPrimary = false;
let primaryId = null
let heartbeatTimeout = null;

// Create an instance of Express
const app = express();

// API: login user, logout, share documents, getCurrentUsersDocuments

// Use Express to handle JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create an HTTP server and pass the Express app
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
console.log("PORT: ", PORT)
const myId = PORT; // Node ID is set in the environment variable

// Existing code for WebSocket server setup
const wss = new WebSocketServer({ server });
wss.on('connection', setupWSConnection);
console.log('WebSocket server is listening');

// y-mongodb-provider setup
if (!process.env.MONGO_URL) {
  throw new Error('Please define the MONGO_URL environment variable');
}

const client = new MongoClient(process.env.MONGO_URL);
const mdb = new MongodbPersistence(process.env.MONGO_URL+"/"+process.env.DATABASE, {
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
      console.log(update)
      mdb.storeUpdate(docName, update);
    }); // Listens for updates and stores them in the db
  },
  writeState: () => {
    return new Promise((resolve) => {
      resolve(true);
    }); // This promise sends the state to all the clients
  },
});

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

 setInterval(async () => {
  if (isPrimary) {
    // Fetch and forward documents only if this node is the primary
    try {
      await client.connect();
      const collection = client.db(process.env.DATABASE).collection(process.env.COLLECTION_NAME);
      const documents = await collection.find({}).toArray();
      // Forward documents to all replica nodes
      nodes.forEach(node => {
        if (node.id !== myId) {
          axios.post(`${node.address}/document-sync`, { documents })
            .catch(e => console.log(`Failed to forward documents to Node ${node.id}: ${e.message}`));
        }
      });
    } catch (e) {
      console.error('Failed to fetch or forward documents:', e.message);
    }
  }
}, 3000);

app.post('/document-sync', async (req, res) => {
  const { documents } = req.body;

  try {
    await client.connect();
    const collection = client.db(process.env.DATABASE).collection(process.env.COLLECTION_NAME);

    // Delete all documents. Consider implications of temporary data unavailability.
    await collection.deleteMany({});

    // Insert the new documents if any
    if (documents.length > 0) {
      // Map documents to retain original _id values
      console.log(documents)
      const modifiedDocuments = documents.map(doc => ({
        ...doc,
        value: doc.value ? Binary.createFromBase64(doc.value, 0) : null, // Convert value to Binary
        _id: doc._id ? new ObjectId(doc._id) : new ObjectId() // Retain original _id or generate new ObjectId
      }));
      await collection.insertMany(modifiedDocuments);
    }

    console.log(`Synchronized ${documents.length} documents.`);
    res.send('Documents synchronized');
  } catch (e) {
    console.error('Failed to synchronize documents:', e.message);
    res.status(500).send('Failed to synchronize documents');
  }
});

setInterval(async () => {
  if (!isPrimary) {
    let PrimaryAddress = "";
    proxy.forEach(node => {
      if (node.id === primaryId) {
        PrimaryAddress = node.address;
        axios.post(process.env.PROXY_ADDRESS + '/primary-update', { id: PrimaryAddress })
      }
    });
  }
}, 5000);

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