import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { Swarm } from "../swarm/core";
import { Response, Report } from "../swarm/types";
import { Registry } from "../swarm/registry";
import { personTable } from "../schema";
import { drizzle } from "drizzle-orm/d1";
import { Person } from "../types";
import { sql } from "drizzle-orm";
export var registry = new Registry();

export default class NightlyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // await step.sleep("wait on something", "5 second");
    await step.do(
      "Fetch 20",
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
        registry.init(this.env);
        //@ts-ignore
        const config = { apiKey: this.env.OPEN_API_KEY, env: this.env };
        const client = new Swarm(config);
        console.log("Starting Swarm CLI 🐝");
        const messages: any[] = [];
        let agent = registry.getAgent("Nightly");
        console.log("Start Agent ", agent.name);
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

        try {
          const report: Report[] = completionResponse.messages[
            completionResponse.messages.length - 1
          ].content as Report[];
          const arr = new Array<Person>();
          report.map((report) => {
            arr.push({
              id: undefined,
              rank: report.rank,
              name: report.name,
              country: report.country,
              wikipediaUrl: report.wikipediaUrl,
              content: "",
              ratingDisplay: "",
              rating: 0,
              updated: new Date().getTime(),
              created: new Date().getTime(),
            });
          });
          const db = drizzle(this.env.MY_DB);
          await db
            .insert(personTable)
            .values(report)
            .onConflictDoUpdate({
              target: personTable.wikipediaUrl,
              set: {
                name: sql`excluded.name`,
                country: sql`excluded.country`,
                ratingDisplay: sql`excluded.rating_display`,
                rating: sql`excluded.rating`,
                updated: sql`excluded.updated`,
                // 'created' field is typically not updated to preserve the original creation timestamp
              },
            });
        } catch (err) {
          console.log("formatting not correct");
        }
      }
    );
  }
}
