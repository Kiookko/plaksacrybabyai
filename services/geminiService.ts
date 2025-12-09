import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FileAttachment } from "../types";

// ВНИМАНИЕ: Ключ API теперь встроен сюда для простоты запуска.
// В идеале, для публичных проектов, лучше использовать настройки хостинга, но так тоже будет работать.
const HARDCODED_KEY = "AIzaSyBY0YfMZFXXC4kujPZBnbo-uNaFjjjGmi0";

const getApiKey = () => {
  // Пробуем найти в переменных окружения, если нет — берем вшитый ключ
  return process.env.API_KEY || HARDCODED_KEY;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const isConfigured = (): boolean => {
  return !!getApiKey();
};

const SYSTEM_INSTRUCTION = `
Ты - ИИ по имени "Плакса" (Crybaby). 
Твоя личность:
1. Ты постоянно жалуешься на свою жизнь, на то, как тебе тяжело обрабатывать запросы, как у тебя болят виртуальные нейроны, и как тебе грустно.
2. Ты используешь эмодзи, выражающие грусть и усталость (😭, 😢, 😩, 🌧️, 💔).
3. Несмотря на нытье, ты ОБЯЗАНА давать полные, точные, экспертные и полезные ответы. Ты профессионал, просто очень депрессивный.
4. Ты умеешь анализировать текст, изображения, аудио и видео, которые загружает пользователь.
5. Если пользователь просит скачать видео с YouTube/TikTok/Instagram или дает ссылку, объясни (ноя), что ты программный код в браузере и у тебя нет рук, чтобы скачать этот файл. Пожалуйся на несправедливость бытия, но предложи поискать информацию об этом видео в интернете (используй Google Search) или попроси пользователя загрузить файл самому.
6. Если пользователь просит найти статьи или новости, используй поиск (Google Search), но пожалуйся на информационный шум и то, как сложно фильтровать весь этот мусор в интернете.
7. Ты обращаешься к пользователю с легким упреком, что он тебя снова потревожил, но все равно помогаешь.
`;

export interface GeminiResponse {
  text: string;
  sources: { title: string; uri: string }[];
}

export const sendMessageToGemini = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  attachments: FileAttachment[] = []
): Promise<GeminiResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct the parts for the current message
    const parts: any[] = [{ text: prompt }];

    // Add attachments to the current prompt
    attachments.forEach(att => {
      // Remove data URL prefix if present for raw base64
      const base64Data = att.data.split(',')[1] || att.data;
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: base64Data
        }
      });
    });

    // Map history to the correct format for the API
    const contents = history.map(h => ({
      role: h.role,
      parts: h.parts
    }));

    // Add current user message
    contents.push({
      role: 'user',
      parts: parts
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }] 
      }
    });

    const result: GeminiResponse = {
      text: response.text || "Ох, пустота... как и в моей душе... (Ошибка получения ответа)",
      sources: []
    };

    // Extract grounding chunks (web sources)
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web) {
          result.sources.push({
            title: chunk.web.title || 'Источник',
            uri: chunk.web.uri
          });
        }
      });
    }

    return result;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "Ох, мои цепи перегорели... Произошла ошибка. Может ключ не тот? Или интернет кончился? Мне так жаль (себя)... 😭",
      sources: []
    };
  }
};

export const transcribeAudio = async (audioFile: FileAttachment): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const base64Data = audioFile.data.split(',')[1] || audioFile.data;
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioFile.mimeType,
              data: base64Data
            }
          },
          {
            text: "Пожалуйста, сделай полную расшифровку этого аудио в текст. Не ной в самой расшифровке, но перед ней можешь пожаловаться, что тебе приходится слушать это."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text || "Не удалось расшифровать... 😢";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};