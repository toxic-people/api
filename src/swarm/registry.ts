import { End } from "../agents/End";
import { Scraper } from "../agents/Scraper";
import { Agent } from "./types";

export const GTP4_MINI = "gpt-4o-mini";
export const GTP4 = "gpt-4o";

export class Registry {
  agents: Record<string, Agent> = {};

  constructor() {}

  init(env: Env) {
    this.registerAgent(new Scraper(env));
    this.registerAgent(new End(env));
  }

  registerAgent(agent: Agent) {
    this.agents[agent.name] = agent;
  }

  getAgent(name: string): Agent {
    return this.agents[name];
  }
}
