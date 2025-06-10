import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const client = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateGeminiEssay(prompt) {
  try {
    const model = client.getGenerativeModel('models/gemini-2.0-flash');
    const response = await model.generateContent({
      prompt: { text: prompt },
    });
    return response.text;
  } catch (error) {
    console.error('Error generating Gemini essay:', error);
    throw error;
  }
}

export async function generateEssay({ topic, subheadings, notes, tone, length }) {
  const prompt = `
    Write an academic essay on the topic: "${topic}".
    Subheadings: ${subheadings}.
    Notes: ${notes}.
    Tone: ${tone}.
    Length: around ${length} words.
  `;

  const essay = await generateGeminiEssay(prompt);
  return essay;
}
