import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  Bindings: {
    KV: KVNamespace;
    MY_DB: D1Database;
    AI: Ai;
    SECRET_TURNSTYLE_KEY: string;
    OPEN_API_KEY: string;
    IN_QUEUE: Queue;
  };
};

const app = new Hono<Env>();
app.use("*", cors());

app.get("/", (c) => {
  return c.json({ status: "OK", version: "0.0.1" });
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

export default app;
