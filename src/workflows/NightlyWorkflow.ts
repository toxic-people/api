import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { Swarm } from "../swarm/core";
import { Response } from "../swarm/types";
import { Registry } from "../swarm/registry";
import { personTable } from "../schema";
import { drizzle } from "drizzle-orm/d1";
import { People, Person, Render, Report } from "../types";
import { sql } from "drizzle-orm";
import { forEach } from "lodash";
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

        /*
        const client = new Swarm(config);
        console.log("Starting Swarm CLI 🐝");
        const messages: any[] = [];
        let agent = registry.getAgent("Nightly");
        console.log("Start Agent ", agent.name);
        const response = await client.run({
          agent,
          messages,
          max_turns: 1,
          execute_tools: true,
          debug: true,
        });
        const completionResponse = response as Response;
        messages.push(...completionResponse.messages);
        agent = completionResponse.agent!;
        console.log("End========================= ");
        */

        try {
          /*
          const obj =
            completionResponse.messages[completionResponse.messages.length - 1]
              .content;
          console.log("obj.content", JSON.stringify(obj));
          */

          const report: Report[] = [
            {
              rank: 1,
              name: "Andrew Tate",
              country: "United States / United Kingdom",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Andrew_Tate",
            },
            {
              rank: 2,
              name: "Donald Trump",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Donald_Trump",
            },
            {
              rank: 3,
              name: "Elon Musk",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Elon_Musk",
            },
            {
              rank: 4,
              name: "Nick Fuentes",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Nick_Fuentes",
            },
            {
              rank: 5,
              name: "Keith Raniere",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Keith_Raniere",
            },
            {
              rank: 6,
              name: "Umar Johnson",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Umar_Johnson",
            },
            {
              rank: 7,
              name: "Jake Paul",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Jake_Paul",
            },
            {
              rank: 8,
              name: "Logan Paul",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Logan_Paul",
            },
            {
              rank: 9,
              name: "Milo Yiannopoulos",
              country: "United Kingdom",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Milo_Yiannopoulos",
            },
            {
              rank: 10,
              name: "Alex Jones",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Alex_Jones",
            },
            {
              rank: 11,
              name: "Steve Bannon",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Steve_Bannon",
            },
            {
              rank: 12,
              name: "Richard Spencer",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Richard_B._Spencer",
            },
            {
              rank: 13,
              name: "Tommy Robinson",
              country: "United Kingdom",
              wikipediaUrl:
                "https://en.wikipedia.org/wiki/Tommy_Robinson_(activist)",
            },
            {
              rank: 14,
              name: "David Duke",
              country: "United States",
              wikipediaUrl: "https://en.wikipedia.org/wiki/David_Duke",
            },
            {
              rank: 15,
              name: "Gavin McInnes",
              country: "Canada",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Gavin_McInnes",
            },
            {
              rank: 16,
              name: "Stefan Molyneux",
              country: "Canada",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Stefan_Molyneux",
            },
            {
              rank: 17,
              name: "Lauren Southern",
              country: "Canada",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Lauren_Southern",
            },
            {
              rank: 18,
              name: "Katie Hopkins",
              country: "United Kingdom",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Katie_Hopkins",
            },
            {
              rank: 19,
              name: "Paul Joseph Watson",
              country: "United Kingdom",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Paul_Joseph_Watson",
            },
            {
              rank: 20,
              name: "Sargon of Akkad (Carl Benjamin)",
              country: "United Kingdom",
              wikipediaUrl: "https://en.wikipedia.org/wiki/Carl_Benjamin",
            },
          ];
          const persons = new Array<Person>();
          const people = new Array<People>();
          var count = 0;
          const db = drizzle(this.env.MY_DB);
          report.map((report) => {
            const p: Person = {
              name: report.name,
              country: report.country,
              wikipediaUrl: report.wikipediaUrl,
              content: "",
              ratingDisplay: "",
              rating: 0,
              updated: 0,
              created: 0,
            };
            persons.push(p);

            if (count < 10) {
              people.push({
                rank: report.rank,
                name: report.name,
                country: report.country,
                wikipediaUrl: report.wikipediaUrl,
              });
              count += 1;
            }
          });
          persons.forEach(async (person) => {
            await db
              .insert(personTable)
              .values(person)
              .onConflictDoUpdate({
                target: personTable.id, // Conflict target: primary key id''
                set: {
                  name: personTable.name,
                  content: personTable.content,
                  ratingDisplay: personTable.ratingDisplay,
                  rating: personTable.rating,
                  country: personTable.country,
                  updated: new Date().getTime(),
                },
              });
          });

          const render: Render = {
            people: people,
            created: new Date().getTime(),
          };
          await this.env.KV.put("MAIN_NEW", JSON.stringify(render));

          /*
            .onConflictDoUpdate({
              target: personTable.wikipediaUrl,
              set: {
                name: sql`excluded.name`,
                country: sql`excluded.country`,
                ratingDisplay: sql`excluded.ratingDisplay`,
                rating: sql`excluded.rating`,
                updated: sql`excluded.updated`,
                // 'created' field is typically not updated to preserve the original creation timestamp
              },
            });
            */
        } catch (err) {
          console.log("formatting not correct", err);
        }
      }
    );
  }
}
