import { Router, Request, Response } from "express";
import { MDEService } from "./editor.service";

export const editor = Router();
// placeholder string

//controller

editor.get("/", (_: Request, res: Response) => {
  res.send("This is editor api");
});

editor.get("/document/:id", (req: Request, res: Response) => {
  const doc = MDEService.getDocument(Number(req.params.id));
  if (doc) res.send({ doc: doc });
  else res.sendStatus(404);
});

editor.get("/hash/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  res.send(MDEService.getHash(id));
})
//editor.post('/insertString/:id', (req: Request, res: Response) => {
//  const b = req.body
//  mstring = mstring.slice(0, b.index) + b.string + mstring.slice(b.index);
//  res.status(200).send();
//})
//
//editor.post('/removeString/:id', (req: Request, res: Response) => {
//  const b = req.body
//  mstring = mstring.slice(0, b.fromIndex) + mstring.slice(b.toIndex);
//  res.status(200).send();
//})

editor.post("/document/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const doc = MDEService.modifyDocument(id, req.body);
  res.status(200).send(doc);
});

