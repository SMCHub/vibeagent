// ---------------------------------------------------------------------------
// Political Social Media Monitoring Dashboard -- Core Types
// ---------------------------------------------------------------------------

/** Supported social-media / news platforms. */
export type Platform =
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'reddit'
  | 'linkedin'
  | 'news';

/** Sentiment classification for a mention. */
export type SentimentType = 'positive' | 'negative' | 'neutral';

/** Importance level (German labels used in the UI). */
export type Importance = 'hoch' | 'mittel' | 'niedrig';

/** Trend direction for a topic. */
export type Trend = 'rising' | 'stable' | 'falling';

// ---------------------------------------------------------------------------
// Domain entities
// ---------------------------------------------------------------------------

/** A monitored politician profile. */
export interface Politician {
  id: string;
  name: string;
  title: string;
  keywords: string[];
  constituency: string;
  sources: string[];
}

/** A raw article / post fetched from a platform. */
export interface Article {
  id: string;
  sourceId: string;
  externalId: string;
  title: string;
  url: string;
  content: string;
  platform: Platform;
  publishedAt: Date;
}

/** A single mention of a politician across any platform. */
export interface Mention {
  id: string;
  politicianId: string;
  articleId: string;
  sourceId: string;
  platform: Platform;
  content: string;
  author: string;
  authorUrl: string;
  /** Overall sentiment classification. */
  sentiment: SentimentType;
  /** Fine-grained sentiment score in the range [-1, 1]. */
  sentimentScore: number;
  isViral: boolean;
  engagementCount: number;
  needsResponse: boolean;
  tags: string[];
  createdAt: Date;
}

/** An AI-generated response suggestion for a mention. */
export interface Response {
  id: string;
  mentionId: string;
  generatedText: string;
  improvedText: string | null;
  wasCopied: boolean;
}

/** A trending topic detected for a politician. */
export interface Topic {
  id: string;
  politicianId: string;
  name: string;
  importance: Importance;
  mentionCount: number;
  trend: Trend;
  date: Date;
}

/** Aggregated dashboard payload for a single politician view. */
export interface DashboardData {
  politician: Politician;
  mentions: Mention[];
  responses: Record<string, Response>;
  topics: Topic[];
  stats: {
    totalMentions: number;
    positivePct: number;
    negativePct: number;
    neutralPct: number;
    needsResponse: number;
  };
}
