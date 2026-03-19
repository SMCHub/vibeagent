'use client';

import { MessageSquare, ThumbsUp, ThumbsDown, Reply, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsRowProps {
  stats: {
    totalMentions: number;
    positivePct: number;
    negativePct: number;
    neutralPct: number;
    needsResponse: number;
  };
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: { value: number; isPositive: boolean };
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend }: StatCardProps) {
  return (
    <div className="kpi-card rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-[#34a853]" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-[#ea4335]" />
              )}
              <span
                className={clsx(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-[#34a853]' : 'text-[#ea4335]',
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs. letzte Woche</span>
            </div>
          )}
        </div>
        <div
          className={clsx('flex h-11 w-11 items-center justify-center rounded-xl', iconBg)}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

export default function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Erwähnungen"
        value={stats.totalMentions}
        icon={MessageSquare}
        iconColor="#1a73e8"
        iconBg="bg-[#e8f0fe]"
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        label="Positiv"
        value={`${stats.positivePct}%`}
        icon={ThumbsUp}
        iconColor="#34a853"
        iconBg="bg-[#e6f4ea]"
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        label="Negativ"
        value={`${stats.negativePct}%`}
        icon={ThumbsDown}
        iconColor="#ea4335"
        iconBg="bg-[#fce8e6]"
        trend={{ value: -3, isPositive: false }}
      />
      <StatCard
        label="Antwort nötig"
        value={stats.needsResponse}
        icon={Reply}
        iconColor="#fbbc04"
        iconBg="bg-[#fef7e0]"
        trend={{ value: 2, isPositive: false }}
      />
    </div>
  );
}
