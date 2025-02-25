import { Agent } from "../swarm/types";

export class Nightly extends Agent {
  constructor(env: Env) {
    super();
    this.env = env;
  }

  instructions =
    "Create a list of the top 10 most toxic and influential people with large number of followers. Reply using a typescript array with the following schema: { rank: number; name: string; country: string; wikipediaUrl: string}";
}
