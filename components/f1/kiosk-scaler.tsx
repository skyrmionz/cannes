"use client";

import { useEffect, useState } from "react";

const DESIGN_W = 1080;
const DESIGN_H = 1920;

export function KioskScaler({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: "absolute",
    top: 0,
    left: 0,
    width: DESIGN_W,
    height: DESIGN_H,
    transformOrigin: "top left",
    transform: "scale(1)",
  });

  useEffect(() => {
    function update() {
      const scale = Math.min(
        window.innerWidth / DESIGN_W,
        window.innerHeight / DESIGN_H
      );
      const left = (window.innerWidth - DESIGN_W * scale) / 2;
      const top = (window.innerHeight - DESIGN_H * scale) / 2;
      setStyle({
        position: "absolute",
        top,
        left,
        width: DESIGN_W,
        height: DESIGN_H,
        transformOrigin: "top left",
        transform: `scale(${scale})`,
      });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000", position: "relative" }}>
      <div style={style}>{children}</div>
    </div>
  );
}
