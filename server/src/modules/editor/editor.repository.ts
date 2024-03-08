import { MDEDocument } from "../../definitions/document-md.definition";
import { MockDataBase } from "../../definitions/placeholder.definition";

const db = MockDataBase;

export class MDERepository {
  private static nextId:number = 1;
  static createDocument(id: number, doc : MDEDocument) : MDEDocument{
    db[id] = doc;
    return db[id];
  }
 
  static getDocument(id:number) : MDEDocument{
    return db[id];
  }

  static updateDocument(id: number, doc : MDEDocument) : MDEDocument{
    db[id] = doc;
    return db[id];
  }

  static deleteDocument(id:number){
    delete db[id];
  }

  static getNextId() : number{
    return this.nextId++;
  }
}
