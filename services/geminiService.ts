
import { GoogleGenAI, Type } from "@google/genai";
import { Magazine, Page, MagazineElement, BrandKit } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function ensurePaidApiKey() {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }
}

/**
 * Analyzes an image of a PDF page to determine if it contains 
 * a single page, a 2-page spread, or multiple small sheets.
 */
export const detectPdfLayout = async (pageImageBase64: string): Promise<'single' | 'spread'> => {
  const prompt = `
    Analyze this PDF page image. 
    Is this a single magazine page, or is it a "Spread" containing two separate pages side-by-side?
    
    Return your answer as a single word: "single" or "spread".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: pageImageBase64.split(',')[1], mimeType: 'image/png' } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    const text = response.text?.toLowerCase().trim();
    return text?.includes('spread') ? 'spread' : 'single';
  } catch (error) {
    console.error("Layout Detection Error:", error);
    return 'single'; 
  }
};

export const analyzeContentForLayout = async (
  rawText: string,
  images: string[],
  style: string,
  brandKit: BrandKit
): Promise<Page[]> => {
  const prompt = `
    Act as a world-class magazine creative director.
    Based on the provided content and style preference "${style}", design 2-3 interactive magazine pages.
    
    Content:
    Text: ${rawText.substring(0, 1000)}...
    Images Available: ${images.length}
    
    Style Guide:
    - Heading Font: ${brandKit.headingFont}
    - Body Font: ${brandKit.bodyFont}
    - Primary Color: ${brandKit.primaryColor}

    Return a JSON array of pages. Each page has elements with x, y, width, height (0-100 relative to page), type (text, headline, image, hotspot), and content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              elements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    width: { type: Type.NUMBER },
                    height: { type: Type.NUMBER },
                    content: { type: Type.STRING },
                    style: { type: Type.OBJECT, properties: { fontSize: { type: Type.STRING }, color: { type: Type.STRING }, fontWeight: { type: Type.STRING } } }
                  },
                  required: ['id', 'type', 'x', 'y', 'width', 'height', 'content']
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
};

export const processPdfPageWithAI = async (pageImageBase64: string): Promise<MagazineElement[]> => {
  const prompt = `
    Analyze this magazine page. 
    Identify regions that look like:
    1. Buttons or CTAs
    2. External Links
    3. Table of Contents entries (articles and page numbers)
    4. Product shots
    
    For Table of Contents entries, suggest a "page" jump action in the metadata if you can see a page number.
    Return a JSON array of hotspot elements with coordinates (x, y, width, height as percentages 0-100), suggested action labels in 'content', and an optional 'action' object with {type: 'page'|'link', value: string}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: pageImageBase64.split(',')[1], mimeType: 'image/png' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['hotspot'] },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              content: { type: Type.STRING },
              action: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['page', 'link'] },
                  value: { type: Type.STRING }
                }
              }
            },
            required: ['id', 'type', 'x', 'y', 'width', 'height', 'content']
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("PDF Analysis Error:", error);
    return [];
  }
};

export const editImageWithAI = async (base64Image: string, instruction: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: instruction }
        ]
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
};

export const generateProImage = async (prompt: string, aspectRatio: string = "16:9", size: string = "1K"): Promise<string | null> => {
  await ensurePaidApiKey();
  try {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Pro Image Generation Error:", error);
    return null;
  }
};

export const generateVeoVideo = async (imagePrompt: string, base64Image?: string): Promise<string | null> => {
  await ensurePaidApiKey();
  try {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await aiInstance.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: imagePrompt,
      ...(base64Image ? { image: { imageBytes: base64Image.split(',')[1], mimeType: 'image/png' } } : {}),
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await aiInstance.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        const fetchRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await fetchRes.blob();
        return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error("Veo Error:", error);
    return null;
  }
};
