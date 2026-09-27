import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { recallBrandMemory } from '@/lib/hindsight';

const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Recall relevant historical campaign memories from Hindsight
    let recalledMemories = [];
    try {
      const recallResponse = await recallBrandMemory(query);
      recalledMemories = recallResponse?.memories || recallResponse || [];
    } catch (e) {
      console.warn('Hindsight recall warning:', e);
    }

    // 2. Build system prompt leveraging recalled campaign history
    const systemPrompt = `You are BrandMind, an elite AI marketing strategist.
You optimize brand performance by analyzing past campaign learnings and experiment history.

RECALLED BRAND MEMORY:
${JSON.stringify(recalledMemories, null, 2)}

Provide actionable, high-converting marketing advice based on past brand performance context.`;

    // 3. Request completion from Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
    });

    const recommendation = completion.choices[0]?.message?.content || 'No recommendation generated.';

    return NextResponse.json({
      recommendation,
      supportingMemories: recalledMemories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}