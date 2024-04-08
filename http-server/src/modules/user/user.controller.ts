import { Request, Response, Router } from "express";
import { UserService } from "./user.service";

export const UserController = Router();

UserController.get("/", (_: Request, res: Response) => {
  res.json({ m: "This is User API" });
  // res.send("This is User API");
});


UserController.get("/:username", async (req: Request, res: Response) => {
  const user = await UserService.getUser(req.params.username);
  res.send(user);
});

UserController.post("/", async( req: Request, res: Response) => {
  await UserService.createUser(req.body);
  res.sendStatus(200);
});
