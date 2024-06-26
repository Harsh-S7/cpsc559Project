import { ObjectId } from "mongodb";
import { DocumentSchema } from "../../schema/document/document.schema";
import { collections } from "../../utils/mongodb.utils";
import { DocumentRecord } from "./dtos/document.dto";

export class DocumentRepository {
  static async getAllDocuments(): Promise<DocumentRecord[]> {
    const docs = collections.docs!;
    const findResults = await docs.find<DocumentSchema>({}).toArray();
    return findResults.map((doc) => DocumentRecord.fromSchema(doc));
  }

  static async getDocumentsByUser(user: string): Promise<DocumentRecord[]> {
    const docs = collections.docs!;
    const query = { owner: user };
    const findResults = await docs.find<DocumentSchema>(query).toArray();
    return findResults.map((doc) => DocumentRecord.fromSchema(doc));
  }

  static async getDocumentSharedWithUser(user: string): Promise<DocumentRecord[]> {
    const docs = collections.docs!;
    const query = { shared: { $in: [user] } };
    const findResults = await docs.find<DocumentSchema>(query).toArray();
    return findResults.map((doc) => DocumentRecord.fromSchema(doc));
  }

  static async getDocument(id: string): Promise<DocumentRecord | null> {
    const docs = collections.docs!;
    const query = { _id: new ObjectId(id) };
    const result = await docs.findOne(query);
    if (!result) return null;
    return DocumentRecord.fromSchema(result);
  }

  static async createDocument(newDoc: DocumentRecord) {
    const docs = collections.docs!;
    const result = await docs.insertOne(DocumentRecord.toSchema(newDoc));
    if (!result) {
      throw new Error("Failed");
    }
  }

  static async modifyDocument(newDoc: DocumentRecord) {
    const docs = collections.docs!;
    const updatedDoc = DocumentRecord.toSchema(newDoc);
    const query = { _id: updatedDoc._id };
    const result = await docs.updateOne(query, { $set: updatedDoc });
    if (!result) throw new Error("Failed");
  }

  static async deleteDocument(id: string) {
    const docs = collections.docs!;
    const query = { _id: new ObjectId(id) };
    const result = await docs.deleteOne(query);
    if (!result) throw new Error("Failed");
  }

  static async shareDocument(id: string, sharedUsers: string[]) {
    const docs = collections.docs!;
    const query = { _id: new ObjectId(id) };
    const result = await docs.updateOne(query, { $addToSet: { shared: { $each: sharedUsers } } });
    if (!result) throw new Error("Failed");
  }

  static async verifyAccess(id: string, user: string) {
    const docs = collections.docs!;
    const query = { _id: new ObjectId(id) };
    const result = await docs.findOne(query);
    if (!result) throw new Error("doc not found");
    if (result.owner !== user && !result.shared.includes(user)) {
      return false;
    } else {
      return true;
    }
  }
}
