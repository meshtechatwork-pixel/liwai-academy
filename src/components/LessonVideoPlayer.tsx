import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { Lesson } from '../types/learning';

interface LessonVideoPlayerProps {
  lesson: Lesson;
  courseTitle: string;
  thumbnailUrl?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function LessonVideoPlayer({
  lesson,
  courseTitle,
  thumbnailUrl,
}: LessonVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<'1x' | '1.25x' | '1.5x'>('1x');

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [lesson.id]);

  useEffect(() => {
    if (!playing) return;
    const stepMs = speed === '1.5x' ? 350 : speed === '1.25x' ? 450 : 600;
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const isExternalVideo =
    lesson.videoUrl &&
    !lesson.videoUrl.startsWith('interactive://') &&
    (lesson.videoUrl.startsWith('http://') || lesson.videoUrl.startsWith('https://'));

  const youtubeEmbed = isExternalVideo ? getYouTubeEmbedUrl(lesson.videoUrl) : null;

  if (youtubeEmbed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        <iframe
          src={youtubeEmbed}
          title={lesson.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isExternalVideo) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        <video
          src={lesson.videoUrl}
          poster={thumbnailUrl}
          controls
          className="h-full w-full object-contain"
        >
          Your browser does not support HTML5 video playback.
        </video>
      </div>
    );
  }

  const chapterIndex = progress < 34 ? 1 : progress < 68 ? 2 : 3;
  const chapters = [
    {
      num: '01',
      label: 'Core Concept Framing',
      body: lesson.summary,
    },
    {
      num: '02',
      label: 'Guided Studio Walkthrough',
      body: `Apply the workflow for "${lesson.title}" inside ${courseTitle} using structured AI checkpoints and measurable quality criteria.`,
    },
    {
      num: '03',
      label: 'Deliverable & Self-Check',
      body: `Download "${lesson.resourceTitle || 'Lesson Workbook'}" below, complete the checklist, and mark this lesson complete to advance your progress.`,
    },
  ];

  const activeChapter = chapters[chapterIndex - 1];

  return (
    <div className="overflow-hidden rounded-xl border border-white/12 bg-[#140E27]/90 backdrop-blur-md">
      <div className="relative flex aspect-video w-full flex-col justify-between overflow-hidden bg-[#0D091A] p-6 sm:p-10">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
          />
        )}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
          <span>
            Lesson {lesson.order} · {lesson.duration}
          </span>
          <span className="font-mono tabular-nums text-[#C084FC]">
            Segment {activeChapter.num} / 03
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            {activeChapter.label}
          </p>
          <h3 className="mt-2 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
            {lesson.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
            {activeChapter.body}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3 pt-4">
          {chapters.map((ch, idx) => (
            <button
              key={ch.num}
              type="button"
              onClick={() => setProgress(idx === 0 ? 5 : idx === 1 ? 40 : 75)}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                chapterIndex === idx + 1
                  ? 'border-[#A855F7] bg-[#6D28D9]/25 text-white'
                  : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
              }`}
            >
              <span className="font-mono text-[#C084FC]">{ch.num}</span> {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-t border-white/10 bg-[#17112B] px-5 py-3.5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#6D28D9] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#7C3AED] whitespace-nowrap shrink-0"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? 'Pause' : progress >= 100 ? 'Replay' : 'Play Lesson'}
          </button>

          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setPlaying(true);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            aria-label="Restart lesson"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            aria-label="Lesson playback progress"
            className="h-1.5 flex-1 cursor-pointer accent-[#A855F7]"
          />

          <span className="w-10 text-right font-mono text-xs tabular-nums text-slate-300">
            {progress}%
          </span>

          <button
            type="button"
            onClick={() =>
              setSpeed((s) => (s === '1x' ? '1.25x' : s === '1.25x' ? '1.5x' : '1x'))
            }
            className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-xs text-slate-200 hover:border-[#A855F7]"
          >
            {speed}
          </button>

          <Volume2 className="hidden h-4 w-4 text-slate-400 sm:block" />
        </div>
      </div>
    </div>
  );
}
