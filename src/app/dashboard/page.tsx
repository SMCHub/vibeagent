"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import SummaryTab from "@/components/dashboard/SummaryTab";
import CommentList from "@/components/dashboard/CommentList";
import AnalysisTab from "@/components/dashboard/AnalysisTab";
import SourcesTab from "@/components/dashboard/SourcesTab";
import type { DashboardData } from "@/lib/types";
import { Loader2, RefreshCw } from "lucide-react";
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

const emptyData: DashboardData = {
  politician: {
    id: 'default',
    name: 'Thomas Müller',
    title: 'Gemeinderat',
    keywords: ['Müller', 'Gemeinderat', 'Zürich'],
    constituency: 'Stadt Zürich',
    sources: [],
  },
  mentions: [],
  responses: {},
  topics: [],
  stats: { totalMentions: 0, positivePct: 0, negativePct: 0, neutralPct: 0, needsResponse: 0 },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrapeNotification, setScrapeNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();
      if (result.mentions) {
        // Parse date strings back to Date objects
        result.mentions = result.mentions.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }));
        result.topics = (result.topics || []).map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        setData(result);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }

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
        await fetchDashboard();
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
        await fetchDashboard();
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
      const res = await fetch("/api/scrape", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        setScrapeNotification({
          message: `${result.newCount} neue Artikel gefunden`,
          type: "success",
        });
        await fetchDashboard(); // Reload from DB
      } else {
        setScrapeNotification({
          message: result.error || "Fehler",
          type: "error",
        });
      }
    } catch {
      setScrapeNotification({
        message: "Netzwerkfehler",
        type: "error",
      });
    } finally {
      setIsScraping(false);
      setTimeout(() => setScrapeNotification(null), 6000);
    }
  }, []);

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

      if (result.success) {
        setScrapeNotification({
          message: `Sentiment-Analyse abgeschlossen (${result.analyzed} Erwähnungen)`,
          type: "success",
        });
        await fetchDashboard(); // Reload from DB
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
          <div className="flex items-center justify-between rounded-lg border border-[#dadce0] bg-white px-4 py-3 text-sm text-[#202124] shadow-sm">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  scrapeNotification.type === "success"
                    ? "bg-green-500"
                    : scrapeNotification.type === "error"
                      ? "bg-red-500"
                      : "bg-[#1a73e8]"
                }`}
              />
              <span>{scrapeNotification.message}</span>
            </div>
            <button
              onClick={() => setScrapeNotification(null)}
              className="ml-4 text-[#5f6368] hover:text-[#202124]"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Dashboard wird geladen...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data.mentions.length === 0 && activeTab === "summary" && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <RefreshCw className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Noch keine Daten</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Klicken Sie oben auf &quot;Aktualisieren&quot;, um Schweizer Nachrichtenquellen zu durchsuchen.
            </p>
          </div>
        )}

        {/* Summary Tab */}
        {!isLoading && activeTab === "summary" && data.mentions.length > 0 && (
          <SummaryTab
            data={data}
            onGenerateResponse={handleGenerateResponse}
            onImproveResponse={handleImproveResponse}
          />
        )}

        {/* Mentions Tab */}
        {!isLoading && activeTab === "mentions" && (
          <div className="tab-content-enter space-y-6">
            {/* Charts above mentions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Mention Volume */}
              <div className="chart-container">
                <h3 className="mb-1 text-sm font-semibold text-[#202124]">
                  Erwähnungs-Volumen
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Anzahl neuer Erwähnungen pro Tag in den letzten 7 Tagen.
                </p>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mentionVolumeData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f3f4"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#5f6368", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#5f6368", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #dadce0",
                          borderRadius: 8,
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#1a73e8"
                        strokeWidth={2.5}
                        dot={{ fill: "#1a73e8", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Erwähnungen"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#1a73e8" }} />
                    <span>Erwähnungen</span>
                  </div>
                  <span className="text-[#dadce0]">|</span>
                  <span>Zeitraum: Letzte 7 Tage</span>
                </div>
              </div>

              {/* Sentiment over time */}
              <div className="chart-container">
                <h3 className="mb-1 text-sm font-semibold text-[#202124]">
                  Sentiment über Zeit
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Tägliche Sentiment-Verteilung: Positiv, Negativ und Neutral.
                </p>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sentimentTimeData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f3f4"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#5f6368", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#5f6368", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #dadce0",
                          borderRadius: 8,
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="positive"
                        stroke="#1a73e8"
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
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#1a73e8" }} />
                    <span>Positiv</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                    <span>Negativ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#9ca3af" }} />
                    <span>Neutral</span>
                  </div>
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
        {!isLoading && activeTab === "analysis" && (
          <AnalysisTab
            data={data}
            onGenerateResponse={handleGenerateResponse}
            onImproveResponse={handleImproveResponse}
          />
        )}

        {/* Sources Tab */}
        {!isLoading && activeTab === "sources" && <SourcesTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#dadce0] bg-white">
        <div
          className="mx-auto max-w-[1400px] px-6 py-4 text-center text-xs text-[#5f6368]"
          suppressHydrationWarning
        >
          VibeAgent — Politisches Monitoring Dashboard | Letzte Aktualisierung:{" "}
          {new Date().toLocaleString("de-DE")}
        </div>
      </footer>
    </div>
  );
}
