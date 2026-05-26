"use client";

import { usePageTransition } from "@/components/page-transition";

// Invisible top-left tap zone that smoothly cross-fades to another route.
// Used for cross-brand navigation between /f1 and /loreal.
export function CornerTap({ to }: { to: string }) {
  const { navigateTo } = usePageTransition();
  return (
    <button
      type="button"
      aria-label="Switch brand"
      onClick={() => navigateTo(to)}
      className="absolute left-0 top-0 z-30 h-20 w-20 cursor-pointer bg-transparent"
    />
  );
}
