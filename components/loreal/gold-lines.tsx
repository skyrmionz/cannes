"use client";

export function GoldLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-20 top-[20%] h-px w-[140%] rotate-[25deg] bg-[#C8A96E]/[0.04]" />
      <div className="absolute -left-20 top-[45%] h-px w-[140%] rotate-[25deg] bg-[#C8A96E]/[0.06]" />
      <div className="absolute -left-20 top-[70%] h-px w-[140%] rotate-[25deg] bg-[#C8A96E]/[0.03]" />
      <div className="absolute -right-20 top-[35%] h-px w-[140%] -rotate-[25deg] bg-[#C8A96E]/[0.03]" />
    </div>
  );
}
