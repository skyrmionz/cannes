"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { DotBg } from "@/components/f1/dot-bg";
import { LogoHeader } from "@/components/f1/logo-header";
import { ResultScreen } from "@/components/f1/result-screen";
import { decodeF1ShareData, isShareExpired } from "@/lib/f1-share";

export default function SharedResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const decoded = useMemo(() => decodeF1ShareData(code), [code]);

  if (!decoded) {
    return <ErrorShell title="This share link is invalid." />;
  }
  if (isShareExpired(decoded.timestamp)) {
    return (
      <ErrorShell
        title="This link has expired."
        subtitle="Shared podium moments only live for one hour. Head back to the main experience to make a new one."
      />
    );
  }

  return (
    <ResultScreen
      driverName={decoded.driverName}
      team={decoded.team}
      persona={decoded.persona}
      mp3Url={decoded.mp3Url}
      onStartOver={() => {
        window.location.href = "/f1";
      }}
      sharedView
    />
  );
}

function ErrorShell({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] px-4">
      <DotBg />
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
        <Link
          href="/f1"
          className="mt-10 rounded-sm border border-neutral-700 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-[#E10600] hover:text-white"
        >
          Start your engine
        </Link>
      </div>
    </div>
  );
}
