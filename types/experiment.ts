export interface MarketingExperiment {
  id?: string;
  user_id?: string;
  objective: string;
  hypothesis: string;
  audience: string;
  strategy_used: string;
  variables?: string[];
  result_metrics: string;
  audience_reaction: string;
  outcome_status: 'SUCCESS' | 'FAILURE' | 'INCONCLUSIVE';
  interpretation: string;
  learning: string;
  created_at?: string;
}

export interface EvaluationResponse {
  verdict: 'VALIDATED' | 'CHALLENGED' | 'UNTESTED_HYPOTHESIS';
  synthesis: string;
  recommended_action: string;
  supporting_experiments: MarketingExperiment[];
}
