import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { Prompt, ValidatePrompt } from './prompt';

const genAIKey = process.env.GEMINI_API_KEY;
if (!genAIKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

const genAI = new GoogleGenerativeAI(genAIKey);

const bodySchema = z.object({
    description: z.string().min(5), // User input like: "a low-poly tree on a hill"
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { description } = bodySchema.parse(body);
        //  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-exp-03-25' });
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        
        const chat = model.startChat();
        console.info("Prompt :- "+Prompt(description).substring(0,50))
        const codeGenrated = await chat.sendMessage(Prompt(description));
        console.info("Script 1 :- "+codeGenrated.response.text().substring(0,50))
        const result = await chat.sendMessage(ValidatePrompt(description, codeGenrated.response.text()));
        const response = result.response;
        const script = response.text();
        console.info("Final Script :- "+script.substring(0,50))
        return NextResponse.json({ script });
    } catch (error: any) {
        console.error('API error:', error);

        if (error?.code === 'insufficient_quota') {
            return NextResponse.json(
                { error: 'Your API quota is exhausted. Please check your Google AI account.' },
                { status: 429 }
            );
        }

        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid request body', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to generate Blender script.' },
            { status: 500 }
        );
    }
}
