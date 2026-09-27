import { NextResponse } from 'next/server';
import { retainCampaignMemory } from '@/lib/hindsight';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const campaignData = await request.json();

    // 1. Optionally log campaign in Supabase DB
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.from('campaigns').insert([campaignData]);
    }

    // 2. Retain campaign memory in Hindsight bank
    const hindsightResult = await retainCampaignMemory(campaignData);

    return NextResponse.json({
      success: true,
      message: 'Campaign memory retained successfully',
      hindsightResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retain memory' },
      { status: 500 }
    );
  }
}