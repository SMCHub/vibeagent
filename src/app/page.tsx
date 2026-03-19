"use client";

import Link from "next/link";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Logos3 } from "@/components/blocks/logos3";
import {
  Activity,
  BarChart3,
  MessageSquare,
  MapPin,
  AlertTriangle,
  Brain,
  ArrowRight,
  Check,
  ChevronRight,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Echtzeit-Monitoring",
    description:
      "65+ Schweizer Nachrichtenquellen und 8 Social-Media-Plattformen. Von der NZZ bis TikTok.",
  },
  {
    icon: Brain,
    title: "KI-Sentiment-Analyse",
    description:
      "GPT-4o analysiert jede Erwähnung: Sentiment, Themen, Viralität. Krisen erkennen, bevor sie eskalieren.",
  },
  {
    icon: MessageSquare,
    title: "Automatische Antworten",
    description:
      "Plattform-optimierte Antwortvorschläge auf Knopfdruck. Professionell und im richtigen Ton.",
  },
  {
    icon: MapPin,
    title: "26 Kantone abgedeckt",
    description:
      "Lokale Geo-Feeds für jeden Schweizer Kanton. Google News, RSS und regionale Medien.",
  },
  {
    icon: BarChart3,
    title: "Themen-Radar",
    description:
      "Die wichtigsten Themen in Ihrem Wahlkreis. Trends und Handlungsbedarf auf einen Blick.",
  },
  {
    icon: AlertTriangle,
    title: "Krisen-Erkennung",
    description:
      "Virale negative Erwähnungen lösen sofort Alarm aus. Reagieren Sie in Minuten statt Tagen.",
  },
];

const steps = [
  {
    num: "01",
    title: "Profil einrichten",
    desc: "Wählen Sie Kanton, Keywords und Plattformen. 2 Minuten Setup.",
  },
  {
    num: "02",
    title: "Quellen werden gescannt",
    desc: "Alle 30 Min durchsucht unser System 65+ Quellen und Social Media.",
  },
  {
    num: "03",
    title: "Briefing erhalten",
    desc: "Morgens liegt Ihr Dashboard bereit: Erwähnungen, Sentiment, Antwortvorschläge.",
  },
];

const stats = [
  { value: "65+", label: "Nachrichtenquellen" },
  { value: "8", label: "Social-Media-Plattformen" },
  { value: "26", label: "Kantone abgedeckt" },
  { value: "4", label: "Sprachen" },
];

const plans = [
  {
    name: "Starter",
    price: "CHF 49",
    period: "/Monat",
    features: [
      "1 Politiker-Profil",
      "5 Kantone",
      "News-Monitoring",
      "Basis-Sentiment",
    ],
    cta: "Kostenlos testen",
    ctaLink: "/dashboard",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "CHF 149",
    period: "/Monat",
    badge: "Beliebt",
    features: [
      "3 Politiker-Profile",
      "Alle 26 Kantone",
      "News + Social Media",
      "GPT-4o Analyse",
      "Antwortvorschläge",
      "Krisen-Alerts",
    ],
    cta: "Jetzt starten",
    ctaLink: "/dashboard",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Auf Anfrage",
    period: "",
    features: [
      "Unbegrenzte Profile",
      "Custom Quellen",
      "API-Zugang",
      "Dedicated Support",
      "White-Label Option",
    ],
    cta: "Kontakt aufnehmen",
    ctaLink: "#kontakt",
    highlighted: false,
  },
];

const LOGO_TOKEN = "pk_X-1ZO13GSgeOoUrIuJ6GMQ";
const logo = (domain: string) =>
  `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&format=png&size=60`;

const logoData = {
  heading: "Überwacht alle Schweizer Medien & Social Media",
  logos: [
    { id: "nzz", description: "NZZ", image: logo("nzz.ch"), className: "h-6 w-auto" },
    { id: "tagi", description: "Tages-Anzeiger", image: logo("tagesanzeiger.ch"), className: "h-6 w-auto" },
    { id: "20min", description: "20 Minuten", image: logo("20min.ch"), className: "h-6 w-auto" },
    { id: "srf", description: "SRF", image: logo("srf.ch"), className: "h-6 w-auto" },
    { id: "blick", description: "Blick", image: logo("blick.ch"), className: "h-6 w-auto" },
    { id: "watson", description: "Watson", image: logo("watson.ch"), className: "h-6 w-auto" },
    { id: "facebook", description: "Facebook", image: logo("facebook.com"), className: "h-6 w-auto" },
    { id: "instagram", description: "Instagram", image: logo("instagram.com"), className: "h-6 w-auto" },
    { id: "linkedin", description: "LinkedIn", image: logo("linkedin.com"), className: "h-6 w-auto" },
    { id: "twitter", description: "X", image: logo("x.com"), className: "h-6 w-auto" },
    { id: "youtube", description: "YouTube", image: logo("youtube.com"), className: "h-6 w-auto" },
    { id: "reddit", description: "Reddit", image: logo("reddit.com"), className: "h-6 w-auto" },
    { id: "tiktok", description: "TikTok", image: logo("tiktok.com"), className: "h-6 w-auto" },
    { id: "letemps", description: "Le Temps", image: logo("letemps.ch"), className: "h-6 w-auto" },
    { id: "rts", description: "RTS", image: logo("rts.ch"), className: "h-6 w-auto" },
    { id: "bernerzeitung", description: "Berner Zeitung", image: logo("bernerzeitung.ch"), className: "h-6 w-auto" },
    { id: "luzernerzeitung", description: "Luzerner Zeitung", image: logo("luzernerzeitung.ch"), className: "h-6 w-auto" },
    { id: "suedostschweiz", description: "Südostschweiz", image: logo("suedostschweiz.ch"), className: "h-6 w-auto" },
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">V</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">VibeAgent</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#preise" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Preise
            </a>
            <a href="#kontakt" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Kontakt
            </a>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Hero with BackgroundPaths ──────────────────────── */}
      <BackgroundPaths
        title="Politisches Frühwarnsystem"
        subtitle="Überwachen Sie alle Schweizer Medien und Social-Media-Plattformen in Echtzeit. KI-gestützte Analyse und automatische Antwortvorschläge."
      />

      {/* ── Logo Carousel ──────────────────────────────────── */}
      <Logos3 {...logoData} />

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Alles was Sie brauchen
            </h2>
            <p className="text-lg text-muted-foreground">
              Ein umfassendes Monitoring-Tool für die Schweizer Politlandschaft.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary">
                  <f.icon className="h-5 w-5 text-secondary-foreground transition-colors group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="border-y border-border bg-muted px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            So funktioniert es
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="preise" className="border-y border-border bg-muted px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Einfache, transparente Preise
          </h2>
          <p className="mb-16 text-center text-lg text-muted-foreground">
            Starten Sie kostenlos. Upgraden Sie wenn nötig.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-xl border p-8 transition-all ${
                  p.highlighted
                    ? "border-primary bg-card shadow-xl shadow-primary/10"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-lg"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                    {p.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">{p.price}</span>
                    {p.period && (
                      <span className="text-sm text-muted-foreground">{p.period}</span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={p.ctaLink}
                  className={`block rounded-lg py-3 text-center text-sm font-medium transition-all ${
                    p.highlighted
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="px-6 py-24" id="kontakt">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Bereit, Ihren Wahlkreis besser zu verstehen?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Starten Sie jetzt kostenlos — keine Kreditkarte nötig.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90"
          >
            Dashboard öffnen
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-primary-foreground">V</span>
              </div>
              <span className="font-semibold">VibeAgent</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Politisches Monitoring
              <br />
              für die Schweiz.
            </p>
          </div>

          {[
            {
              title: "Produkt",
              links: [
                { label: "Features", href: "#features" },
                { label: "Preise", href: "#preise" },
                { label: "Dashboard", href: "/dashboard" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Datenschutz", href: "#" },
                { label: "Impressum", href: "#" },
                { label: "AGB", href: "#" },
              ],
            },
            {
              title: "Kontakt",
              links: [
                { label: "info@vibeagent.ch", href: "mailto:info@vibeagent.ch" },
                { label: "Support", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © 2026 VibeAgent. Made in Switzerland.
        </div>
      </footer>
    </div>
  );
}
