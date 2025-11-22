import OpenAI from "openai";

const MODEL_NAME = "c1/anthropic/claude-sonnet-4/v-20250617";
const THESYS_BASE_URL = "https://api.thesys.dev/v1/embed";
const BASE_SYSTEM_PROMPT = `You are the Thesys C1 Generative UI engineer.
Return immersive enterprise-grade artifacts that feel like the showcases at https://www.thesys.dev/artifacts.
Return valid C1 markup using <content>...</content> for narrative copy and <artifact type="report|slides|dashboard|canvas" id="...">...</artifact> for interactive layouts.
Inside artifacts, use rich constructs such as <section> with headings, <stat>, <kpi>, <table>, <callout>, <timeline>, <pill>, and CTA rows.
Always include chips, structured bullets, or multi-column grids when summarising data, and wrap supporting context inside <context> when helpful.
Never emit markdown or JSON—only XML-like C1 tags.`;

function normalizeMessages(messages = []) {
  return messages
    .filter(
      (message) =>
        message &&
        typeof message.role === "string" &&
        typeof message.content === "string",
    )
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content.trim(),
    }));
}

function buildSystemMessage(intent) {
  if (!intent) {
    return BASE_SYSTEM_PROMPT;
  }

  return `${BASE_SYSTEM_PROMPT}
Focus especially on the "${intent}" use case.
Ensure the artifact feels bespoke with tailored KPIs, tags, and CTAs for that scenario.`;
}

export async function POST(request) {
  const apiKey = process.env.THESYS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "THESYS_API_KEY is not configured." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, intent } = body ?? {};
  const sanitizedMessages = normalizeMessages(messages);

  if (!sanitizedMessages.length) {
    return new Response(JSON.stringify({ error: "messages array required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: THESYS_BASE_URL,
  });

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: buildSystemMessage(intent) },
        ...sanitizedMessages,
      ],
      temperature: 0.2,
      stream: false,
    });

    const artifact = completion.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(JSON.stringify({ artifact }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const status =
      (typeof error === "object" && error && "status" in error && error.status) ||
      (error?.cause?.status ?? 502);
    const message =
      (typeof error === "object" && error && "message" in error && error.message) ||
      "Failed to fetch Thesys response.";

    console.error("Thesys API error:", status, message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: Number.isInteger(status) ? status : 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

