'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Heart, Sparkles, Copy, Check, RefreshCw, MessageSquare, ExternalLink, Reply, Tag } from 'lucide-react';
import type { Mention, Response } from '@/lib/types';
import SourceBadge from './SourceBadge';

interface CommentCardProps {
  mention: Mention;
  response?: Response;
  onGenerateResponse: (mentionId: string) => void;
  onImproveResponse: (mentionId: string) => void;
}

/** Returns a German relative-time string. */
function timeAgoDE(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Minuten`;
  if (diffHrs < 24) return `vor ${diffHrs} Stunden`;
  if (diffDays < 7) return `vor ${diffDays} Tagen`;

  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const sentimentMeta: Record<
  string,
  { label: string; dotColor: string; textColor: string }
> = {
  positive: { label: 'Positiv', dotColor: 'bg-[#1a73e8]', textColor: 'text-[#1a73e8]' },
  negative: { label: 'Negativ', dotColor: 'bg-[#ef4444]', textColor: 'text-[#ef4444]' },
  neutral: { label: 'Neutral', dotColor: 'bg-[#9ca3af]', textColor: 'text-[#9ca3af]' },
};

export default function CommentCard({
  mention,
  response,
  onGenerateResponse,
  onImproveResponse,
}: CommentCardProps) {
  const [copied, setCopied] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const [localTags, setLocalTags] = useState<string[]>(mention.tags ?? []);

  const handleAddTag = () => {
    const trimmed = tagValue.trim();
    if (trimmed && !localTags.includes(trimmed)) {
      setLocalTags((prev) => [...prev, trimmed]);
    }
    setTagValue('');
    setShowTagInput(false);
  };

  const sentiment = sentimentMeta[mention.sentiment] ?? sentimentMeta.neutral;

  const handleCopy = async () => {
    const text = response?.improvedText ?? response?.generatedText ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#dadce0] bg-white p-5 transition-all hover:border-[#9aa0a6] hover:shadow-md">
      {/* Top row: source, author, time, original link */}
      <div className="flex flex-wrap items-center gap-2">
        <SourceBadge platform={mention.platform} />
        {mention.authorUrl ? (
          <a
            href={mention.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#202124] underline decoration-[#dadce0] underline-offset-2 transition-colors hover:text-[#1a73e8] hover:decoration-[#1a73e8]"
          >
            {mention.author}
          </a>
        ) : (
          <span className="text-sm font-medium text-[#202124]">{mention.author}</span>
        )}
        <span className="text-xs text-[#5f6368]" suppressHydrationWarning>
          {timeAgoDE(new Date(mention.createdAt))}
        </span>
        {mention.authorUrl && (
          <a
            href={mention.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-[#5f6368] transition-colors hover:text-[#1a73e8]"
          >
            <ExternalLink className="h-3 w-3" />
            Zum Original →
          </a>
        )}
      </div>

      {/* Sentiment indicator + Tag button */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className={clsx('inline-block h-2.5 w-2.5 rounded-full', sentiment.dotColor)} />
        <span className={clsx('text-xs font-medium', sentiment.textColor)}>{sentiment.label}</span>
        <button
          onClick={() => setShowTagInput((prev) => !prev)}
          className="ml-2 inline-flex items-center gap-1 rounded-md border border-[#dadce0] px-2 py-0.5 text-[11px] font-medium text-[#5f6368] transition-colors hover:border-[#1a73e8] hover:text-[#1a73e8]"
        >
          <Tag className="h-3 w-3" />
          Tag
        </button>
      </div>

      {/* Inline Tag Input */}
      {showTagInput && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
            placeholder="Tag eingeben..."
            className="rounded-md border border-[#dadce0] px-2.5 py-1 text-xs text-[#202124] placeholder:text-[#9aa0a6] focus:border-[#1a73e8] focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleAddTag}
            className="rounded-md bg-[#1a73e8] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#174ea6]"
          >
            Hinzufügen
          </button>
        </div>
      )}

      {/* Tags */}
      {localTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {localTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#e8f0fe] px-2.5 py-0.5 text-[11px] font-medium text-[#1a73e8]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <p className="mt-3 text-sm leading-relaxed text-[#202124]">{mention.content}</p>

      {/* Engagement */}
      {mention.engagementCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#5f6368]">
          <Heart className="h-3.5 w-3.5" />
          <span className="font-medium">
            {mention.engagementCount.toLocaleString('de-DE')}
          </span>
          <span>Interaktionen</span>
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="mt-4 rounded-lg border border-[#dadce0] bg-[#f9f9f9] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1a73e8]">
            <Sparkles className="h-3.5 w-3.5" />
            KI-Antwortvorschlag
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#202124]">
            {response.improvedText ?? response.generatedText}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => onImproveResponse(mention.id)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#dadce0] px-3 py-1.5 text-xs font-medium text-[#5f6368] transition-colors hover:border-[#1a73e8] hover:text-[#1a73e8]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Verbessern
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1a73e8] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#174ea6]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Kopieren
                </>
              )}
            </button>
            <div className="relative group">
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#dadce0] px-3 py-1.5 text-xs font-medium text-[#9aa0a6]"
              >
                <Reply className="h-3.5 w-3.5" />
                Direkt antworten
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#202124] px-2.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                Bald verfügbar — Login erforderlich
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Generate response CTA */}
      {!response && mention.needsResponse && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onGenerateResponse(mention.id)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1a73e8] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#174ea6]"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Antwort generieren
          </button>
          <div className="relative group">
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#dadce0] px-4 py-2 text-xs font-medium text-[#9aa0a6]"
            >
              <Reply className="h-3.5 w-3.5" />
              Direkt antworten
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#202124] px-2.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              Bald verfügbar — Login erforderlich
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
