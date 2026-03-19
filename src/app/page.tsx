"use client";

import Link from "next/link";
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
  Shield,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Echtzeit-Monitoring",
    description:
      "65+ Schweizer Nachrichtenquellen und 8 Social-Media-Plattformen. Von der NZZ bis TikTok — nichts entgeht Ihnen.",
  },
  {
    icon: Brain,
    title: "KI-Sentiment-Analyse",
    description:
      "GPT-4o analysiert jede Erwähnung: Sentiment, Themen, Viralität. Erkennen Sie Krisen, bevor sie eskalieren.",
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
      "Erkennen Sie die wichtigsten Themen in Ihrem Wahlkreis. Trends und Handlungsbedarf auf einen Blick.",
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

const mediaBadges = [
  "NZZ",
  "Tages-Anzeiger",
  "20 Minuten",
  "SRF",
  "Blick",
  "Watson",
  "Le Temps",
  "Corriere del Ticino",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#644a40]">
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#644a40]">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              VibeAgent
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-[#666] transition-colors hover:text-[#644a40]"
            >
              Features
            </a>
            <a
              href="#preise"
              className="text-sm text-[#666] transition-colors hover:text-[#644a40]"
            >
              Preise
            </a>
            <a
              href="#kontakt"
              className="text-sm text-[#666] transition-colors hover:text-[#644a40]"
            >
              Kontakt
            </a>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg bg-[#644a40] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#333]"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24 md:pt-32">
        {/* Grid Background */}
        <div
          className="absolute inset-0 -z-10 h-[600px] w-full opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
            maskImage:
              "radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)",
          }}
        />

        {/* Radial Gradient Accent */}
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-50 via-transparent to-transparent opacity-80" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[#666] shadow-sm">
            <Zap className="h-3.5 w-3.5 text-[#644a40]" />
            Jetzt für Schweizer Politiker verfügbar
            <ChevronRight className="h-3.5 w-3.5" />
          </div>

          <h1 className="mb-6 text-5xl font-semibold leading-[1.1] tracking-tight text-[#644a40] md:text-7xl">
            Ihr politisches
            <br />
            <span className="bg-gradient-to-r from-[#644a40] via-[#444] to-[#999] bg-clip-text text-transparent">
              Frühwarnsystem
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#666] md:text-xl">
            Überwachen Sie alle Schweizer Medien und Social-Media-Plattformen in
            Echtzeit. KI-gestützte Analyse und automatische Antwortvorschläge.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-[#644a40] px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-black/10 transition-all hover:bg-[#333] hover:shadow-xl"
            >
              Kostenlos testen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-7 py-3.5 text-sm font-medium text-[#644a40] transition-all hover:border-[#ccc] hover:bg-[#fafafa]"
            >
              Mehr erfahren
            </a>
          </div>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-2xl shadow-black/5 ring-1 ring-black/5">
            <div className="rounded-lg bg-[#fafafa] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#e5e5e5]" />
                  <div className="h-3 w-3 rounded-full bg-[#e5e5e5]" />
                  <div className="h-3 w-3 rounded-full bg-[#e5e5e5]" />
                </div>
                <div className="h-6 w-64 rounded-md bg-[#e5e5e5]" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {["Erwähnungen", "Positiv", "Negativ", "Antworten"].map(
                  (label) => (
                    <div
                      key={label}
                      className="rounded-lg border border-[#e5e5e5] bg-white p-4"
                    >
                      <div className="text-xs text-[#999]">{label}</div>
                      <div className="mt-1 text-2xl font-semibold text-[#644a40]">
                        {label === "Positiv"
                          ? "40%"
                          : label === "Negativ"
                            ? "30%"
                            : label === "Antworten"
                              ? "3"
                              : "10"}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="col-span-2 h-32 rounded-lg border border-[#e5e5e5] bg-white" />
                <div className="h-32 rounded-lg border border-[#e5e5e5] bg-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ──────────────────────────────────────────────── */}
      <section className="border-y border-[#f0f0f0] bg-[#fafafa] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-[#999]">
            Überwacht Quellen von
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {mediaBadges.map((name) => (
              <span
                key={name}
                className="text-sm font-medium text-[#999] transition-colors hover:text-[#666]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Alles was Sie brauchen
            </h2>
            <p className="text-lg text-[#666]">
              Ein umfassendes Monitoring-Tool für die Schweizer Politlandschaft.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-[#f0f0f0] bg-white p-6 transition-all hover:border-[#e0e0e0] hover:shadow-lg hover:shadow-black/5"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f5f5] transition-colors group-hover:bg-[#644a40]">
                  <f.icon className="h-5 w-5 text-[#666] transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#666]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section className="border-y border-[#f0f0f0] bg-[#fafafa] px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            So funktioniert es
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#644a40] text-sm font-bold text-white">
                  {s.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[#666]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold tracking-tight md:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-[#666]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section
        id="preise"
        className="border-y border-[#f0f0f0] bg-[#fafafa] px-6 py-24"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Einfache, transparente Preise
          </h2>
          <p className="mb-16 text-center text-lg text-[#666]">
            Starten Sie kostenlos. Upgraden Sie wenn nötig.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-xl border p-8 transition-all ${
                  p.highlighted
                    ? "border-[#644a40] bg-white shadow-xl shadow-black/10"
                    : "border-[#e5e5e5] bg-white hover:border-[#ccc] hover:shadow-lg hover:shadow-black/5"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#644a40] px-4 py-1 text-xs font-medium text-white">
                    {p.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">{p.price}</span>
                    {p.period && (
                      <span className="text-sm text-[#666]">{p.period}</span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-[#644a40]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={p.ctaLink}
                  className={`block rounded-lg py-3 text-center text-sm font-medium transition-all ${
                    p.highlighted
                      ? "bg-[#644a40] text-white hover:bg-[#333]"
                      : "border border-[#e5e5e5] text-[#644a40] hover:bg-[#f5f5f5]"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24" id="kontakt">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Bereit, Ihren Wahlkreis besser zu verstehen?
          </h2>
          <p className="mb-10 text-lg text-[#666]">
            Starten Sie jetzt kostenlos — keine Kreditkarte nötig.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-[#644a40] px-8 py-4 text-base font-medium text-white shadow-lg shadow-black/10 transition-all hover:bg-[#333] hover:shadow-xl"
          >
            Dashboard öffnen
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#f0f0f0] bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#644a40]">
                <span className="text-xs font-bold text-white">V</span>
              </div>
              <span className="font-semibold">VibeAgent</span>
            </div>
            <p className="text-sm leading-relaxed text-[#999]">
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
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#999]">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#666] transition-colors hover:text-[#644a40]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-[#f0f0f0] pt-8 text-center text-xs text-[#999]">
          © 2026 VibeAgent. Made in Switzerland.
        </div>
      </footer>
    </div>
  );
}
