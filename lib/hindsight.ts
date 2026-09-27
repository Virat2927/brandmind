// Helper functions for Vectorize Hindsight API integration

const HINDSIGHT_URL = process.env.HINDSIGHT_API_URL || 'https://api.hindsight.vectorize.io';
const HINDSIGHT_KEY = process.env.HINDSIGHT_API_KEY || '';

export async function retainCampaignMemory(campaignData: Record<string, any>) {
  const response = await fetch(`${HINDSIGHT_URL}/v1/default/banks/brandmind/memories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HINDSIGHT_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaignData),
  });

  if (!response.ok) {
    throw new Error(`Failed to retain memory in Hindsight: ${response.statusText}`);
  }

  return response.json();
}

export async function recallBrandMemory(query: string) {
  const response = await fetch(`${HINDSIGHT_URL}/v1/default/banks/brandmind/recall`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HINDSIGHT_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Failed to recall memory from Hindsight: ${response.statusText}`);
  }

  return response.json();
}