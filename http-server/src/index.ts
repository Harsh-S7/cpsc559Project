// src/index.js
import express, { Express } from "express";
import dotenv from "dotenv";
import { UserController } from "./modules/user/user.controller";
import { mongdoDbSetup } from "./utils/mongodb.utils";
import { DocumentController } from "./modules/document/document.controller";
import { basicLogger } from "./utils/logger.utils";
import { errorHandler } from "./utils/error.utils";

const BASE_URL = "/api";

dotenv.config();
// set up express server
const app: Express = express();
const port = process.env.PORT || 3003;
app.use(express.json());

app.use(basicLogger);
//app.use(errorHandler);
//load modules
app.use(`${BASE_URL}/user`, UserController);
app.use(`${BASE_URL}/document`, DocumentController);

mongdoDbSetup().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});
