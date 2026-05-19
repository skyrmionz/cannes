// Blue animated mesh gradient — replaces the dark dot grid
export function DotBg() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#001050" }}
    >
      {/* Blob 1 — top-left, large blue */}
      <div
        className="absolute rounded-full opacity-60"
        style={{
          width: "80vw",
          height: "80vw",
          top: "-20vw",
          left: "-20vw",
          background:
            "radial-gradient(circle at center, #0057FF 0%, transparent 70%)",
          animation: "moveInCircle 20s reverse infinite",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 2 — bottom-right */}
      <div
        className="absolute rounded-full opacity-50"
        style={{
          width: "70vw",
          height: "70vw",
          bottom: "-15vw",
          right: "-15vw",
          background:
            "radial-gradient(circle at center, #003bb5 0%, transparent 70%)",
          animation: "moveInCircle 40s linear infinite",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 3 — center, subtle */}
      <div
        className="absolute rounded-full opacity-40"
        style={{
          width: "60vw",
          height: "60vw",
          top: "20%",
          left: "20%",
          background:
            "radial-gradient(circle at center, #1a44cc 0%, transparent 70%)",
          animation: "moveVertical 30s ease infinite",
          filter: "blur(80px)",
        }}
      />
      {/* Blob 4 — top-right accent */}
      <div
        className="absolute rounded-full opacity-30"
        style={{
          width: "50vw",
          height: "50vw",
          top: "-10vw",
          right: "-5vw",
          background:
            "radial-gradient(circle at center, #001a6e 0%, transparent 70%)",
          animation: "moveHorizontal 40s ease infinite",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
