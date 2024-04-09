import { Request, Response, Router } from "express";
import { DocumentService } from "./document.service";
import { DocumentRecord } from "./dtos/document.dto";

export const DocumentController = Router();

DocumentController.get("/", (_: Request, res: Response) => {
  res.send("This is Document API");
});

DocumentController.get("/all", async (_: Request, res: Response) => {
  try {
    res.send(await DocumentService.getAllDocument());
  } catch (e) {
    res.status(500).send("sth broke");
  }
});

DocumentController.get(
  "/byUser/:userId",
  async (req: Request, res: Response) => {
    try {
      res.send(await DocumentService.getDocumentByUser(req.params.userId));
    } catch (e) {
      res.status(500).send("sth broke");
    }
  },
);

DocumentController.get(
  "/sharedWithUser/:userId",
  async (req: Request, res: Response) => {
    try {
      res.send(
        await DocumentService.getDocumentSharedWithUser(req.params.userId),
      );
    } catch (e) {
      res.status(500).send("sth broke");
    }
  },
);

DocumentController.get(
  "/combined/:userId",
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const documentsByUser = await DocumentService.getDocumentByUser(userId);
    const documentsSharedWithUser =
      await DocumentService.getDocumentSharedWithUser(userId);
    res.send([...documentsByUser, ...documentsSharedWithUser]);
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

DocumentController.delete("/:id", async (req: Request, res: Response) => {
  await DocumentService.deleteDocument(req.params.id);
  res.sendStatus(200);
});

DocumentController.post("/share/:id", async (req: Request, res: Response) => {
  await DocumentService.shareDocument(req.params.id, req.body.shared);
  res.sendStatus(200);
});
