import { MDEDocument } from "../../definitions/document-md.definition";
import { MDERepository } from "./editor.repository";
import * as crypto from 'crypto';

export class MDEService {
  static createDocument(doc: MDEDocument) {
    const id = MDERepository.getNextId();
    MDERepository.createDocument(id, doc);
    const newDoc = MDERepository.getDocument(id);
    if (!newDoc) throw Error;
    return newDoc;
  }

  static getHash(id: number) : string {
    const shasum = crypto.createHash('sha1');
    const doc = MDERepository.getDocument(id);
    shasum.update(doc.content);
    return shasum.digest('hex');
  }

  static getDocument(id: number) {
    const doc = MDERepository.getDocument(id);
    if (!doc) return null;
    return doc;
  }

  static modifyDocument(id: number, doc: MDEDocument) {
    const newDoc = MDERepository.updateDocument(id, doc);
    return newDoc;
  }

  static deleteDocument(id: number) {
    MDERepository.deleteDocument(id);
  }
}
