import { GoogleGenAI } from "@google/genai";
import { PersonalityProfile, WeatherData } from "../types";

/* -------------------------------------------------------
   🔑 API KEYS
------------------------------------------------------- */
const geminiKey = import.meta.env.VITE_GEMINI_KEY;
const stabilityKey = import.meta.env.VITE_STABILITY_KEY;

/* -------------------------------------------------------
   🔹 Gemini Client Init
------------------------------------------------------- */
let ai: GoogleGenAI | null = null;
if (geminiKey) {
  ai = new GoogleGenAI({ apiKey: geminiKey });
}

/* -------------------------------------------------------
   👕 Outfit Advice Rules
------------------------------------------------------- */
const determineOutfitAdvice = (weather: WeatherData): string => {
  const { temp, condition } = weather;
  const cond = condition.toLowerCase();

  if (cond.includes("storm") || cond.includes("thunder"))
    return "Wear a raincoat, tight jacket, and non-slip shoes.";

  if (cond.includes("rain") || cond.includes("drizzle"))
    return "Bring an umbrella and waterproof jacket. Avoid white clothes.";

  if (cond.includes("snow") || cond.includes("ice"))
    return "Wear heavy winter gear, thermal layers, snow boots.";

  if (cond.includes("fog") || cond.includes("mist"))
    return "Visibility is low. Wear warm layers and a scarf.";

  if (temp >= 28)
    return "It's HOT: wear loose cotton, light colors, avoid black.";

  if (temp >= 20)
    return "Warm day: light shirts and casual outfits work great.";

  if (temp >= 16)
    return "Mild weather: hoodie or light jacket recommended.";

  if (temp >= 8)
    return "Cold: sweater + warm jacket.";

  if (temp >= 0)
    return "Very cold: heavy coat, gloves, scarf, beanie.";

  return "Dress comfortably according to the weather.";
};

/* -------------------------------------------------------
   🧠 Gemini — Chat / NPC Responses
------------------------------------------------------- */
export const generateCharacterResponse = async (
  userMessage: string,
  personality: PersonalityProfile,
  weather: WeatherData
): Promise<string> => {
  if (!ai) return "I lost my voice! (Missing Gemini key)";

  try {
    const outfitAdvice = determineOutfitAdvice(weather);

    const sys = `
      ${personality.systemPrompt}

      WEATHER:
      - City: ${weather.city}
      - Temp: ${weather.temp}°C
      - Condition: ${weather.condition}

      OUTFIT RULE:
      "${outfitAdvice}"

      RULES:
      - Stay in character ALWAYS
      - Max 3 sentences
      - Use emojis matching personality
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: sys,
        temperature: 1.2,
        maxOutputTokens: 150,
      },
    });

    return response.text || "...";
  } catch (err) {
    console.error("Gemini Text Error:", err);
    return `My brain froze… but here's what you should wear: ${determineOutfitAdvice(weather)}`;
  }
};

/* -------------------------------------------------------
   🔘 Gemini — Quick Button NPC Lines
------------------------------------------------------- */
export const generateInteractionResponse = async (
  type: "outfit" | "mood" | "tip",
  personality: PersonalityProfile,
  weather: WeatherData
): Promise<string> => {
  if (!ai) return "I lost my voice! (Missing Gemini key)";

  let prompt = "";

  if (type === "outfit")
    prompt = `Give outfit advice for ${weather.temp}°C and ${weather.condition}.`;
  if (type === "mood")
    prompt = `Describe today's weather emotionally (anime NPC): ${weather.condition}.`;
  if (type === "tip")
    prompt = `Give a short practical weather tip for ${weather.condition}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `${personality.systemPrompt} Keep replies short (max 15 words).`,
        temperature: 1,
        maxOutputTokens: 50,
      },
    });

    return response.text || "...";
  } catch (err) {
    console.error("Gemini Interaction Error:", err);
    return "I'm buffering… try again!";
  }
};

/* -------------------------------------------------------
   🧼 White Background Removal (Canvas)
------------------------------------------------------- */
const removeWhiteBackground = (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(base64);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const threshold = 240;

      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0; // make transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => resolve(base64);
    img.src = base64;
  });
};

/* -------------------------------------------------------
   ⭐ Stability AI — Character Image Generator
------------------------------------------------------- */
export const generateCharacterImage = async (
  prompt: string
): Promise<string | null> => {
  if (!stabilityKey) {
    console.error("Missing Stability API key");
    return null;
  }

  try {
    const form = new FormData();
    form.append(
      "prompt",
      `${prompt}. full body, centered, anime style, pure white background.`
    );
    form.append("aspect_ratio", "1:1");
    form.append("output_format", "png");

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stabilityKey}`,
          Accept: "application/json",
        },
        body: form,
      }
    );

    if (!response.ok) {
      console.error("Stability API Error:", await response.text());
      return null;
    }

    const data = await response.json();
    const base64 = `data:image/png;base64,${data.image}`;

    // 🧼 Apply transparent background
    return await removeWhiteBackground(base64);
  } catch (err) {
    console.error("Stability Fetch Error:", err);
    return null;
  }
};
