"use client";

import { useMemo } from "react";
import { use } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  decodeLorealResult,
  getStatus,
  isLorealResultExpired,
} from "@/lib/loreal-personas";

const LOREAL_GRADIENT =
  "linear-gradient(180deg, #90D0FE 0%, #EAF5FE 62.02%, #FBF3E0 100%)";

// Lock the page to one viewport (no scroll) by sizing on dynamic viewport
// height (dvh) so iOS / Android browser chrome doesn't push content off.
const FULLPAGE_STYLE: React.CSSProperties = {
  background: LOREAL_GRADIENT,
  width: "100vw",
  height: "100dvh",
  overflow: "hidden",
  position: "fixed",
  inset: 0,
};

export default function ResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: encoded } = use(params);
  const data = useMemo(() => decodeLorealResult(encoded), [encoded]);
  const expired = data ? isLorealResultExpired(data.timestamp) : false;

  if (!data) {
    return (
      <Fallback message="This link is invalid. Please visit the L'Oréal booth to try again." />
    );
  }
  if (expired) {
    return (
      <Fallback message="This gift link has expired. Please visit the L'Oréal booth for a new one." />
    );
  }

  // Re-derive the status from the encoded inputs so the page always renders
  // the current matrix's title/description/image.
  const status = getStatus(data.sun, data.hydration, data.agenda);

  return (
    <div className="text-[#001050]" style={FULLPAGE_STYLE}>
      {/* Persistent glass card — same shell used by the kiosk so the unique
          link feels like a continuation of the kiosk experience. */}
      <div
        className="pointer-events-none absolute inset-3 z-0 rounded-[40px]"
        style={{
          WebkitBackdropFilter: "blur(10px) saturate(120%)",
          backdropFilter: "blur(10px) saturate(120%)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.16) 100%)",
          boxShadow: [
            "0 0 0 1px rgba(255,255,255,0.45) inset",
            "0 1px 0 rgba(255,255,255,0.65) inset",
            "0 18px 50px rgba(120,160,220,0.18)",
          ].join(", "),
        }}
      />

      {/* Content — flex column inset to match the glass card */}
      <div
        className="relative z-10 flex h-full w-full flex-col items-center"
        style={{ padding: "clamp(1.25rem, 4vh, 2rem) clamp(1rem, 4vw, 1.5rem)" }}
      >
        {/* Status card with revolving shimmer halo */}
        <motion.div
          className="relative w-full max-w-md shrink-0"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: "easeOut" }}
        >
          <span aria-hidden className="status-card-shimmer" />
          <div
            className="relative z-10 rounded-[28px] bg-white"
            style={{
              padding: "clamp(14px, 3.4vw, 20px) clamp(16px, 4vw, 22px)",
              boxShadow: [
                "0 0 0 1px rgba(0,16,80,0.05)",
                "0 18px 40px rgba(120,160,220,0.22)",
              ].join(", "),
            }}
          >
            <div className="flex items-start gap-3">
              <Image
                src="/loreal/icon-sun.png"
                alt=""
                width={778}
                height={774}
                priority
                draggable={false}
                className="h-auto shrink-0 select-none"
                style={{ width: "clamp(36px, 11vw, 52px)" }}
              />
              <div className="flex min-w-0 flex-col">
                <span
                  className="font-semibold leading-tight text-[#001050]"
                  style={{
                    fontSize: "clamp(0.85rem, 3.6vw, 1rem)",
                    fontFamily:
                      'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  Your status
                </span>
                <h1
                  className="mt-1 font-bold leading-[1.08] tracking-tight text-[#001050]"
                  style={{ fontSize: "clamp(1.3rem, 6.2vw, 1.95rem)" }}
                >
                  {status.title.replace(/^OOO\s+/, "OOO ")}
                </h1>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status icon — flex-1 wrapper so the icon owns the slack region
            between the card and the description, never pushing layout. */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
            className="flex w-full justify-center"
          >
            <Image
              src={status.image}
              alt={status.title}
              width={989}
              height={989}
              priority
              unoptimized
              draggable={false}
              className="h-auto select-none"
              style={{
                width: "min(72vw, 50vh, 380px)",
                maxHeight: "50vh",
                objectFit: "contain",
              }}
            />
          </motion.div>
        </div>

        {/* Description */}
        <motion.p
          className="w-full shrink-0 text-center font-semibold leading-snug text-[#001050]"
          style={{
            fontSize: "clamp(0.95rem, 3.8vw, 1.15rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            whiteSpace: "pre-line",
            paddingInline: "clamp(0.5rem, 3vw, 1.5rem)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5, ease: "easeOut" }}
        >
          {status.description}
        </motion.p>

        {/* Salesforce Beach lockup w/ cloud separator */}
        <motion.div
          className="mt-auto flex w-full shrink-0 items-center justify-center pt-4"
          style={{ marginTop: "clamp(1rem, 3vh, 2rem)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <SalesforceBeachLockup />
        </motion.div>
      </div>
    </div>
  );
}

// Salesforce + cloud + Beach. The cloud Vector.png slots into the empty
// space the wordmark already leaves between "Salesforce" and "Beach"
// (the source PNG was designed with that gap in mind).
function SalesforceBeachLockup() {
  return (
    <div
      className="relative inline-block select-none"
      style={{ width: "min(58vw, 240px)" }}
    >
      <Image
        src="/loreal/salesforce-beach.png"
        alt="Salesforce Beach"
        width={416}
        height={33}
        priority
        draggable={false}
        className="block h-auto w-full select-none"
      />
      {/* Cloud — absolutely centered horizontally, matched vertically to
          the wordmark x-height. width≈11% of the wordmark fits the gap. */}
      <Image
        src="/loreal/sf-cloud-vector.png"
        alt=""
        width={64}
        height={46}
        priority
        draggable={false}
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{
          left: "50%",
          top: "50%",
          width: "11%",
          height: "auto",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

function Fallback({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{ ...FULLPAGE_STYLE }}
    >
      <p
        className="max-w-md text-center leading-snug text-[#001050]/80"
        style={{
          fontSize: "clamp(0.95rem, 3.5vw, 1.1rem)",
          fontFamily:
            'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {message}
      </p>
    </div>
  );
}
