import { Request, Response, Router } from "express";
import { UserService } from "./user.service";

export const UserController = Router();

UserController.get("/", (_: Request, res: Response) => {
  res.json({ m: "This is User API" });
  // res.send("This is User API");
});

UserController.get("/:username", async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUser(req.params.username);
    res.send(user);
  } catch (e) {
    res.status(404).send(e);
  }
});

UserController.post("/", async (req: Request, res: Response) => {
  try {
    await UserService.createUser(req.body);
    res.sendStatus(200);
  } catch (e) {
    res.status(304).send(e);
  }
});
