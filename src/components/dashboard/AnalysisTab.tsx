'use client';

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
import { BarChart3, TrendingUp, Activity, Target } from 'lucide-react';
import TopicRadar from './TopicRadar';
import CommentCard from './CommentCard';
import type { DashboardData } from '@/lib/types';

interface AnalysisTabProps {
  data: DashboardData;
  onGenerateResponse: (mentionId: string) => void;
  onImproveResponse: (mentionId: string) => void;
}

// Mock time-series data
const mentionsOverTime = [
  { date: '12 Mär', mentions: 3, positive: 1, negative: 1, neutral: 1 },
  { date: '13 Mär', mentions: 5, positive: 2, negative: 2, neutral: 1 },
  { date: '14 Mär', mentions: 2, positive: 1, negative: 0, neutral: 1 },
  { date: '15 Mär', mentions: 7, positive: 3, negative: 2, neutral: 2 },
  { date: '16 Mär', mentions: 4, positive: 2, negative: 1, neutral: 1 },
  { date: '17 Mär', mentions: 8, positive: 3, negative: 3, neutral: 2 },
  { date: '18 Mär', mentions: 6, positive: 2, negative: 2, neutral: 2 },
  { date: '19 Mär', mentions: 10, positive: 4, negative: 3, neutral: 3 },
];

const COLORS = {
  positive: '#644a40',
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
    <div className="kpi-card rounded-xl border border-[#d8d8d8] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#646464]">{label}</p>
          <p className="mt-1 text-3xl font-bold text-[#202020]">{value}</p>
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
  // Sentiment breakdown
  const sentimentData = [
    { name: 'Positiv', value: data.stats.positivePct, color: COLORS.positive },
    { name: 'Negativ', value: data.stats.negativePct, color: COLORS.negative },
    { name: 'Neutral', value: data.stats.neutralPct, color: COLORS.neutral },
  ];

  // Platform breakdown
  const platformCounts: Record<string, number> = {};
  data.mentions.forEach((m) => {
    platformCounts[m.platform] = (platformCounts[m.platform] || 0) + 1;
  });
  const platformData = Object.entries(platformCounts)
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
    .sort((a, b) => b.count - a.count);

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
          iconColor="#644a40"
          iconBg="bg-[#ffdfb5]"
        />
        <KpiCard
          label="Avg. Engagement"
          value={avgEngagement.toLocaleString('de-DE')}
          icon={Activity}
          iconColor="#644a40"
          iconBg="bg-[#fff5e6]"
        />
        <KpiCard
          label="Presence Score"
          value={`${presenceScore}/100`}
          icon={Target}
          iconColor="#644a40"
          iconBg="bg-[#ffdfb5]"
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
          <h3 className="mb-4 text-sm font-semibold text-[#202020]">
            Sentiment-Verteilung
          </h3>
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
                    border: '1px solid #d8d8d8',
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
          <div className="mt-2 flex justify-center gap-6">
            {sentimentData.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs text-[#646464]">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentions over time */}
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
                  dataKey="positive"
                  stroke="#644a40"
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
        </div>

        {/* Source Breakdown BarChart */}
        <div className="chart-container">
          <h3 className="mb-4 text-sm font-semibold text-[#202020]">
            Quellen-Verteilung
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformData}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#efefef" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#999999', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#343434', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
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
                <Bar
                  dataKey="count"
                  fill="#644a40"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                  name="Erwähnungen"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Radar */}
        <TopicRadar topics={data.topics} />
      </div>

      {/* Top Mentions */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-[#202020]">
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
