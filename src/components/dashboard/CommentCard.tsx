'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Heart, Sparkles, Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';
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
  positive: { label: 'Positiv', dotColor: 'bg-[#644a40]', textColor: 'text-[#644a40]' },
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

  const sentiment = sentimentMeta[mention.sentiment] ?? sentimentMeta.neutral;

  const handleCopy = async () => {
    const text = response?.improvedText ?? response?.generatedText ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#d8d8d8] bg-white p-5 transition-all hover:border-[#b5b5b5] hover:shadow-md">
      {/* Top row: source, author, time */}
      <div className="flex flex-wrap items-center gap-2">
        <SourceBadge platform={mention.platform} />
        <span className="text-sm font-medium text-[#202020]">{mention.author}</span>
        <span className="text-xs text-[#999999]" suppressHydrationWarning>
          {timeAgoDE(new Date(mention.createdAt))}
        </span>
      </div>

      {/* Sentiment indicator */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className={clsx('inline-block h-2.5 w-2.5 rounded-full', sentiment.dotColor)} />
        <span className={clsx('text-xs font-medium', sentiment.textColor)}>{sentiment.label}</span>
      </div>

      {/* Tags */}
      {mention.tags && mention.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {mention.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#efefef] px-2.5 py-0.5 text-[11px] font-medium text-[#646464]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <p className="mt-3 text-sm leading-relaxed text-[#343434]">{mention.content}</p>

      {/* Engagement */}
      {mention.engagementCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#999999]">
          <Heart className="h-3.5 w-3.5" />
          <span className="font-medium">
            {mention.engagementCount.toLocaleString('de-DE')}
          </span>
          <span>Interaktionen</span>
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="mt-4 rounded-lg border border-[#d8d8d8] bg-[#f9f9f9] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#644a40]">
            <Sparkles className="h-3.5 w-3.5" />
            KI-Antwortvorschlag
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#343434]">
            {response.improvedText ?? response.generatedText}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onImproveResponse(mention.id)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8d8d8] px-3 py-1.5 text-xs font-medium text-[#646464] transition-colors hover:border-[#644a40] hover:text-[#644a40]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Verbessern
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#644a40] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#4a3530]"
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
          </div>
        </div>
      )}

      {/* Generate response CTA */}
      {!response && mention.needsResponse && (
        <button
          onClick={() => onGenerateResponse(mention.id)}
          className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#644a40] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4a3530]"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Antwort generieren
        </button>
      )}
    </div>
  );
}
