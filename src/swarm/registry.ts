import { End } from "../agents/End";
import { Nightly } from "../agents/Nightly";
import { Scraper } from "../agents/Scraper";
import { Agent } from "./types";

export const GTP4_MINI = "gpt-4o-mini";
export const GTP4 = "gpt-4o";

export class Registry {
  agents: Record<string, Agent> = {};
  isInit = false;

  constructor() {}

  init(env: Env) {
    if(this.isInit)return
    this.isInit = true
    this.registerAgent(new Scraper(env));
    this.registerAgent(new End(env));
    this.registerAgent(new Nightly(env));
  }

  registerAgent(agent: Agent) {
    this.agents[agent.name] = agent;
  }

  getAgent(name: string): Agent {
    return this.agents[name];
  }
}
