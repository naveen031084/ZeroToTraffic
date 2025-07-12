import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const key = process.env.GEMINI_KEY;
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function generate(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    throw new Error('Gemini error');
  }
}

app.post('/api/suggest-topics', async (req, res) => {
  const { niche } = req.body || {};
  if (!niche) return res.json({ topics: [] });
  const prompt = `Give 10 catchy blog/LinkedIn topics for a ${niche} business. Return only a JSON array.`;
  try {
    const text = await generate(prompt);
    const cleaned = text.replace(/```json|```/g, '').trim();
    const topics = JSON.parse(cleaned);
    res.json({ topics });
  } catch {
    res.json({ topics: ['Topic 1','Topic 2','Topic 3','Topic 4','Topic 5','Topic 6','Topic 7','Topic 8','Topic 9','Topic 10'] });
  }
});

app.post('/api/generate-blog', async (req, res) => {
  const { topic, length = 400 } = req.body || {};
  if (!topic) return res.json({ markdown: '' });
  const prompt = `Write an SEO-optimized blog post (~${length} words) about: ${topic}. Return markdown.`;
  try {
    const md = await generate(prompt);
    res.json({ markdown: md });
  } catch {
    res.json({ markdown: `# ${topic}\n\nComing soon…` });
  }
});

app.post('/api/meta-tags', async (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.json({ title:'', description:'' });
  const prompt = `Create SEO meta title (≤60 chars) and meta description (≤160 chars) for: ${title}. Return JSON {title, description}.`;
  try {
    const text = await generate(prompt);
    const data = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.json(data);
  } catch {
    res.json({ title, description: `Read our guide on ${title}.` });
  }
});

app.post('/api/linkedin-post', async (req, res) => {
  const { blogMd } = req.body || {};
  if (!blogMd) return res.json({ post: '' });
  const prompt = `Turn this blog into a short, engaging LinkedIn post with 3 emojis and a CTA. Return plain text.\n\n${blogMd}`;
  try {
    const post = await generate(prompt);
    res.json({ post });
  } catch {
    res.json({ post: 'Just published a new article! 🚀 Check it out 👇' });
  }
});

export default app;
