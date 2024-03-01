// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { seedString } from "./definitions/placeholder.definition";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());

var mstring = seedString

const getString = (_: Request, res: Response) => {
  res.send({m:mstring})
}

const insertString = (req:Request, res: Response) => {
  const b = req.body
  mstring = mstring.slice(0, b.index) + b.string + mstring.slice(b.index);
  res.status(200).send();
}

const removeString = (req:Request, res: Response) => {
  const b = req.body
  mstring = mstring.slice(0, b.fromIndex) + mstring.slice(b.toIndex);
  res.status(200).send();
}

app.get("/mstring/", getString);
app.post("/insertString/", insertString);
app.post("/removeString/", removeString);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
