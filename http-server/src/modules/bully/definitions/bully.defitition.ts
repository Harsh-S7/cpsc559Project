import axios from "axios";
import { AddressBook } from "./address.definition";

export class Bully {
  node_id: number;
  nodes: number[];
  running: boolean;
  leader: number | null;

  constructor(id: number, nodes: number[]) {
    this.node_id = id;
    this.nodes = nodes;
    this.running = false;
    this.leader = null;
  }

  async initiateElection() {
    this.running = true;
    if (Math.max(...this.nodes) == this.node_id) {
      for (let node in this.nodes) {
        const res = await axios.post(
          AddressBook[node] + `/bully/leader/${this.node_id}`,
          {},
        );
      }
    } else {
      for (let node in this.nodes) {
        const res = await axios.post(
          AddressBook[node] + `/bully/election/${this.node_id}`,
          {},
        );
      }
    }
  }
}

const node_id = process.env.NODE_ID ? Number(process.env.NODE_ID) : 1;
export const BullyObj = new Bully(node_id, [1, 2, 3]);
