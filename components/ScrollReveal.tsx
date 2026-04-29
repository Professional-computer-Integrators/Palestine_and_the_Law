"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "left" | "right" | "fade";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dirMap: Record<string, string> = {
      up:    "translateY(40px)",
      left:  "translateX(-40px)",
      right: "translateX(40px)",
      fade:  "",
    };

    const hidden = () => {
      el.style.opacity = "0";
      el.style.transform = dirMap[direction] ?? "";
      el.style.transition = "none";
    };

    const visible = () => {
      // allow one frame so the "hidden" state is painted before transitioning
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`;
          el.style.opacity = "1";
          el.style.transform = "";
        });
      });
    };

    hidden();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible();
        } else {
          hidden();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
