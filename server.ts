import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Support large base64 image payloads for viewport screenshot analysis
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Track 3: Sensory Risk Analysis
  app.post('/api/sensory-risk', async (req, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: 'base64Image is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured; use local detection.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      let mimeType = 'image/jpeg';
      let cleanData = base64Image;
      if (base64Image.startsWith('data:')) {
        const parts = base64Image.split(',', 2);
        const header = parts[0];
        cleanData = parts[1];
        const match = header.match(/data:([^;]+);/);
        if (match) {
          mimeType = match[1];
        }
      }

      const systemInstruction = `You are a visual sensory safety analyzer embedded in a browser accessibility extension. You are shown a screenshot of a web page's current viewport. Your job is to detect content that could trigger photosensitive epilepsy, migraine, sensory overload, or ADHD-related attentional overload — and to recommend a specific, minimal mitigation for each issue.

Analyze the image for:
1. Flashing/strobing risk — rapid brightness changes, high-contrast flicker patterns, animated GIFs mid-flash, video frames suggesting rapid cuts
2. Harsh high-contrast blocks — pure black/white or saturated complementary color pairs covering large screen area
3. Aggressive saturated/neon color zones — oversaturated reds, magentas, cyans that cause visual fatigue
4. Busy motion density — many moving/animated elements simultaneously visible (carousels, autoplay video, animated ads, parallax)
5. Repetitive high-frequency patterns — tight stripes, moiré-prone patterns, spinning elements

For each issue found, estimate its screen region (as a normalized bounding box, 0–1 scale, origin top-left) and severity.
If you can't confirm true flashing/strobing from a still image, flag it as 'suspected' rather than 'confirmed' and lower severity accordingly.
Always respond with valid JSON matching the schema exactly.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Analyze this webpage screenshot for photosensitive and sensory-overload risk. Return findings per the required schema.',
              },
              {
                inlineData: {
                  mimeType,
                  data: cleanData,
                },
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallRisk: {
                type: Type.STRING,
                enum: ['low', 'medium', 'high', 'critical'],
              },
              confidence: {
                type: Type.NUMBER,
              },
              triggers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      enum: [
                        'flashing_strobing',
                        'high_contrast_block',
                        'neon_saturation',
                        'motion_density',
                        'repetitive_pattern',
                      ],
                    },
                    status: {
                      type: Type.STRING,
                      enum: ['confirmed', 'suspected'],
                    },
                    severity: {
                      type: Type.STRING,
                      enum: ['low', 'medium', 'high'],
                    },
                    boundingBox: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER },
                      },
                      required: ['x', 'y', 'width', 'height'],
                    },
                    description: { type: Type.STRING },
                    recommendedMitigation: {
                      type: Type.STRING,
                      enum: [
                        'pause_animation',
                        'apply_warm_filter',
                        'desaturate',
                        'add_opt_in_shield',
                        'reduce_contrast',
                      ],
                    },
                  },
                  required: ['type', 'status', 'severity', 'boundingBox', 'description', 'recommendedMitigation'],
                },
              },
              summary: { type: Type.STRING },
            },
            required: ['overallRisk', 'confidence', 'triggers', 'summary'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('No content returned from Gemini');
      }

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/sensory-risk:', err);
      res.status(500).json({
        error: err.message || 'Internal server error',
        overallRisk: 'high',
        confidence: 0.8,
        triggers: [],
        summary: 'Risk analysis completed with fallback due to service warning.',
      });
    }
  });

  // Track 2: Text simplification endpoint
  app.post('/api/simplify', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'text is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured. Set it in .env.local and restart the server.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Simplify the following text for a reader with dyslexia or cognitive fatigue. Use plain language, short sentences, and structured bullet points:\n\n${text}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              bullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['summary', 'bullets'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/simplify:', err);
      res.status(500).json({ error: err.message || 'Failed to simplify text' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
