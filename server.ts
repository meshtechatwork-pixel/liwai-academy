import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'Learn It With AI API' });
});

app.post('/api/prompts/generate', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    const { platform, category, purpose, tone, outputFormat, detailLevel, topic, regenerateSeed } =
      req.body ?? {};

    if (!platform || !category || !purpose || !tone || !outputFormat || !detailLevel) {
      return res.status(400).json({
        error: 'Please select AI platform, category, prompt purpose, tone, output format, and level of detail.',
      });
    }

    const userTopic =
      typeof topic === 'string' && topic.trim().length > 0
        ? topic.trim().slice(0, 600)
        : `A practical ${category} initiative focused on ${purpose}`;

    const systemInstruction = `You are a Principal Prompt Architect at Learn It With AI.
Your task is to engineer a detailed, immediately usable, production-grade prompt tailored to the user's selected AI platform, category, purpose, tone, output format, and level of detail.
Ensure the prompt includes explicit role framing, context, rules/constraints, step-by-step instructions, quality verification checks, and customizable bracketed placeholders.`;

    const variationNote = regenerateSeed
      ? `\n- Variation Directive: Produce a fresh structural angle and distinct phrasing (seed: ${String(regenerateSeed).slice(0, 40)}).`
      : '';

    const promptRequest = `Generate a structured prompt with these exact specifications:
- Target AI Platform: ${String(platform).slice(0, 80)}
- Category: ${String(category).slice(0, 80)}
- Prompt Purpose: ${String(purpose).slice(0, 140)}
- Desired Tone: ${String(tone).slice(0, 60)}
- Output Format: ${String(outputFormat).slice(0, 80)}
- Level of Detail: ${String(detailLevel).slice(0, 60)}
- Specific Project / Topic Context: ${userTopic}${variationNote}

Return a JSON object containing:
1. "title": a concise descriptive title for this prompt
2. "prompt": the complete, ready-to-copy structured prompt scaled appropriately to the requested Level of Detail (${String(detailLevel).slice(0, 60)})
3. "usageTips": 3 concise practical tips tailored to ${String(platform).slice(0, 80)}
4. "variables": up to 5 short placeholder variable names included in the prompt`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: promptRequest,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Concise descriptive title for the engineered prompt.' },
            prompt: { type: Type.STRING, description: 'The complete structured prompt ready to copy and run.' },
            usageTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Three concise execution tips for the target AI platform.',
            },
            variables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key customizable placeholder variables included in the prompt.',
            },
          },
          required: ['title', 'prompt', 'usageTips', 'variables'],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return res.status(502).json({ error: 'The AI model returned an empty response. Please try again.' });
    }

    const parsed = JSON.parse(rawText);
    return res.json({
      title: parsed.title || `${category} — ${purpose}`,
      prompt: parsed.prompt || rawText,
      usageTips: Array.isArray(parsed.usageTips) ? parsed.usageTips : [],
      variables: Array.isArray(parsed.variables) ? parsed.variables : [],
    });
  } catch (err) {
    console.error('Error generating prompt:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate prompt.';
    return res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Learn It With AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
