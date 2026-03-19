'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
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

// Mock time-series data for mentions over time
const mentionsOverTime = [
  { date: '12 Mär', mentions: 3, reach: 450 },
  { date: '13 Mär', mentions: 5, reach: 1200 },
  { date: '14 Mär', mentions: 2, reach: 320 },
  { date: '15 Mär', mentions: 7, reach: 2800 },
  { date: '16 Mär', mentions: 4, reach: 980 },
  { date: '17 Mär', mentions: 8, reach: 6500 },
  { date: '18 Mär', mentions: 6, reach: 3200 },
  { date: '19 Mär', mentions: 10, reach: 4100 },
];

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
  const firstName = data.politician.name.split(' ')[0];
  const viralCrisis = data.mentions.find(
    (m) => m.isViral && m.sentiment === 'negative',
  );

  // Top 3 mentions by engagement
  const topMentions = [...data.mentions]
    .sort((a, b) => b.engagementCount - a.engagementCount)
    .slice(0, 3);

  return (
    <div className="tab-content-enter space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#202020]">
            Guten Morgen, {firstName}!
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-[#646464]">
            <Calendar className="h-4 w-4" />
            <span suppressHydrationWarning>
              Ihr tägliches Briefing vom {formatGermanDate(new Date())}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#ffdfb5] px-3 py-1.5">
          <TrendingUp className="h-4 w-4 text-[#644a40]" />
          <span className="text-sm font-medium text-[#644a40]">
            Presence Score: 78/100
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <StatsRow stats={data.stats} />

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
          <p className="mt-3 text-sm leading-relaxed text-[#343434]">
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
          <h3 className="mb-4 text-sm font-semibold text-[#202020]">
            Erwähnungen über Zeit
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mentionsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#999999', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#999999', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8d8d8',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mentions"
                  stroke="#644a40"
                  strokeWidth={2.5}
                  dot={{ fill: '#644a40', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Erwähnungen"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Radar */}
        <TopicRadar topics={data.topics} />
      </div>

      {/* Top Mentions */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-[#202020]">
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
