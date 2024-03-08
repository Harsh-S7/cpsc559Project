import { Router, Request, Response } from "express";
import { seedString } from "../../definitions/placeholder.definition";
 
export const editor = Router();
// placeholder string
var mstring = seedString

//controller

editor.get('/', (_: Request, res: Response)=> {
  res.send("This is editor api");
})

editor.get('/document/:id', (_: Request, res: Response) => {
  res.json({m:mstring});
})

editor.post('/insertString/:id', (req:Request, res: Response) => {
  const b = req.body
  mstring = mstring.slice(0, b.index) + b.string + mstring.slice(b.index);
  res.status(200).send();
})

editor.post('/removeString/:id',(req:Request, res: Response) => {
  const b = req.body
  mstring = mstring.slice(0, b.fromIndex) + mstring.slice(b.toIndex);
  res.status(200).send();
})
