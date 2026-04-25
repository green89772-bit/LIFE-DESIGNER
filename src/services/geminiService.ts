import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function reframeDysfunctionalBelief(belief: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a life design coach. Your task is to take a 'dysfunctional belief' (失功能信念) and 'reframe' (重擬) it into a positive, actionable life design truth based on the 'Designing Your Life' book. Keep it concise, wise, and encouraging. Respond in Traditional Chinese (繁體中文).",
      },
      contents: `重擬這個想法：\"${belief}\"`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Reframing failed:", error);
    return "AI 暫時無法連線，請試著從另一個角度思考。";
  }
}

export async function generateMindMapIdeas(theme: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a creative brainstorming assistant. Given a theme, generate 5-8 wild, diverse, and unexpected branches for a life design mind map. Each branch should be a short phrase. Respond in Traditional Chinese (繁體中文). Return the result as a bulleted list.",
      },
      contents: `主題是：\"${theme}\"`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Mind map failed:", error);
    return "無法生成創意，試著隨意聯想吧！";
  }
}
