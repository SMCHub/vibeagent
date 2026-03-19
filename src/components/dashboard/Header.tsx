'use client';

import { Settings, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

type Tab = 'summary' | 'mentions' | 'analysis' | 'sources';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onScrape: () => void;
  isScraping: boolean;
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'summary', label: 'Übersicht' },
  { key: 'mentions', label: 'Erwähnungen' },
  { key: 'analysis', label: 'Analyse' },
  { key: 'sources', label: 'Quellen' },
];

export default function Header({
  activeTab,
  onTabChange,
  onScrape,
  isScraping,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#d8d8d8] bg-white shadow-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#644a40]">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-lg font-semibold text-[#202020]">
            VibeAgent
          </span>
        </Link>

        {/* Tab Navigation */}
        <nav className="flex items-center">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={clsx(
                'tab-nav-item',
                activeTab === key && 'active',
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onScrape}
            disabled={isScraping}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#646464] transition-colors hover:bg-[#efefef] hover:text-[#343434] disabled:opacity-50"
          >
            {isScraping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Aktualisieren</span>
          </button>
          <Link
            href="/settings"
            className="rounded-lg p-2 text-[#646464] transition-colors hover:bg-[#efefef] hover:text-[#343434]"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
