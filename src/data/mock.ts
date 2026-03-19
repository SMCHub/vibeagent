import type {
  DashboardData,
  Mention,
  Politician,
  Response,
  Topic,
} from '@/lib/types';

// ---------------------------------------------------------------------------
// Politician profile
// ---------------------------------------------------------------------------

const politician: Politician = {
  id: 'pol-001',
  name: 'Thomas Müller',
  title: 'Gemeinderat',
  keywords: [
    'Müller',
    'Gemeinderat',
    'Zürich',
    'Mitte',
    'Verkehr',
    'Wohnen',
  ],
  constituency: 'Stadt Zürich',
  sources: [
    'facebook.com/GemeinderatMueller',
    'twitter.com/tmueller_zh',
    'instagram.com/thomas.mueller.zh',
    'nzz.ch',
    'tagesanzeiger.ch',
    'srf.ch',
    'reddit.com/r/zurich',
    '20min.ch',
    'linkedin.com/in/thomas-mueller-zh',
  ],
};

// ---------------------------------------------------------------------------
// Helper – dates around "today" (mid-March 2026)
// ---------------------------------------------------------------------------

function d(daysAgo: number, hours = 10): Date {
  const base = new Date('2026-03-19T00:00:00+01:00');
  base.setDate(base.getDate() - daysAgo);
  base.setHours(hours, Math.floor(Math.random() * 60), 0, 0);
  return base;
}

// ---------------------------------------------------------------------------
// Mentions (10 total – 4 positive, 3 negative, 3 neutral)
// ---------------------------------------------------------------------------

const mentions: Mention[] = [
  // ---- POSITIVE (4) -------------------------------------------------------
  {
    id: 'men-001',
    politicianId: 'pol-001',
    articleId: 'art-001',
    sourceId: 'src-fb',
    platform: 'facebook',
    content:
      'Super Sache! Gemeinderat Müller hat sich stark gemacht für die Verkehrsberuhigung an der Langstrasse. Endlich weniger Durchgangsverkehr im Quartier – das wurde höchste Zeit. Merci! 👍',
    author: 'Quartierverein Kreis 4',
    authorUrl: 'https://facebook.com/quartierverein.kreis4',
    sentiment: 'positive',
    sentimentScore: 0.79,
    isViral: false,
    engagementCount: 187,
    needsResponse: false,
    tags: ['Verkehrsberuhigung', 'Langstrasse', 'Quartierentwicklung'],
    createdAt: d(0, 9),
  },
  {
    id: 'men-003',
    politicianId: 'pol-001',
    articleId: 'art-003',
    sourceId: 'src-ig',
    platform: 'instagram',
    content:
      'Neue Velowege entlang der Limmat – endlich wird Zürich ein Stück velofreundlicher! Gemeinderat Müller hat den Vorstoss mit lanciert. Weiter so! 🚲 #züripolitik #velostadt #velowege #klimaziel2040',
    author: 'veloinitiative_zh',
    authorUrl: 'https://instagram.com/veloinitiative_zh',
    sentiment: 'positive',
    sentimentScore: 0.74,
    isViral: false,
    engagementCount: 312,
    needsResponse: false,
    tags: ['Velowege', 'Limmat', 'Klimaziel 2040', 'Velostadt'],
    createdAt: d(2, 14),
  },
  {
    id: 'men-007',
    politicianId: 'pol-001',
    articleId: 'art-007',
    sourceId: 'src-news-ta',
    platform: 'news',
    content:
      'Kita-Initiative im Gemeinderat: Thomas Müller (Mitte) setzt sich für 500 zusätzliche Kita-Plätze in der Stadt Zürich ein. Der Vorstoss wurde von einer breiten Allianz aus Mitte, SP und Grünen unterstützt und hat gute Chancen in der Volksabstimmung.',
    author: 'Tages-Anzeiger',
    authorUrl: 'https://tagesanzeiger.ch/zuerich',
    sentiment: 'positive',
    sentimentScore: 0.62,
    isViral: false,
    engagementCount: 534,
    needsResponse: false,
    tags: ['Kita-Plätze', 'Vorstoss', 'Volksabstimmung'],
    createdAt: d(1, 8),
  },
  {
    id: 'men-010',
    politicianId: 'pol-001',
    articleId: 'art-010',
    sourceId: 'src-li',
    platform: 'linkedin',
    content:
      'Spannender Austausch heute an der Smart City Zürich Konferenz. Gemeinderat Thomas Müller hat die Vision der digitalen Verwaltung vorgestellt – von Online-Bewilligungen bis hin zu datengetriebener Quartierplanung. Zürich kann hier Vorreiter in der Schweiz werden.',
    author: 'Sandra Keller',
    authorUrl: 'https://linkedin.com/in/sandra-keller-zh',
    sentiment: 'positive',
    sentimentScore: 0.71,
    isViral: false,
    engagementCount: 278,
    needsResponse: false,
    tags: ['Smart City', 'Digitalisierung', 'Verwaltung'],
    createdAt: d(3, 11),
  },

  // ---- NEGATIVE (3) -------------------------------------------------------
  {
    id: 'men-002',
    politicianId: 'pol-001',
    articleId: 'art-002',
    sourceId: 'src-tw',
    platform: 'twitter',
    content:
      'Die Wohnungsnot in Zürich spitzt sich zu und Gemeinderat Müller (Mitte) blockiert Verdichtungsprojekte im Seefeld. Wer 4000.– für eine 3-Zi-Wohnung zahlt, braucht keine Sonntagsreden sondern Lösungen. #Wohnungsnot #Zürich',
    author: 'Anna Brunner',
    authorUrl: 'https://twitter.com/annabrunner_zh',
    sentiment: 'negative',
    sentimentScore: -0.72,
    isViral: false,
    engagementCount: 423,
    needsResponse: true,
    tags: ['Wohnungsnot', 'Verdichtung', 'Kritik'],
    createdAt: d(1, 18),
  },
  {
    id: 'men-004',
    politicianId: 'pol-001',
    articleId: 'art-004',
    sourceId: 'src-yt',
    platform: 'youtube',
    content:
      'SRF Arena: Mietenwahnsinn in Schweizer Städten. Gemeinderat Müller wird von Mieterverband-Vertreterin komplett zerlegt. Kein Plan gegen steigende Mieten, nur Ausreden. Die Leute können sich Zürich schlicht nicht mehr leisten!',
    author: 'SRF Arena Clips',
    authorUrl: 'https://youtube.com/@SRFArena',
    sentiment: 'negative',
    sentimentScore: -0.81,
    isViral: true,
    engagementCount: 6_230,
    needsResponse: true,
    tags: ['Mieten', 'Mietenwahnsinn', 'SRF Arena', 'Kritik'],
    createdAt: d(2, 20),
  },
  {
    id: 'men-009',
    politicianId: 'pol-001',
    articleId: 'art-009',
    sourceId: 'src-news-20m',
    platform: 'news',
    content:
      'Stau-Chaos auf der Hardbrücke: Anwohner sind genervt, Pendler stehen täglich im Stau. Gemeinderäte wie Thomas Müller (Mitte) versprechen Besserung durch die neue Verkehrspolitik – doch bisher fehlen konkrete Resultate.',
    author: '20 Minuten',
    authorUrl: 'https://20min.ch/zuerich',
    sentiment: 'negative',
    sentimentScore: -0.55,
    isViral: false,
    engagementCount: 891,
    needsResponse: true,
    tags: ['Stau', 'Hardbrücke', 'Verkehrspolitik'],
    createdAt: d(0, 17),
  },

  // ---- NEUTRAL (3) --------------------------------------------------------
  {
    id: 'men-005',
    politicianId: 'pol-001',
    articleId: 'art-005',
    sourceId: 'src-rd',
    platform: 'reddit',
    content:
      'Was haltet ihr vom Parkplatz-Abbau in der Innenstadt? Gemeinderat Müller (Mitte) hat dafür gestimmt, die Grünen sowieso. Einerseits verständlich wegen Verdichtung und Veloförderung, andererseits brauchen Gewerbetreibende Kundenparkplätze. Bin hin- und hergerissen.',
    author: 'u/zuerich_politik',
    authorUrl: 'https://reddit.com/u/zuerich_politik',
    sentiment: 'neutral',
    sentimentScore: 0.03,
    isViral: false,
    engagementCount: 156,
    needsResponse: false,
    tags: ['Parkplatz-Abbau', 'Verdichtung', 'Innenstadt'],
    createdAt: d(3, 21),
  },
  {
    id: 'men-006',
    politicianId: 'pol-001',
    articleId: 'art-006',
    sourceId: 'src-news-nzz',
    platform: 'news',
    content:
      'Zürich setzt auf Smart City: Gemeinderat Thomas Müller (Mitte) reicht Vorstoss für digitale Verwaltung ein. Der Vorstoss sieht eine vollständige Digitalisierung der Baubewilligungen und einen Open-Data-Hub für die Stadtplanung vor. Die Kosten werden auf 12 Millionen Franken geschätzt.',
    author: 'NZZ',
    authorUrl: 'https://nzz.ch/zuerich',
    sentiment: 'neutral',
    sentimentScore: 0.12,
    isViral: true,
    engagementCount: 2_340,
    needsResponse: false,
    tags: ['Smart City', 'Digitalisierung', 'Vorstoss', 'Gemeinderat'],
    createdAt: d(1, 7),
  },
  {
    id: 'men-008',
    politicianId: 'pol-001',
    articleId: 'art-008',
    sourceId: 'src-tt',
    platform: 'tiktok',
    content:
      'Zusammenschnitt aus der Gemeinderatssitzung vom 17.03. – Debatte zu ÖV-Ausbau und Tramverlängerung Affoltern. Thomas Müller spricht ab Minute 1:45 über Finanzierung und Fahrplan.',
    author: 'zh_politik',
    authorUrl: 'https://tiktok.com/@zh_politik',
    sentiment: 'neutral',
    sentimentScore: 0.05,
    isViral: false,
    engagementCount: 467,
    needsResponse: false,
    tags: ['Gemeinderatssitzung', 'ÖV-Ausbau', 'Tram'],
    createdAt: d(2, 19),
  },
];

// ---------------------------------------------------------------------------
// AI-generated response suggestions (for mentions flagged needsResponse)
// ---------------------------------------------------------------------------

const responses: Record<string, Response> = {
  'men-002': {
    id: 'res-001',
    mentionId: 'men-002',
    generatedText:
      'Vielen Dank für Ihre Rückmeldung, Frau Brunner. Die Wohnungsnot beschäftigt uns im Gemeinderat intensiv. Ich habe gemeinsam mit der Mitte-Fraktion einen Vorstoss für beschleunigte Baubewilligungen und gezieltes Verdichten in geeigneten Quartieren eingereicht. Im Seefeld setzen wir uns für eine ausgewogene Lösung ein, die sowohl die Lebensqualität der Anwohnerinnen und Anwohner als auch den dringend nötigen Wohnraum berücksichtigt. Die Volksabstimmung über das Rahmenkredit-Paket im Juni wird ein wichtiger Schritt sein. Gerne tausche ich mich persönlich mit Ihnen aus.',
    improvedText: null,
    wasCopied: false,
  },
  'men-004': {
    id: 'res-002',
    mentionId: 'men-004',
    generatedText:
      'Die Diskussion in der SRF Arena hat gezeigt, dass beim Thema Mieten viele Emotionen im Spiel sind – zu Recht. Im Gemeinderat habe ich konkret drei Massnahmen vorgeschlagen: (1) Ausbau des gemeinnützigen Wohnungsbaus mit einem Rahmenkredit von 200 Mio. Franken, (2) Vorkaufsrecht der Stadt bei Liegenschaftsverkäufen, (3) strengere Regeln gegen missbräuchliche Mietzinserhöhungen. Der Vorstoss liegt dem Gemeinderat vor und wird voraussichtlich im April behandelt. Ich setze mich für einen breit abgestützten Kompromiss ein.',
    improvedText:
      'Die Mietensituation ist ernst – das sehe ich genauso. Konkret habe ich im Gemeinderat drei Massnahmen eingebracht: Ausbau des gemeinnützigen Wohnungsbaus (200 Mio. Rahmenkredit), Vorkaufsrecht der Stadt und strengere Regeln gegen missbräuchliche Mietzinserhöhungen. Der Vorstoss wird im April behandelt. Für einen tragfähigen Kompromiss braucht es alle Parteien.',
    wasCopied: false,
  },
  'men-009': {
    id: 'res-003',
    mentionId: 'men-009',
    generatedText:
      'Das Stau-Problem auf der Hardbrücke ist bekannt und belastet Anwohnende und Pendler gleichermassen. Im Rahmen der städtischen Verkehrsstrategie haben wir im Gemeinderat den Ausbau der ÖV-Kapazitäten auf dieser Achse beschlossen – die Tramverlängerung nach Altstetten und die bessere Taktung der Buslinie 33 sollen ab 2027 spürbar entlasten. Kurzfristig setzen wir auf intelligente Lichtsignalsteuerung. Ich verstehe die Ungeduld, aber nachhaltige Verkehrsplanung braucht sorgfältige Abwägung.',
    improvedText: null,
    wasCopied: false,
  },
};

// ---------------------------------------------------------------------------
// Topic radar
// ---------------------------------------------------------------------------

const topics: Topic[] = [
  {
    id: 'top-001',
    politicianId: 'pol-001',
    name: 'Wohnungsnot',
    importance: 'hoch',
    mentionCount: 64,
    trend: 'rising',
    date: d(0),
  },
  {
    id: 'top-002',
    politicianId: 'pol-001',
    name: 'Velowege & Verkehr',
    importance: 'hoch',
    mentionCount: 53,
    trend: 'rising',
    date: d(0),
  },
  {
    id: 'top-003',
    politicianId: 'pol-001',
    name: 'Kita-Plätze',
    importance: 'hoch',
    mentionCount: 41,
    trend: 'stable',
    date: d(0),
  },
  {
    id: 'top-004',
    politicianId: 'pol-001',
    name: 'Klimaziel 2040',
    importance: 'mittel',
    mentionCount: 33,
    trend: 'rising',
    date: d(0),
  },
  {
    id: 'top-005',
    politicianId: 'pol-001',
    name: 'Digitale Verwaltung',
    importance: 'mittel',
    mentionCount: 25,
    trend: 'stable',
    date: d(0),
  },
  {
    id: 'top-006',
    politicianId: 'pol-001',
    name: 'Quartierentwicklung',
    importance: 'mittel',
    mentionCount: 28,
    trend: 'stable',
    date: d(0),
  },
  {
    id: 'top-007',
    politicianId: 'pol-001',
    name: 'ÖV-Ausbau',
    importance: 'hoch',
    mentionCount: 47,
    trend: 'rising',
    date: d(0),
  },
  {
    id: 'top-008',
    politicianId: 'pol-001',
    name: 'Nachtleben & Lärm',
    importance: 'niedrig',
    mentionCount: 14,
    trend: 'falling',
    date: d(0),
  },
];

// ---------------------------------------------------------------------------
// Aggregated dashboard data
// ---------------------------------------------------------------------------

const totalMentions = mentions.length;
const positiveMentions = mentions.filter((m) => m.sentiment === 'positive').length;
const negativeMentions = mentions.filter((m) => m.sentiment === 'negative').length;
const neutralMentions = mentions.filter((m) => m.sentiment === 'neutral').length;
const needsResponseCount = mentions.filter((m) => m.needsResponse).length;

export const mockDashboardData: DashboardData = {
  politician,
  mentions,
  responses,
  topics,
  stats: {
    totalMentions,
    positivePct: Math.round((positiveMentions / totalMentions) * 100),
    negativePct: Math.round((negativeMentions / totalMentions) * 100),
    neutralPct: Math.round((neutralMentions / totalMentions) * 100),
    needsResponse: needsResponseCount,
  },
};
