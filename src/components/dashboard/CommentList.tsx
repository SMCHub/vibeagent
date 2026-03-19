'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { MessageSquare, Search, X } from 'lucide-react';
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

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function CommentList({
  mentions,
  responses,
  onGenerateResponse,
  onImproveResponse,
}: CommentListProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 250);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    inputRef.current?.focus();
  }, []);

  const filtered = mentions.filter((m) => {
    // Sentiment filter
    const passesSentiment = (() => {
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
    })();

    if (!passesSentiment) return false;

    // Keyword filter
    if (debouncedQuery.trim() === '') return true;

    const q = debouncedQuery.toLowerCase();
    return (
      m.content.toLowerCase().includes(q) ||
      m.author.toLowerCase().includes(q) ||
      m.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const isSearchActive = debouncedQuery.trim() !== '';

  return (
    <section>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#202124]">
          <MessageSquare className="h-5 w-5 text-[#5f6368]" />
          Aktuelle Erwähnungen
          <span className="ml-1 rounded-full bg-[#e8f0fe] px-2.5 py-0.5 text-xs font-medium text-[#1a73e8]">
            {isSearchActive
              ? `${filtered.length} von ${mentions.length}`
              : filtered.length}
          </span>
        </h2>
      </div>

      {/* Keyword search input */}
      <div className="mt-3 w-full max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6368]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nach Stichwort filtern..."
            className="w-full rounded-lg border border-[#dadce0] bg-white py-2 pl-9 pr-9 text-sm text-[#202124] placeholder-[#a0a0a0] outline-none transition-colors focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
          />
          {searchQuery !== '' && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-[#5f6368] transition-colors hover:text-[#202124]"
              aria-label="Suche zurücksetzen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active filter indicator */}
        {isSearchActive && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0fe] px-2.5 py-1 text-xs font-medium text-[#1a73e8]">
              Gefiltert nach: {debouncedQuery}
              <button
                onClick={clearSearch}
                className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-[#f0c890]"
                aria-label="Filter entfernen"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Filter tabs - Brand24 style */}
      <div className="mt-3 flex gap-0 border-b border-[#dadce0]">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={clsx(
              'cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors',
              activeFilter === key
                ? 'border-b-[3px] border-[#1a73e8] text-[#1a73e8]'
                : 'border-b-[3px] border-transparent text-[#5f6368] hover:text-[#202124]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtered count */}
      {isSearchActive && (
        <p className="mt-2 text-xs text-[#5f6368]">
          {filtered.length} von {mentions.length} Erwähnungen
        </p>
      )}

      {/* Cards */}
      <div className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#5f6368]">
            {isSearchActive
              ? `Keine Erwähnungen für \u201E${debouncedQuery}\u201C gefunden.`
              : 'Keine Erwähnungen für diesen Filter.'}
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
