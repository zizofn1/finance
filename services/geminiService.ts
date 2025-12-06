
import { GoogleGenAI, Type } from "@google/genai";
import { SmartInsight } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

export const generateInsights = async (data: any): Promise<SmartInsight[]> => {
  const prompt = `
    You are a financial analyst for a Joinery/Interior Fitting business.
    Analyze the following JSON data representing Projects, Financials, and Inventory.
    
    Data: ${JSON.stringify(data)}

    Provide 4-6 specific "Smart Insights" to help the business owner.
    
    Context:
    - Projects marked as 'ESTIMATE' with Income usually represent "Advance Payments" or Deposits. This is normal and good for Cash Flow.
    - Focus on "Completed" projects for final profitability analysis.
    
    Focus on:
    1. Project Profitability (Which jobs made money, which lost?).
    2. Material Waste/Cost (Are we spending too much on wood?).
    3. Cash Flow warnings.
    4. Operational efficiency.

    IMPORTANT: Respond in FRENCH (Français).
    The description should be detailed (2-3 sentences).

    Return the response as a JSON array of objects with the following schema:
    [{ "title": "string", "description": "string", "type": "WARNING" | "OPPORTUNITY" | "INFO", "metric": "string (optional)" }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["WARNING", "OPPORTUNITY", "INFO"] },
              metric: { type: Type.STRING },
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SmartInsight[];

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [
      {
        title: "Analysis Failed",
        description: "Could not generate insights at this time.",
        type: "WARNING"
      }
    ];
  }
};
