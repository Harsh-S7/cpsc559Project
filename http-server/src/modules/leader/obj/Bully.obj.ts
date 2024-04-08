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

  initiateElection() {
    this.running = true;
    if (Math.max(...this.nodes) == this.node_id) {
      // send leader (i)
    } else {
      // send election(i) to all Pj , i>i
      // if all down, send leader(i) to all
      // else bullied:
    }
  }
}
const node_id = process.env.NODE_ID
  ? Number(process.env.NODE_ID)
  : Number(process.env.PORT);
export const BullyObj = new Bully(node_id, [1, 2, 3]);
