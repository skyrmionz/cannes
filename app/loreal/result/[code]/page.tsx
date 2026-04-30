"use client";

import { useMemo } from "react";
import { use } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Sparkle, Droplet, FlaskConical, ShieldCheck, type LucideIcon } from "lucide-react";
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
          className="mb-8 h-12 w-auto"
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
          className="mb-8 h-12 w-auto"
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
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,169,110,0.06)_0%,transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center px-4 py-10">
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
            className="mb-10 h-12 w-auto"
          />
        </motion.div>

        {/* Code display */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Your code
          </p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.3em] text-[#C8A96E]">
            {data.code}
          </p>
        </motion.div>

        {/* Personalized heading */}
        <motion.h1
          className="mt-8 text-center font-serif text-2xl font-light tracking-wide text-neutral-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          Beauty Kit for{" "}
          <span className="text-[#C8A96E]">{data.name}</span>
        </motion.h1>

        <motion.p
          className="mt-3 max-w-sm text-center text-sm leading-relaxed text-neutral-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Head on over to the Agentforce L&apos;ORÉAL gift booth and show this
          code to receive your personalized gift.
        </motion.p>

        {/* Product list */}
        <motion.div
          className="mt-8 w-full max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-neutral-400">
            Your recommended products
          </p>
          <div className="space-y-2">
            {products.map((product: LorealProduct, i: number) => {
              const Icon = categoryIcons[product.category] ?? Sparkle;
              return (
                <motion.div
                  key={product.id}
                  className="flex items-center gap-3 rounded-sm border border-neutral-200 bg-white px-4 py-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#C8A96E]" strokeWidth={1.5} />
                  <span className="font-serif text-sm text-neutral-700">
                    {product.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
