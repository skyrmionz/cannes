"use client";

import { useMemo } from "react";
import { use } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Sparkle, Droplet, FlaskConical, ShieldCheck, type LucideIcon } from "lucide-react";
import { GlassBackground } from "@/components/ui/glass-background";
import {
  decodeResultData,
  isExpired,
  getRecommendations,
  type LorealProduct,
} from "@/lib/loreal-products";

const categoryIcons: Record<string, LucideIcon> = {
  cleanser: Sparkle,
  moisturizer: Droplet,
  serum: FlaskConical,
  sunscreen: ShieldCheck,
};

export default function ResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const data = useMemo(() => decodeResultData(code), [code]);
  const expired = data ? isExpired(data.timestamp) : false;

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <Image
          src="/logos/loreal.png"
          alt="L'Oréal"
          width={160}
          height={60}
          className="mb-8 h-12 w-auto brightness-0"
        />
        <p className="text-center font-serif text-lg text-neutral-500">
          This link is invalid. Please visit the consultation booth to start a
          new session.
        </p>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <Image
          src="/logos/loreal.png"
          alt="L'Oréal"
          width={160}
          height={60}
          className="mb-8 h-12 w-auto brightness-0"
        />
        <p className="text-center font-serif text-lg text-neutral-500">
          This beauty kit code has expired. Please visit the consultation booth
          to start a new session.
        </p>
      </div>
    );
  }

  const products = getRecommendations(
    data.skinRoutine,
    data.skinType,
    data.preferredProduct
  );

  return (
    <GlassBackground
      containerClassName="!h-auto min-h-screen"
      className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/logos/loreal.png"
          alt="L'Oréal"
          width={160}
          height={60}
          className="mb-8 h-12 w-auto brightness-0"
        />
      </motion.div>

      <motion.h1
        className="text-center font-serif text-2xl font-light tracking-wide text-neutral-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Beauty Kit for{" "}
        <span className="text-[#C8A96E]">{data.name}</span>
      </motion.h1>

      <motion.p
        className="mt-3 max-w-sm text-center text-sm leading-relaxed text-neutral-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        Head on over to the Agentforce L&apos;ORÉAL gift booth to receive
        your personalized gift.
      </motion.p>

      <motion.div
        className="mt-6 w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-neutral-400">
          Your recommended products
        </p>
        <div className="space-y-1.5">
          {products.map((product: LorealProduct, i: number) => {
            const Icon = categoryIcons[product.category] ?? Sparkle;
            return (
              <motion.div
                key={product.id}
                className="flex items-center gap-3 rounded-sm border border-neutral-200 bg-white/80 px-4 py-2.5 backdrop-blur-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#C8A96E]" strokeWidth={1.5} />
                <span className="font-serif text-sm text-neutral-700">
                  {product.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </GlassBackground>
  );
}
