// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { editor } from "./modules/editor/editor.controller";

const BASE_URL = "/api";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(`${BASE_URL}/editor`, editor);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
