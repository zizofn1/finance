
import { SmartInsight } from '../types';

export const generateInsights = async (data: any): Promise<SmartInsight[]> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ API Key missing in aiService (fetch mode)");
    return [{
      title: "Configuration Manquante",
      description: "La clé API n'est pas détectée. Vérifiez .env.local",
      type: "WARNING"
    }];
  }

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

    Return ONLY raw JSON array. Do not wrap in markdown blocks. 
    Schema:
    [{ "title": "string", "description": "string", "type": "WARNING" | "OPPORTUNITY" | "INFO", "metric": "string (optional)" }]
  `;

  try {
    console.log("🚀 Starting Groq API Call (fetch mode)...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Groq API Error:", errorData);
      throw new Error(`HTTP Error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "";

    // Clean up markdown
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(jsonString) as SmartInsight[];
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, text);
      return [{
        title: "Erreur de Format",
        description: "L'IA a répondu mais le format est invalide.",
        type: "WARNING"
      }];
    }

  } catch (error: any) {
    console.error("Network Error:", error);
    return [{
      title: "Erreur de Connexion",
      description: `Impossible de contacter Groq: ${error.message}`,
      type: "WARNING"
    }];
  }
};
