'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { MessageSquare } from 'lucide-react';
import type { Mention, Response } from '@/lib/types';
import CommentCard from './CommentCard';

type Filter = 'all' | 'positive' | 'negative' | 'neutral' | 'needsResponse';

interface CommentListProps {
  mentions: Mention[];
  responses: Record<string, Response>;
  onGenerateResponse: (mentionId: string) => void;
  onImproveResponse: (mentionId: string) => void;
}

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'positive', label: 'Positiv' },
  { key: 'negative', label: 'Negativ' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'needsResponse', label: 'Antwort nötig' },
];

export default function CommentList({
  mentions,
  responses,
  onGenerateResponse,
  onImproveResponse,
}: CommentListProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filtered = mentions.filter((m) => {
    switch (activeFilter) {
      case 'positive':
        return m.sentiment === 'positive';
      case 'negative':
        return m.sentiment === 'negative';
      case 'neutral':
        return m.sentiment === 'neutral';
      case 'needsResponse':
        return m.needsResponse;
      default:
        return true;
    }
  });

  return (
    <section>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#202020]">
          <MessageSquare className="h-5 w-5 text-[#646464]" />
          Aktuelle Erwähnungen
          <span className="ml-1 rounded-full bg-[#ffdfb5] px-2.5 py-0.5 text-xs font-medium text-[#644a40]">
            {filtered.length}
          </span>
        </h2>
      </div>

      {/* Filter tabs - Brand24 style */}
      <div className="mt-3 flex gap-0 border-b border-[#d8d8d8]">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={clsx(
              'cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors',
              activeFilter === key
                ? 'border-b-[3px] border-[#644a40] text-[#644a40]'
                : 'border-b-[3px] border-transparent text-[#646464] hover:text-[#343434]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#646464]">
            Keine Erwähnungen für diesen Filter.
          </p>
        )}
        {filtered.map((mention) => (
          <CommentCard
            key={mention.id}
            mention={mention}
            response={responses[mention.id]}
            onGenerateResponse={onGenerateResponse}
            onImproveResponse={onImproveResponse}
          />
        ))}
      </div>
    </section>
  );
}
