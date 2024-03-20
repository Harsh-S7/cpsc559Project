import * as mongodb from "mongodb";
import { MongoDbCollectionsEnum } from "../definitions/mongoDb-collections.definition";
import { UserSchema } from "../schema/user/user.schema";
import { DocumentSchema } from "../schema/document/document.schema";

export const collections: {
  users?: mongodb.Collection<UserSchema>;
  docs?: mongodb.Collection<DocumentSchema>;
} = {};

export async function mongdoDbSetup() {
  const mongodbUrl = process.env.MONGO_CONN;
  const mongoDbName = process.env.MONGO_DB || "cpsc559";

  if (!mongodbUrl) {
    throw new Error("mongodbUrl not defined");
  }

  const client = new mongodb.MongoClient(mongodbUrl);
  await client.connect();
  const db = client.db(mongoDbName);
  try {
    db.createCollection(MongoDbCollectionsEnum.users);
    db.collection(MongoDbCollectionsEnum.users).insertOne({
      username: "root",
      email: "root@gmail.com",
    });
    console.log("success");
  } catch (Exception) {
    console.log("Collections already exists");
  }
  try {
    db.createCollection(MongoDbCollectionsEnum.documents);
  } catch (Exception) {
    console.log("Collections already exists");
  }
  collections.docs = db.collection<DocumentSchema>(
    MongoDbCollectionsEnum.documents,
  );
  collections.users = db.collection<UserSchema>(MongoDbCollectionsEnum.users);
}
