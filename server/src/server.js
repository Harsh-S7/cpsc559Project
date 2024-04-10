// Load environment variables from .env file
require("dotenv").config();

// Import necessary modules
const http = require("http");
const express = require("express");
const WebSocketServer = require("ws").Server;
const Y = require("yjs");
const { MongodbPersistence } = require("y-mongodb-provider");
const { setPersistence, setupWSConnection } = require("../websocket/utils.js");
const WebSocket = require("ws");
const axios = require("axios");
const { MongoClient, ObjectId, Binary } = require("mongodb");

// Define heartbeat interval for leader checks
const heartbeatInterval = 15000; // 15 seconds

// Election timeout variable, will be used to determine leader election timing
let electionTimeout = null;

// Array to store the nodes in the distributed system
const nodes = [];

// Parse and add nodes from environment variables to the nodes array
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
      address: process.env[addressKey],
    });

    i++;
  }
}

// Parse nodes at startup
parseNodesFromEnv();

// Variables to keep track of the node's status in the election
let isPrimary = false;
let primaryId = null;
let heartbeatTimeout = null;

// Create an instance of Express
const app = express();

// Middleware to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create an HTTP server with the Express app
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

console.log("PORT: ", PORT);
const myId = PORT; // Use the port as a unique identifier for this node

// Setup WebSocket server for real-time communication
const wss = new WebSocketServer({ server });
wss.on("connection", setupWSConnection); // Setup WebSocket connection handler
console.log("WebSocket server is listening");

// MongoDB setup with y-mongodb-provider for Yjs documents
if (!process.env.MONGO_URL) {
  throw new Error("Please define the MONGO_URL environment variable");
}

// MongoDB client setup
const client = new MongoClient(process.env.MONGO_URL);
const mdb = new MongodbPersistence(
  process.env.MONGO_URL + "/" + process.env.DATABASE,
  {
    collectionName: "documents",
    flushSize: 100,
    multipleCollections: false,
  },
);

// Set up persistence for Yjs documents using MongoDB
setPersistence({
  bindState: async (docName, ydoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc); // Get updates for document
    mdb.storeUpdate(docName, newUpdates); // Store updates in MongoDB
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc)); // Apply updates from MongoDB to the document
    ydoc.on("update", async (update) => {
      console.log(update);
      mdb.storeUpdate(docName, update); // Listen for updates and store them
    });
  },
  writeState: () => {
    return new Promise((resolve) => {
      resolve(true); // This simulates sending the state to all clients
    });
  },
});

// Function to start the election process
function startElection() {
  isPrimary = false;
  primaryId = null;
  const higherNodes = nodes.filter((n) => n.id > myId);
  if (higherNodes.length === 0) {
    becomeLeader();
  } else {
    higherNodes.forEach((node) => {
      axios
        .post(`${node.address}/election`, { from: myId })
        .catch((e) => console.log(`Node ${node.id} is down`));
    });
    // Set a timeout to become the leader if no response
    electionTimeout = setTimeout(becomeLeader, 5000); // 5 seconds to wait for responses
  }
}

// Function to make the current node a leader
function becomeLeader() {
  if (!isPrimary) {
    isPrimary = true;
    primaryId = myId;
    console.log(`Node ${myId} is now the leader`);
    clearTimeout(heartbeatTimeout);
    // Announce new leader status to all nodes
    nodes.forEach((node) => {
      if (node.id != myId) {
        axios
          .post(`${node.address}/new-leader`, { leaderId: myId })
          .catch((e) => console.log(`Node ${node.id} is down`));
      }
    });
  }
}

// Endpoint to handle new leader announcements
app.post("/new-leader", (req, res) => {
  const { leaderId } = req.body;
  clearTimeout(electionTimeout);
  isPrimary = false;
  primaryId = leaderId;
  console.log(`New leader is ${leaderId}`);
  res.send("Leader acknowledged");
});

// Endpoint to handle election messages
app.post("/election", (req, res) => {
  const { from } = req.body;
  console.log(`Election message received from ${from}`);
  res.send("OK");
  startElection();
});

// Send heartbeat from the leader to all nodes periodically
setInterval(() => {
  if (isPrimary) {
    nodes.forEach((node) => {
      if (node.id != myId) {
        axios
          .post(`${node.address}/heartbeat`, { leaderId: myId })
          .catch((e) => console.log(`Node ${node.id} is down`));
      }
    });
  }
}, 5000); // Every 5 seconds

// Endpoint to handle heartbeats from the leader
app.post("/heartbeat", (req, res) => {
  const { leaderId } = req.body;
  clearTimeout(electionTimeout);
  clearTimeout(heartbeatTimeout); // Reset the heartbeat timeout

  primaryId = leaderId;
  console.log(`Received heartbeat from leader ${leaderId}`);

  heartbeatTimeout = setTimeout(() => {
    console.log("Heartbeat missed. Starting election.");
    startElection();
  }, heartbeatInterval);

  res.send("Heartbeat acknowledged");
});

// Endpoint to check if the node is primary
app.get("/isPrimary", (req, res) => {
  console.log("IS PRIMARY: ", isPrimary);
  res.json({ isPrimary: isPrimary });
});

// Synchronize documents across nodes periodically if this node is the primary
setInterval(async () => {
  if (isPrimary) {
    try {
      await client.connect();
      const collection = client
        .db(process.env.DATABASE)
        .collection(process.env.COLLECTION_NAME);
      const documents = await collection.find({}).toArray();
      nodes.forEach((node) => {
        if (node.id != myId) {
          axios
            .post(`${node.address}/document-sync`, { documents })
            .catch((e) =>
              console.log(`Failed to forward documents to Node ${node.id}: ${e.message}`),
            );
        }
      });
    } catch (e) {
      console.error("Failed to fetch or forward documents:", e.message);
    }
  }
}, 3000); // Every 3 seconds

// Endpoint for document synchronization between nodes
app.post("/document-sync", async (req, res) => {
  const { documents } = req.body;

  try {
    await client.connect();
    const collection = client
      .db(process.env.DATABASE)
      .collection(process.env.COLLECTION_NAME);

    await collection.deleteMany({}); // Delete all documents before synchronization

    if (documents.length > 0) {
      const modifiedDocuments = documents.map((doc) => ({
        ...doc,
        value: doc.value ? Binary.createFromBase64(doc.value, 0) : null,
        _id: doc._id ? new ObjectId(doc._id) : new ObjectId(),
      }));
      await collection.insertMany(modifiedDocuments); // Insert synchronized documents
    }

    console.log(`Synchronized ${documents.length} documents.`);
    res.send("Documents synchronized");
  } catch (e) {
    console.error("Failed to synchronize documents:", e.message);
    res.status(500).send("Failed to synchronize documents");
  }
});

// Update the primary node's address to a proxy or another service periodically
setInterval(async () => {
  if (isPrimary) {
    let PrimaryAddress = "";
    nodes.forEach((node) => {
      if (node.id == primaryId) {
        PrimaryAddress = node.address;
        axios.post(process.env.PROXY_ADDRESS + "/primary-update", {
          id: PrimaryAddress,
        }).catch((error) => {
          console.log("Error updating primary address");
        });
      }
    });
  }
}, 5000); // Every 5 seconds

// Start the server and initialize leader election and heartbeat timeout mechanisms
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  startElection(); // Initiate election process at server start
  if (!isPrimary) {
    heartbeatTimeout = setTimeout(() => {
      console.log("Heartbeat missed at startup. Starting election.");
      startElection();
    }, heartbeatInterval);
  }
});
