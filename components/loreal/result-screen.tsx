"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { LogoHeader } from "./logo-header";
import { LorealBg } from "./loreal-bg";
import {
  getRecommendations,
  generateResultCode,
  encodeResultData,
  type LorealProduct,
} from "@/lib/loreal-products";

interface ResultScreenProps {
  name: string;
  skinRoutine: string;
  skinType: string;
  preferredProduct: string;
  onStartOver: () => void;
}

export function ResultScreen({
  name,
  skinRoutine,
  skinType,
  preferredProduct,
  onStartOver,
}: ResultScreenProps) {
  const { code, qrUrl, products } = useMemo(() => {
    const c = generateResultCode();
    const encoded = encodeResultData({
      name,
      skinRoutine,
      skinType,
      preferredProduct,
      code: c,
    });
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      code: c,
      qrUrl: `${origin}/loreal/result/${encoded}`,
      products: getRecommendations(skinRoutine, skinType, preferredProduct),
    };
  }, [name, skinRoutine, skinType, preferredProduct]);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-8">
      <LorealBg />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <LogoHeader className="mb-10" />
        </motion.div>

        <motion.h2
          className="text-center font-serif text-2xl font-light tracking-wide text-white md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-[#C8A96E]">{name}</span>, your personal beauty
          kit is ready!
        </motion.h2>

        <motion.p
          className="mt-4 max-w-sm text-center text-sm leading-relaxed text-neutral-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Head on over to the Agentforce L&apos;ORÉAL gift booth and show this
          code to receive your personalized gift.
        </motion.p>

        {/* QR Code */}
        <motion.div
          className="mt-8 rounded-lg bg-white p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <QRCodeSVG
            value={qrUrl}
            size={160}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="M"
          />
        </motion.div>

        {/* Short code */}
        <motion.p
          className="mt-4 font-mono text-2xl font-bold tracking-[0.3em] text-[#C8A96E]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          {code}
        </motion.p>

        {/* Product recommendations */}
        <motion.div
          className="mt-8 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-neutral-500">
            Your recommended products
          </p>
          <div className="grid grid-cols-2 gap-2">
            {products.map((product: LorealProduct) => (
              <div
                key={product.id}
                className="rounded-sm border border-neutral-800 bg-[#111] p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C8A96E]">
                  {product.line}
                </p>
                <p className="mt-1 font-serif text-sm leading-snug text-white">
                  {product.name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          onClick={onStartOver}
          className="mt-8 rounded-sm border border-neutral-700 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-[#C8A96E] hover:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          Start Over
        </motion.button>
      </div>
    </div>
  );
}
