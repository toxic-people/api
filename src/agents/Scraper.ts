import { GTP4_MINI } from "../swarm/registry";
import { Agent, AgentFunction, FunctionDescriptor } from "../swarm/types";
import puppeteer from "@cloudflare/puppeteer";
import { getDocumentProxy, extractText } from "unpdf";
import { registry } from "../workflows/AddWorkflow";

export class Scraper extends Agent {
  constructor(env: Env) {
    super();
    this.env = env;
    this.addFunctions();
  }

  tool_choice = "auto"; //'none', 'auto', and 'required'.
  parallel_tool_calls = false;
  fetch: AgentFunction | undefined;
  endFunction: AgentFunction | undefined;

  env: Env;
  name = "Scraper";
  model = GTP4_MINI;
  instructions =
    "You are a Summary Agent creating a short summary and find entities. Report in JSON: {summary:string, entities:{people:[string], organisations:[string], locations:[string]}. " +
    "Use the fetch tool to download the url in user content from the Internet and finish by  transfering the conversation to the end agent";

  d: FunctionDescriptor = {
    name: "fetch",
    description: "Download url from Internet",
    parameters: {
      url: {
        type: "string",
        description: "URL to download",
        required: true,
      },
    },
  };

  addFunctions() {
    this.fetch = {
      env: this.env,
      name: "fetch",
      func: async function (args: Record<string, any>): Promise<string> {
        const browser = await puppeteer.launch(this.env.MYBROWSER);
        const page = await browser.newPage();
        await page.goto(args.url);
        const artifact = new Uint8Array(await page.pdf());
        await browser.close();
        const document = await getDocumentProxy(new Uint8Array(artifact));
        const { text } = await extractText(document, { mergePages: true });
        return text;
      },
      descriptor: this.d,
    };

    this.endFunction = {
      env: this.env,
      name: "end",
      func: () => {
        return registry.getAgent("end");
      },
      descriptor: {
        name: "end",
        description: "Transfers the conversation to end Agent.",
        parameters: {},
      },
    };

    this.functions = [this.fetch, this.endFunction];
  }
}
