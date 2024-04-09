import { ObjectId } from "mongodb";

export interface DocumentSchema {
  _id: string;
  name: string;
  owner: string;
  shared: string[];
}
