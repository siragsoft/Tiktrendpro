import { GoogleGenAI, Type } from '@google/genai';

export interface VideoAnalysisResult {
  hookScore: number;
  hookComment: string;
  visualContent: string;
  transcript: string;
  hashtagsAnalysis: string;
  sentiment: string;
  tips: string[];
}

export async function analyzeVideoWithGemini(
  videoUrl: string,
  language: string = "en",
): Promise<VideoAnalysisResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const simulatedTranscript = "This is a simulated transcript from the video audio using Whisper API structure. It talks about how to go viral on TikTok by using strong hooks and engaging visuals.";
    const simulatedComments = [
      "Great video! This helped me a lot.", 
      "I didn't like this advice.", 
      "Amazing content, very helpful for my business.", 
      "Not for me, but good quality.",
      "Can you make a part 2?"
    ];
    const simulatedHashtags = ["#fyp", "#viral", "#trending", "#tiktoktips"];

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

    let text = response.text;
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON block if wrapped in markdown
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      text = jsonMatch[1];
    }
    text = text.trim();

    return JSON.parse(text) as VideoAnalysisResult;
  } catch (error: any) {
    console.error("Error analyzing video:", error);
    throw new Error(error.message || "Failed to analyze video");
  }
}
