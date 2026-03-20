'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { BarChart3, TrendingUp, Activity, Target, Users } from 'lucide-react';
import TopicRadar from './TopicRadar';
import CommentCard from './CommentCard';
import SourceBadge from './SourceBadge';
import type { DashboardData, Platform } from '@/lib/types';

interface AnalysisTabProps {
  data: DashboardData;
  onGenerateResponse: (mentionId: string) => void;
  onImproveResponse: (mentionId: string) => void;
}

const COLORS = {
  positive: '#1a73e8',
  negative: '#ef4444',
  neutral: '#9ca3af',
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function KpiCard({ label, value, icon: Icon, iconColor, iconBg }: KpiCardProps) {
  return (
    <div className="kpi-card rounded-xl border border-[#dadce0] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#5f6368]">{label}</p>
          <p className="mt-1 text-3xl font-bold text-[#202124]">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

export default function AnalysisTab({
  data,
  onGenerateResponse,
  onImproveResponse,
}: AnalysisTabProps) {
  // Compute sentiment over time from real data (last 7 days)
  const sentimentOverTime = useMemo(() => {
    const days: Record<string, { positive: number; negative: number; neutral: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
      days[key] = { positive: 0, negative: 0, neutral: 0 };
    }
    for (const m of data.mentions) {
      const d = new Date(m.createdAt);
      const key = d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
      if (key in days && (m.sentiment === 'positive' || m.sentiment === 'negative' || m.sentiment === 'neutral')) {
        days[key][m.sentiment]++;
      }
    }
    return Object.entries(days).map(([date, counts]) => ({ date, ...counts }));
  }, [data.mentions]);

  // Compute word frequencies from mentions
  const wordFrequencies = useMemo(() => {
    const stopwords = new Set(['der', 'die', 'das', 'und', 'in', 'von', 'zu', 'für', 'mit', 'auf', 'ist', 'im', 'den', 'des', 'ein', 'eine', 'dem', 'nicht', 'sich', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'dann', 'soll', 'da', 'sehr', 'wurde', 'bereits', 'seit']);

    const counts: Record<string, number> = {};
    for (const m of data.mentions) {
      const words = m.content.toLowerCase().replace(/[^a-zäöüß\s]/g, '').split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && !stopwords.has(word)) {
          counts[word] = (counts[word] || 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
  }, [data.mentions]);

  // Sentiment breakdown
  const sentimentData = [
    { name: 'Positiv', value: data.stats.positivePct, color: COLORS.positive },
    { name: 'Negativ', value: data.stats.negativePct, color: COLORS.negative },
    { name: 'Neutral', value: data.stats.neutralPct, color: COLORS.neutral },
  ];

  // Platform breakdown with percentages
  const platformCounts: Record<string, number> = {};
  data.mentions.forEach((m) => {
    platformCounts[m.platform] = (platformCounts[m.platform] || 0) + 1;
  });
  const totalMentionsForPct = data.mentions.length || 1;
  const platformData = Object.entries(platformCounts)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      rawName: name as Platform,
      count,
      pct: Math.round((count / totalMentionsForPct) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topPlatform = platformData[0];

  // Top authors (Share of Voice)
  const topAuthors = useMemo(() => {
    const counts: Record<string, { count: number; platform: Platform }> = {};
    for (const m of data.mentions) {
      if (!counts[m.author]) counts[m.author] = { count: 0, platform: m.platform };
      counts[m.author].count++;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [data.mentions]);

  // Total engagement
  const totalEngagement = data.mentions.reduce((s, m) => s + m.engagementCount, 0);
  const avgEngagement = Math.round(totalEngagement / data.mentions.length);

  // Presence score (mock)
  const presenceScore = 78;

  // Positive/negative ratio
  const posNegRatio =
    data.stats.negativePct > 0
      ? (data.stats.positivePct / data.stats.negativePct).toFixed(1)
      : 'N/A';

  // Top mentions
  const topMentions = [...data.mentions]
    .sort((a, b) => b.engagementCount - a.engagementCount)
    .slice(0, 3);

  return (
    <div className="tab-content-enter space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Erwähnungen"
          value={data.stats.totalMentions}
          icon={BarChart3}
          iconColor="#1a73e8"
          iconBg="bg-[#e8f0fe]"
        />
        <KpiCard
          label="Avg. Engagement"
          value={avgEngagement.toLocaleString('de-DE')}
          icon={Activity}
          iconColor="#1a73e8"
          iconBg="bg-[#e8f0fe]"
        />
        <KpiCard
          label="Presence Score"
          value={`${presenceScore}/100`}
          icon={Target}
          iconColor="#1a73e8"
          iconBg="bg-[#e8f0fe]"
        />
        <KpiCard
          label="Positiv/Negativ Ratio"
          value={`${posNegRatio}:1`}
          icon={TrendingUp}
          iconColor="#f59e0b"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Grid 2x2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sentiment Pie Chart */}
        <div className="chart-container">
          <h3 className="mb-1 text-sm font-semibold text-[#202124]">
            Sentiment-Verteilung
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Verteilung der Stimmung aller Erwähnungen. Zeigt den Anteil positiver, negativer und neutraler Nennungen.
          </p>
          <div className="flex items-center justify-center" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {sentimentData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value) => [`${value}%`, 'Anteil']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
            {sentimentData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentions over time */}
        <div className="chart-container">
          <h3 className="mb-1 text-sm font-semibold text-[#202124]">
            Erwähnungen über Zeit
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Sentiment-Verlauf über die letzten 7 Tage. Zeigt die tägliche Entwicklung nach Stimmungskategorie.
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="positive"
                  stroke="#1a73e8"
                  strokeWidth={2}
                  dot={false}
                  name="Positiv"
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Negativ"
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  dot={false}
                  name="Neutral"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#1a73e8' }} />
              <span>Positiv</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span>Negativ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
              <span>Neutral</span>
            </div>
          </div>
        </div>

        {/* Share of Voice — Source Breakdown BarChart */}
        <div className="chart-container">
          <h3 className="mb-1 text-sm font-semibold text-[#202124]">
            Share of Voice — Quellen-Verteilung
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Verteilung der Erwähnungen nach Plattform. Zeigt, welche Quellen die meisten Treffer liefern.
          </p>
          {topPlatform && (
            <p className="mb-3 rounded-lg bg-[#e8f0fe] px-3 py-2 text-sm text-[#202124]">
              Die meisten Erwähnungen kommen von <strong>{topPlatform.name}</strong> ({topPlatform.pct}%)
            </p>
          )}
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformData}
                layout="vertical"
                margin={{ top: 5, right: 50, bottom: 5, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#5f6368', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#202124', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #dadce0',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value, _name, props) => {
                    const entry = (props as any).payload;
                    return [`${value} (${entry?.pct ?? 0}%)`, 'Erwähnungen'];
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#1a73e8"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                  name="Erwähnungen"
                  label={{
                    position: 'right',
                    content: (props: any) => {
                      const { x, y, width, height, value, index } = props;
                      const entry = platformData[index];
                      if (!entry) return null;
                      return (
                        <text
                          x={x + width + 6}
                          y={y + height / 2}
                          fill="#5f6368"
                          fontSize={11}
                          dominantBaseline="middle"
                        >
                          {entry.pct}%
                        </text>
                      );
                    },
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#1a73e8' }} />
              <span>Erwähnungen pro Plattform</span>
            </div>
          </div>

          {/* Top Authors */}
          {topAuthors.length > 0 && (
            <div className="mt-5 border-t border-[#f1f3f4] pt-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#202124]">
                <Users className="h-4 w-4 text-[#5f6368]" />
                Top Autoren
              </h4>
              <ul className="space-y-2">
                {topAuthors.map(([author, { count, platform }]) => (
                  <li key={author} className="flex items-center gap-2.5 text-sm">
                    <SourceBadge platform={platform} className="shrink-0" />
                    <span className="truncate font-medium text-[#202124]">{author}</span>
                    <span className="ml-auto shrink-0 rounded-full bg-[#f1f3f4] px-2 py-0.5 text-xs font-medium text-[#5f6368]">
                      {count} {count === 1 ? 'Erwähnung' : 'Erwähnungen'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Topic Radar */}
        <TopicRadar topics={data.topics} />
      </div>

      {/* Word Cloud */}
      <div className="chart-container">
        <h3 className="mb-1 text-sm font-semibold text-[#202124]">
          Meistgenannte Begriffe
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Die am häufigsten verwendeten Begriffe in allen Erwähnungen der letzten 7 Tage.
        </p>
        <div className="flex flex-wrap gap-2 justify-center py-4">
          {wordFrequencies.map(([word, count], idx) => {
            const maxCount = wordFrequencies[0]?.[1] ?? 1;
            const minSize = 14;
            const maxSize = 40;
            const fontSize = Math.round(minSize + ((count / maxCount) * (maxSize - minSize)));
            const colors = ['#1a73e8', '#5f6368', '#34a853', '#ea4335', '#fbbc04', '#1a73e8'];
            const color = colors[idx % colors.length];
            return (
              <span
                key={word}
                className="inline-block cursor-default transition-opacity hover:opacity-70"
                style={{ fontSize: `${fontSize}px`, color, fontWeight: count === maxCount ? 700 : 500, lineHeight: 1.3 }}
                title={`${count}× erwähnt`}
              >
                {word}
              </span>
            );
          })}
          {wordFrequencies.length === 0 && (
            <p className="text-sm text-muted-foreground">Keine Erwähnungen vorhanden.</p>
          )}
        </div>
      </div>

      {/* Top Mentions */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-[#202124]">
          Wichtigste Erwähnungen
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
