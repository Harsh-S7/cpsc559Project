import { Request, Response, Router } from "express";
import { DocumentService } from "./document.service";
import { DocumentRecord } from "./dtos/document.dto";

export const DocumentController = Router();

DocumentController.get("/", (_: Request, res: Response) => {
  res.send("This is Document API");
});

DocumentController.get("/all", async (_: Request, res: Response) => {
  res.send(await DocumentService.getAllDocument());
});

DocumentController.get(
  "/byUser/:userId",
  async (req: Request, res: Response) => {
    res.send(await DocumentService.getDocumentByUser(req.params.userId));
  },
);

DocumentController.get("/:id", async (req: Request, res: Response) => {
  res.send(await DocumentService.getDocument(req.params.id));
});

DocumentController.post("/", async (req: Request, res: Response) => {
  await DocumentService.createDocument(req.body);
  res.sendStatus(200);
});

DocumentController.put("/:id", async (req: Request, res: Response) => {
  await DocumentService.modifyDocument(req.params.id, req.body);
  res.sendStatus(200);
});
