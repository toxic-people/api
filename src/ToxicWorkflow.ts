import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { Scaper } from "./scraper";
import { drizzle } from "drizzle-orm/d1";
import { contentTable } from "./schema";
import { sql } from "drizzle-orm";

export default class ToxicWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
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
        timeout: "2 minutes",
      },
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
    );
  }
}
