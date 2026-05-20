// Animated mesh overlay on top of the F1 Formula 1 Gradient from Figma:
// #022AC0 at 35% → #066AFE at 68% → #00B3FF at 100%, linear top-to-bottom.
export const F1_GRADIENT = "linear-gradient(180deg, #022AC0 0%, #066AFE 55%, #00B3FF 100%)";

export function DotBg() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: F1_GRADIENT }}
    >
      {/* Blob 1 — top-left */}
      <div
        className="absolute rounded-full opacity-30"
        style={{
          width: "80vw",
          height: "80vw",
          top: "-20vw",
          left: "-20vw",
          background: "radial-gradient(circle at center, #066AFE 0%, transparent 70%)",
          animation: "moveInCircle 20s reverse infinite",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 2 — bottom-right */}
      <div
        className="absolute rounded-full opacity-25"
        style={{
          width: "70vw",
          height: "70vw",
          bottom: "-15vw",
          right: "-15vw",
          background: "radial-gradient(circle at center, #00B3FF 0%, transparent 70%)",
          animation: "moveInCircle 40s linear infinite",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 3 — center subtle */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: "60vw",
          height: "60vw",
          top: "20%",
          left: "20%",
          background: "radial-gradient(circle at center, #066AFE 0%, transparent 70%)",
          animation: "moveVertical 30s ease infinite",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
