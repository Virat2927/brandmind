import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { recallBrandMemory } from '@/lib/hindsight';
import { EvaluationResponse, MarketingExperiment } from '@/types/experiment';

export const dynamic = 'force-dynamic';

const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || 'dummy_build_key',
});

const SYSTEM_PROMPT = `You are BrandMind, a Marketing Experiment Synthesis Agent. Evaluate the user's strategy strictly against recalled brand experiment history across 3 levels: Raw Experience, Learning, and Strategic Directive.

Your job is to challenge assumptions, not to agree by default. Compare the user's proposed strategy with both SUCCESS and FAILURE experiments in the recalled history.

Assumption Challenger Rule:
- If the proposed strategy matches or substantially repeats a past FAILURE, return verdict CHALLENGED.
- Cite the specific failed experiment in the synthesis, explain why it failed using its result, audience reaction, interpretation, or learning, and recommend the alternative strategy proven by relevant SUCCESS experiments.
- Return VALIDATED only when relevant SUCCESS evidence supports the proposed strategy.
- Return UNTESTED_HYPOTHESIS when the recalled history does not provide a meaningful success or failure comparison.

Evaluate the request at all three levels:
1. Raw Experience: identify the directly relevant past experiments and their outcomes.
2. Learning: explain the transferable pattern, including the reason a strategy succeeded or failed.
3. Strategic Directive: give a concrete next action and what to measure.

Return only valid JSON matching this exact shape:
{
  "verdict": "VALIDATED" | "CHALLENGED" | "UNTESTED_HYPOTHESIS",
  "synthesis": "string covering Raw Experience, Learning, and Strategic Directive",
  "recommended_action": "string",
  "supporting_experiments": [MarketingExperiment objects]
}

Every supporting experiment must include objective, hypothesis, audience, strategy_used, result_metrics, audience_reaction, outcome_status, interpretation, and learning. Do not include markdown fences or any additional keys.`;

function isOutcomeStatus(value: unknown): value is MarketingExperiment['outcome_status'] {
  return value === 'SUCCESS' || value === 'FAILURE' || value === 'INCONCLUSIVE';
}

function normalizeExperiment(value: unknown): MarketingExperiment | null {
  if (!value || typeof value !== 'object') return null;
  const experiment = value as Record<string, unknown>;
  const requiredFields = [
    'objective',
    'hypothesis',
    'audience',
    'strategy_used',
    'result_metrics',
    'audience_reaction',
    'interpretation',
    'learning',
  ];

  if (
    !requiredFields.every((field) => typeof experiment[field] === 'string') ||
    !isOutcomeStatus(experiment.outcome_status)
  ) {
    return null;
  }

  return {
    id: typeof experiment.id === 'string' ? experiment.id : undefined,
    objective: experiment.objective as string,
    hypothesis: experiment.hypothesis as string,
    audience: experiment.audience as string,
    strategy_used: experiment.strategy_used as string,
    variables: Array.isArray(experiment.variables)
      ? experiment.variables.filter((variable): variable is string => typeof variable === 'string')
      : undefined,
    result_metrics: experiment.result_metrics as string,
    audience_reaction: experiment.audience_reaction as string,
    outcome_status: experiment.outcome_status,
    interpretation: experiment.interpretation as string,
    learning: experiment.learning as string,
    created_at: typeof experiment.created_at === 'string' ? experiment.created_at : undefined,
  };
}

function normalizeEvaluation(value: unknown, fallbackSynthesis: string): EvaluationResponse {
  const evaluation = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const verdict = evaluation.verdict;
  const supportingExperiments = Array.isArray(evaluation.supporting_experiments)
    ? evaluation.supporting_experiments.map(normalizeExperiment).filter((experiment): experiment is MarketingExperiment => experiment !== null)
    : [];

  return {
    verdict: verdict === 'VALIDATED' || verdict === 'CHALLENGED' || verdict === 'UNTESTED_HYPOTHESIS'
      ? verdict
      : 'UNTESTED_HYPOTHESIS',
    synthesis: typeof evaluation.synthesis === 'string' ? evaluation.synthesis : fallbackSynthesis,
    recommended_action: typeof evaluation.recommended_action === 'string'
      ? evaluation.recommended_action
      : 'Define a measurable test and capture the result in the experiment memory.',
    supporting_experiments: supportingExperiments,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: unknown };
    if (typeof body.query !== 'string' || !body.query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const recallQuery = `Relevant past marketing experiments for this user hypothesis. Include both SUCCESS and FAILURE cases and return the complete experiment details when available. User hypothesis: ${body.query}`;
    let recalledMemories: unknown[] = [];
    try {
      const recallResponse = await recallBrandMemory(recallQuery);
      const memories = recallResponse?.memories || recallResponse || [];
      recalledMemories = Array.isArray(memories) ? memories : [memories];
    } catch (error) {
      console.warn('Hindsight recall warning:', error);
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `User strategy or hypothesis:\n${body.query}\n\nRecalled experiment history, including SUCCESS and FAILURE cases:\n${JSON.stringify(recalledMemories, null, 2)}`,
        },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, '')) as unknown;
    return NextResponse.json(normalizeEvaluation(parsed, 'No structured synthesis was generated.'));
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to synthesize experiment history' },
      { status: 500 },
    );
  }
}