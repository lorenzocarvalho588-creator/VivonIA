// netlify/functions/vivon-ai.js
// Atende toda a VIVON AI: Coach, Nutricionista, Personal, Planejador e o Analista.
// A chave da API fica segura aqui no servidor (variável de ambiente), nunca no front.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5"; // modelo definido no servidor

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método não permitido" }) };
  }

  try {
    const { system, messages, max_tokens } = JSON.parse(event.body || "{}");

    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "O campo 'messages' é obrigatório." }) };
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada no Netlify." }) };
    }

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: max_tokens || 1000,
        system: system || "",
        messages,
      }),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno na função VIVON AI", detail: String(err) }),
    };
  }
};
