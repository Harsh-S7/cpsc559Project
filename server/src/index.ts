// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { seedString } from "./definitions/placeholder.definition";

const BASE_URL = "/api";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;
const port2 = process.env.PORT || 3002;
app.use(express.json(), cors());

var mstring = seedString

const getString = (_: Request, res: Response) => {
  console.log("request: getString: " + mstring);
  res.json({m:mstring});
}

const insertString = (req:Request, res: Response) => {
  const b = req.body
  mstring = mstring.slice(0, b.index) + b.string + mstring.slice(b.index);
  console.log("request: insertString: " + mstring);
  res.status(200).send();
}

const removeString = (req:Request, res: Response) => {
  const b = req.body
  mstring = mstring.slice(0, b.fromIndex) + mstring.slice(b.toIndex);
  console.log("request: removeString: " + mstring);
  res.status(200).send();
}

app.get(`${BASE_URL}/mstring/`, getString);
app.post(`${BASE_URL}/insertString/`, insertString);
app.post(`${BASE_URL}/removeString/`, removeString);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.listen(port2, () => {
  console.log(`[server]: Server is running at http://localhost:${port2}`);
});
