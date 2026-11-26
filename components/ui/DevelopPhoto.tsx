"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The "picture develops" moment: the first time the photograph comes into view
 * it rises out of a faint grey print, darks first, then colour (1.6 s, once).
 * It only arms itself when motion is allowed and the photo is still below the
 * fold, so a reader who lands on it, prints it or has no script sees it as is.
 */
export default function DevelopPhoto({ children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.classList.add("develop-armed");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.remove("develop-armed");
        el.classList.add("develop-in");
        io.disconnect();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
