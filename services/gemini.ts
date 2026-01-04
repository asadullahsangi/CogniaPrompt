
import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationResult, Tone, Role } from "../types";

// Get API key from environment
// Try multiple sources: Vite's define replacement, then import.meta.env (Vite standard)
const getApiKey = (): string => {
  // @ts-ignore - process.env.API_KEY is replaced by Vite's define
  let apiKey = (process.env.API_KEY || "").trim();
  
  // Fallback to import.meta.env (Vite standard - automatically available for VITE_ prefixed vars)
  if (!apiKey && typeof import.meta !== 'undefined') {
    // @ts-ignore
    apiKey = (import.meta.env?.VITE_GEMINI_API_KEY || "").trim();
  }
  
  // Also try process.env.GEMINI_API_KEY (in case define didn't work)
  if (!apiKey && typeof process !== 'undefined' && process.env) {
    apiKey = (process.env.GEMINI_API_KEY || "").trim();
  }
  
  // Check for placeholder values
  if (apiKey === 'your_gemini_api_key_here' || apiKey === 'your_api_key_here') {
    throw new Error('Please set your GEMINI_API_KEY in .env.local file (for local) or Vercel environment variables (for production).');
  }
  
  if (!apiKey || apiKey.length < 20) {
    console.error('❌ API Key Error:', {
      keyLength: apiKey.length,
      keyPrefix: apiKey ? apiKey.substring(0, 5) : 'EMPTY',
      hasKey: !!apiKey,
      isPlaceholder: apiKey.includes('your_'),
      hasProcessEnv: typeof process !== 'undefined',
      hasImportMeta: typeof import.meta !== 'undefined',
      // @ts-ignore
      importMetaKeys: typeof import.meta !== 'undefined' ? Object.keys(import.meta.env || {}).filter(k => k.includes('API') || k.includes('GEMINI')) : []
    });
    throw new Error('API key is missing. Please provide a valid API key in .env.local (local) or Vercel settings (production).');
  }
  
  return apiKey;
};

// Lazy initialization - only create AI instance when needed
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = getApiKey();
    console.log('✅ API Key loaded successfully, length:', apiKey.length);
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const optimizePrompt = async (
  prompt: string,
  tone: Tone,
  role: Role,
  extraInstructions?: string
): Promise<OptimizationResult> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Optimize the following prompt.
      User's Original Prompt: "${prompt}"
      Desired Tone: ${tone}
      Persona/Role: ${role}
      Additional Context: ${extraInstructions || "None"}`,
      config: {
        systemInstruction: `You are a world-class Prompt Engineer specializing in Large Language Model (LLM) optimization.
        Your goal is to transform rough user inputs into high-performance, clear, and context-rich prompts.
        Follow prompt engineering best practices: clear constraints, few-shot examples (simulated), delimiters, and explicit output formatting instructions.
        Provide a primary optimized version, clear reasoning, a quality score (1-100), actionable tips, and three variants (Short, Detailed, Creative).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            score: { type: Type.NUMBER },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            variants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["label", "content"]
              }
            }
          },
          required: ["optimizedPrompt", "reasoning", "score", "tips", "variants"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as OptimizationResult;
  } catch (error: any) {
    // Provide more helpful error messages
    if (error.message?.includes('API key')) {
      throw error; // Re-throw our custom API key error
    }
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY in .env.local (local) or Vercel settings (production).');
    }
    if (error.message?.includes('403') || error.message?.includes('forbidden')) {
      throw new Error('API key does not have permission to access Gemini API. Please enable the Generative Language API in Google Cloud Console.');
    }
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED') || error.code === 429) {
      throw new Error('API quota exceeded. You have reached your rate limit. Please wait a moment and try again, or check your usage at https://ai.dev/usage?tab=rate-limit');
    }
    // Re-throw with original message
    throw new Error(error.message || 'An error occurred while optimizing the prompt. Please try again.');
  }
};
