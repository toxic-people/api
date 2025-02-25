import { Agent } from "../swarm/types";

export class Nightly extends Agent {
  constructor(env: Env) {
    super();
    this.env = env;
    this.addFunctions();
  }

  ts = `
  typescript
  type Report = {
    rank: number;
    name: string;
    country: string;
    wikipediaUrl: string;
};`;

  instructions =
    "Create a list of the top 20 most toxic and influential people with large number of followers. Report using typescript array with the schema: " +
    this.ts;
  env: Env;
  name = "Nightly";

  addFunctions = () => {
    this.functions = [];
  };
}
