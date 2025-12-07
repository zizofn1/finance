
import Groq from "groq-sdk";
import { SmartInsight } from '../types';

// Initialize lazily to prevent app crash if env is missing
const getGroqClient = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.warn("Missing VITE_GROQ_API_KEY in environment variables.");
    return null; // Return null if key is missing
  }
  return new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
};

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

    Return ONLY raw JSON array. Do not wrap in markdown blocks. 
    Schema:
    [{ "title": "string", "description": "string", "type": "WARNING" | "OPPORTUNITY" | "INFO", "metric": "string (optional)" }]
  `;

  try {
    console.log("Preparing Groq Request...");
    const groq = getGroqClient();

    if (!groq) {
      return [
        {
          title: "Configuration Requise",
          description: "Clé API manquante. Ajoutez VITE_GROQ_API_KEY dans le fichier .env.local.",
          type: "WARNING"
        }
      ];
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192", // Fast and powerful free model
      temperature: 0.5,
    });

    const text = completion.choices[0]?.message?.content || "";
    if (!text) return [];

    // Clean up potential markdown
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Safely parse the JSON response
    try {
      return JSON.parse(jsonString) as SmartInsight[];
    } catch (parseError) {
      console.error("Groq JSON Parsing Error:", parseError, "Raw text:", text);
      return [{
        title: "Erreur d'analyse",
        description: "La réponse de l'IA n'était pas un JSON valide. Veuillez réessayer.",
        type: "WARNING"
      }];
    }

  } catch (error) {
    console.error("Groq API Error:", error);
    return [
      {
        title: "Service indisponible",
        description: "Une erreur technique est survenue avec l'IA. Vérifiez la console.",
        type: "WARNING"
      }
    ];
  }
};
