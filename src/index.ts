import { Hono } from "hono";
import { cors } from "hono/cors";
import ToxicWorkflow from "./ToxicWorkflow";
export { ToxicWorkflow };

type Params = {
  url: string;
};

type Env = {
  Bindings: {
    KV: KVNamespace;
    MY_DB: D1Database;
    AI: Ai;
    SECRET_TURNSTYLE_KEY: string;
    OPEN_API_KEY: string;
    IN_QUEUE: Queue;
    MY_WORKFLOW: Workflow;
    BROWSER_KV_DEMO: KVNamespace;
    MYBROWSER: Fetcher;
  };
};

const app = new Hono<Env>();
app.use("*", cors());

app.get("/", (c) => {
  return c.json({ status: "OK", version: "0.0.1" });
});

app.post("/0/getImage", async (c) => {
  const data = await c.req.json();
  const url = data.url;
  const img = await c.env.BROWSER_KV_DEMO.get(url, { type: "arrayBuffer" });
  return new Response(img, {
    headers: {
      "content-type": "image/jpeg",
    },
  });
});

app.post("/0/set", async (c) => {
  const data = await c.req.json();
  console.log(data);
  await c.env.KV.put("MAIN", JSON.stringify(data));
  return c.json({ status: "OK" });
});

app.get("/0/get/:key", async (c) => {
  const key = c.req.param("key");
  const str = await c.env.KV.get(key);
  const data = JSON.parse(str!);
  return c.json(data);
});

app.post("/0/add", async (c) => {
  const body = await c.req.json();
  const urlSubmit = body.urlSubmit;
  const token = body.token;
  const clientIp = c.req.header("CF-Connecting-IP");

  // Validate turnstyle NOT protection
  let formData = new FormData();
  formData.append("secret", c.env.SECRET_TURNSTYLE_KEY!);
  formData.append("response", token);
  formData.append("remoteip", clientIp!);
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });
  const outcome = await result.json();

  //@ts-ignore
  if (outcome.success) {
    // https://orm.drizzle.team/docs/connect-cloudflare-d1
    // const db = drizzle(c.env.MY_DB);
    const msg = { url: urlSubmit, clientIp: clientIp };
    await c.env.IN_QUEUE.send(msg);
    return c.json({ status: "OK", version: "0.0.1" });
  }
  return c.json({ status: "REJECTED" });
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<Error>, envQueue: Env): Promise<void> {
    for (const message of batch.messages) {
      console.log(JSON.stringify(message));
      try {
        switch (batch.queue) {
          case "toxicpeople-in":
            console.log("handling toxicpeople-i message", message.body);

            //@ts-ignore
            let instance = await envQueue.MY_WORKFLOW.create({
              id: crypto.randomUUID(),
              //@ts-ignore
              params: { url: message.body.url },
            });
            console.log("workflow instance", JSON.stringify(instance));
            break;
        }
        message.ack();
      } catch (error) {
        console.error("Failed to process message:", error);
      }
    }
  },
};
