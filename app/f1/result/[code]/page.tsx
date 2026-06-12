"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { DotBg } from "@/components/f1/dot-bg";
import { LogoHeader } from "@/components/f1/logo-header";
import { ResultScreen } from "@/components/f1/result-screen";

interface ShareResponse {
  driverName: string;
  team: string;
  persona: string;
  songUrl: string;
  commentaryUrl: string | null;
  videoUrl: string | null;
  expiresAt: string;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ok"; data: ShareResponse }
  | { kind: "not_found" }
  | { kind: "error"; message: string };

export default function SharedResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  // Record QR scan — fire-and-forget
  useEffect(() => {
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => {});
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll(isFirstLoad: boolean) {
      try {
        const res = await fetch(`/api/share/${code}`);
        if (cancelled) return;
        if (res.status === 404) { setState({ kind: "not_found" }); return; }
        if (!res.ok) { setState({ kind: "error", message: `HTTP ${res.status}` }); return; }
        const data = (await res.json()) as ShareResponse;
        setState({ kind: "ok", data });
        // Keep polling until video is ready (render takes ~30s server-side)
        if (!data.videoUrl) {
          timer = setTimeout(() => { if (!cancelled) poll(false); }, 4000);
        }
      } catch (err) {
        if (cancelled) return;
        if (isFirstLoad) {
          setState({ kind: "error", message: err instanceof Error ? err.message : "unknown error" });
        }
        // On poll errors after first load, retry silently
        else { timer = setTimeout(() => { if (!cancelled) poll(false); }, 6000); }
      }
    }

    poll(true);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [code]);

  if (state.kind === "loading") {
    return <Shell title="Loading your podium..." />;
  }
  if (state.kind === "not_found") {
    return (
      <Shell
        title="This link has expired."
        subtitle="Shared podium moments only live for one hour. Head back to the main experience to make a new one."
        showBack
      />
    );
  }
  if (state.kind === "error") {
    return (
      <Shell
        title="Something went wrong."
        subtitle={state.message}
        showBack
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#022AC0]">
      <ResultScreen
        driverName={state.data.driverName}
        team={state.data.team}
        persona={state.data.persona}
        songUrl={state.data.songUrl}
        commentaryUrl={state.data.commentaryUrl}
        videoUrl={state.data.videoUrl}
        grandPrix={null}
        celebration={null}
        onStartOver={() => { window.location.href = "/f1"; }}
        sharedView
      />
    </div>
  );
}

function Shell({
  title,
  subtitle,
  showBack,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#022AC0] px-4">
      <DotBg wave />
      <div className="relative z-10 pt-8">
        <LogoHeader className="justify-center" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <motion.h2
          className="text-2xl font-semibold uppercase tracking-[0.15em] text-white md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            className="mt-4 max-w-md text-sm text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}
        {showBack && (
          <Link
            href="/f1"
            className="mt-10 rounded-sm border border-neutral-700 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-[#E10600] hover:text-white"
          >
            Start your engine
          </Link>
        )}
      </div>
    </div>
  );
}
