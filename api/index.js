// api/index.js  – runs on Vercel Serverless
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function generate(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Suggest topics
app.post('/api/suggest-topics', async (req, res) => {
  const { niche } = req.body;
  const prompt = `Give 10 catchy blog/LinkedIn topics for a ${niche} business. Return only a JSON array of strings.`;
  try {
    const text = await generate(prompt);
    const topics = JSON.parse(text.trim());
    res.json({ topics });
  } catch (e) {
    res.status(500).json({ error: 'AI error' });
  }
});

// Generate blog post
app.post('/api/generate-blog', async (req, res) => {
  const { topic, length = 400 } = req.body;
  const prompt = `Write an SEO-optimized blog post (~${length} words) about: ${topic}. Return markdown.`;
  const md = await generate(prompt);
  res.json({ markdown: md });
});

// Meta tags
app.post('/api/meta-tags', async (req, res) => {
  const { title } = req.body;
  const prompt = `Create SEO meta title (≤60 chars) and meta description (≤160 chars) for: ${title}. Return JSON {title, description}.`;
  const text = await generate(prompt);
  const data = JSON.parse(text.trim());
  res.json(data);
});

// LinkedIn post
app.post('/api/linkedin-post', async (req, res) => {
  const { blogMd } = req.body;
  const prompt = `Turn this blog into a short, engaging LinkedIn post with 3 emojis and a CTA. Return plain text.`;
  const post = await generate(prompt);
  res.json({ post });
});

export default app;
