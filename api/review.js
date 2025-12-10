// api/review.js

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ error: "Method not allowed. Use POST." });
  }

  const body = req.body || {};
  const prompt = body.prompt;

  if (!prompt) {
    res.statusCode = 400;
    return res.json({ error: "Missing 'prompt' in request body." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    return res.json({ error: "OPENAI_API_KEY is not set on the server." });
  }

  try {
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Arabic educational program and training package reviewer. Answer only in high-quality Arabic."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      res.statusCode = 500;
      return res.json({ error: "OpenAI API error", details: text });
    }

    const data = await apiRes.json();
    const result =
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "";

    res.statusCode = 200;
    return res.json({ result: result.trim() });
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    return res.json({ error: "Server error", details: err.message });
  }
};
