import { ObjectId } from "mongodb";
import { DocumentRepository } from "./document.repository";
import {
  DocumentRecord,
  PostDocumentReqDto,
  PutDocumentReqDto,
} from "./dtos/document.dto";
import { UserRepository } from "../user/user.repository";

export class DocumentService {
  static async getAllDocument(): Promise<DocumentRecord[]> {
    return await DocumentRepository.getAllDocuments();
  }

  static async getDocumentByUser(username: string): Promise<DocumentRecord[]> {
    const user = await UserRepository.getUser(username);
    if (!user) throw new Error("user not found");
    return DocumentRepository.getDocumentsByUser(username);
  }

  static async getDocument(id: string): Promise<DocumentRecord> {
    const doc = await DocumentRepository.getDocument(id);
    if (!doc) throw new Error();
    return doc;
  }

  static async modifyDocument(id: string, doc: PutDocumentReqDto) {
    const newDoc: DocumentRecord = {
      id: new ObjectId(doc.id),
      name: doc.name,
      shared: doc.shared,
      owner: doc.owner,
    };
    if (id != doc.id.toString()) throw new Error("mismatched id");
    const originalDoc = DocumentRepository.getDocument(id);
    if (!originalDoc) throw new Error("doc not found");
    await DocumentRepository.modifyDocument(newDoc);
  }

  static async createDocument(newDoc: PostDocumentReqDto) {
    const doc: DocumentRecord = {
      id: new ObjectId(),
      name: newDoc.name,
      owner: newDoc.owner,
      shared: [],
    };
    await DocumentRepository.createDocument(doc);
  }
}
