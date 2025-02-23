import { parseHTML } from "linkedom";
import puppeteer from "@cloudflare/puppeteer";

export class Scaper {
  env: Env;
  artifact: any;

  constructor(env: Env) {
    this.env = env;
  }

  stripHtml = (html: string): string => html.replace(/<[^>]*>/g, "");

  async fetch(url: string): Promise<string> {
    // 1. Fetch the target page’s HTML
    const response = await fetch(url);
    const html = await response.text();

    const uri = new URL(url).toString(); // normalize
    this.artifact = await this.env.BROWSER_KV_DEMO.get(uri, {
      type: "arrayBuffer",
    });

    if (this.artifact === null) {
      const browser = await puppeteer.launch(this.env.MYBROWSER);
      const page = await browser.newPage();
      await page.goto(url);
      const metrics = await page.metrics();
      console.log(metrics);
      // this.artifact = (await page.screenshot()) as Buffer;
      this.artifact = (await page.pdf()) as Buffer;
      await this.env.BROWSER_KV_DEMO.put(url, this.artifact, {
        expirationTtl: 60 * 60 * 24,
      });
      await browser.close();
      return JSON.stringify(metrics); //tml);
    }

    // 2. Parse the HTML
    // const { document } = parseHTML(html);
    return html; //tml);
  }
}

/*
Measurement
{
    "Timestamp": 21677.900989,
    "Documents": 12,
    "Frames": 6,
    "JSEventListeners": 159,
    "Nodes": 5674,
    "LayoutCount": 27,
    "RecalcStyleCount": 34,
    "LayoutDuration": 0.330323,
    "RecalcStyleDuration": 0.54337,
    "ScriptDuration": 0.189425,
    "TaskDuration": 2.446843,
    "JSHeapUsedSize": 9434876,
    "JSHeapTotalSize": 12111872
}

{
    "Locations": [
        "Germany",
        "Israel",
        "Europe",
        "Egypt",
        "Ukraine",
        "Russia",
        "Palestine",
        "US"
    ],
    "Persons": [
        "Pope",
        "Musk",
        "Nicolas Cage",
        "Elon Musk",
        "James Bond"
    ],
    "Organizations": [
        "US Government",
        "Archaeologists",
        "BBC"
    ],
    "Events": [
        "Ukraine Conflict",
        "German Elections",
        "Israel & Palestine Conflict",
        "WW1-themed Drama",
        "Next James Bond Speculation"
    ]
}
    */
