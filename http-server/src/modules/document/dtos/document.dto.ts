import { ObjectId } from "mongodb";
import { DocumentSchema } from "../../../schema/document/document.schema";

export class DocumentRecord {
  id: string;
  name: string;
  owner: string;
  shared: string[];

  static fromSchema(data: DocumentSchema): DocumentRecord {
    return {
      id: data._id,
      name: data.name,
      owner: data.owner,
      shared: data.shared,
    };
  }
  static toSchema(data: DocumentRecord): DocumentSchema {
    return {
      _id: data.id,
      name: data.name,
      owner: data.owner,
      shared: data.shared,
    };
  }
}

export class PostDocumentReqDto {
  name: string;
  owner: string;
}

export class PutDocumentReqDto {
  id: string;
  name: string;
  owner: string;
  shared: string[];
}
