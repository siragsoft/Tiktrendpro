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
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze video');
    }

    return await response.json() as VideoAnalysisResult;
  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
}
