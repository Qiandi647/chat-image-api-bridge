import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

function wantsImage(text) {
  return /生成图片|画一张|插画|漫画|海报|image|draw|illustration/i.test(text);
}

async function generateImage(prompt) {
  const response = await fetch(process.env.IMAGE_GENERATION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.IMAGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.IMAGE_MODEL,
      prompt,
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    throw new Error(`Image API returned ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const first = data.data?.[0] ?? data.images?.[0];
  const imageUrl = first?.url ?? first?.image_url;
  const base64 = first?.b64_json ?? first?.base64;

  if (!imageUrl && !base64) {
    throw new Error("The provider response did not contain an image URL or Base64 image.");
  }

  return { imageUrl, base64 };
}

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message ?? "").trim();

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    if (wantsImage(message)) {
      return res.json({
        type: "image",
        prompt: message,
        ...(await generateImage(message)),
      });
    }

    // Replace this branch with your text-model call.
    return res.json({
      type: "text",
      content: "这是文字模型分支；需要生成图片时才会调用图片 API。",
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on http://localhost:${process.env.PORT || 3000}`);
});
