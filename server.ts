import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  } catch (e) {
    console.warn('Failed to initialize Gemini API. Ensure GEMINI_API_KEY is set.');
  }

  // Initialize OpenAI (for Whisper API)
  let openai: OpenAI | null = null;
  try {
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  } catch (e) {
    console.warn('Failed to initialize OpenAI API. Ensure OPENAI_API_KEY is set.');
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Video Analysis Endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      if (!ai) {
        throw new Error('Gemini API is not configured on the server.');
      }

      const { videoUrl, language } = req.body;

      if (!videoUrl) {
        return res.status(400).json({ error: 'Video URL is required' });
      }

      // 1. Simulate fetching video data (Audio to Text, Comments, Hashtags)
      // In a real scenario, you'd use a TikTok scraper (like RapidAPI or Apify) to get the video file and comments.
      
      /* 
      // --- Example OpenAI Whisper API Integration ---
      // Assuming you have downloaded the video audio to a local file 'audio.mp3'
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream("audio.mp3"),
        model: "whisper-1",
      });
      const actualTranscript = transcription.text;
      */

      const simulatedTranscript = "This is a simulated transcript from the video audio using Whisper API structure. It talks about how to go viral on TikTok by using strong hooks and engaging visuals.";
      const simulatedComments = [
        "Great video! This helped me a lot.", 
        "I didn't like this advice.", 
        "Amazing content, very helpful for my business.", 
        "Not for me, but good quality.",
        "Can you make a part 2?"
      ];
      const simulatedHashtags = ["#fyp", "#viral", "#trending", "#tiktoktips"];

      // 2. Use Gemini for deep analysis
      const prompt = `
        Analyze a TikTok video from the URL: ${videoUrl}.
        Language for the response: ${language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English'}.
        
        Here is the extracted data:
        - Transcript (from Audio-to-Text): "${simulatedTranscript}"
        - Sample Comments (first 50): ${JSON.stringify(simulatedComments)}
        - Current Hashtags: ${JSON.stringify(simulatedHashtags)}
        
        Provide a detailed analysis. Return the response strictly as a JSON object with the following structure:
        - hookScore: A number from 1 to 10 evaluating the first 3 seconds based on the transcript and typical TikTok trends.
        - hookComment: A brief explanation of the hook score.
        - visualContent: A description of what happens visually in the video based on typical TikTok trends.
        - transcript: The provided transcript.
        - hashtagsAnalysis: An evaluation of the current hashtags based on search volume/competition, and suggest 5 alternative high-performing hashtags.
        - sentiment: The overall sentiment of the provided comments (e.g., Positive, Mixed, Negative) with a brief summary.
        - tips: An array of 3 to 5 actionable tips to improve the video's performance.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hookScore: { type: Type.NUMBER },
              hookComment: { type: Type.STRING },
              visualContent: { type: Type.STRING },
              transcript: { type: Type.STRING },
              hashtagsAnalysis: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['hookScore', 'hookComment', 'visualContent', 'transcript', 'hashtagsAnalysis', 'sentiment', 'tips']
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response from Gemini');
      }

      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Checkout Session
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY is not set');
      }
      
      const stripe = new Stripe(stripeSecretKey);
      const { priceId, userId } = req.body;
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/pricing`,
        client_reference_id: userId,
      });

      res.json({ id: session.id });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
