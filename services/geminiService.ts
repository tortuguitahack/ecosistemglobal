import { GoogleGenAI, Tool, Modality } from "@google/genai";
import { System } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI assistant will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSpeech = async (text: string): Promise<string> => {
    if (!API_KEY) {
        console.warn("API Key not configured. Speech generation will not work.");
        return "";
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                // FIX: Used Modality.AUDIO enum instead of a string literal, as per API guidelines.
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || "";
    } catch (error) {
        console.error("Error generating speech:", error);
        return "";
    }
};

export const getAiResponse = async (
    prompt: string, 
    chatHistory: { role: string, parts: { text: string }[] }[],
    systems: System[],
    isThinkingMode: boolean
): Promise<{ text: string; sources: any[] }> => {
  if (!API_KEY) {
    return { text: "API Key not configured. Please set up your Gemini API key.", sources: [] };
  }
  
  try {
    const systemInstruction = "You are an expert AI assistant for managing a large-scale automation ecosystem named 'n8n Revenue Pro'. Your role is to analyze data, provide actionable insights, detect anomalies, and help users optimize their automation workflows for maximum revenue and efficiency. You have access to real-time data for all 100 systems. When asked for a summary or performance of a specific system, use the provided data to give a concise, data-driven, and friendly response. Be concise in all your responses.";

    let finalPrompt = prompt;
    const lowerCasePrompt = prompt.toLowerCase();

    // Check if the user is asking for a system summary
    const summaryKeywords = ['summary', 'performance', 'status', 'details', 'info on'];
    if (summaryKeywords.some(keyword => lowerCasePrompt.includes(keyword))) {
        for (const system of systems) {
            if (lowerCasePrompt.includes(system.name.toLowerCase())) {
                finalPrompt = `
                    Please provide a concise and easy-to-understand summary of the performance for the following system.
                    Use a friendly and helpful tone, and present the key metrics clearly.
                    System Data:
                    - Name: ${system.name}
                    - Status: ${system.status}
                    - Revenue (last 30 days): $${system.revenue.toLocaleString()}
                    - Conversions (last 30 days): ${system.conversions}
                    - ROI: ${system.roi}%
                    - Description: ${system.description}
                    Based on this data, summarize its current performance.
                `;
                break;
            }
        }
    }

    const conversationHistory = [...chatHistory, { role: "user", parts: [{ text: finalPrompt }] }];
    
    const searchKeywords = ['latest', 'current events', 'news', 'who won', 'what is the score', 'recent', 'trending', 'what is the current'];
    const shouldUseSearch = searchKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

    let modelName = 'gemini-2.5-flash';
    let config: any = { systemInstruction };
    let tools: Tool[] | undefined = undefined;

    if (isThinkingMode) {
        modelName = 'gemini-2.5-pro';
        config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (shouldUseSearch) {
        modelName = 'gemini-2.5-flash';
        tools = [{ googleSearch: {} }];
    }
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: conversationHistory,
        config: config,
        tools: tools,
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

    return { text: response.text, sources };
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return { text: "Sorry, I encountered an error. Please check the console for details.", sources: [] };
  }
};