import puppeteer from "@cloudflare/puppeteer";
import { ChatOpenAI } from "@langchain/openai";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getDocumentProxy, extractText } from "unpdf";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export class Scaper {
  env: Env;
  artifact: any;

  constructor(env: Env) {
    this.env = env;
    this.artifact = [];
  }

  async extractPdfText(pdfData: Uint8Array): Promise<string> {
    const pdf = await getDocumentProxy(pdfData);
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }

  async summarizeText(text: string, openaiKey: string): Promise<string> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    const docChunks = await textSplitter.createDocuments([text]);

    const llm = new ChatOpenAI({
      modelName: "gpt-4",
      openAIApiKey: openaiKey,
      temperature: 0,
    });
    const chain = loadSummarizationChain(llm, { type: "map_reduce" });
    return await chain.run(docChunks);
  }

  stripHtml = (html: string): string => html.replace(/<[^>]*>/g, "");

  async fetch(url: string): Promise<{ text: string; summary: string }> {
    const browser = await puppeteer.launch(this.env.MYBROWSER);
    const page = await browser.newPage();
    await page.goto(url);
    // const metrics = await page.metrics();
    this.artifact = new Uint8Array(await page.pdf());
    await this.env.BROWSER_KV_DEMO.put(url, this.artifact, {
      expirationTtl: 60 * 60 * 24,
    });
    await browser.close();

    // cherio
    const pTagSelector = "p";
    const cheerioLoader = new CheerioWebBaseLoader(url, {
      selector: pTagSelector,
    });
    const docs = await cheerioLoader.load();

    // unpdf
    //const document = await getDocumentProxy(new Uint8Array(this.artifact));
    //const { text } = await extractText(document, { mergePages: true });

    // Define prompt
    const prompt = PromptTemplate.fromTemplate(
      "Summarize the main themes in these retrieved doc: {context} "
    );

    const llm = new ChatOpenAI({
      //@ts-ignore
      apiKey: this.env.OPEN_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0,
    });
    // Instantiate
    const chain = await createStuffDocumentsChain({
      llm: llm,
      outputParser: new StringOutputParser(),
      prompt,
    });

    const summary = await chain.invoke({ context: docs });

    console.log(summary);
    return { text: docs[0].pageContent, summary: summary };
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
