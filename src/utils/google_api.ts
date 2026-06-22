import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import config from '../config/config';

const ai = new GoogleGenAI({ apiKey: config.google.apiKey });

const COMPARAR_DESCRIPCIONES_PROMPT_PATH = path.join(__dirname, 'prompts/compare_descriptions.md');

function buildCompararDescripcionesPrompt(desc1: string, desc2: string): string {
  const template = fs.readFileSync(COMPARAR_DESCRIPCIONES_PROMPT_PATH, 'utf-8');
  return template.replace('{{desc1}}', desc1).replace('{{desc2}}', desc2);
}

async function compararDescripciones(desc1: string, desc2: string) {
  const prompt = buildCompararDescripcionesPrompt(desc1, desc2);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(response.text);
}

export const googleAI = { compararDescripciones };
