import axios from "axios";
import { NextFunction, Request, Response } from "express";

export const propagate = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //get all variable needed
  const webSocketPort = process.env.WEB_SOCKET_PORT;
  const websocketUrl = `http://localhost:${webSocketPort}`;
  // check if primary with replica manager
  const isPrimary = (await axios.get(websocketUrl + "/isPrimary")).data
    .isPrimary;
  if (isPrimary) {
    // do propagation if is primary
    // crafting requests
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
    console.log(clone2_pack);
    // propagation happens here
    try {
      await axios(clone1_pack);
      await axios(clone2_pack);
    } catch (e) {
      console.log("one or more http replicas failed");
    }
  }
  next();
};
