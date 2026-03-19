'use client';

import { useState } from 'react';
import {
  Newspaper,
  Share2,
  MapPin,
  Languages,
  Rss,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  NEWS_SOURCES,
  SOCIAL_MEDIA_TARGETS,
  CANTONS,
} from '@/lib/sources/switzerland';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function SummaryCard({ label, value, icon: Icon, iconColor, iconBg }: SummaryCardProps) {
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

export default function SourcesTab() {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(['national']));
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set(['reddit']));

  // Unique languages
  const languages = new Set(NEWS_SOURCES.map((s) => s.language));

  // Group news sources by region
  const newsByRegion: Record<string, typeof NEWS_SOURCES> = {};
  NEWS_SOURCES.forEach((source) => {
    const region = source.region;
    if (!newsByRegion[region]) newsByRegion[region] = [];
    newsByRegion[region].push(source);
  });

  // Group social targets by platform
  const socialByPlatform: Record<string, typeof SOCIAL_MEDIA_TARGETS> = {};
  SOCIAL_MEDIA_TARGETS.forEach((target) => {
    const platform = target.platform;
    if (!socialByPlatform[platform]) socialByPlatform[platform] = [];
    socialByPlatform[platform].push(target);
  });

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

  const togglePlatform = (platform: string) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  const getRegionLabel = (region: string): string => {
    if (region === 'national') return 'National';
    const canton = CANTONS.find((c) => c.code === region);
    return canton ? `${canton.name} (${canton.code})` : region;
  };

  const langLabels: Record<string, string> = {
    de: 'Deutsch',
    fr: 'Francais',
    it: 'Italiano',
    rm: 'Rumantsch',
    multi: 'Mehrsprachig',
  };

  return (
    <div className="tab-content-enter space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Nachrichtenquellen"
          value={NEWS_SOURCES.length}
          icon={Newspaper}
          iconColor="#644a40"
          iconBg="bg-[#ffdfb5]"
        />
        <SummaryCard
          label="Social Media Targets"
          value={SOCIAL_MEDIA_TARGETS.length}
          icon={Share2}
          iconColor="#644a40"
          iconBg="bg-[#fff5e6]"
        />
        <SummaryCard
          label="Kantone"
          value={CANTONS.length}
          icon={MapPin}
          iconColor="#f59e0b"
          iconBg="bg-amber-50"
        />
        <SummaryCard
          label="Sprachen"
          value={languages.size}
          icon={Languages}
          iconColor="#8b5cf6"
          iconBg="bg-purple-50"
        />
      </div>

      {/* News Sources */}
      <div className="rounded-xl border border-[#d8d8d8] bg-white">
        <div className="border-b border-[#d8d8d8] px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#202020]">
            <Newspaper className="h-5 w-5 text-[#644a40]" />
            Nachrichtenquellen
          </h3>
          <p className="mt-1 text-sm text-[#646464]">
            {NEWS_SOURCES.length} konfigurierte Quellen nach Region
          </p>
        </div>

        <div className="divide-y divide-[#efefef]">
          {Object.entries(newsByRegion).map(([region, sources]) => (
            <div key={region}>
              <button
                onClick={() => toggleRegion(region)}
                className="flex w-full items-center justify-between px-6 py-3 text-left hover:bg-[#f9f9f9]"
              >
                <div className="flex items-center gap-2">
                  {expandedRegions.has(region) ? (
                    <ChevronDown className="h-4 w-4 text-[#999999]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#999999]" />
                  )}
                  <span className="text-sm font-medium text-[#343434]">
                    {getRegionLabel(region)}
                  </span>
                </div>
                <span className="rounded-full bg-[#efefef] px-2.5 py-0.5 text-xs font-medium text-[#646464]">
                  {sources.length}
                </span>
              </button>

              {expandedRegions.has(region) && (
                <div className="bg-[#f9f9f9] px-6 pb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[#999999]">
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Typ</th>
                        <th className="pb-2 font-medium">Sprache</th>
                        <th className="pb-2 text-center font-medium">RSS</th>
                        <th className="pb-2 text-center font-medium">Google</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8d8d8]">
                      {sources.map((source) => (
                        <tr key={source.id} className="group">
                          <td className="py-2.5">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-medium text-[#343434] hover:text-[#644a40]"
                            >
                              {source.name}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                            </a>
                          </td>
                          <td className="py-2.5">
                            <span className="rounded-full bg-[#d8d8d8] px-2 py-0.5 text-xs text-[#646464]">
                              {source.type}
                            </span>
                          </td>
                          <td className="py-2.5 text-[#646464]">
                            {langLabels[source.language] ?? source.language}
                          </td>
                          <td className="py-2.5 text-center">
                            {source.rssFeed ? (
                              <Rss className="mx-auto h-4 w-4 text-[#644a40]" />
                            ) : (
                              <span className="text-[#b5b5b5]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center">
                            {source.googleNewsProxy ? (
                              <Globe className="mx-auto h-4 w-4 text-[#644a40]" />
                            ) : (
                              <span className="text-[#b5b5b5]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Targets */}
      <div className="rounded-xl border border-[#d8d8d8] bg-white">
        <div className="border-b border-[#d8d8d8] px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#202020]">
            <Share2 className="h-5 w-5 text-[#644a40]" />
            Social Media Targets
          </h3>
          <p className="mt-1 text-sm text-[#646464]">
            {SOCIAL_MEDIA_TARGETS.length} konfigurierte Targets nach Plattform
          </p>
        </div>

        <div className="divide-y divide-[#efefef]">
          {Object.entries(socialByPlatform).map(([platform, targets]) => (
            <div key={platform}>
              <button
                onClick={() => togglePlatform(platform)}
                className="flex w-full items-center justify-between px-6 py-3 text-left hover:bg-[#f9f9f9]"
              >
                <div className="flex items-center gap-2">
                  {expandedPlatforms.has(platform) ? (
                    <ChevronDown className="h-4 w-4 text-[#999999]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#999999]" />
                  )}
                  <span className="text-sm font-medium capitalize text-[#343434]">
                    {platform}
                  </span>
                </div>
                <span className="rounded-full bg-[#efefef] px-2.5 py-0.5 text-xs font-medium text-[#646464]">
                  {targets.length}
                </span>
              </button>

              {expandedPlatforms.has(platform) && (
                <div className="bg-[#f9f9f9] px-6 pb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[#999999]">
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Typ</th>
                        <th className="pb-2 font-medium">Region</th>
                        <th className="pb-2 font-medium">Sprache</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8d8d8]">
                      {targets.map((target) => (
                        <tr key={target.id} className="group">
                          <td className="py-2.5">
                            <a
                              href={target.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-medium text-[#343434] hover:text-[#644a40]"
                            >
                              {target.name}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                            </a>
                          </td>
                          <td className="py-2.5">
                            <span className="rounded-full bg-[#d8d8d8] px-2 py-0.5 text-xs text-[#646464]">
                              {target.type}
                            </span>
                          </td>
                          <td className="py-2.5 text-[#646464]">
                            {target.region === 'national'
                              ? 'National'
                              : getRegionLabel(target.region)}
                          </td>
                          <td className="py-2.5 text-[#646464]">
                            {target.language === 'multi'
                              ? 'Mehrsprachig'
                              : langLabels[target.language] ?? target.language}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Link to settings */}
      <div className="flex justify-center">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg border border-[#d8d8d8] bg-white px-6 py-3 text-sm font-medium text-[#646464] transition-colors hover:border-[#644a40] hover:text-[#644a40]"
        >
          <Settings className="h-4 w-4" />
          Quellen konfigurieren
        </Link>
      </div>
    </div>
  );
}

