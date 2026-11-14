import React, { useState } from 'react';
import {
  BookmarkPlus,
  Check,
  Copy,
  Eraser,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../hooks/useLearning';
import { generateStructuredPrompt } from '../services/promptService';
import { PromptGeneratorResponse } from '../types/learning';

const AI_PLATFORMS = ['ChatGPT', 'Google Gemini', 'Claude', 'Microsoft Copilot'];

const PROMPT_CATEGORIES = [
  'Business',
  'Education',
  'Marketing',
  'Programming',
  'Design',
  'Writing',
  'Social Media',
];

const PROMPT_PURPOSES = [
  'Generate Production Code or Architecture',
  'Design System & UI Wireframe Spec',
  'High-Retention Social Media Campaign',
  'Video Script, Storyboard & Editing Plan',
  'Lesson Plan & Curriculum Design',
  'Business Strategy & Executive Audit',
  'Long-Form Editorial or Technical Writing',
];

const TONES = [
  'Professional & Authoritative',
  'Concise & Technical',
  'Creative & Editorial',
  'Educational & Beginner-Friendly',
  'Persuasive & Conversion-Focused',
];

const OUTPUT_FORMATS = [
  'Structured Markdown Sections',
  'Step-by-Step Checklist',
  'JSON Schema / Key-Value Spec',
  'Comparison Table + Action Plan',
  'Ready-to-Run Script / Code',
];

const DETAIL_LEVELS = [
  'Concise Overview',
  'Standard Detailed',
  'Comprehensive Blueprint',
  'Expert Deep-Dive',
];

export default function PromptGeneratorPage() {
  const { user } = useAuth();
  const { prompts, savePromptRecord, togglePromptFavorite, deletePromptRecord } = useLearning();

  const [platform, setPlatform] = useState(AI_PLATFORMS[0]);
  const [category, setCategory] = useState(PROMPT_CATEGORIES[0]);
  const [purpose, setPurpose] = useState(PROMPT_PURPOSES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [outputFormat, setOutputFormat] = useState(OUTPUT_FORMATS[0]);
  const [detailLevel, setDetailLevel] = useState(DETAIL_LEVELS[1]);
  const [topic, setTopic] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PromptGeneratorResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'favorites'>('all');

  const runGeneration = async (regenerateSeed?: string) => {
    setLoading(true);
    setError(null);
    setSavedFlag(false);

    try {
      const data = await generateStructuredPrompt({
        platform,
        category,
        purpose,
        tone,
        outputFormat,
        detailLevel,
        topic,
        regenerateSeed,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach prompt service.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await runGeneration();
  };

  const handleRegenerate = async () => {
    await runGeneration(String(Date.now()));
  };

  const handleCopy = async () => {
    if (!result?.prompt) return;
    await navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTopic('');
    setResult(null);
    setError(null);
    setCopied(false);
    setSavedFlag(false);
  };

  const handleSavePrompt = async (asFavorite = false) => {
    if (!user || !result) return;
    try {
      await savePromptRecord({
        title: result.title || `${category} — ${purpose}`,
        platform,
        category,
        purpose,
        tone,
        outputFormat,
        detailLevel,
        topic: topic.trim() || `${category} — ${purpose}`,
        generatedPrompt: result.prompt,
        isFavorite: asFavorite,
      });
      setSavedFlag(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save prompt.');
    }
  };

  const visibleHistory =
    historyFilter === 'favorites' ? prompts.filter((p) => p.isFavorite) : prompts;

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            Learn It With AI · Prompt Engineering Lab
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl text-balance">
            Engineer structured, high-precision prompts for any AI platform.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Select your target AI platform, domain category, prompt purpose, tone, output format,
            and level of detail. Our secure backend AI service crafts a copy-ready prompt with
            variables and platform execution tips.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Configuration Form */}
          <form
            onSubmit={handleGenerate}
            className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 sm:p-7 lg:col-span-5"
          >
            <h2 className="font-display text-lg font-semibold text-white">Prompt Parameters</h2>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300" htmlFor="pg-platform">
                    AI Platform
                  </label>
                  <select
                    id="pg-platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  >
                    {AI_PLATFORMS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300" htmlFor="pg-category">
                    Category
                  </label>
                  <select
                    id="pg-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  >
                    {PROMPT_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300" htmlFor="pg-purpose">
                  Prompt Purpose
                </label>
                <select
                  id="pg-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                >
                  {PROMPT_PURPOSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300" htmlFor="pg-tone">
                    Tone
                  </label>
                  <select
                    id="pg-tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  >
                    {TONES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300" htmlFor="pg-detail">
                    Level of Detail
                  </label>
                  <select
                    id="pg-detail"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  >
                    {DETAIL_LEVELS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300" htmlFor="pg-format">
                  Output Format
                </label>
                <select
                  id="pg-format"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                >
                  {OUTPUT_FORMATS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300" htmlFor="pg-topic">
                  Project Goal or Topic Context (optional)
                </label>
                <textarea
                  id="pg-topic"
                  rows={3}
                  maxLength={600}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe your product, target audience, tech stack, or creative brief..."
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7C3AED] disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Generating Prompt...' : 'Generate Prompt'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                <Eraser className="h-4 w-4" />
                Clear
              </button>
            </div>
          </form>

          {/* Output Stage */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    {result ? result.title : 'Structured Prompt Output'}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {platform} · {category} · {detailLevel}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {result && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRegenerate}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-[#A855F7] disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  )}
                  {user && result && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSavePrompt(false)}
                        disabled={savedFlag}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-[#A855F7] disabled:opacity-60"
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        {savedFlag ? 'Saved' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSavePrompt(true)}
                        disabled={savedFlag}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 disabled:opacity-60"
                        title="Save to Favourites"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Favourite
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={!result}
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#6D28D9] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-40"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    disabled={!result && !topic}
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="mt-6 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
                  <div className="h-32 w-full animate-pulse rounded-xl bg-white/5" />
                </div>
              ) : result ? (
                <div className="mt-5 space-y-6">
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-[#100B20] p-5 font-mono text-xs leading-relaxed text-slate-100 sm:text-sm">
                    {result.prompt}
                  </pre>

                  {result.variables.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-[#C084FC]">
                        Customizable Variables
                      </h3>
                      <p className="mt-1.5 font-mono text-xs text-slate-300">
                        {result.variables.join(' · ')}
                      </p>
                    </div>
                  )}

                  {result.usageTips.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <h3 className="text-xs font-semibold text-white">
                        {platform} Execution Tips
                      </h3>
                      <ul className="mt-2.5 space-y-2 text-sm text-slate-300">
                        {result.usageTips.map((tip, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="font-mono text-xs text-[#A855F7]">0{i + 1}.</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-[#100B20] p-10 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    Configure your options on the left and select Generate Prompt.
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Outputs include role framing, task constraints, customizable placeholders, and
                    formatting rules.
                  </p>
                </div>
              )}
            </div>

            {/* Saved Prompts & Favourites Library */}
            {user && prompts.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-base font-semibold text-white">
                    Prompt History &amp; Favourites ({visibleHistory.length})
                  </h2>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#100B20] p-1">
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('all')}
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        historyFilter === 'all'
                          ? 'bg-[#6D28D9] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({prompts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('favorites')}
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        historyFilter === 'favorites'
                          ? 'bg-[#6D28D9] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Favourites ({prompts.filter((p) => p.isFavorite).length})
                    </button>
                  </div>
                </div>

                {visibleHistory.length === 0 ? (
                  <p className="mt-4 text-xs text-slate-400">
                    No favourite prompts marked yet. Click the star icon on any saved prompt.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {visibleHistory.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-[#C084FC]">
                            {item.platform} · {item.category} · {item.detailLevel}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium text-white">
                            {item.title || item.topic}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => togglePromptFavorite(item.id, !item.isFavorite)}
                            aria-label={
                              item.isFavorite ? 'Remove from favourites' : 'Mark as favourite'
                            }
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                              item.isFavorite
                                ? 'border-amber-400/50 bg-amber-500/15 text-amber-300'
                                : 'border-white/10 text-slate-400 hover:text-amber-300'
                            }`}
                          >
                            <Star
                              className="h-3.5 w-3.5"
                              fill={item.isFavorite ? 'currentColor' : 'none'}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setResult({
                                title: item.title || item.topic,
                                prompt: item.generatedPrompt,
                                usageTips: [],
                                variables: [],
                              })
                            }
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#A855F7]"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePromptRecord(item.id)}
                            aria-label="Delete saved prompt"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
