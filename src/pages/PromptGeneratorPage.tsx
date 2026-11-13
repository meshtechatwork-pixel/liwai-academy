import React, { useState } from 'react';
import { BookmarkPlus, Check, Copy, Eraser, Sparkles, Trash2 } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { useAuth } from '../context/AuthContext';
import { PromptGeneratorResponse } from '../types/academy';

const PROMPT_CATEGORIES = [
  'Web Design',
  'Web Development',
  'Social Media Management',
  'Video Editing',
  'AI Prompt Engineering',
  'Marketing & Copywriting',
  'Education & Course Creation',
];

const AI_PLATFORMS = [
  'Google Gemini',
  'ChatGPT (GPT-4o / o3)',
  'Claude (Sonnet / Opus)',
  'Midjourney / Image Models',
  'Veo / Video Generation',
  'Cursor / Coding Assistants',
];

const PROMPT_PURPOSES = [
  'Generate Production Code or Architecture',
  'Design System & UI Wireframe Spec',
  'High-Retention Social Media Campaign',
  'Video Script, Storyboard & Editing Plan',
  'Lesson Plan & Curriculum Design',
  'Research Synthesis & Executive Audit',
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

export default function PromptGeneratorPage() {
  const { user } = useAuth();
  const { savedPrompts, savePromptToHistory, deleteSavedPrompt } = useAcademy();

  const [category, setCategory] = useState(PROMPT_CATEGORIES[0]);
  const [platform, setPlatform] = useState(AI_PLATFORMS[0]);
  const [purpose, setPurpose] = useState(PROMPT_PURPOSES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [outputFormat, setOutputFormat] = useState(OUTPUT_FORMATS[0]);
  const [topic, setTopic] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PromptGeneratorResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedFlag(false);

    try {
      const response = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          platform,
          purpose,
          tone,
          outputFormat,
          topic,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate structured prompt.');
      }
      setResult(data as PromptGeneratorResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach prompt service.');
    } finally {
      setLoading(false);
    }
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

  const handleSavePrompt = async () => {
    if (!user || !result) return;
    try {
      await savePromptToHistory({
        category,
        platform,
        purpose,
        tone,
        outputFormat,
        topic: topic.trim() || `${category} — ${purpose}`,
        generatedPrompt: result.prompt,
      });
      setSavedFlag(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save prompt.');
    }
  };

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            LIWAI ACADEMY · AI Prompt Generator
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl text-balance">
            Engineer structured, high-precision prompts for any AI platform.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Configure your prompt category, target AI platform, purpose, tone, and output format.
            Our backend Gemini service generates a complete prompt ready to copy into your workflow.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Configuration Form */}
          <form
            onSubmit={handleGenerate}
            className="rounded-2xl border border-white/10 bg-[#17112B] p-6 sm:p-7 lg:col-span-5"
          >
            <h2 className="font-display text-lg font-semibold text-white">Prompt Parameters</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300" htmlFor="pg-category">
                  Prompt Category
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
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300" htmlFor="pg-topic">
                  Project Goal or Topic Context (optional)
                </label>
                <textarea
                  id="pg-topic"
                  rows={3}
                  maxLength={500}
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
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-[#17112B] p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    {result ? result.title : 'Structured Prompt Output'}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {category} · {platform} · {outputFormat}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {user && result && (
                    <button
                      type="button"
                      onClick={handleSavePrompt}
                      disabled={savedFlag}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:border-[#A855F7] disabled:opacity-60"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      {savedFlag ? 'Saved' : 'Save'}
                    </button>
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
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
                      <h3 className="text-xs font-semibold text-white">Platform Execution Tips</h3>
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

            {/* Saved Prompts History for Signed-In Users */}
            {user && savedPrompts.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#17112B] p-6">
                <h2 className="font-display text-base font-semibold text-white">
                  Saved Prompt Library ({savedPrompts.length})
                </h2>
                <div className="mt-4 space-y-3">
                  {savedPrompts.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-[#C084FC]">
                          {item.category} · {item.platform}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-white">{item.topic}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setResult({
                              title: item.topic,
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
                          onClick={() => deleteSavedPrompt(item.id)}
                          aria-label="Delete saved prompt"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
