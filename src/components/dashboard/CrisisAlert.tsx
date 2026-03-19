'use client';

import { AlertTriangle, Heart } from 'lucide-react';
import type { Mention } from '@/lib/types';
import SourceBadge from './SourceBadge';

interface CrisisAlertProps {
  mention: Mention;
  onGenerateResponse: (mentionId: string) => void;
}

export default function CrisisAlert({
  mention,
  onGenerateResponse,
}: CrisisAlertProps) {
  if (!mention.isViral || mention.sentiment !== 'negative') {
    return null;
  }

  const truncatedContent =
    mention.content.length > 200
      ? mention.content.slice(0, 200) + '...'
      : mention.content;

  return (
    <div className="rounded-xl border border-[#f5c6cb] bg-[#fce8e6] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0 text-[#a50e0e]" />
        <h2 className="text-sm font-semibold tracking-wide text-[#a50e0e] uppercase">
          Krisenmeldung: Virale Erwähnung erkannt
        </h2>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#202124]">
        {truncatedContent}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <SourceBadge platform={mention.platform} />

        {mention.engagementCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-[#5f6368]">
            <Heart className="h-3.5 w-3.5" />
            {mention.engagementCount.toLocaleString('de-DE')}
          </span>
        )}

        <button
          onClick={() => onGenerateResponse(mention.id)}
          className="ml-auto cursor-pointer rounded-full bg-[#a50e0e] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#8c0c0c]"
        >
          Antwort generieren
        </button>
      </div>
    </div>
  );
}
