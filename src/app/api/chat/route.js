import OpenAI from "openai";

const MODEL_NAME = "c1/anthropic/claude-sonnet-4/v-20250617";
const THESYS_BASE_URL = "https://api.thesys.dev/v1/embed";
const encoder = new TextEncoder();

function formatChunk(delta) {
  if (!delta) {
    return "";
  }

  if (typeof delta === "string") {
    return delta;
  }

  if (Array.isArray(delta)) {
    return delta
      .map((entry) => {
        if (!entry) {
          return "";
        }

        if (typeof entry === "string") {
          return entry;
        }

        return entry.text ?? "";
      })
      .join("");
  }

  if (typeof delta === "object" && delta.text) {
    return delta.text;
  }

  return "";
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

  const { messages } = body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
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
      messages,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of completion) {
            const chunkText = formatChunk(part.choices?.[0]?.delta?.content);
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Thesys API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Thesys response." }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

