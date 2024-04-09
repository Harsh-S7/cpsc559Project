import { NextFunction, Request, Response } from "express";

export const basicLogger = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const rtime = new Date(Date.now()).toString();
  console.log(
    `NEW REQUEST ${req.method}, ${req.hostname}, ${req.originalUrl}, ${rtime}`,
  );
  console.log(`DATA ${JSON.stringify(req.body)}`);
  next();
};
