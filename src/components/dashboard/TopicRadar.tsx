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
  hoch: '#644a40',
  mittel: '#f59e0b',
  niedrig: '#d8d8d8',
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
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#202020]">
        <BarChart3 className="h-4 w-4 text-[#646464]" />
        Themen-Radar
      </h3>

      <div style={{ width: '100%', height: topics.length * 40 + 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
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
              width={160}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8d8d8',
                borderRadius: 8,
                color: '#343434',
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              labelStyle={{ color: '#202020', fontWeight: 600 }}
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
    </div>
  );
}
