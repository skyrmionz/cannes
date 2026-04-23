"use client";

import { TransitionProvider, usePageTransition } from "@/components/page-transition";

function LorealContent() {
  const { navigateTo } = usePageTransition();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <h1 className="text-5xl font-semibold text-white">L&apos;Oréal Experience</h1>
      <p className="mt-4 text-neutral-400">Coming soon</p>
      <button
        onClick={() => navigateTo("/")}
        className="mt-8 rounded-lg border border-neutral-700 px-6 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
      >
        Back
      </button>
    </div>
  );
}

export default function LorealPage() {
  return (
    <TransitionProvider>
      <LorealContent />
    </TransitionProvider>
  );
}
