"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Sparkle, Droplet, FlaskConical, ShieldCheck, type LucideIcon } from "lucide-react";
import { LogoHeader } from "@/components/loreal/logo-header";
import {
  getRecommendations,
  generateResultCode,
  encodeResultData,
  type LorealProduct,
} from "@/lib/loreal-products";

const categoryIcons: Record<string, LucideIcon> = {
  cleanser: Sparkle,
  moisturizer: Droplet,
  serum: FlaskConical,
  sunscreen: ShieldCheck,
};

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
  const { qrUrl, products } = useMemo(() => {
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
      qrUrl: `${origin}/loreal/result/${encoded}`,
      products: getRecommendations(skinRoutine, skinType, preferredProduct),
    };
  }, [name, skinRoutine, skinType, preferredProduct]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-lg flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <LogoHeader />
        </motion.div>

        <motion.h2
          className="text-center font-serif text-2xl font-light tracking-wide text-neutral-800 md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-[#C8A96E]">{name}</span>, your personal beauty
          kit is ready!
        </motion.h2>

        <motion.p
          className="mt-3 max-w-sm text-center text-sm leading-relaxed text-neutral-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Scan your QR code for more details.
        </motion.p>

        {/* QR Code + Products side by side */}
        <motion.div
          className="mt-6 flex w-full flex-col items-center gap-6 md:flex-row md:items-start md:justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <div className="w-full max-w-xs">
            <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-neutral-400 md:text-left">
              Your recommended products
            </p>
            <div className="flex items-start gap-5">
              <div className="shrink-0 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
                <QRCodeSVG
                  value={qrUrl}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="M"
                />
              </div>

              <div className="flex-1 space-y-1.5">
                {products.map((product: LorealProduct) => {
                  const Icon = categoryIcons[product.category] ?? Sparkle;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 rounded-sm border border-neutral-200 bg-white px-3 py-2"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#C8A96E]" strokeWidth={1.5} />
                      <span className="font-serif text-xs text-neutral-700">
                        {product.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={onStartOver}
          className="mt-6 rounded-sm border border-neutral-300 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:border-[#C8A96E] hover:text-neutral-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Start Over
        </motion.button>
      </div>
    </div>
  );
}
