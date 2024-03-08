import { MDEDocument } from "./document-md.definition"

const typescriptMD : MDEDocument = {
  id : 0,
  name: "typescript.md",
  content : `# TypeScript
[TypeScript](https://www.typescriptlang.org/) is a language for application-scale JavaScript.`}
export var MockDataBase : {[id:number] : MDEDocument;} = {};
MockDataBase[0] = typescriptMD;
