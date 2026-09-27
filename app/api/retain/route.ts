import { NextResponse } from 'next/server';
import { retainCampaignMemory } from '@/lib/hindsight';
import { supabase } from '@/lib/supabase';
import { MarketingExperiment } from '@/types/experiment';

export async function POST(request: Request) {
  try {
    const experiment: MarketingExperiment = await request.json();

    const { data, error } = await supabase
      .from('experiments')
      .insert([experiment])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    const memory = `EXPERIMENT OUTCOME [${experiment.outcome_status}]: Objective: ${experiment.objective} | Hypothesis: ${experiment.hypothesis} | Strategy: ${experiment.strategy_used} | Audience: ${experiment.audience} | Results: ${experiment.result_metrics} | Audience Reaction: ${experiment.audience_reaction} | Cumulative Learning: ${experiment.learning}`;
    await retainCampaignMemory({ content: memory });

    return NextResponse.json({ success: true, experimentId: data.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to retain memory' },
      { status: 500 }
    );
  }
}