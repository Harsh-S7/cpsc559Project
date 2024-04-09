import axios from "axios";
import { NextFunction, Request, Response } from "express";

export const propagate = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const webSocketPort = process.env.WEB_SOCKET_PORT;
  const websocketUrl = `http://localhost:${webSocketPort}`;
  const isPrimary = (await axios.get(websocketUrl + "/isPrimary")).data
    .isPrimary;
  if (isPrimary && req.method != "GET") {
    // do propagation if is primary
    const clone1 = process.env.CLONE1;
    const clone2 = process.env.CLONE2;
    const clone1_pack = {
      method: req.method.toString().toLowerCase(),
      url: clone1 + req.originalUrl,
      data: req.body,
    };
    const clone2_pack = {
      method: req.method.toString().toLowerCase(),
      url: clone2 + req.originalUrl,
      data: req.body,
    };
    console.log(clone1_pack);
    await axios(clone1_pack);
    await axios(clone2_pack);
  }
  next();
};
