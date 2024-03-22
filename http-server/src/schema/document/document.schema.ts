import { ObjectId } from "mongodb";

export interface DocumentSchema {
  _id: ObjectId;
  name: string;
  owner: string;
  shared: string[];
}
