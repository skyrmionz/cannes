import { cn } from "@/lib/utils";

export function DotBg() {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#0a0a0a] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    </>
  );
}
