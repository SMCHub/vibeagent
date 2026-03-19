'use client';

import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Topic, Importance } from '@/lib/types';

interface TopicRadarProps {
  topics: Topic[];
}

const importanceColor: Record<Importance, string> = {
  hoch: '#4285f4',
  mittel: '#fbbc04',
  niedrig: '#dadce0',
};

const trendArrow: Record<string, string> = {
  rising: '\u2191',
  stable: '\u2192',
  falling: '\u2193',
};

export default function TopicRadar({ topics }: TopicRadarProps) {
  const data = topics.map((t) => ({
    name: `${t.name} ${trendArrow[t.trend] ?? ''}`,
    mentionCount: t.mentionCount,
    importance: t.importance,
  }));

  return (
    <div className="chart-container">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#202124]">
        <BarChart3 className="h-4 w-4 text-[#5f6368]" />
        Themen-Radar
      </h3>
      <p className="text-xs text-muted-foreground mt-1 mb-3">
        Zeigt die am häufigsten erwähnten Themen der letzten 7 Tage. Die Balkenlänge entspricht der Anzahl Erwähnungen.
      </p>

      <div style={{ width: '100%', height: topics.length * 40 + 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
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
              width={160}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: 8,
                color: '#202124',
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              labelStyle={{ color: '#202124', fontWeight: 600 }}
            />
            <Bar dataKey="mentionCount" radius={[0, 6, 6, 0]} barSize={20} name="Erwähnungen">
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={importanceColor[entry.importance as Importance]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#4285f4' }} />
          <span>Hohe Wichtigkeit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#fbbc04' }} />
          <span>Mittlere Wichtigkeit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#dadce0' }} />
          <span>Niedrige Wichtigkeit</span>
        </div>
        <span className="mx-1 text-[#dadce0]">|</span>
        <div className="flex items-center gap-1.5">
          <span>↑ Steigend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>→ Stabil</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>↓ Fallend</span>
        </div>
      </div>
    </div>
  );
}
