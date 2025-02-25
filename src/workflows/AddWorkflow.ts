import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { Scaper } from "../scraper";
import { drizzle } from "drizzle-orm/d1";
import { contentTable } from "../schema";
import { sql } from "drizzle-orm";
import { Swarm } from "../swarm/core";
import { prettyPrintMessages } from "../swarm/util";
import { Response } from "../swarm/types";
import { Registry } from "../swarm/registry";

export var registry = new Registry();

export default class AddWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // Singleton
    registry.init(this.env);

    // await step.sleep("wait on something", "5 second");
    await step.do(
      "Fetch Page",
      // Define a retry strategy
      {
        retries: {
          limit: 1,
          delay: "5 second",
          backoff: "exponential",
        },
        timeout: "1 minutes",
      },
      async () => {
        var count = 0;
        // create the first Agent
        //@ts-ignore
        const config = { apiKey: this.env.OPEN_API_KEY, env: this.env };
        const client = new Swarm(config);
        console.log("Starting Swarm CLI 🐝");
        const messages: any[] = [];
        const url: string = event.payload.url! as string;
        let agent = registry.getAgent("Scraper");

        messages.push({ role: "user", content: "use this url: " + url });

        console.log("Agent starts messages ", messages);
        console.log("Start Agent ", agent.name);
        // while (count < 5) {
        console.log("Looping", count);
        count += 1;
        const response = await client.run({
          agent,
          messages,
          max_turns: 3,
          execute_tools: true,
          debug: true,
        });
        const completionResponse = response as Response;
        messages.push(...completionResponse.messages);
        agent = completionResponse.agent!;
        console.log("End========================= ");
        const report =
          completionResponse.messages[completionResponse.messages.length - 1]
            .content;
        console.log(JSON.stringify(report));
        const db = drizzle(this.env.MY_DB);
        await db
          .insert(contentTable)
          .values({
            url: url,
            content: report,
            contentOrg: "",
            creator: "online",
            updated: new Date().getTime(),
            created: new Date().getTime(),
          })
          .onConflictDoUpdate({
            target: contentTable.url,
            set: {
              content: report,
              updated: new Date().getTime(),
            },
            where: sql`${contentTable.url} != ${url}`,
          });
      }

      // console.log("Workflow complete ");
      //}
      /*
      async () => {
        const url: string = event.payload.url! as string;
        const { text, summary } = await new Scaper(this.env).fetch(url);
        const db = drizzle(this.env.MY_DB);
        await db
          .insert(contentTable)
          .values({
            url: url,
            content: summary,
            contentOrg: text,
            creator: "online",
            updated: new Date().getTime(),
            created: new Date().getTime(),
          })
          .onConflictDoUpdate({
            target: contentTable.url,
            set: {
              content: summary,
              updated: new Date().getTime(),
            },
            where: sql`${contentTable.url} != ${url}`,
          });
      }
      */
    );
  }
}
