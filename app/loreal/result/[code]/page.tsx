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
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: LOREAL_GRADIENT }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center px-5 pt-8 pb-8 text-[#001050] sm:px-6 sm:pt-10 sm:pb-10">
        <Image
          src="/loreal/loreal-logo.png"
          alt="L'Oréal"
          width={600}
          height={160}
          priority
          className="h-auto shrink-0 select-none"
          style={{ width: "min(38vw, 14vh)" }}
        />

        <motion.h1
          className="mt-6 text-center font-bold leading-[1.05] tracking-tight"
          style={{ fontSize: "clamp(1.4rem, 6.4vw, 2.4rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        >
          Your persona is{" "}
          <span className="whitespace-nowrap">{data.persona}.</span>
        </motion.h1>

        <motion.p
          className="mt-3 w-full max-w-xl text-center leading-snug text-[#001050]/80"
          style={{
            fontSize: "clamp(0.85rem, 3.2vw, 1.05rem)",
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
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
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
                width: "min(56vw, 34vh)",
                filter: "drop-shadow(0 20px 40px rgba(60,120,240,0.22))",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Spacer pushes the confirmation code block to the bottom. */}
        <div className="flex-1" />

        {/* Confirmation code — centered at the bottom, no container, no left text. */}
        <motion.div
          className="mt-6 flex w-full flex-col items-center text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        >
          <span
            className="block font-bold tracking-[0.22em] text-[#001050]"
            style={{ fontSize: "clamp(2rem, 9vw, 3.2rem)" }}
          >
            {data.code}
          </span>
          <span
            className="mt-2 block text-[11px] uppercase tracking-[0.22em] text-[#001050]/55"
            style={{
              fontFamily:
                'system-ui, -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Your Confirmation Code
          </span>
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
