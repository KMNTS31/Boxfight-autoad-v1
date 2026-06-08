import { useEffect, useRef } from "react";

export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      if (ref.current) {
        ref.current.style.transform = `translate(${cx - 300}px, ${cy - 300}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-0 select-none"
      style={{
        width: 600,
        height: 600,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at center, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 35%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
