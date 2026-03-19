// =============================================================================
// Swiss Media Sources & Social Media Monitoring Configuration
// =============================================================================
// Comprehensive database of Swiss news outlets and social media targets for
// political monitoring, organized by canton and language region.
// =============================================================================

import type { Platform } from '@/lib/types';

// =============================================================================
// Type Definitions
// =============================================================================

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssFeed: string | null;
  googleNewsProxy: boolean;
  language: 'de' | 'fr' | 'it' | 'rm';
  region: string;
  type:
    | 'tageszeitung'
    | 'wochenzeitung'
    | 'online'
    | 'sonntagszeitung'
    | 'gratiszeitung'
    | 'nachrichtenagentur'
    | 'tv-radio';
}

export interface SocialMediaTarget {
  id: string;
  platform: Platform;
  name: string;
  identifier: string;
  url: string;
  language: 'de' | 'fr' | 'it' | 'rm' | 'multi';
  region: string;
  type: 'official' | 'group' | 'hashtag' | 'subreddit' | 'channel';
}

export interface Canton {
  code: string;
  name: string;
  language: 'de' | 'fr' | 'it' | 'rm' | 'multi';
}

// =============================================================================
// All 26 Swiss Cantons
// =============================================================================

export const CANTONS: Canton[] = [
  // German-speaking cantons
  { code: 'ZH', name: 'Zürich', language: 'de' },
  { code: 'BE', name: 'Bern', language: 'multi' },
  { code: 'LU', name: 'Luzern', language: 'de' },
  { code: 'UR', name: 'Uri', language: 'de' },
  { code: 'SZ', name: 'Schwyz', language: 'de' },
  { code: 'OW', name: 'Obwalden', language: 'de' },
  { code: 'NW', name: 'Nidwalden', language: 'de' },
  { code: 'GL', name: 'Glarus', language: 'de' },
  { code: 'ZG', name: 'Zug', language: 'de' },
  { code: 'SO', name: 'Solothurn', language: 'de' },
  { code: 'BS', name: 'Basel-Stadt', language: 'de' },
  { code: 'BL', name: 'Basel-Landschaft', language: 'de' },
  { code: 'SH', name: 'Schaffhausen', language: 'de' },
  { code: 'AR', name: 'Appenzell Ausserrhoden', language: 'de' },
  { code: 'AI', name: 'Appenzell Innerrhoden', language: 'de' },
  { code: 'SG', name: 'St. Gallen', language: 'de' },
  { code: 'AG', name: 'Aargau', language: 'de' },
  { code: 'TG', name: 'Thurgau', language: 'de' },
  // French-speaking cantons
  { code: 'GE', name: 'Geneve', language: 'fr' },
  { code: 'VD', name: 'Vaud', language: 'fr' },
  { code: 'NE', name: 'Neuchatel', language: 'fr' },
  { code: 'JU', name: 'Jura', language: 'fr' },
  // Bilingual cantons (DE/FR)
  { code: 'FR', name: 'Fribourg', language: 'multi' },
  { code: 'VS', name: 'Valais', language: 'multi' },
  // Italian-speaking canton
  { code: 'TI', name: 'Ticino', language: 'it' },
  // Romansh/German canton
  { code: 'GR', name: 'Graubunden', language: 'multi' },
];

// =============================================================================
// News Sources
// =============================================================================
// Organized by region: national sources first, then per-canton sources.
// =============================================================================

export const NEWS_SOURCES: NewsSource[] = [
  // ---------------------------------------------------------------------------
  // NATIONAL -- Deutsch
  // ---------------------------------------------------------------------------
  {
    id: 'ch-20min-de',
    name: '20 Minuten',
    url: 'https://www.20min.ch',
    rssFeed: 'https://partner-feeds.20min.ch/rss/20minuten',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'gratiszeitung',
  },
  {
    id: 'ch-blick',
    name: 'Blick',
    url: 'https://www.blick.ch',
    rssFeed: 'https://www.blick.ch/rss.xml',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'tageszeitung',
  },
  {
    id: 'ch-watson',
    name: 'Watson',
    url: 'https://www.watson.ch',
    rssFeed: 'https://www.watson.ch/rss.xml',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'online',
  },
  {
    id: 'ch-nzz',
    name: 'Neue Zürcher Zeitung',
    url: 'https://www.nzz.ch',
    rssFeed: 'https://www.nzz.ch/recent.rss',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'tageszeitung',
  },
  {
    id: 'ch-tagesanzeiger',
    name: 'Tages-Anzeiger',
    url: 'https://www.tagesanzeiger.ch',
    rssFeed:
      'http://partner-feeds.publishing.tamedia.ch/rss/tagesanzeiger/schweiz',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'tageszeitung',
  },
  {
    id: 'ch-srf-news',
    name: 'SRF News',
    url: 'https://www.srf.ch/news',
    rssFeed: 'https://www.srf.ch/news/bnf/rss/1890',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'tv-radio',
  },
  {
    id: 'ch-nau',
    name: 'Nau.ch',
    url: 'https://www.nau.ch',
    rssFeed: 'https://www.nau.ch/feed',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'online',
  },
  {
    id: 'ch-swissinfo-de',
    name: 'Swissinfo (DE)',
    url: 'https://www.swissinfo.ch/ger',
    rssFeed: 'https://www.swissinfo.ch/ger/rss/alle-news',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'online',
  },

  // ---------------------------------------------------------------------------
  // NATIONAL -- Francais
  // ---------------------------------------------------------------------------
  {
    id: 'ch-letemps',
    name: 'Le Temps',
    url: 'https://www.letemps.ch',
    rssFeed: 'https://www.letemps.ch/rss',
    googleNewsProxy: false,
    language: 'fr',
    region: 'national',
    type: 'tageszeitung',
  },
  {
    id: 'ch-24heures-national',
    name: '24 heures',
    url: 'https://www.24heures.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'national',
    type: 'tageszeitung',
  },
  {
    id: 'ch-lematin',
    name: 'Le Matin',
    url: 'https://www.lematin.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'national',
    type: 'online',
  },
  {
    id: 'ch-rts-info',
    name: 'RTS Info',
    url: 'https://www.rts.ch/info',
    rssFeed: 'https://www.rts.ch/info/rss/info.xml',
    googleNewsProxy: false,
    language: 'fr',
    region: 'national',
    type: 'tv-radio',
  },
  {
    id: 'ch-20min-fr',
    name: '20 Minutes (FR)',
    url: 'https://www.20min.ch/fr',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'national',
    type: 'gratiszeitung',
  },

  // ---------------------------------------------------------------------------
  // NATIONAL -- Italiano
  // ---------------------------------------------------------------------------
  {
    id: 'ch-cdt-national',
    name: 'Corriere del Ticino',
    url: 'https://www.cdt.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'it',
    region: 'national',
    type: 'tageszeitung',
  },
  {
    id: 'ch-rsi-news',
    name: 'RSI News',
    url: 'https://www.rsi.ch/news',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'it',
    region: 'national',
    type: 'tv-radio',
  },
  {
    id: 'ch-laregione-national',
    name: 'laRegione',
    url: 'https://www.laregione.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'it',
    region: 'national',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // NACHRICHTENAGENTUREN (News Agencies)
  // ---------------------------------------------------------------------------
  {
    id: 'ch-keystone-sda',
    name: 'Keystone-SDA',
    url: 'https://www.keystone-sda.ch',
    rssFeed: null,
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'nachrichtenagentur',
  },
  {
    id: 'ch-awp',
    name: 'AWP Finanznachrichten',
    url: 'https://www.awp.ch',
    rssFeed: null,
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'nachrichtenagentur',
  },

  // ---------------------------------------------------------------------------
  // TV / RADIO (National Broadcasters)
  // ---------------------------------------------------------------------------
  {
    id: 'ch-srf',
    name: 'SRF (Schweizer Radio und Fernsehen)',
    url: 'https://www.srf.ch',
    rssFeed: 'https://www.srf.ch/news/bnf/rss/1890',
    googleNewsProxy: false,
    language: 'de',
    region: 'national',
    type: 'tv-radio',
  },
  {
    id: 'ch-rts',
    name: 'RTS (Radio Television Suisse)',
    url: 'https://www.rts.ch',
    rssFeed: 'https://www.rts.ch/info/rss/info.xml',
    googleNewsProxy: false,
    language: 'fr',
    region: 'national',
    type: 'tv-radio',
  },
  {
    id: 'ch-rsi',
    name: 'RSI (Radiotelevisione Svizzera)',
    url: 'https://www.rsi.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'it',
    region: 'national',
    type: 'tv-radio',
  },

  // ---------------------------------------------------------------------------
  // ZURICH (ZH)
  // ---------------------------------------------------------------------------
  {
    id: 'zh-tagesanzeiger',
    name: 'Tages-Anzeiger Zürich',
    url: 'https://www.tagesanzeiger.ch/zuerich',
    rssFeed:
      'http://partner-feeds.publishing.tamedia.ch/rss/tagesanzeiger/zuerich',
    googleNewsProxy: false,
    language: 'de',
    region: 'ZH',
    type: 'tageszeitung',
  },
  {
    id: 'zh-zueriost',
    name: 'ZüriOst',
    url: 'https://www.zueriost.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'ZH',
    type: 'tageszeitung',
  },
  {
    id: 'zh-zuercher-unterlaender',
    name: 'Zürcher Unterländer',
    url: 'https://www.zuonline.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'ZH',
    type: 'tageszeitung',
  },
  {
    id: 'zh-zsz',
    name: 'Zürichsee-Zeitung',
    url: 'https://www.zsz.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'ZH',
    type: 'tageszeitung',
  },
  {
    id: 'zh-landbote',
    name: 'Der Landbote',
    url: 'https://www.landbote.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'ZH',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // BERN (BE)
  // ---------------------------------------------------------------------------
  {
    id: 'be-bernerzeitung',
    name: 'Berner Zeitung',
    url: 'https://www.bernerzeitung.ch',
    rssFeed: 'https://www.bernerzeitung.ch/feed',
    googleNewsProxy: false,
    language: 'de',
    region: 'BE',
    type: 'tageszeitung',
  },
  {
    id: 'be-derbund',
    name: 'Der Bund',
    url: 'https://www.derbund.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'BE',
    type: 'tageszeitung',
  },
  {
    id: 'be-berneroberlaender',
    name: 'Berner Oberländer',
    url: 'https://www.berneroberlaender.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'BE',
    type: 'tageszeitung',
  },
  {
    id: 'be-thunertagblatt',
    name: 'Thuner Tagblatt',
    url: 'https://www.thunertagblatt.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'BE',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // LUZERN (LU)
  // ---------------------------------------------------------------------------
  {
    id: 'lu-luzernerzeitung',
    name: 'Luzerner Zeitung',
    url: 'https://www.luzernerzeitung.ch',
    rssFeed: 'https://www.luzernerzeitung.ch/zentralschweiz/luzern.rss',
    googleNewsProxy: false,
    language: 'de',
    region: 'LU',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // AARGAU (AG)
  // ---------------------------------------------------------------------------
  {
    id: 'ag-aargauerzeitung',
    name: 'Aargauer Zeitung',
    url: 'https://www.aargauerzeitung.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'AG',
    type: 'tageszeitung',
  },
  {
    id: 'ag-badenertagblatt',
    name: 'Badener Tagblatt',
    url: 'https://www.badenertagblatt.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'AG',
    type: 'tageszeitung',
  },
  {
    id: 'ag-zofingertagblatt',
    name: 'Zofinger Tagblatt',
    url: 'https://www.zofingertagblatt.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'AG',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // ST. GALLEN (SG)
  // ---------------------------------------------------------------------------
  {
    id: 'sg-tagblatt',
    name: 'St. Galler Tagblatt',
    url: 'https://www.tagblatt.ch',
    rssFeed: 'https://www.tagblatt.ch/rss',
    googleNewsProxy: false,
    language: 'de',
    region: 'SG',
    type: 'tageszeitung',
  },
  {
    id: 'sg-rheintaler',
    name: 'Rheintaler',
    url: 'https://www.rheintaler.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'SG',
    type: 'tageszeitung',
  },
  {
    id: 'sg-toggenburger-tagblatt',
    name: 'Toggenburger Tagblatt',
    url: 'https://www.tagblatt.ch/ostschweiz/toggenburg',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'SG',
    type: 'tageszeitung',
  },
  {
    id: 'sg-wiler-zeitung',
    name: 'Wiler Zeitung',
    url: 'https://www.tagblatt.ch/ostschweiz/wil',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'SG',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // BASEL-STADT (BS) & BASEL-LANDSCHAFT (BL)
  // ---------------------------------------------------------------------------
  {
    id: 'bs-baslerzeitung',
    name: 'Basler Zeitung',
    url: 'https://www.bazonline.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'BS',
    type: 'tageszeitung',
  },
  {
    id: 'bs-bzbasel',
    name: 'bz Basel',
    url: 'https://www.bzbasel.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'BS',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // GRAUBUNDEN (GR)
  // ---------------------------------------------------------------------------
  {
    id: 'gr-suedostschweiz',
    name: 'Südostschweiz',
    url: 'https://www.suedostschweiz.ch',
    rssFeed: 'https://www.suedostschweiz.ch/rss.xml',
    googleNewsProxy: false,
    language: 'de',
    region: 'GR',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // SOLOTHURN (SO)
  // ---------------------------------------------------------------------------
  {
    id: 'so-solothurnerzeitung',
    name: 'Solothurner Zeitung',
    url: 'https://www.solothurnerzeitung.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'SO',
    type: 'tageszeitung',
  },
  {
    id: 'so-oltnertagblatt',
    name: 'Oltner Tagblatt',
    url: 'https://www.oltnertagblatt.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'SO',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // THURGAU (TG)
  // ---------------------------------------------------------------------------
  {
    id: 'tg-thurgauerzeitung',
    name: 'Thurgauer Zeitung',
    url: 'https://www.tagblatt.ch/ostschweiz/frauenfeld',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'TG',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // WALLIS / VALAIS (VS)
  // ---------------------------------------------------------------------------
  {
    id: 'vs-walliserbote',
    name: 'Walliser Bote / RRO',
    url: 'https://www.rro.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'VS',
    type: 'tageszeitung',
  },
  {
    id: 'vs-lenouvelliste',
    name: 'Le Nouvelliste',
    url: 'https://www.lenouvelliste.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'VS',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // FRIBOURG (FR)
  // ---------------------------------------------------------------------------
  {
    id: 'fr-freiburgernachrichten',
    name: 'Freiburger Nachrichten',
    url: 'https://www.freiburger-nachrichten.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'FR',
    type: 'tageszeitung',
  },
  {
    id: 'fr-laliberte',
    name: 'La Liberte',
    url: 'https://www.laliberte.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'FR',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // GENEVE (GE)
  // ---------------------------------------------------------------------------
  {
    id: 'ge-tdg',
    name: 'Tribune de Geneve',
    url: 'https://www.tdg.ch',
    rssFeed: 'http://partner-feeds.publishing.tamedia.ch/rss/tdg',
    googleNewsProxy: false,
    language: 'fr',
    region: 'GE',
    type: 'tageszeitung',
  },
  {
    id: 'ge-ghi',
    name: 'GHI',
    url: 'https://www.ghi.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'GE',
    type: 'gratiszeitung',
  },

  // ---------------------------------------------------------------------------
  // VAUD (VD)
  // ---------------------------------------------------------------------------
  {
    id: 'vd-24heures',
    name: '24 heures',
    url: 'https://www.24heures.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'VD',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // TICINO (TI)
  // ---------------------------------------------------------------------------
  {
    id: 'ti-cdt',
    name: 'Corriere del Ticino',
    url: 'https://www.cdt.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'it',
    region: 'TI',
    type: 'tageszeitung',
  },
  {
    id: 'ti-laregione',
    name: 'laRegione',
    url: 'https://www.laregione.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'it',
    region: 'TI',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // APPENZELL (AR / AI)
  // ---------------------------------------------------------------------------
  {
    id: 'ar-appenzellerzeitung',
    name: 'Appenzeller Zeitung',
    url: 'https://www.tagblatt.ch/ostschweiz/appenzellerland',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'AR',
    type: 'tageszeitung',
  },
  {
    id: 'ai-appenzell24',
    name: 'Appenzell24',
    url: 'https://www.appenzell24.ch',
    rssFeed: 'https://www.appenzell24.ch/feed',
    googleNewsProxy: false,
    language: 'de',
    region: 'AI',
    type: 'online',
  },

  // ---------------------------------------------------------------------------
  // ZUG (ZG)
  // ---------------------------------------------------------------------------
  {
    id: 'zg-luzernerzeitung-zug',
    name: 'Luzerner Zeitung (Zug)',
    url: 'https://www.luzernerzeitung.ch/zentralschweiz/zug',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'ZG',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // SCHWYZ (SZ)
  // ---------------------------------------------------------------------------
  {
    id: 'sz-bote-urschweiz',
    name: 'Bote der Urschweiz',
    url: 'https://www.bote.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'SZ',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // NIDWALDEN (NW)
  // ---------------------------------------------------------------------------
  {
    id: 'nw-luzernerzeitung-nidwalden',
    name: 'Luzerner Zeitung (Nidwalden)',
    url: 'https://www.luzernerzeitung.ch/zentralschweiz/nidwalden',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'NW',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // OBWALDEN (OW)
  // ---------------------------------------------------------------------------
  {
    id: 'ow-luzernerzeitung-obwalden',
    name: 'Luzerner Zeitung (Obwalden)',
    url: 'https://www.luzernerzeitung.ch/zentralschweiz/obwalden',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'OW',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // URI (UR)
  // ---------------------------------------------------------------------------
  {
    id: 'ur-luzernerzeitung-uri',
    name: 'Luzerner Zeitung (Uri)',
    url: 'https://www.luzernerzeitung.ch/zentralschweiz/uri',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'UR',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // SCHAFFHAUSEN (SH)
  // ---------------------------------------------------------------------------
  {
    id: 'sh-shn',
    name: 'Schaffhauser Nachrichten',
    url: 'https://www.shn.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'SH',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // GLARUS (GL)
  // ---------------------------------------------------------------------------
  {
    id: 'gl-suedostschweiz-glarus',
    name: 'Südostschweiz (Glarus)',
    url: 'https://www.suedostschweiz.ch/glarus',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'de',
    region: 'GL',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // JURA (JU)
  // ---------------------------------------------------------------------------
  {
    id: 'ju-lqj',
    name: 'Le Quotidien Jurassien',
    url: 'https://www.lqj.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'JU',
    type: 'tageszeitung',
  },

  // ---------------------------------------------------------------------------
  // NEUCHATEL (NE)
  // ---------------------------------------------------------------------------
  {
    id: 'ne-arcinfo',
    name: 'ArcInfo',
    url: 'https://www.arcinfo.ch',
    rssFeed: null,
    googleNewsProxy: true,
    language: 'fr',
    region: 'NE',
    type: 'tageszeitung',
  },
];

// =============================================================================
// Social Media Monitoring Targets
// =============================================================================

export const SOCIAL_MEDIA_TARGETS: SocialMediaTarget[] = [
  // ---------------------------------------------------------------------------
  // REDDIT -- Subreddits
  // ---------------------------------------------------------------------------
  {
    id: 'reddit-switzerland',
    platform: 'reddit',
    name: 'r/Switzerland',
    identifier: 'Switzerland',
    url: 'https://www.reddit.com/r/Switzerland',
    language: 'multi',
    region: 'national',
    type: 'subreddit',
  },
  {
    id: 'reddit-swisspolitics',
    platform: 'reddit',
    name: 'r/SwissPolitics',
    identifier: 'SwissPolitics',
    url: 'https://www.reddit.com/r/SwissPolitics',
    language: 'multi',
    region: 'national',
    type: 'subreddit',
  },
  {
    id: 'reddit-askswitzerland',
    platform: 'reddit',
    name: 'r/askswitzerland',
    identifier: 'askswitzerland',
    url: 'https://www.reddit.com/r/askswitzerland',
    language: 'multi',
    region: 'national',
    type: 'subreddit',
  },
  {
    id: 'reddit-zurich',
    platform: 'reddit',
    name: 'r/zurich',
    identifier: 'zurich',
    url: 'https://www.reddit.com/r/zurich',
    language: 'de',
    region: 'ZH',
    type: 'subreddit',
  },
  {
    id: 'reddit-bern',
    platform: 'reddit',
    name: 'r/bern',
    identifier: 'bern',
    url: 'https://www.reddit.com/r/bern',
    language: 'de',
    region: 'BE',
    type: 'subreddit',
  },
  {
    id: 'reddit-basel',
    platform: 'reddit',
    name: 'r/basel',
    identifier: 'basel',
    url: 'https://www.reddit.com/r/basel',
    language: 'de',
    region: 'BS',
    type: 'subreddit',
  },
  {
    id: 'reddit-geneva',
    platform: 'reddit',
    name: 'r/geneva',
    identifier: 'geneva',
    url: 'https://www.reddit.com/r/geneva',
    language: 'fr',
    region: 'GE',
    type: 'subreddit',
  },
  {
    id: 'reddit-lausanne',
    platform: 'reddit',
    name: 'r/lausanne',
    identifier: 'lausanne',
    url: 'https://www.reddit.com/r/lausanne',
    language: 'fr',
    region: 'VD',
    type: 'subreddit',
  },
  {
    id: 'reddit-luzern',
    platform: 'reddit',
    name: 'r/Luzern',
    identifier: 'Luzern',
    url: 'https://www.reddit.com/r/Luzern',
    language: 'de',
    region: 'LU',
    type: 'subreddit',
  },

  // ---------------------------------------------------------------------------
  // FACEBOOK -- National Political Groups & Pages
  // ---------------------------------------------------------------------------
  {
    id: 'fb-politik-schweiz',
    platform: 'facebook',
    name: 'Politik Schweiz',
    identifier: 'fb-group-politik-schweiz',
    url: 'https://www.facebook.com/groups/politikschweiz',
    language: 'de',
    region: 'national',
    type: 'group',
  },
  {
    id: 'fb-svp',
    platform: 'facebook',
    name: 'SVP Schweiz',
    identifier: 'fb-page-svp',
    url: 'https://www.facebook.com/SVPSchweiz',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'fb-sp',
    platform: 'facebook',
    name: 'SP Schweiz',
    identifier: 'fb-page-sp',
    url: 'https://www.facebook.com/spschweiz',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'fb-fdp',
    platform: 'facebook',
    name: 'FDP.Die Liberalen',
    identifier: 'fb-page-fdp',
    url: 'https://www.facebook.com/FDP.DieLiberalen',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'fb-gruene',
    platform: 'facebook',
    name: 'GRUNE Schweiz',
    identifier: 'fb-page-gruene',
    url: 'https://www.facebook.com/GrueneSchweiz',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'fb-mitte',
    platform: 'facebook',
    name: 'Die Mitte',
    identifier: 'fb-page-mitte',
    url: 'https://www.facebook.com/diemitte',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'fb-glp',
    platform: 'facebook',
    name: 'Grunliberale Partei',
    identifier: 'fb-page-glp',
    url: 'https://www.facebook.com/grunliberale',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  // Cantonal Parliament / Grossrat placeholder pages
  {
    id: 'fb-kantonsrat-zh',
    platform: 'facebook',
    name: 'Kantonsrat Zürich',
    identifier: 'fb-page-kantonsrat-zh',
    url: 'https://www.facebook.com/kantonsrat.zuerich',
    language: 'de',
    region: 'ZH',
    type: 'official',
  },
  {
    id: 'fb-grossrat-be',
    platform: 'facebook',
    name: 'Grosser Rat Bern',
    identifier: 'fb-page-grossrat-be',
    url: 'https://www.facebook.com/grosserrat.bern',
    language: 'de',
    region: 'BE',
    type: 'official',
  },
  {
    id: 'fb-grossrat-ag',
    platform: 'facebook',
    name: 'Grosser Rat Aargau',
    identifier: 'fb-page-grossrat-ag',
    url: 'https://www.facebook.com/grosserrat.aargau',
    language: 'de',
    region: 'AG',
    type: 'official',
  },
  {
    id: 'fb-kantonsrat-sg',
    platform: 'facebook',
    name: 'Kantonsrat St. Gallen',
    identifier: 'fb-page-kantonsrat-sg',
    url: 'https://www.facebook.com/kantonsrat.stgallen',
    language: 'de',
    region: 'SG',
    type: 'official',
  },
  {
    id: 'fb-grossrat-bs',
    platform: 'facebook',
    name: 'Grosser Rat Basel-Stadt',
    identifier: 'fb-page-grossrat-bs',
    url: 'https://www.facebook.com/grosserrat.basel',
    language: 'de',
    region: 'BS',
    type: 'official',
  },
  {
    id: 'fb-grandconseil-ge',
    platform: 'facebook',
    name: 'Grand Conseil Geneve',
    identifier: 'fb-page-grandconseil-ge',
    url: 'https://www.facebook.com/grandconseil.geneve',
    language: 'fr',
    region: 'GE',
    type: 'official',
  },
  {
    id: 'fb-grandconseil-vd',
    platform: 'facebook',
    name: 'Grand Conseil Vaud',
    identifier: 'fb-page-grandconseil-vd',
    url: 'https://www.facebook.com/grandconseil.vaud',
    language: 'fr',
    region: 'VD',
    type: 'official',
  },
  // Gemeinde-Gruppen pattern (placeholders for the major cities)
  {
    id: 'fb-gemeinde-zuerich',
    platform: 'facebook',
    name: 'Gemeinde Zürich',
    identifier: 'fb-group-gemeinde-zuerich',
    url: 'https://www.facebook.com/groups/gemeindezuerich',
    language: 'de',
    region: 'ZH',
    type: 'group',
  },
  {
    id: 'fb-gemeinde-bern',
    platform: 'facebook',
    name: 'Gemeinde Bern',
    identifier: 'fb-group-gemeinde-bern',
    url: 'https://www.facebook.com/groups/gemeindebern',
    language: 'de',
    region: 'BE',
    type: 'group',
  },
  {
    id: 'fb-gemeinde-basel',
    platform: 'facebook',
    name: 'Gemeinde Basel',
    identifier: 'fb-group-gemeinde-basel',
    url: 'https://www.facebook.com/groups/gemeindebasel',
    language: 'de',
    region: 'BS',
    type: 'group',
  },
  {
    id: 'fb-gemeinde-luzern',
    platform: 'facebook',
    name: 'Gemeinde Luzern',
    identifier: 'fb-group-gemeinde-luzern',
    url: 'https://www.facebook.com/groups/gemeindeluzern',
    language: 'de',
    region: 'LU',
    type: 'group',
  },
  {
    id: 'fb-gemeinde-geneve',
    platform: 'facebook',
    name: 'Commune de Geneve',
    identifier: 'fb-group-commune-geneve',
    url: 'https://www.facebook.com/groups/communegeneve',
    language: 'fr',
    region: 'GE',
    type: 'group',
  },

  // ---------------------------------------------------------------------------
  // INSTAGRAM -- Political Hashtags (National)
  // ---------------------------------------------------------------------------
  {
    id: 'ig-schweizerpolitik',
    platform: 'instagram',
    name: '#schweizerpolitik',
    identifier: 'schweizerpolitik',
    url: 'https://www.instagram.com/explore/tags/schweizerpolitik',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-schweizerparlament',
    platform: 'instagram',
    name: '#schweizerParlament',
    identifier: 'schweizerParlament',
    url: 'https://www.instagram.com/explore/tags/schweizerparlament',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-nationalrat',
    platform: 'instagram',
    name: '#nationalrat',
    identifier: 'nationalrat',
    url: 'https://www.instagram.com/explore/tags/nationalrat',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-staenderat',
    platform: 'instagram',
    name: '#ständerat',
    identifier: 'staenderat',
    url: 'https://www.instagram.com/explore/tags/st%C3%A4nderat',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  // Instagram -- Party hashtags
  {
    id: 'ig-svp',
    platform: 'instagram',
    name: '#svp',
    identifier: 'svp',
    url: 'https://www.instagram.com/explore/tags/svp',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-sp',
    platform: 'instagram',
    name: '#sp',
    identifier: 'sp',
    url: 'https://www.instagram.com/explore/tags/sp',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-fdp',
    platform: 'instagram',
    name: '#fdp',
    identifier: 'fdp',
    url: 'https://www.instagram.com/explore/tags/fdp',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-gruene',
    platform: 'instagram',
    name: '#gruene',
    identifier: 'gruene',
    url: 'https://www.instagram.com/explore/tags/gruene',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-mitte',
    platform: 'instagram',
    name: '#mitte',
    identifier: 'mitte',
    url: 'https://www.instagram.com/explore/tags/mitte',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  {
    id: 'ig-glp',
    platform: 'instagram',
    name: '#glp',
    identifier: 'glp',
    url: 'https://www.instagram.com/explore/tags/glp',
    language: 'de',
    region: 'national',
    type: 'hashtag',
  },
  // Instagram -- Cantonal political hashtags
  {
    id: 'ig-zuerichpolitik',
    platform: 'instagram',
    name: '#zürichpolitik',
    identifier: 'zuerichpolitik',
    url: 'https://www.instagram.com/explore/tags/z%C3%BCrichpolitik',
    language: 'de',
    region: 'ZH',
    type: 'hashtag',
  },
  {
    id: 'ig-bernpolitik',
    platform: 'instagram',
    name: '#bernpolitik',
    identifier: 'bernpolitik',
    url: 'https://www.instagram.com/explore/tags/bernpolitik',
    language: 'de',
    region: 'BE',
    type: 'hashtag',
  },
  {
    id: 'ig-baselpolitik',
    platform: 'instagram',
    name: '#baselpolitik',
    identifier: 'baselpolitik',
    url: 'https://www.instagram.com/explore/tags/baselpolitik',
    language: 'de',
    region: 'BS',
    type: 'hashtag',
  },
  {
    id: 'ig-luzernpolitik',
    platform: 'instagram',
    name: '#luzernpolitik',
    identifier: 'luzernpolitik',
    url: 'https://www.instagram.com/explore/tags/luzernpolitik',
    language: 'de',
    region: 'LU',
    type: 'hashtag',
  },
  {
    id: 'ig-aargaupolitik',
    platform: 'instagram',
    name: '#aargaupolitik',
    identifier: 'aargaupolitik',
    url: 'https://www.instagram.com/explore/tags/aargaupolitik',
    language: 'de',
    region: 'AG',
    type: 'hashtag',
  },
  {
    id: 'ig-stgallenpolitik',
    platform: 'instagram',
    name: '#stgallenpolitik',
    identifier: 'stgallenpolitik',
    url: 'https://www.instagram.com/explore/tags/stgallenpolitik',
    language: 'de',
    region: 'SG',
    type: 'hashtag',
  },
  {
    id: 'ig-politiquegeneve',
    platform: 'instagram',
    name: '#politiquegeneve',
    identifier: 'politiquegeneve',
    url: 'https://www.instagram.com/explore/tags/politiquegeneve',
    language: 'fr',
    region: 'GE',
    type: 'hashtag',
  },
  {
    id: 'ig-politiquevaud',
    platform: 'instagram',
    name: '#politiquevaud',
    identifier: 'politiquevaud',
    url: 'https://www.instagram.com/explore/tags/politiquevaud',
    language: 'fr',
    region: 'VD',
    type: 'hashtag',
  },
  {
    id: 'ig-politicaticino',
    platform: 'instagram',
    name: '#politicaticino',
    identifier: 'politicaticino',
    url: 'https://www.instagram.com/explore/tags/politicaticino',
    language: 'it',
    region: 'TI',
    type: 'hashtag',
  },

  // ---------------------------------------------------------------------------
  // TWITTER / X -- News Outlet Accounts
  // ---------------------------------------------------------------------------
  {
    id: 'x-srf',
    platform: 'twitter',
    name: 'SRF News',
    identifier: 'SRF',
    url: 'https://x.com/SRF',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-nzz',
    platform: 'twitter',
    name: 'NZZ',
    identifier: 'NZZ',
    url: 'https://x.com/NZZ',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-blaborsky',
    platform: 'twitter',
    name: 'Fabian Eberhard (Blick)',
    identifier: 'taborsky',
    url: 'https://x.com/taborsky',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-tagesanzeiger',
    platform: 'twitter',
    name: 'Tages-Anzeiger',
    identifier: 'taborsky',
    url: 'https://x.com/Aborsky',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-watson',
    platform: 'twitter',
    name: 'Watson',
    identifier: 'watson_news',
    url: 'https://x.com/watson_news',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-rts',
    platform: 'twitter',
    name: 'RTS Info',
    identifier: 'RTSinfo',
    url: 'https://x.com/RTSinfo',
    language: 'fr',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-letemps',
    platform: 'twitter',
    name: 'Le Temps',
    identifier: 'LeTemps',
    url: 'https://x.com/LeTemps',
    language: 'fr',
    region: 'national',
    type: 'official',
  },
  // Twitter / X -- Party accounts
  {
    id: 'x-svp',
    platform: 'twitter',
    name: 'SVP Schweiz',
    identifier: 'SVPch',
    url: 'https://x.com/SVPch',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-sp',
    platform: 'twitter',
    name: 'SP Schweiz',
    identifier: 'spschweiz',
    url: 'https://x.com/spschweiz',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-fdp',
    platform: 'twitter',
    name: 'FDP.Die Liberalen',
    identifier: 'FDP_Liberalen',
    url: 'https://x.com/FDP_Liberalen',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-gruene',
    platform: 'twitter',
    name: 'GRUNE Schweiz',
    identifier: 'gruaborsch',
    url: 'https://x.com/gruaborsch',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-mitte',
    platform: 'twitter',
    name: 'Die Mitte',
    identifier: 'MittePartei',
    url: 'https://x.com/MittePartei',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'x-glp',
    platform: 'twitter',
    name: 'Grunliberale',
    identifier: 'gaborunliberale',
    url: 'https://x.com/grunliberale',
    language: 'de',
    region: 'national',
    type: 'official',
  },

  // ---------------------------------------------------------------------------
  // YOUTUBE -- Channels
  // ---------------------------------------------------------------------------
  {
    id: 'yt-srf-news',
    platform: 'youtube',
    name: 'SRF News',
    identifier: 'UCv4_hbkOdGn7jRSQMGAYCgg',
    url: 'https://www.youtube.com/@SRFNews',
    language: 'de',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-srf-arena',
    platform: 'youtube',
    name: 'SRF Arena (Political Debate)',
    identifier: 'UCsC5cEIFpFZaQqJnR7PACJA',
    url: 'https://www.youtube.com/@SRFArena',
    language: 'de',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-rts-info',
    platform: 'youtube',
    name: 'RTS Info',
    identifier: 'UCefBYBPFOEFP2nqscn2ritg',
    url: 'https://www.youtube.com/@RTSInfo',
    language: 'fr',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-rsi-news',
    platform: 'youtube',
    name: 'RSI News',
    identifier: 'UC1I3hH1anFqvKThtYoBM0GA',
    url: 'https://www.youtube.com/@RSINews',
    language: 'it',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-svp',
    platform: 'youtube',
    name: 'SVP Schweiz',
    identifier: 'UCa0GEBQmgVXb6wXLKKM9xFg',
    url: 'https://www.youtube.com/@SVPSchweiz',
    language: 'de',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-sp',
    platform: 'youtube',
    name: 'SP Schweiz',
    identifier: 'UC_sp_channel_placeholder',
    url: 'https://www.youtube.com/@SPSchweiz',
    language: 'de',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-fdp',
    platform: 'youtube',
    name: 'FDP.Die Liberalen',
    identifier: 'UC_fdp_channel_placeholder',
    url: 'https://www.youtube.com/@FDPdieLiberalen',
    language: 'de',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-gruene',
    platform: 'youtube',
    name: 'GRUNE Schweiz',
    identifier: 'UC_gruene_channel_placeholder',
    url: 'https://www.youtube.com/@GrueneSchweiz',
    language: 'de',
    region: 'national',
    type: 'channel',
  },
  {
    id: 'yt-mitte',
    platform: 'youtube',
    name: 'Die Mitte',
    identifier: 'UC_mitte_channel_placeholder',
    url: 'https://www.youtube.com/@DieMitte',
    language: 'de',
    region: 'national',
    type: 'channel',
  },

  // ---------------------------------------------------------------------------
  // TIKTOK -- Swiss Political Creators (Placeholders)
  // ---------------------------------------------------------------------------
  {
    id: 'tt-srf',
    platform: 'tiktok',
    name: 'SRF on TikTok',
    identifier: 'srf.ch',
    url: 'https://www.tiktok.com/@srf.ch',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'tt-20min',
    platform: 'tiktok',
    name: '20 Minuten on TikTok',
    identifier: '20min.ch',
    url: 'https://www.tiktok.com/@20min.ch',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'tt-watson',
    platform: 'tiktok',
    name: 'Watson on TikTok',
    identifier: 'watson.news',
    url: 'https://www.tiktok.com/@watson.news',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'tt-nau',
    platform: 'tiktok',
    name: 'Nau.ch on TikTok',
    identifier: 'nau.ch',
    url: 'https://www.tiktok.com/@nau.ch',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'tt-political-creator-1',
    platform: 'tiktok',
    name: 'Swiss Political Creator (Placeholder 1)',
    identifier: 'swiss_politics_placeholder_1',
    url: 'https://www.tiktok.com/@swiss_politics_placeholder_1',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'tt-political-creator-2',
    platform: 'tiktok',
    name: 'Swiss Political Creator (Placeholder 2)',
    identifier: 'swiss_politics_placeholder_2',
    url: 'https://www.tiktok.com/@swiss_politics_placeholder_2',
    language: 'fr',
    region: 'national',
    type: 'official',
  },

  // ---------------------------------------------------------------------------
  // LINKEDIN -- Political & Institutional Accounts
  // ---------------------------------------------------------------------------
  {
    id: 'li-bundesrat',
    platform: 'linkedin',
    name: 'Schweizerische Eidgenossenschaft',
    identifier: 'swiss-government',
    url: 'https://www.linkedin.com/company/swiss-government',
    language: 'multi',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-parlamentsdienste',
    platform: 'linkedin',
    name: 'Parlamentsdienste',
    identifier: 'parlamentsdienste',
    url: 'https://www.linkedin.com/company/parlamentsdienste',
    language: 'multi',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-svp',
    platform: 'linkedin',
    name: 'SVP Schweiz',
    identifier: 'svp-schweiz',
    url: 'https://www.linkedin.com/company/svp-schweiz',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-sp',
    platform: 'linkedin',
    name: 'SP Schweiz',
    identifier: 'sp-schweiz',
    url: 'https://www.linkedin.com/company/sp-schweiz',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-fdp',
    platform: 'linkedin',
    name: 'FDP.Die Liberalen',
    identifier: 'fdp-die-liberalen',
    url: 'https://www.linkedin.com/company/fdp-die-liberalen',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-gruene',
    platform: 'linkedin',
    name: 'GRUNE Schweiz',
    identifier: 'gruene-schweiz',
    url: 'https://www.linkedin.com/company/gruene-schweiz',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-mitte',
    platform: 'linkedin',
    name: 'Die Mitte',
    identifier: 'die-mitte',
    url: 'https://www.linkedin.com/company/die-mitte',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-glp',
    platform: 'linkedin',
    name: 'Grunliberale Partei',
    identifier: 'grunliberale',
    url: 'https://www.linkedin.com/company/grunliberale',
    language: 'de',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-economiesuisse',
    platform: 'linkedin',
    name: 'economiesuisse',
    identifier: 'economiesuisse',
    url: 'https://www.linkedin.com/company/economiesuisse',
    language: 'multi',
    region: 'national',
    type: 'official',
  },
  {
    id: 'li-sgb',
    platform: 'linkedin',
    name: 'Schweizerischer Gewerkschaftsbund',
    identifier: 'sgb-uss',
    url: 'https://www.linkedin.com/company/sgb-uss',
    language: 'multi',
    region: 'national',
    type: 'official',
  },
];

// =============================================================================
// Google News Geo Feeds -- Per-Canton
// =============================================================================
// These URLs return RSS feeds from Google News filtered to a specific
// geographic region. Use the appropriate language parameter per canton.
// =============================================================================

export const GOOGLE_NEWS_GEO_FEEDS: Record<string, string> = {
  // German-speaking cantons
  ZH: 'https://news.google.com/rss/headlines/section/geo/Z%C3%BCrich?hl=de&gl=CH&ceid=CH:de',
  BE: 'https://news.google.com/rss/headlines/section/geo/Bern?hl=de&gl=CH&ceid=CH:de',
  LU: 'https://news.google.com/rss/headlines/section/geo/Luzern?hl=de&gl=CH&ceid=CH:de',
  UR: 'https://news.google.com/rss/headlines/section/geo/Uri?hl=de&gl=CH&ceid=CH:de',
  SZ: 'https://news.google.com/rss/headlines/section/geo/Schwyz?hl=de&gl=CH&ceid=CH:de',
  OW: 'https://news.google.com/rss/headlines/section/geo/Obwalden?hl=de&gl=CH&ceid=CH:de',
  NW: 'https://news.google.com/rss/headlines/section/geo/Nidwalden?hl=de&gl=CH&ceid=CH:de',
  GL: 'https://news.google.com/rss/headlines/section/geo/Glarus?hl=de&gl=CH&ceid=CH:de',
  ZG: 'https://news.google.com/rss/headlines/section/geo/Zug?hl=de&gl=CH&ceid=CH:de',
  SO: 'https://news.google.com/rss/headlines/section/geo/Solothurn?hl=de&gl=CH&ceid=CH:de',
  BS: 'https://news.google.com/rss/headlines/section/geo/Basel?hl=de&gl=CH&ceid=CH:de',
  BL: 'https://news.google.com/rss/headlines/section/geo/Basel-Landschaft?hl=de&gl=CH&ceid=CH:de',
  SH: 'https://news.google.com/rss/headlines/section/geo/Schaffhausen?hl=de&gl=CH&ceid=CH:de',
  AR: 'https://news.google.com/rss/headlines/section/geo/Appenzell%20Ausserrhoden?hl=de&gl=CH&ceid=CH:de',
  AI: 'https://news.google.com/rss/headlines/section/geo/Appenzell%20Innerrhoden?hl=de&gl=CH&ceid=CH:de',
  SG: 'https://news.google.com/rss/headlines/section/geo/St.%20Gallen?hl=de&gl=CH&ceid=CH:de',
  AG: 'https://news.google.com/rss/headlines/section/geo/Aargau?hl=de&gl=CH&ceid=CH:de',
  TG: 'https://news.google.com/rss/headlines/section/geo/Thurgau?hl=de&gl=CH&ceid=CH:de',
  GR: 'https://news.google.com/rss/headlines/section/geo/Graub%C3%BCnden?hl=de&gl=CH&ceid=CH:de',

  // French-speaking cantons
  GE: 'https://news.google.com/rss/headlines/section/geo/Gen%C3%A8ve?hl=fr&gl=CH&ceid=CH:fr',
  VD: 'https://news.google.com/rss/headlines/section/geo/Vaud?hl=fr&gl=CH&ceid=CH:fr',
  NE: 'https://news.google.com/rss/headlines/section/geo/Neuch%C3%A2tel?hl=fr&gl=CH&ceid=CH:fr',
  JU: 'https://news.google.com/rss/headlines/section/geo/Jura?hl=fr&gl=CH&ceid=CH:fr',

  // Bilingual cantons (using primary language)
  FR: 'https://news.google.com/rss/headlines/section/geo/Fribourg?hl=fr&gl=CH&ceid=CH:fr',
  VS: 'https://news.google.com/rss/headlines/section/geo/Valais?hl=fr&gl=CH&ceid=CH:fr',

  // Italian-speaking canton
  TI: 'https://news.google.com/rss/headlines/section/geo/Ticino?hl=it&gl=CH&ceid=CH:it',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all news sources covering a specific region.
 * Returns sources directly assigned to the region, plus national sources.
 */
export function getSourcesByRegion(region: string): NewsSource[] {
  const normalized = region.toUpperCase();
  return NEWS_SOURCES.filter(
    (s) => s.region === normalized || s.region === 'national',
  );
}

/**
 * Get all news sources for a specific language.
 */
export function getSourcesByLanguage(
  lang: 'de' | 'fr' | 'it' | 'rm',
): NewsSource[] {
  return NEWS_SOURCES.filter((s) => s.language === lang);
}

/**
 * Get all social media monitoring targets for a specific region.
 * Returns targets directly assigned to the region, plus national targets.
 */
export function getSocialTargetsByRegion(
  region: string,
): SocialMediaTarget[] {
  const normalized = region.toUpperCase();
  return SOCIAL_MEDIA_TARGETS.filter(
    (t) => t.region === normalized || t.region === 'national',
  );
}

/**
 * Build a Google News search RSS feed URL for a specific canton and keywords.
 *
 * If no canton-specific geo feed exists, falls back to a general Swiss search.
 * Keywords are joined with "+" (AND) in the Google News query syntax.
 *
 * @param canton - Canton code (e.g. "ZH", "BE", "GE")
 * @param keywords - Search terms to filter headlines
 * @returns RSS feed URL
 */
export function getGoogleNewsFeed(
  canton: string,
  keywords: string[],
): string {
  const code = canton.toUpperCase();
  const cantonInfo = CANTONS.find((c) => c.code === code);
  const lang =
    cantonInfo?.language === 'fr'
      ? 'fr'
      : cantonInfo?.language === 'it'
        ? 'it'
        : 'de';

  // If keywords are provided, build a search-based RSS feed
  if (keywords.length > 0) {
    const query = encodeURIComponent(keywords.join(' '));
    return `https://news.google.com/rss/search?q=${query}&hl=${lang}&gl=CH&ceid=CH:${lang}`;
  }

  // Otherwise return the geo-based feed for the canton
  return (
    GOOGLE_NEWS_GEO_FEEDS[code] ??
    `https://news.google.com/rss/headlines/section/geo/Switzerland?hl=${lang}&gl=CH&ceid=CH:${lang}`
  );
}

/**
 * Return every configured source and social media target as a single object.
 * Useful for iterating over the complete monitoring configuration.
 */
export function getAllConfiguredSources(): {
  news: NewsSource[];
  social: SocialMediaTarget[];
} {
  return {
    news: NEWS_SOURCES,
    social: SOCIAL_MEDIA_TARGETS,
  };
}
