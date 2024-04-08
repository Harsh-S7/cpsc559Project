import { Request, Response, Router } from "express";
import { BullyObj } from "./definitions/bully.defitition";
import { ResolveOptions } from "dns";

export const BullyController = Router();

BullyController.post("/leader/:id", (req: Request, res: Response) => {
  const bullyObj = BullyObj;
  const id = Number(req.params.id);
  bullyObj.leader = id;
  bullyObj.running = false;
  res.status(200).send();
});

BullyController.post("/election/:id", async (req: Request, res: Response) => {
  const bullyObj = BullyObj;
  const id = Number(req.params.id);
  if (bullyObj.node_id > id) {
    res.send({ bully: bullyObj.node_id });
    if (!bullyObj.node_id) {
      await bullyObj.initiateElection();
    }
  }
});

BullyController.get("/nodeDetails", (_: Request, res: Response) => {
  const bully = BullyObj;
  res.send({
    node_id: bully.node_id,
    running: bully.running,
    leader: bully.leader,
    isLeader: bully.leader == bully.node_id,
  });
});
