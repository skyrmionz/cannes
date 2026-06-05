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

  // Re-derive status from the encoded answer trio so the page always paints
  // the current matrix's title/description/image (instead of trusting the
  // possibly-stale strings stored in the link payload).
  const status = getStatus(data.sun, data.hydration, data.agenda);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden text-[#001050]"
      style={{ background: LOREAL_GRADIENT }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 pt-8 pb-10 sm:px-6 sm:pt-10 sm:pb-14">
        {/* White status card */}
        <motion.div
          className="w-full rounded-[28px] bg-white"
          style={{
            padding: "20px 22px",
            boxShadow: [
              "0 0 0 1px rgba(0,16,80,0.05)",
              "0 18px 40px rgba(120,160,220,0.22)",
            ].join(", "),
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: "easeOut" }}
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
              style={{ width: "clamp(40px, 12vw, 56px)" }}
            />
            <div className="flex min-w-0 flex-col">
              <span
                className="font-semibold leading-tight text-[#001050]"
                style={{
                  fontSize: "clamp(0.95rem, 4vw, 1.1rem)",
                  fontFamily:
                    'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                }}
              >
                Your status
              </span>
              <h1
                className="mt-1 font-bold leading-[1.1] tracking-tight text-[#001050]"
                style={{ fontSize: "clamp(1.5rem, 7vw, 2.1rem)" }}
              >
                {status.title.replace(/^OOO\s+/, "OOO ")}
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Status icon — large, centered */}
        <motion.div
          className="mt-6 flex w-full justify-center"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
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
            style={{ width: "min(82vw, 420px)" }}
          />
        </motion.div>

        {/* Description */}
        <motion.p
          className="mt-6 w-full text-center font-semibold leading-snug text-[#001050]"
          style={{
            fontSize: "clamp(1.05rem, 4.4vw, 1.25rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            whiteSpace: "pre-line",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5, ease: "easeOut" }}
        >
          {status.description}
        </motion.p>

        {/* Salesforce Beach lockup */}
        <motion.div
          className="mt-auto flex w-full justify-center pt-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Image
            src="/loreal/salesforce-beach.png"
            alt="Salesforce Beach"
            width={416}
            height={33}
            priority
            draggable={false}
            className="h-auto select-none"
            style={{ width: "min(60vw, 240px)" }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function Fallback({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-6"
      style={{ background: LOREAL_GRADIENT }}
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
