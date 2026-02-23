import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: We use the process.env.GEMINI_API_KEY which is injected by the platform
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generates an embedding vector for a given text using the Gemini API.
 * Uses the 'text-embedding-004' model (or latest equivalent).
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!ai) {
    throw new Error("Gemini API Key is missing. Please set it in the environment variables.");
  }

  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ parts: [{ text }] }],
    });

    const embedding = response.embeddings?.[0]?.values;
    
    if (!embedding) {
      throw new Error("No embedding returned from API");
    }
    
    return embedding;
  } catch (error) {
    console.error("Error fetching embedding:", error);
    throw error;
  }
}
