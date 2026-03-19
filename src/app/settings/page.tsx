'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Settings, User, Key, Globe, Share2, Save, ArrowLeft, Check, MapPin, ChevronDown } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface NewsSource {
  id: string
  label: string
  enabled: boolean
  category: 'national' | 'regional' | 'google-geo'
  cantons?: string[] // which cantons this source covers
}

interface SocialPlatform {
  id: string
  label: string
  enabled: boolean
  description: string
  watchedAccounts: string
}

interface ApiKeyEntry {
  id: string
  label: string
  value: string
  placeholder: string
}

interface Canton {
  code: string
  name: string
  region: 'de' | 'fr' | 'it' | 'rm'
  isMultilingual?: boolean
  multilingualNote?: string
}

// ── Data ───────────────────────────────────────────────────────────────────────

const SWISS_CANTONS: Canton[] = [
  { code: 'ZH', name: 'Zürich', region: 'de' },
  { code: 'BE', name: 'Bern', region: 'de', isMultilingual: true, multilingualNote: 'de+fr' },
  { code: 'LU', name: 'Luzern', region: 'de' },
  { code: 'UR', name: 'Uri', region: 'de' },
  { code: 'SZ', name: 'Schwyz', region: 'de' },
  { code: 'OW', name: 'Obwalden', region: 'de' },
  { code: 'NW', name: 'Nidwalden', region: 'de' },
  { code: 'GL', name: 'Glarus', region: 'de' },
  { code: 'ZG', name: 'Zug', region: 'de' },
  { code: 'FR', name: 'Fribourg', region: 'fr', isMultilingual: true, multilingualNote: 'de+fr' },
  { code: 'SO', name: 'Solothurn', region: 'de' },
  { code: 'BS', name: 'Basel-Stadt', region: 'de' },
  { code: 'BL', name: 'Basel-Landschaft', region: 'de' },
  { code: 'SH', name: 'Schaffhausen', region: 'de' },
  { code: 'AR', name: 'Appenzell A.Rh.', region: 'de' },
  { code: 'AI', name: 'Appenzell I.Rh.', region: 'de' },
  { code: 'SG', name: 'St. Gallen', region: 'de' },
  { code: 'GR', name: 'Graubünden', region: 'de', isMultilingual: true, multilingualNote: 'de+rm+it' },
  { code: 'AG', name: 'Aargau', region: 'de' },
  { code: 'TG', name: 'Thurgau', region: 'de' },
  { code: 'TI', name: 'Ticino', region: 'it' },
  { code: 'VD', name: 'Vaud', region: 'fr' },
  { code: 'VS', name: 'Valais', region: 'fr', isMultilingual: true, multilingualNote: 'de+fr' },
  { code: 'NE', name: 'Neuchâtel', region: 'fr' },
  { code: 'GE', name: 'Genève', region: 'fr' },
  { code: 'JU', name: 'Jura', region: 'fr' },
]

const CANTON_DROPDOWN = SWISS_CANTONS.map((c) => `${c.name} (${c.code})`)

const LANGUAGE_REGIONS: { key: string; label: string; regionCodes: string[] }[] = [
  {
    key: 'de',
    label: 'Deutschschweiz',
    regionCodes: ['ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG'],
  },
  {
    key: 'fr',
    label: 'Romandie',
    regionCodes: ['FR', 'VD', 'VS', 'NE', 'GE', 'JU'],
  },
  {
    key: 'it',
    label: 'Tessin',
    regionCodes: ['TI'],
  },
  {
    key: 'rm',
    label: 'Rätoromanisch',
    regionCodes: ['GR'],
  },
]

const REGIONAL_SOURCES: { id: string; label: string; cantons: string[] }[] = [
  { id: 'zueritipp', label: 'Züritipp / Tages-Anzeiger Regional', cantons: ['ZH'] },
  { id: 'zsz', label: 'Zürichsee-Zeitung', cantons: ['ZH'] },
  { id: 'landbote', label: 'Der Landbote', cantons: ['ZH'] },
  { id: 'berner-zeitung', label: 'Berner Zeitung', cantons: ['BE'] },
  { id: 'bund', label: 'Der Bund', cantons: ['BE'] },
  { id: 'luzerner-zeitung', label: 'Luzerner Zeitung', cantons: ['LU'] },
  { id: 'urner-zeitung', label: 'Urner Zeitung', cantons: ['UR'] },
  { id: 'bote-sz', label: 'Bote der Urschweiz', cantons: ['SZ', 'UR', 'OW', 'NW'] },
  { id: 'zuger-zeitung', label: 'Zuger Zeitung', cantons: ['ZG'] },
  { id: 'freiburger-nachrichten', label: 'Freiburger Nachrichten', cantons: ['FR'] },
  { id: 'solothurner-zeitung', label: 'Solothurner Zeitung', cantons: ['SO'] },
  { id: 'bz-basel', label: 'bz Basel', cantons: ['BS', 'BL'] },
  { id: 'basellandschaftliche', label: 'Basellandschaftliche Zeitung', cantons: ['BL'] },
  { id: 'schaffhauser-nachrichten', label: 'Schaffhauser Nachrichten', cantons: ['SH'] },
  { id: 'appenzeller-zeitung', label: 'Appenzeller Zeitung', cantons: ['AR', 'AI'] },
  { id: 'tagblatt-sg', label: 'St. Galler Tagblatt', cantons: ['SG', 'AR', 'AI', 'TG'] },
  { id: 'suedostschweiz', label: 'Südostschweiz', cantons: ['GR', 'GL'] },
  { id: 'aargauer-zeitung', label: 'Aargauer Zeitung', cantons: ['AG'] },
  { id: 'thurgauer-zeitung', label: 'Thurgauer Zeitung', cantons: ['TG'] },
  { id: 'corriere-del-ticino', label: 'Corriere del Ticino', cantons: ['TI'] },
  { id: 'laregione', label: 'laRegione', cantons: ['TI'] },
  { id: '24heures', label: '24 heures', cantons: ['VD'] },
  { id: 'tribune-de-geneve', label: 'Tribune de Genève', cantons: ['GE'] },
  { id: 'le-temps', label: 'Le Temps', cantons: ['VD', 'GE'] },
  { id: 'arcinfo', label: 'ArcInfo', cantons: ['NE', 'JU'] },
  { id: 'le-nouvelliste', label: 'Le Nouvelliste', cantons: ['VS'] },
  { id: 'walliser-bote', label: 'Walliser Bote', cantons: ['VS'] },
  { id: 'la-liberte', label: 'La Liberté', cantons: ['FR'] },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Politician profile
  const [name, setName] = useState('Thomas Müller')
  const [title, setTitle] = useState('Gemeinderat')
  const [constituency, setConstituency] = useState('Zürich (ZH)')
  const [keywords, setKeywords] = useState('Müller, Gemeinderat, Zürich, Verkehrspolitik')
  const [language, setLanguage] = useState('Deutsch')

  // Canton selection
  const [selectedCantons, setSelectedCantons] = useState<Set<string>>(new Set(['ZH']))

  // National news sources
  const [nationalSources, setNationalSources] = useState<{ id: string; label: string; enabled: boolean }[]>([
    { id: '20min', label: '20 Minuten', enabled: true },
    { id: 'blick', label: 'Blick', enabled: true },
    { id: 'watson', label: 'Watson', enabled: true },
    { id: 'nzz', label: 'NZZ', enabled: true },
    { id: 'tages-anzeiger', label: 'Tages-Anzeiger', enabled: true },
    { id: 'srf-news', label: 'SRF News', enabled: true },
    { id: 'nau', label: 'Nau.ch', enabled: false },
    { id: 'swissinfo', label: 'Swissinfo', enabled: false },
  ])

  // Regional news sources — derive enabled from selected cantons
  const [regionalOverrides, setRegionalOverrides] = useState<Record<string, boolean>>({})

  // Google News geo feeds — auto-enabled per canton
  const [googleGeoEnabled, setGoogleGeoEnabled] = useState(true)

  // Social media platforms
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'facebook',
      label: 'Facebook',
      enabled: true,
      description: 'Grösste Social-Media-Plattform in der Schweiz, stark bei 30+ Zielgruppe',
      watchedAccounts: '@GemeindeZuerich, @KantonZuerich, #Gemeinderat',
    },
    {
      id: 'twitter',
      label: 'Twitter / X',
      enabled: true,
      description: 'Wichtig für politische Kommunikation und Journalisten in der Schweiz',
      watchedAccounts: '@stadtZuerich, @SRF, #CHPolitik, #Gemeinderat',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      enabled: false,
      description: 'Wachsend für politische Kommunikation, besonders bei jüngerer Zielgruppe',
      watchedAccounts: '',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      enabled: true,
      description: 'Sehr beliebt in der Schweiz für politische und wirtschaftliche Diskussionen',
      watchedAccounts: '#Schweiz, #Gemeindepolitik, #Zürich',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      enabled: false,
      description: 'Für Parlamentsdebatten, Interviews und politische Inhalte',
      watchedAccounts: '',
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      enabled: false,
      description: 'Zunehmend relevant für politische Kommunikation bei jüngeren Schweizern',
      watchedAccounts: '',
    },
    {
      id: 'threads',
      label: 'Threads',
      enabled: false,
      description: 'Wachsende Plattform in der Schweiz, Meta-Alternative zu Twitter/X',
      watchedAccounts: '',
    },
    {
      id: 'reddit',
      label: 'Reddit',
      enabled: false,
      description: 'r/Switzerland und r/zurich für Community-Diskussionen',
      watchedAccounts: 'r/Switzerland, r/zurich',
    },
  ])

  // API keys
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([
    { id: 'OPENAI_API_KEY', label: 'OpenAI API Key', value: '', placeholder: 'sk-...' },
    { id: 'META_ACCESS_TOKEN', label: 'Meta Access Token', value: '', placeholder: 'EAA...' },
    {
      id: 'TWITTER_BEARER_TOKEN',
      label: 'Twitter Bearer Token',
      value: '',
      placeholder: 'AAAA...',
    },
    { id: 'YOUTUBE_API_KEY', label: 'YouTube API Key', value: '', placeholder: 'AIza...' },
    { id: 'REDDIT_CLIENT_ID', label: 'Reddit Client ID', value: '', placeholder: 'Client ID' },
    {
      id: 'REDDIT_CLIENT_SECRET',
      label: 'Reddit Client Secret',
      value: '',
      placeholder: 'Client Secret',
    },
    { id: 'TIKTOK_API_KEY', label: 'TikTok API Key', value: '', placeholder: 'API Key' },
  ])

  // Toast state
  const [showToast, setShowToast] = useState(false)

  // ── Derived state ──────────────────────────────────────────────────────────

  const visibleRegionalSources = useMemo(() => {
    if (selectedCantons.size === 0) return []
    return REGIONAL_SOURCES.filter((s) => s.cantons.some((c) => selectedCantons.has(c)))
  }, [selectedCantons])

  const totalSourceCount = useMemo(() => {
    return nationalSources.length + visibleRegionalSources.length + (googleGeoEnabled ? selectedCantons.size : 0)
  }, [nationalSources, visibleRegionalSources, googleGeoEnabled, selectedCantons])

  const activeSourceCount = useMemo(() => {
    const activeNational = nationalSources.filter((s) => s.enabled).length
    const activeRegional = visibleRegionalSources.filter((s) => {
      if (s.id in regionalOverrides) return regionalOverrides[s.id]
      return true // enabled by default when canton is selected
    }).length
    const activeGeo = googleGeoEnabled ? selectedCantons.size : 0
    return activeNational + activeRegional + activeGeo
  }, [nationalSources, visibleRegionalSources, regionalOverrides, googleGeoEnabled, selectedCantons])

  // Sources available per canton
  const sourcesPerCanton = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const canton of SWISS_CANTONS) {
      const regional = REGIONAL_SOURCES.filter((s) => s.cantons.includes(canton.code)).length
      counts[canton.code] = nationalSources.length + regional + (googleGeoEnabled ? 1 : 0)
    }
    return counts
  }, [nationalSources, googleGeoEnabled])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleCanton = (code: string) => {
    setSelectedCantons((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  const selectRegion = (regionCodes: string[]) => {
    setSelectedCantons((prev) => {
      const next = new Set(prev)
      const allSelected = regionCodes.every((c) => next.has(c))
      if (allSelected) {
        regionCodes.forEach((c) => next.delete(c))
      } else {
        regionCodes.forEach((c) => next.add(c))
      }
      return next
    })
  }

  const toggleNationalSource = (id: string) => {
    setNationalSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    )
  }

  const toggleRegionalSource = (id: string) => {
    setRegionalOverrides((prev) => {
      const current = prev[id] ?? true
      return { ...prev, [id]: !current }
    })
  }

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    )
  }

  const updateWatchedAccounts = (id: string, value: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, watchedAccounts: value } : p)),
    )
  }

  const updateApiKey = (id: string, value: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, value } : k)))
  }

  const handleSave = () => {
    // Phase 3: Persist settings to backend / .env
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const inputClasses =
    'w-full bg-white border border-[#dadce0] text-[#202124] rounded-lg p-2.5 text-sm placeholder-[#80868b] focus:border-[#644a40] focus:ring-1 focus:ring-[#644a40] outline-none transition-colors'

  const selectClasses =
    'w-full bg-white border border-[#dadce0] text-[#202124] rounded-lg p-2.5 text-sm focus:border-[#644a40] focus:ring-1 focus:ring-[#644a40] outline-none transition-colors appearance-none cursor-pointer'

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#137333] px-4 py-3 text-sm font-medium text-white shadow-lg animate-in">
          <Check className="h-4 w-4" />
          Einstellungen erfolgreich gespeichert
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#e8eaed] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-[#5f6368] transition-colors hover:text-[#202124]"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="h-4 w-px bg-[#dadce0]" />
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#5f6368]" />
              <h1 className="text-lg font-semibold text-[#202124]">Einstellungen</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="space-y-8">

          {/* ── Section 1: Politiker-Profil ────────────────────────────────── */}
          <section className="rounded-xl border border-[#dadce0] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff5e6]">
                <User className="h-5 w-5 text-[#644a40]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#202124]">Politiker-Profil</h2>
                <p className="text-sm text-[#5f6368]">
                  Grundlegende Informationen zum überwachten Politiker
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#202124]">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                  placeholder="Vor- und Nachname"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#202124]">Titel</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                  placeholder="z.B. Gemeinderat, Nationalrat"
                />
              </div>
              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-[#202124]">Wahlkreis / Kanton</label>
                <div className="relative">
                  <select
                    value={constituency}
                    onChange={(e) => setConstituency(e.target.value)}
                    className={selectClasses}
                  >
                    {CANTON_DROPDOWN.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80868b]" />
                </div>
              </div>
              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-[#202124]">Sprache</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="Deutsch">Deutsch</option>
                    <option value="Français">Français</option>
                    <option value="Italiano">Italiano</option>
                    <option value="Rumantsch">Rumantsch</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80868b]" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[#202124]">
                  Keywords{' '}
                  <span className="font-normal text-[#80868b]">(kommagetrennt)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className={inputClasses}
                  placeholder="Müller, Gemeinderat, Zürich, Verkehrspolitik"
                />
                <p className="mt-1.5 text-xs text-[#80868b]">
                  Diese Keywords werden zum Monitoring in Nachrichtenquellen und sozialen Medien
                  verwendet.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 2: Kantone & Regionen ─────────────────────────────── */}
          <section className="rounded-xl border border-[#dadce0] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <MapPin className="h-5 w-5 text-[#c5221f]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#202124]">Kantone &amp; Regionen</h2>
                <p className="text-sm text-[#5f6368]">
                  Wählen Sie die Kantone aus, die überwacht werden sollen
                </p>
              </div>
              <div className="ml-auto">
                <span className="rounded-full bg-[#ffdfb5] px-3 py-1 text-xs font-medium text-[#644a40]">
                  {selectedCantons.size} von 26 Kantone
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {LANGUAGE_REGIONS.map((region) => {
                const regionCantons = SWISS_CANTONS.filter((c) =>
                  region.regionCodes.includes(c.code),
                )
                const allSelected = region.regionCodes.every((c) => selectedCantons.has(c))

                return (
                  <div key={region.key}>
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-[#202124]">{region.label}</h3>
                      <button
                        type="button"
                        onClick={() => selectRegion(region.regionCodes)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          allSelected
                            ? 'bg-[#644a40] text-white'
                            : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
                        }`}
                      >
                        {allSelected ? `Alle ${region.label} abwählen` : `Alle ${region.label}`}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {regionCantons.map((canton) => {
                        const isSelected = selectedCantons.has(canton.code)
                        return (
                          <button
                            key={canton.code}
                            type="button"
                            onClick={() => toggleCanton(canton.code)}
                            className={`group relative flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-all ${
                              isSelected
                                ? 'border-[#644a40] bg-[#ffdfb5] text-[#644a40]'
                                : 'border-[#dadce0] bg-[#f8f9fa] text-[#5f6368] hover:border-[#bdc1c6] hover:bg-white'
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                                isSelected
                                  ? 'bg-[#644a40] text-white'
                                  : 'bg-white text-[#5f6368] border border-[#dadce0]'
                              }`}
                            >
                              {canton.code}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium leading-tight">
                                {canton.name}
                              </div>
                              <div className="text-[10px] leading-tight text-[#80868b]">
                                {sourcesPerCanton[canton.code]} Quellen
                              </div>
                            </div>
                            {canton.isMultilingual && (
                              <span className="absolute -top-1 -right-1 rounded-full bg-[#fce8e6] px-1.5 py-0.5 text-[9px] font-medium text-[#c5221f]">
                                {canton.multilingualNote}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Section 3: Nachrichtenquellen ─────────────────────────────── */}
          <section className="rounded-xl border border-[#dadce0] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <Globe className="h-5 w-5 text-[#137333]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#202124]">Nachrichtenquellen</h2>
                <p className="text-sm text-[#5f6368]">
                  Nationale, regionale und Geo-Feed Quellen konfigurieren
                </p>
              </div>
              <div className="ml-auto">
                <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-medium text-[#137333]">
                  {activeSourceCount} von {totalSourceCount} Quellen aktiv
                </span>
              </div>
            </div>

            {/* National */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-[#202124]">Nationale Medien</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {nationalSources.map((source) => (
                  <label
                    key={source.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      source.enabled
                        ? 'border-[#137333] bg-[#e6f4ea]'
                        : 'border-[#dadce0] bg-[#f8f9fa] hover:border-[#bdc1c6]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={() => toggleNationalSource(source.id)}
                      className="h-4 w-4 rounded border-[#dadce0] bg-white text-[#137333] focus:ring-[#137333] focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-[#202124]">{source.label}</span>
                    {source.enabled && (
                      <span className="ml-auto">
                        <Check className="h-3.5 w-3.5 text-[#137333]" />
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Regional */}
            <div className="mb-6">
              <h3 className="mb-1 text-sm font-semibold text-[#202124]">Regionale Medien</h3>
              <p className="mb-3 text-xs text-[#80868b]">
                Basierend auf den ausgewählten Kantonen ({selectedCantons.size} Kantone)
              </p>
              {visibleRegionalSources.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#dadce0] bg-[#f8f9fa] p-4 text-center text-sm text-[#80868b]">
                  Wählen Sie oben mindestens einen Kanton aus, um regionale Quellen anzuzeigen.
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {visibleRegionalSources.map((source) => {
                    const isEnabled = regionalOverrides[source.id] ?? true
                    return (
                      <label
                        key={source.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                          isEnabled
                            ? 'border-[#137333] bg-[#e6f4ea]'
                            : 'border-[#dadce0] bg-[#f8f9fa] hover:border-[#bdc1c6]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => toggleRegionalSource(source.id)}
                          className="h-4 w-4 rounded border-[#dadce0] bg-white text-[#137333] focus:ring-[#137333] focus:ring-offset-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-[#202124]">{source.label}</span>
                          <div className="text-[10px] text-[#80868b]">
                            {source.cantons.join(', ')}
                          </div>
                        </div>
                        {isEnabled && (
                          <span className="ml-auto shrink-0">
                            <Check className="h-3.5 w-3.5 text-[#137333]" />
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Google News Geo-Feeds */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-sm font-semibold text-[#202124]">Google News Geo-Feeds</h3>
                <button
                  type="button"
                  role="switch"
                  aria-checked={googleGeoEnabled}
                  onClick={() => setGoogleGeoEnabled(!googleGeoEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    googleGeoEnabled ? 'bg-[#137333]' : 'bg-[#dadce0]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      googleGeoEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-[#80868b]">
                {googleGeoEnabled
                  ? `Automatisch aktiviert für ${selectedCantons.size} ausgewählte Kantone. Google News liefert standortbasierte Nachrichtenfeeds pro Kanton.`
                  : 'Google News Geo-Feeds sind deaktiviert.'}
              </p>
              {googleGeoEnabled && selectedCantons.size > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.from(selectedCantons)
                    .sort()
                    .map((code) => (
                      <span
                        key={code}
                        className="rounded-full bg-[#e6f4ea] px-2.5 py-0.5 text-xs font-medium text-[#137333]"
                      >
                        {code}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Section 4: Social Media Plattformen ───────────────────────── */}
          <section className="rounded-xl border border-[#dadce0] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#202124]">Social Media Plattformen</h2>
                <p className="text-sm text-[#5f6368]">
                  Plattformen für das Social-Media-Monitoring aktivieren
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`rounded-lg border transition-colors ${
                    platform.enabled
                      ? 'border-[#dadce0] bg-white'
                      : 'border-[#dadce0] bg-[#f8f9fa]'
                  }`}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="mr-4">
                      <p className="text-sm font-medium text-[#202124]">{platform.label}</p>
                      <p className="mt-0.5 text-xs text-[#80868b]">{platform.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={platform.enabled}
                      onClick={() => togglePlatform(platform.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        platform.enabled ? 'bg-[#644a40]' : 'bg-[#dadce0]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          platform.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {platform.enabled && (
                    <div className="border-t border-[#e8eaed] px-4 py-3">
                      <label className="mb-1.5 block text-xs font-medium text-[#5f6368]">
                        Überwachte Accounts / Hashtags
                      </label>
                      <textarea
                        value={platform.watchedAccounts}
                        onChange={(e) => updateWatchedAccounts(platform.id, e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-[#dadce0] bg-[#f8f9fa] p-2 text-xs text-[#202124] placeholder-[#80868b] focus:border-[#644a40] focus:ring-1 focus:ring-[#644a40] outline-none transition-colors"
                        placeholder="@accounts, #hashtags (kommagetrennt)"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 5: API-Schlüssel ──────────────────────────────────── */}
          <section className="rounded-xl border border-[#dadce0] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Key className="h-5 w-5 text-[#ea8600]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#202124]">API-Schlüssel</h2>
                <p className="text-sm text-[#5f6368]">
                  Zugangsdaten für externe Dienste und APIs
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id}>
                  <label className="mb-1.5 block text-sm font-medium text-[#202124]">
                    {apiKey.label}
                    <span className="ml-2 font-mono text-xs text-[#80868b]">{apiKey.id}</span>
                  </label>
                  <input
                    type="password"
                    value={apiKey.value}
                    onChange={(e) => updateApiKey(apiKey.id, e.target.value)}
                    className={inputClasses}
                    placeholder={apiKey.placeholder}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-[#80868b]">
              API-Schlüssel werden verschlüsselt gespeichert und niemals im Klartext angezeigt.
              Die Persistierung wird in Phase 3 implementiert.
            </p>
          </section>

          {/* Save button */}
          <div className="flex justify-end pb-8">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-full bg-[#644a40] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1765cc] focus:outline-none focus:ring-2 focus:ring-[#644a40] focus:ring-offset-2 focus:ring-offset-[#f8f9fa]"
            >
              <Save className="h-4 w-4" />
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
