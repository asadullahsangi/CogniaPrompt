
import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationResult, Tone, Role } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const optimizePrompt = async (
  prompt: string,
  tone: Tone,
  role: Role,
  extraInstructions?: string
): Promise<OptimizationResult> => {
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
};
