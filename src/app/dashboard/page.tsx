"use client";

import { useState, useCallback } from "react";
import { mockDashboardData } from "@/data/mock";
import Header from "@/components/dashboard/Header";
import SummaryTab from "@/components/dashboard/SummaryTab";
import CommentList from "@/components/dashboard/CommentList";
import AnalysisTab from "@/components/dashboard/AnalysisTab";
import SourcesTab from "@/components/dashboard/SourcesTab";
import type { Response, Mention, SentimentType } from "@/lib/types";
import type { ScrapedItem } from "@/lib/scraper/base";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Tab = "summary" | "mentions" | "analysis" | "sources";

// Mock chart data for the Mentions tab
const mentionVolumeData = [
  { date: "12 Mär", count: 3 },
  { date: "13 Mär", count: 5 },
  { date: "14 Mär", count: 2 },
  { date: "15 Mär", count: 7 },
  { date: "16 Mär", count: 4 },
  { date: "17 Mär", count: 8 },
  { date: "18 Mär", count: 6 },
  { date: "19 Mär", count: 10 },
];

const sentimentTimeData = [
  { date: "12 Mär", positive: 1, negative: 1, neutral: 1 },
  { date: "13 Mär", positive: 2, negative: 2, neutral: 1 },
  { date: "14 Mär", positive: 1, negative: 0, neutral: 1 },
  { date: "15 Mär", positive: 3, negative: 2, neutral: 2 },
  { date: "16 Mär", positive: 2, negative: 1, neutral: 1 },
  { date: "17 Mär", positive: 3, negative: 3, neutral: 2 },
  { date: "18 Mär", positive: 2, negative: 2, neutral: 2 },
  { date: "19 Mär", positive: 4, negative: 3, neutral: 3 },
];

/** Convert a ScrapedItem from the API into a Mention for the dashboard. */
function scrapedItemToMention(
  item: ScrapedItem,
  index: number,
  politicianId: string
): Mention {
  return {
    id: `scraped-${item.externalId}`,
    politicianId,
    articleId: `art-${item.externalId}`,
    sourceId: `src-${item.platform}`,
    platform: item.platform,
    content: item.content || item.title,
    author: item.author,
    authorUrl: item.authorUrl || item.url,
    sentiment: "neutral" as SentimentType,
    sentimentScore: 0,
    isViral: false,
    engagementCount: item.engagementCount,
    needsResponse: false,
    tags: [],
    createdAt: new Date(item.publishedAt),
  };
}

/** Recalculate dashboard stats from mentions. */
function recalcStats(mentions: Mention[]) {
  const total = mentions.length;
  if (total === 0) {
    return {
      totalMentions: 0,
      positivePct: 0,
      negativePct: 0,
      neutralPct: 0,
      needsResponse: 0,
    };
  }
  const positive = mentions.filter((m) => m.sentiment === "positive").length;
  const negative = mentions.filter((m) => m.sentiment === "negative").length;
  const neutral = mentions.filter((m) => m.sentiment === "neutral").length;
  return {
    totalMentions: total,
    positivePct: Math.round((positive / total) * 100),
    negativePct: Math.round((negative / total) * 100),
    neutralPct: Math.round((neutral / total) * 100),
    needsResponse: mentions.filter((m) => m.needsResponse).length,
  };
}

export default function DashboardPage() {
  const [data, setData] = useState(mockDashboardData);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrapeNotification, setScrapeNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleGenerateResponse = useCallback(async (mentionId: string) => {
    setIsGenerating(mentionId);
    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentionId }),
      });
      const result = await res.json();

      if (result.success) {
        const newResponse: Response = {
          id: `resp-${mentionId}`,
          mentionId,
          generatedText: result.response,
          improvedText: null,
          wasCopied: false,
        };
        setData((prev) => ({
          ...prev,
          responses: { ...prev.responses, [mentionId]: newResponse },
        }));
      }
    } catch (error) {
      console.error("Fehler beim Generieren:", error);
    } finally {
      setIsGenerating(null);
    }
  }, []);

  const handleImproveResponse = useCallback(async (mentionId: string) => {
    setIsGenerating(mentionId);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentionId }),
      });
      const result = await res.json();

      if (result.success) {
        setData((prev) => ({
          ...prev,
          responses: {
            ...prev.responses,
            [mentionId]: {
              ...prev.responses[mentionId],
              improvedText: result.response,
            },
          },
        }));
      }
    } catch (error) {
      console.error("Fehler beim Verbessern:", error);
    } finally {
      setIsGenerating(null);
    }
  }, []);

  const handleScrape = useCallback(async () => {
    setIsScraping(true);
    setScrapeNotification(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
      });
      const result = await res.json();

      if (result.success && Array.isArray(result.items)) {
        const newMentions = result.items.map(
          (item: ScrapedItem, index: number) =>
            scrapedItemToMention(item, index, data.politician.id)
        );

        setData((prev) => {
          // Deduplicate by id: existing mentions take precedence
          const existingIds = new Set(prev.mentions.map((m) => m.id));
          const uniqueNew = newMentions.filter(
            (m: Mention) => !existingIds.has(m.id)
          );
          const merged = [...uniqueNew, ...prev.mentions];

          return {
            ...prev,
            mentions: merged,
            stats: recalcStats(merged),
          };
        });

        const addedCount = newMentions.length;
        setScrapeNotification({
          message: `${addedCount} neue Artikel gefunden (${(result.durationMs / 1000).toFixed(1)}s)`,
          type: "success",
        });
      } else {
        setScrapeNotification({
          message: `Fehler: ${result.error ?? "Unbekannter Fehler"}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Fehler beim Scrapen:", error);
      setScrapeNotification({
        message: "Netzwerkfehler beim Scrapen",
        type: "error",
      });
    } finally {
      setIsScraping(false);
      setTimeout(() => setScrapeNotification(null), 8000);
    }
  }, [data.politician.id]);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setScrapeNotification(null);
    try {
      const mentionTexts = data.mentions.map((m) => m.content);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentions: mentionTexts }),
      });
      const result = await res.json();

      if (result.success && Array.isArray(result.results)) {
        setData((prev) => {
          const updatedMentions = prev.mentions.map((mention, idx) => {
            const analysis = result.results[idx];
            if (!analysis) return mention;
            return {
              ...mention,
              sentiment: analysis.sentiment as SentimentType,
              sentimentScore: analysis.sentimentScore,
              tags: analysis.tags || mention.tags,
              needsResponse: analysis.needsResponse ?? mention.needsResponse,
              isViral: analysis.isViral ?? mention.isViral,
            };
          });

          return {
            ...prev,
            mentions: updatedMentions,
            stats: recalcStats(updatedMentions),
          };
        });

        setScrapeNotification({
          message: `Sentiment-Analyse abgeschlossen (${result.analyzed} Erwähnungen)`,
          type: "success",
        });
      } else {
        setScrapeNotification({
          message: `Analyse-Fehler: ${result.error ?? "Unbekannter Fehler"}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Fehler bei der Analyse:", error);
      setScrapeNotification({
        message: "Netzwerkfehler bei der Sentiment-Analyse",
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setScrapeNotification(null), 8000);
    }
  }, [data.mentions]);

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header with Tabs */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onScrape={handleScrape}
        isScraping={isScraping}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
      />

      {/* Scrape / Analyze Notification */}
      {scrapeNotification && (
        <div className="mx-auto max-w-[1400px] px-6 pt-4">
          <div className="flex items-center justify-between rounded-lg border border-[#d8d8d8] bg-white px-4 py-3 text-sm text-[#343434] shadow-sm">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  scrapeNotification.type === "success"
                    ? "bg-green-500"
                    : scrapeNotification.type === "error"
                      ? "bg-red-500"
                      : "bg-[#644a40]"
                }`}
              />
              <span>{scrapeNotification.message}</span>
            </div>
            <button
              onClick={() => setScrapeNotification(null)}
              className="ml-4 text-[#999999] hover:text-[#343434]"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <SummaryTab
            data={data}
            onGenerateResponse={handleGenerateResponse}
            onImproveResponse={handleImproveResponse}
          />
        )}

        {/* Mentions Tab */}
        {activeTab === "mentions" && (
          <div className="tab-content-enter space-y-6">
            {/* Charts above mentions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Mention Volume */}
              <div className="chart-container">
                <h3 className="mb-4 text-sm font-semibold text-[#202020]">
                  Erwähnungs-Volumen
                </h3>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mentionVolumeData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#efefef"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#999999", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#999999", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #d8d8d8",
                          borderRadius: 8,
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#644a40"
                        strokeWidth={2.5}
                        dot={{ fill: "#644a40", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Erwähnungen"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sentiment over time */}
              <div className="chart-container">
                <h3 className="mb-4 text-sm font-semibold text-[#202020]">
                  Sentiment über Zeit
                </h3>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sentimentTimeData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#efefef"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#999999", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#999999", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #d8d8d8",
                          borderRadius: 8,
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
            </div>

            {/* Full-width CommentList */}
            <CommentList
              mentions={data.mentions}
              responses={data.responses}
              onGenerateResponse={handleGenerateResponse}
              onImproveResponse={handleImproveResponse}
            />
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && (
          <AnalysisTab
            data={data}
            onGenerateResponse={handleGenerateResponse}
            onImproveResponse={handleImproveResponse}
          />
        )}

        {/* Sources Tab */}
        {activeTab === "sources" && <SourcesTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d8d8d8] bg-white">
        <div
          className="mx-auto max-w-[1400px] px-6 py-4 text-center text-xs text-[#999999]"
          suppressHydrationWarning
        >
          VibeAgent — Politisches Monitoring Dashboard | Letzte Aktualisierung:{" "}
          {new Date().toLocaleString("de-DE")}
        </div>
      </footer>
    </div>
  );
}
