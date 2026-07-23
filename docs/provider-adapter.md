# 第三方图片 API 适配说明

## 请求格式

本项目默认使用常见的 OpenAI-compatible JSON 请求：

```http
POST /v1/images/generations
Authorization: Bearer <local-api-key>
Content-Type: application/json
```

```json
{
  "model": "gpt-image-2",
  "prompt": "image description",
  "size": "1024x1024"
}
```

## 响应格式

适配器读取以下任一字段：

```json
{"data":[{"url":"https://..."}]}
```

或：

```json
{"data":[{"b64_json":"..."}]}
```

如果供应商字段不同，只修改 `server/index.mjs` 中的响应解析，不要把 Key 写进代码。

## 供应商切换

优先通过环境变量切换：

```dotenv
IMAGE_GENERATION_URL=https://new-provider.example/v1/images/generations
IMAGE_API_KEY=replace_me
IMAGE_MODEL=provider-model-name
```

聊天模型仍然可以保持不变。
