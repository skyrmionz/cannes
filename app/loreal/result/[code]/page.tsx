"use client";

import { useMemo } from "react";
import { use } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  decodeLorealResult,
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
    return <Fallback message="This link is invalid. Please visit the L'Oréal booth to try again." />;
  }
  if (expired) {
    return <Fallback message="This gift link has expired. Please visit the L'Oréal booth for a new one." />;
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: LOREAL_GRADIENT }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center px-6 pt-10 pb-10 text-[#001050]">
        <Image
          src="/loreal/loreal-logo.png"
          alt="L'Oréal"
          width={600}
          height={160}
          priority
          className="h-auto select-none"
          style={{ width: "min(40vw, 18vh)" }}
        />

        <motion.h1
          className="mt-8 text-center font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(1.6rem, 7vw, 2.6rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        >
          Your persona is{" "}
          <span className="whitespace-nowrap">{data.persona}.</span>
        </motion.h1>

        <motion.p
          className="mt-3 max-w-xl text-center leading-snug text-[#001050]/80"
          style={{
            fontSize: "clamp(0.9rem, 3.4vw, 1.05rem)",
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5, ease: "easeOut" }}
        >
          {data.description}
        </motion.p>

        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.32, duration: 0.55, ease: "easeOut" }}
        >
          <Image
            src="/loreal/sunscreen-tube.png"
            alt="L'Oréal sunscreen"
            width={720}
            height={720}
            priority
            draggable={false}
            className="h-auto select-none"
            style={{
              width: "min(60vw, 36vh)",
              filter: "drop-shadow(0 20px 40px rgba(60,120,240,0.22))",
            }}
          />
        </motion.div>

        {/* Confirmation code card — replaces the QR slot in the kiosk view. */}
        <motion.div
          className="mt-6 flex w-full max-w-xl items-center justify-between gap-5 rounded-3xl bg-white/65 p-5"
          style={{
            boxShadow:
              "0 0 0 1px rgba(0,16,80,0.08), 0 12px 30px rgba(120,160,220,0.18)",
            WebkitBackdropFilter: "blur(12px) saturate(140%)",
            backdropFilter: "blur(12px) saturate(140%)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        >
          <p
            className="leading-snug"
            style={{
              fontSize: "clamp(0.9rem, 3.2vw, 1.05rem)",
              fontFamily:
                'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 500,
            }}
          >
            Show this code to one of our Brand Ambassadors at the L&rsquo;Oréal
            booth to claim your gift.
          </p>
          <div
            className="shrink-0 rounded-2xl bg-white px-4 py-3 text-center"
            style={{
              boxShadow: "0 0 0 1px rgba(0,16,80,0.1)",
            }}
          >
            <span
              className="block font-bold tracking-[0.18em] text-[#001050]"
              style={{ fontSize: "clamp(1.4rem, 5vw, 2rem)" }}
            >
              {data.code}
            </span>
            <span
              className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-[#001050]/55"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
              }}
            >
              Confirmation
            </span>
          </div>
        </motion.div>

        <p
          className="mt-6 text-center text-[11px] uppercase tracking-[0.22em] text-[#001050]/45"
          style={{
            fontFamily:
              'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
        >
          Powered by Agentforce on Salesforce · Valid for 24 hours
        </p>
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
      <Image
        src="/loreal/loreal-logo.png"
        alt="L'Oréal"
        width={600}
        height={160}
        priority
        className="mb-8 h-auto select-none"
        style={{ width: "min(40vw, 18vh)" }}
      />
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
