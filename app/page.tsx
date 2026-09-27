'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Check,
  Circle,
  Database,
  FlaskConical,
  Gauge,
  History,
  Layers3,
  Lightbulb,
  Loader2,
  Network,
  Plus,
  Quote,
  Search,
  Send,
  Server,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import type { EvaluationResponse, MarketingExperiment } from '@/types/experiment';

type Tab = 'evaluator' | 'outcome' | 'timeline';
type Notice = { type: 'success' | 'error'; message: string } | null;

type ExperimentDraft = Omit<MarketingExperiment, 'id' | 'created_at'> & {
  created_at?: string;
};

const EMPTY_DRAFT: ExperimentDraft = {
  objective: '',
  hypothesis: '',
  audience: '',
  strategy_used: '',
  variables: [],
  result_metrics: '',
  audience_reaction: '',
  outcome_status: 'INCONCLUSIVE',
  interpretation: '',
  learning: '',
};

const DEMO_PRESETS: Array<{ label: string; experiment: ExperimentDraft }> = [
  {
    label: 'Video hook test',
    experiment: {
      objective: 'Increase qualified attention on short-form video',
      hypothesis: 'A problem-led hook in the first 2.5 seconds will improve early retention',
      audience: 'Performance marketers at growth-stage SaaS companies',
      strategy_used: 'Negative problem hook: Stop doing X for performance marketing',
      variables: ['Hook framing', 'First 3-second retention', 'Video format'],
      result_metrics: '3-second view rate increased by 42%',
      audience_reaction: 'Viewers paused more often and comments cited the specific problem',
      outcome_status: 'SUCCESS',
      interpretation: 'Specific tension earned attention before the brand was introduced',
      learning: 'Lead with a recognizable operational problem when the audience has high intent',
    },
  },
  {
    label: 'LinkedIn carousel test',
    experiment: {
      objective: 'Generate more qualified demo requests from LinkedIn',
      hypothesis: 'A five-slide teardown carousel will outperform a single static image',
      audience: 'B2B marketing and revenue leaders',
      strategy_used: 'Five-slide teardown carousel with one insight per slide',
      variables: ['Creative format', 'Slide count', 'Demo request conversion'],
      result_metrics: '3.1x more demo request conversions than static ads',
      audience_reaction: 'Prospects saved the carousel and shared it with their teams',
      outcome_status: 'SUCCESS',
      interpretation: 'Progressive disclosure made a complex proof point easier to consume',
      learning: 'Use structured, saveable content when the buying decision needs internal alignment',
    },
  },
  {
    label: 'Feature-led email failure',
    experiment: {
      objective: 'Increase qualified replies from lifecycle email',
      hypothesis: 'Feature-led subject lines will drive more replies than outcome framing',
      audience: 'Existing trial users',
      strategy_used: 'Feature-led subject lines focused on product capabilities',
      variables: ['Subject line framing', 'Qualified reply rate'],
      result_metrics: 'Qualified replies fell 14% versus outcome-led control',
      audience_reaction: 'Recipients described the email as broad and not relevant to their current workflow',
      outcome_status: 'FAILURE',
      interpretation: 'Capability language created work for the reader instead of naming an outcome',
      learning: 'Anchor lifecycle messaging in a concrete operational result, not a feature list',
    },
  },
];

const TABS: Array<{ id: Tab; label: string; icon: typeof Sparkles }> = [
  { id: 'evaluator', label: 'Hypothesis & Strategy Evaluator', icon: Sparkles },
  { id: 'outcome', label: 'Log Experiment Outcome', icon: FlaskConical },
  { id: 'timeline', label: 'Evolving Knowledge Timeline', icon: History },
];

function StatusItem({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 border-l border-slate-800 pl-4 first:border-l-0 first:pl-0">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      <div className="hidden sm:block"><p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">{label}</p><p className="text-[11px] text-slate-300">{value}</p></div>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required = true, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean; multiline?: boolean }) {
  const className = 'w-full border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs leading-5 text-slate-200 outline-none transition-colors placeholder:text-slate-700 focus:border-slate-600';
  return <div><label className="mb-2 block text-[11px] font-medium text-slate-400">{label}</label>{multiline ? <textarea required={required} rows={4} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${className} resize-none`} /> : <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />}</div>;
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Layers3; title: string; description: string }) {
  return <div className="flex min-h-[300px] flex-col items-center justify-center border border-dashed border-slate-800 px-6 text-center"><Icon className="mb-4 h-6 w-6 text-slate-600" /><h3 className="text-sm font-medium text-slate-300">{title}</h3><p className="mt-2 max-w-md text-xs leading-5 text-slate-500">{description}</p></div>;
}

function VerdictBanner({ verdict }: { verdict: EvaluationResponse['verdict'] }) {
  const styles = verdict === 'CHALLENGED' ? 'border-amber-800/60 bg-amber-950/30 text-amber-300' : verdict === 'VALIDATED' ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300';
  const Icon = verdict === 'CHALLENGED' ? TrendingDown : verdict === 'VALIDATED' ? TrendingUp : Circle;
  return <div className={`flex items-center gap-3 border px-4 py-4 ${styles}`}><Icon className="h-5 w-5" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">Agent verdict</p><p className="mt-0.5 text-lg font-semibold tracking-tight">{verdict}</p></div></div>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('evaluator');
  const [draft, setDraft] = useState<ExperimentDraft>(EMPTY_DRAFT);
  const [experiments, setExperiments] = useState<MarketingExperiment[]>([]);
  const [retainNotice, setRetainNotice] = useState<Notice>(null);
  const [isRetaining, setIsRetaining] = useState(false);
  const [hypothesis, setHypothesis] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [evaluateError, setEvaluateError] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timelineSearch, setTimelineSearch] = useState('');

  const timelineExperiments = useMemo(() => {
    const search = timelineSearch.trim().toLowerCase();
    return [...experiments]
      .filter((experiment) => !search || [experiment.objective, experiment.learning, experiment.strategy_used].some((value) => value.toLowerCase().includes(search)))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [experiments, timelineSearch]);

  const updateDraft = <K extends keyof ExperimentDraft>(key: K, value: ExperimentDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const applyPreset = (preset: (typeof DEMO_PRESETS)[number]) => {
    setDraft({ ...preset.experiment });
    setRetainNotice(null);
  };

  const handleRetain = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRetaining(true);
    setRetainNotice(null);
    const experiment: MarketingExperiment = { ...draft, variables: draft.variables || [], created_at: draft.created_at || new Date().toISOString() };
    try {
      const response = await fetch('/api/retain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(experiment) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to log experiment outcome.');
      const savedExperiment = { ...experiment, id: data.experimentId };
      setExperiments((current) => [savedExperiment, ...current]);
      setDraft(EMPTY_DRAFT);
      setRetainNotice({ type: 'success', message: 'Experiment outcome committed to brand memory.' });
    } catch (error) {
      setRetainNotice({ type: 'error', message: error instanceof Error ? error.message : 'Error connecting to the memory service.' });
    } finally {
      setIsRetaining(false);
    }
  };

  const handleEvaluate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hypothesis.trim()) return;
    setIsEvaluating(true);
    setEvaluation(null);
    setEvaluateError('');
    try {
      const response = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: hypothesis }) });
      const data = await response.json();
      if (!response.ok || !data.synthesis) throw new Error(data.error || 'Unable to evaluate this strategy.');
      setEvaluation(data as EvaluationResponse);
    } catch (error) {
      setEvaluateError(error instanceof Error ? error.message : 'Error connecting to the synthesis agent.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto max-w-[1480px] px-5 py-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center border border-slate-700 bg-slate-900"><BrainCircuit className="h-5 w-5 text-slate-200" /></div><div><div className="flex items-center gap-2"><h1 className="text-sm font-semibold text-white">Marketing Experiment Intelligence Workspace</h1><span className="border border-slate-800 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-slate-500">BrandMind</span></div><p className="mt-1 text-[11px] text-slate-500">A cumulative decision system for growth teams</p></div></div>
            <div className="flex flex-wrap items-center gap-4"><StatusItem icon={Network} label="Hindsight" value="Vector Bank" /><StatusItem icon={Zap} label="Inference" value="Groq Llama 3.3" /><StatusItem icon={Server} label="Database" value="Supabase" /><div className="flex items-center gap-2 border-l border-slate-800 pl-4"><Gauge className="h-3.5 w-3.5 text-slate-500" /><div><p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">Active memory</p><p className="text-[11px] text-slate-300">{experiments.length} experiments</p></div></div></div>
          </div>
          <nav className="mt-6 flex gap-1 overflow-x-auto" aria-label="Experiment workspace tabs">{TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-medium transition-colors ${activeTab === id ? 'border-slate-200 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-5 py-8 lg:px-8">
        {activeTab === 'evaluator' && <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><section className="border border-slate-800 bg-slate-900/50"><div className="border-b border-slate-800 px-6 py-5"><p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"><Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" /> Assumption challenger agent</p><h2 className="text-xl font-semibold tracking-tight text-white">Test your next strategic move</h2><p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">Propose a strategy or hypothesis. BrandMind will compare it against what your experiments have already proven and disproven.</p></div><div className="p-6"><form onSubmit={handleEvaluate}><label htmlFor="hypothesis" className="mb-2 block text-[11px] font-medium text-slate-400">Proposed strategy or hypothesis</label><div className="flex flex-col gap-2 sm:flex-row"><textarea id="hypothesis" required rows={3} value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} placeholder="e.g. We should lead the next lifecycle campaign with a feature comparison..." className="min-h-12 flex-1 resize-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs leading-5 text-slate-200 outline-none placeholder:text-slate-700 focus:border-slate-600" /><button type="submit" disabled={isEvaluating} className="flex min-h-12 items-center justify-center gap-2 border border-slate-200 bg-slate-200 px-5 text-xs font-semibold text-slate-950 hover:bg-white disabled:opacity-60"><Send className="h-3.5 w-3.5" /> Evaluate</button></div></form><div className="mt-8">{isEvaluating && <div className="flex min-h-[300px] flex-col items-center justify-center border border-slate-800 bg-slate-950/70"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /><p className="mt-3 text-xs text-slate-500">Comparing hypothesis with recalled experiments...</p></div>}{evaluateError && !isEvaluating && <div className="flex items-center justify-between border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-300"><span>{evaluateError}</span><button type="button" onClick={() => setEvaluateError('')} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}{!isEvaluating && !evaluation && !evaluateError && <EmptyState icon={Lightbulb} title="Your evidence-led verdict is waiting" description="Ask BrandMind to surface the raw experiments, transferable learning, and strategic directive behind your next move." />}{evaluation && !isEvaluating && <div className="space-y-5"><VerdictBanner verdict={evaluation.verdict} /><div className="border border-slate-800 bg-slate-950/70"><div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4 text-xs font-semibold text-slate-200"><Quote className="h-4 w-4 text-slate-500" /> AI synthesis</div><div className="whitespace-pre-wrap px-5 py-5 text-sm leading-7 text-slate-300">{evaluation.synthesis}</div><div className="border-t border-slate-800 px-5 py-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Recommended action</p><p className="mt-2 text-xs leading-5 text-slate-300">{evaluation.recommended_action}</p></div></div></div>}</div></div></section><aside className="space-y-6"><div className="border border-slate-800 bg-slate-900/50 p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Session memory</p><div className="mt-5 flex items-end justify-between"><span className="text-4xl font-semibold tracking-tight text-white">{experiments.length}</span><span className="mb-1 text-xs text-slate-600">logged outcomes</span></div><div className="mt-5 h-px bg-slate-800" /><p className="mt-4 text-xs leading-5 text-slate-500">Each outcome strengthens the agent&apos;s ability to challenge future assumptions.</p></div><div className="border border-slate-800 bg-slate-900/50 p-5"><div className="flex items-center gap-2 text-xs font-medium text-slate-300"><Database className="h-4 w-4 text-slate-500" /> Evidence recalled</div>{evaluation?.supporting_experiments.length ? <div className="mt-4 space-y-3">{evaluation.supporting_experiments.map((experiment) => <div key={experiment.id || experiment.objective} className="border-l border-slate-700 pl-3"><p className="text-xs font-medium text-slate-300">{experiment.strategy_used}</p><p className="mt-1 text-[10px] text-slate-500">{experiment.outcome_status} · {experiment.result_metrics}</p></div>)}</div> : <p className="mt-4 text-xs leading-5 text-slate-600">Supporting experiments will appear here after an evaluation.</p>}</div></aside></div>}

        {activeTab === 'outcome' && <div className="mx-auto max-w-5xl"><div className="mb-6"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Grow the organizational memory</p><h2 className="text-xl font-semibold tracking-tight text-white">Log experiment outcome</h2><p className="mt-2 text-xs leading-5 text-slate-500">Record the full chain from objective to learning. The agent needs the why behind the result, not just the metric.</p></div><section className="border border-slate-800 bg-slate-900/50"><div className="border-b border-slate-800 px-6 py-5"><div className="flex items-center gap-2 text-sm font-medium text-slate-200"><FlaskConical className="h-4 w-4 text-slate-500" /> Marketing experiment record</div></div><div className="p-6"><div className="mb-7"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Quick-fill demo presets</p><div className="flex flex-wrap gap-2">{DEMO_PRESETS.map((preset) => <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="flex items-center gap-1.5 border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-400 hover:border-slate-600 hover:text-slate-200"><Plus className="h-3 w-3" />{preset.label}</button>)}</div></div><form onSubmit={handleRetain} className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="Objective" value={draft.objective} onChange={(value) => updateDraft('objective', value)} placeholder="What business outcome are we trying to change?" /><Field label="Hypothesis" value={draft.hypothesis} onChange={(value) => updateDraft('hypothesis', value)} placeholder="What do we expect to happen, and why?" /><Field label="Audience" value={draft.audience} onChange={(value) => updateDraft('audience', value)} placeholder="Who was exposed to the experiment?" /><Field label="Strategy used" value={draft.strategy_used} onChange={(value) => updateDraft('strategy_used', value)} placeholder="What did the team actually do?" /></div><div className="grid gap-5 md:grid-cols-2"><Field label="Result metrics" value={draft.result_metrics} onChange={(value) => updateDraft('result_metrics', value)} placeholder="What changed? Include the baseline and delta." multiline /><Field label="Audience reaction" value={draft.audience_reaction} onChange={(value) => updateDraft('audience_reaction', value)} placeholder="What did the audience do, say, or ignore?" multiline /><Field label="Interpretation" value={draft.interpretation} onChange={(value) => updateDraft('interpretation', value)} placeholder="What explains the result?" multiline /><Field label="Learning" value={draft.learning} onChange={(value) => updateDraft('learning', value)} placeholder="What should the organization remember?" multiline /></div><div className="grid gap-5 md:grid-cols-2"><div><label className="mb-2 block text-[11px] font-medium text-slate-400">Variables <span className="text-slate-600">comma separated</span></label><input value={(draft.variables || []).join(', ')} onChange={(event) => updateDraft('variables', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))} placeholder="Hook, format, conversion rate" className="w-full border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-200 outline-none placeholder:text-slate-700 focus:border-slate-600" /></div><div><label className="mb-2 block text-[11px] font-medium text-slate-400">Outcome status</label><select value={draft.outcome_status} onChange={(event) => updateDraft('outcome_status', event.target.value as MarketingExperiment['outcome_status'])} className="w-full border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-200 outline-none focus:border-slate-600"><option value="SUCCESS">SUCCESS</option><option value="FAILURE">FAILURE</option><option value="INCONCLUSIVE">INCONCLUSIVE</option></select></div></div><div className="flex flex-col justify-between gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center"><p className="max-w-lg text-[11px] leading-5 text-slate-600">The record is dual-written to Supabase and Hindsight so future strategy decisions can build on it.</p><button type="submit" disabled={isRetaining} className="flex items-center justify-center gap-2 border border-slate-200 bg-slate-200 px-5 py-3 text-xs font-semibold text-slate-950 hover:bg-white disabled:opacity-60">{isRetaining ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Committing outcome</> : <><ArrowRight className="h-3.5 w-3.5" /> Commit outcome</>}</button></div></form>{retainNotice && <div className={`mt-5 flex items-center gap-2 border px-4 py-3 text-xs ${retainNotice.type === 'success' ? 'border-emerald-900/50 bg-emerald-950/20 text-emerald-300' : 'border-red-900/50 bg-red-950/20 text-red-300'}`}>{retainNotice.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}{retainNotice.message}</div>}</div></section></div>}

        {activeTab === 'timeline' && <div><div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Compounding intelligence</p><h2 className="text-xl font-semibold tracking-tight text-white">Evolving knowledge timeline</h2><p className="mt-2 text-xs leading-5 text-slate-500">Follow how experiment outcomes become increasingly precise brand guidance.</p></div><div className="relative w-full md:w-72"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" /><input value={timelineSearch} onChange={(event) => setTimelineSearch(event.target.value)} placeholder="Search learnings..." className="w-full border border-slate-800 bg-slate-900/60 py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-slate-600" /></div></div>{timelineExperiments.length === 0 ? <EmptyState icon={History} title={timelineSearch ? 'No matching learnings' : 'The timeline begins with your first outcome'} description={timelineSearch ? 'Try a different objective, strategy, or learning keyword.' : 'Log an experiment outcome to see the organization&apos;s knowledge evolve over time.'} /> : <div className="relative ml-3 border-l border-slate-800 pl-8 md:ml-8 md:pl-10">{timelineExperiments.map((experiment, index) => <article key={experiment.id || `${experiment.objective}-${index}`} className="relative mb-8 last:mb-0"><span className={`absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center border bg-slate-950 ${experiment.outcome_status === 'SUCCESS' ? 'border-emerald-700 text-emerald-400' : experiment.outcome_status === 'FAILURE' ? 'border-red-800 text-red-400' : 'border-slate-700 text-slate-400'}`}>{experiment.outcome_status === 'SUCCESS' ? <TrendingUp className="h-3 w-3" /> : experiment.outcome_status === 'FAILURE' ? <TrendingDown className="h-3 w-3" /> : <Circle className="h-2 w-2 fill-current" />}</span><div className="border border-slate-800 bg-slate-900/50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{experiment.created_at ? new Date(experiment.created_at).toLocaleDateString() : 'Undated'}</span><span className={`text-[10px] font-semibold tracking-wider ${experiment.outcome_status === 'SUCCESS' ? 'text-emerald-400' : experiment.outcome_status === 'FAILURE' ? 'text-red-400' : 'text-slate-400'}`}>{experiment.outcome_status}</span></div><h3 className="mt-4 text-sm font-medium text-slate-200">{experiment.objective}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{experiment.learning}</p><div className="mt-4 grid gap-3 border-t border-slate-800 pt-4 text-[11px] md:grid-cols-3"><div><p className="text-slate-600">Strategy</p><p className="mt-1 text-slate-400">{experiment.strategy_used}</p></div><div><p className="text-slate-600">Result</p><p className="mt-1 text-slate-400">{experiment.result_metrics}</p></div><div><p className="text-slate-600">Audience</p><p className="mt-1 text-slate-400">{experiment.audience}</p></div></div></div></article>)}</div>}</div>}
      </div>
    </main>
  );
}
