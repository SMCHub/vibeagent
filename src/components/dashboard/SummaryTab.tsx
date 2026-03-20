'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AlertTriangle, TrendingUp, Calendar, Bell, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import StatsRow from './StatsRow';
import TopicRadar from './TopicRadar';
import CommentCard from './CommentCard';
import type { DashboardData } from '@/lib/types';
import type { Response } from '@/lib/types';

interface SummaryTabProps {
  data: DashboardData;
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

function formatGermanDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SummaryTab({
  data,
  onGenerateResponse,
  onImproveResponse,
}: SummaryTabProps) {
  // Compute mentions over time from real data (last 7 days)
  const mentionsOverTime = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
      days[key] = 0;
    }
    // Count mentions per day
    for (const m of data.mentions) {
      const d = new Date(m.createdAt);
      const key = d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
      if (key in days) days[key]++;
    }
    return Object.entries(days).map(([date, mentions]) => ({ date, mentions }));
  }, [data.mentions]);

  const firstName = data.politician.name.split(' ')[0];
  const viralCrisis = data.mentions.find(
    (m) =>
      m.isViral &&
      m.sentiment === 'negative' &&
      m.sentimentScore < -0.5 &&
      m.engagementCount > 100,
  );

  // Top 3 mentions by engagement
  const topMentions = [...data.mentions]
    .sort((a, b) => b.engagementCount - a.engagementCount)
    .slice(0, 3);

  // Dynamic Presence Score
  const totalMentions = data.stats.totalMentions;
  const positivePct = data.stats.positivePct;
  const avgEngagement =
    data.mentions.length > 0
      ? data.mentions.reduce((sum, m) => sum + m.engagementCount, 0) /
        data.mentions.length
      : 0;
  const presenceScore =
    totalMentions > 0
      ? Math.min(
          100,
          Math.round(
            totalMentions * 2 + positivePct * 0.5 + avgEngagement / 50,
          ),
        )
      : null;

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch('/api/strategy', { method: 'POST' });
      const result = await res.json();
      if (result.success) setAiSummary(result.strategy);
    } catch {
      // silently handle errors
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="tab-content-enter space-y-6">
      {/* Activity Feed */}
      {data.mentions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bell className="h-4 w-4 text-primary" />
            Aktuelle Aktivität
          </h3>
          <div className="space-y-2">
            {data.mentions.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className={clsx(
                  'h-2 w-2 rounded-full shrink-0',
                  m.sentiment === 'positive' ? 'bg-[#34a853]' :
                  m.sentiment === 'negative' ? 'bg-[#ea4335]' : 'bg-[#5f6368]'
                )} />
                <span className="truncate text-muted-foreground">
                  <span className="font-medium text-foreground">{m.author}</span>
                  {' — '}
                  {m.content.slice(0, 80)}...
                </span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
                  {timeAgoDE(new Date(m.createdAt))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#202124]">
            Guten Morgen, {firstName}!
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-[#5f6368]">
            <Calendar className="h-4 w-4" />
            <span suppressHydrationWarning>
              Ihr tägliches Briefing vom {formatGermanDate(new Date())}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#e8f0fe] px-3 py-1.5">
          <TrendingUp className="h-4 w-4 text-[#1a73e8]" />
          <span className="text-sm font-medium text-[#1a73e8]">
            Presence Score: {presenceScore !== null ? `${presenceScore}/100` : '\u2014'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <StatsRow stats={data.stats} />

      {/* AI Summary */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-[#1a73e8]" />
            KI-Zusammenfassung
          </h3>
          <button
            onClick={handleGenerateSummary}
            disabled={isLoadingSummary}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a73e8] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1557b0] disabled:opacity-60"
          >
            {isLoadingSummary ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Wird generiert...
              </>
            ) : (
              'Zusammenfassung generieren'
            )}
          </button>
        </div>
        {aiSummary ? (
          <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {aiSummary}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Klicken Sie auf &quot;Zusammenfassung generieren&quot; für eine KI-gestützte Zusammenfassung der aktuellen Lage.
          </p>
        )}
      </div>

      {/* Crisis Alert */}
      {viralCrisis && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#ef4444]">
                Krisenmeldung: Virale negative Erwähnung
              </h3>
              <p className="text-xs text-red-400">
                {viralCrisis.engagementCount.toLocaleString('de-DE')} Interaktionen — Sofortige Reaktion empfohlen
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#202124]">
            {viralCrisis.content.length > 200
              ? viralCrisis.content.slice(0, 200) + '...'
              : viralCrisis.content}
          </p>
          <button
            onClick={() => onGenerateResponse(viralCrisis.id)}
            className="mt-3 rounded-lg bg-[#ef4444] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600"
          >
            Antwort generieren
          </button>
        </div>
      )}

      {/* Two-column: Chart + TopicRadar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mentions over time chart */}
        <div className="chart-container">
          <h3 className="mb-1 text-sm font-semibold text-[#202124]">
            Erwähnungen über Zeit
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Entwicklung der Erwähnungen über die letzten 7 Tage. Jeder Punkt entspricht einem Tag.
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mentionsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="mentionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34a853" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34a853" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#5f6368', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#5f6368', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mentions"
                  stroke="#34a853"
                  strokeWidth={2}
                  fill="url(#mentionFill)"
                  dot={{ fill: '#34a853', r: 3 }}
                  activeDot={{ r: 5, fill: '#34a853' }}
                  name="Erwähnungen"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#34a853' }} />
              <span>Erwähnungen</span>
            </div>
            <span className="text-[#dadce0]">|</span>
            <span>Zeitraum: Letzte 7 Tage</span>
          </div>
        </div>

        {/* Topic Radar */}
        <TopicRadar topics={data.topics} />
      </div>

      {/* Top Mentions */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-[#202124]">
          Top Erwähnungen nach Engagement
        </h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {topMentions.map((mention) => (
            <CommentCard
              key={mention.id}
              mention={mention}
              response={data.responses[mention.id]}
              onGenerateResponse={onGenerateResponse}
              onImproveResponse={onImproveResponse}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
