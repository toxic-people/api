import { Agent } from "../swarm/types";

export class End extends Agent {
  constructor(env: Env) {
    super();
    this.env = env;
  }

  tool_choice = "none"; //'none', 'auto', and 'required'.
  parallel_tool_calls = false;

  env: Env;
  name = "End";
}
