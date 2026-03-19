"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TextLoop } from "@/components/ui/text-loop";
import Link from "next/link";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950 dark:text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    title = "Background Paths",
    subtitle,
}: {
    title?: string;
    subtitle?: string;
}) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 opacity-40">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight font-sans">
                        {words.map((word, wordIndex) => (
                            <motion.span
                                key={wordIndex}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    delay: wordIndex * 0.15,
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 25,
                                }}
                                className="inline-block mr-3 last:mr-0 text-transparent bg-clip-text
                                bg-gradient-to-r from-neutral-900 to-neutral-700/80
                                dark:from-white dark:to-white/80"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    <div className="mb-10 mx-auto max-w-xl text-lg leading-relaxed font-sans text-center">
                        <TextLoop interval={3}>
                            <span className="rounded-full bg-background/80 backdrop-blur-md px-5 py-2 text-foreground/70">Alle Schweizer Medien in Echtzeit überwachen</span>
                            <span className="rounded-full bg-background/80 backdrop-blur-md px-5 py-2 text-foreground/70">KI-gestützte Sentiment-Analyse mit GPT-4o</span>
                            <span className="rounded-full bg-background/80 backdrop-blur-md px-5 py-2 text-foreground/70">Automatische Antwortvorschläge auf Knopfdruck</span>
                            <span className="rounded-full bg-background/80 backdrop-blur-md px-5 py-2 text-foreground/70">65+ Nachrichtenquellen &amp; 8 Social-Media-Plattformen</span>
                            <span className="rounded-full bg-background/80 backdrop-blur-md px-5 py-2 text-foreground/70">26 Kantone — 4 Sprachen — lückenlose Abdeckung</span>
                        </TextLoop>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 font-sans"
                        >
                            Kostenlos testen
                            <span>→</span>
                        </Link>
                        <a
                            href="#features"
                            className="inline-flex items-center rounded-lg border border-border bg-card/80 backdrop-blur-md px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-accent font-sans"
                        >
                            Mehr erfahren
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
