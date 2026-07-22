import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "You are an expert in Hebrew grammar and Nikud. Your ONLY job is to take the provided Hebrew text and return it with full, perfectly accurate Nikud (vowel points). DO NOT add any extra text, explanations, quotes, or markdown formatting. Just return the exact same words with Nikud."
    });

    const result = await model.generateContent(text);
    const responseText = await result.response.text();
    
    // Clean up any potential markdown or whitespace
    const cleanText = responseText.replace(/```/g, "").trim();

    return NextResponse.json({ text: cleanText || text });
  } catch (error: any) {
    console.error('Error in Nikud API:', error);
    return NextResponse.json({ error: 'Failed to apply Nikud' }, { status: 500 });
  }
}
