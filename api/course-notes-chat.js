const { once } = require("node:events");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";
const MAX_BODY_BYTES = 200_000;
const MAX_MESSAGES = 21;
const MAX_MESSAGE_CHARS = 24_000;
const MAX_TOTAL_CHARS = 40_000;

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return "Invalid conversation.";
  }

  let totalChars = 0;
  for (const message of messages) {
    if (
      !message ||
      typeof message !== "object" ||
      !["system", "user", "assistant"].includes(message.role) ||
      typeof message.content !== "string" ||
      message.content.length > MAX_MESSAGE_CHARS
    ) {
      return "Invalid conversation.";
    }
    totalChars += message.content.length;
    if (totalChars > MAX_TOTAL_CHARS) return "Conversation is too long.";
  }
  if (messages[0].role !== "system" || messages.slice(1).some((message) => message.role === "system")) {
    return "Invalid conversation.";
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: { message: "Method not allowed." } });
  }

  const contentLength = Number(req.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return sendJson(res, 413, { error: { message: "Request is too large." } });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return sendJson(res, 503, { error: { message: "The AI Tutor is not configured. Please contact the site administrator." } });
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendJson(res, 400, { error: { message: "Invalid request." } });
  }
  const validationError = validateMessages(body.messages);
  if (validationError) {
    return sendJson(res, 400, { error: { message: validationError } });
  }

  let upstream;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `https://${req.headers.host || "vercel.com"}`,
        "X-Title": "COMP5241 Course Notes Tutor",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: body.messages,
        stream: true,
        max_tokens: 700,
      }),
    });
  } catch (error) {
    console.error("OpenRouter request failed:", error);
    return sendJson(res, 502, { error: { message: "The AI Tutor could not connect to its provider. Please try again." } });
  }

  if (!upstream.ok) {
    const detail = (await upstream.text()).slice(0, 1000);
    console.error(`OpenRouter returned ${upstream.status}:`, detail);
    return sendJson(res, 502, { error: { message: "The AI Tutor provider returned an error. Please try again later." } });
  }

  if (!upstream.body) {
    return sendJson(res, 502, { error: { message: "The AI Tutor provider returned an empty response." } });
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    for await (const chunk of upstream.body) {
      if (!res.write(chunk)) await once(res, "drain");
    }
    res.end();
  } catch (error) {
    console.error("OpenRouter stream failed:", error);
    res.destroy(error);
  }
};
