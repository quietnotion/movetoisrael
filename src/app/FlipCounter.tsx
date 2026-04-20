"use client";

import { useEffect, useRef, useState } from "react";

function useAnimatedCount(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const startedFrom = useRef(0);
  useEffect(() => {
    const from = startedFrom.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else startedFrom.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function FlipCounter({ initialTotal }: { initialTotal: number }) {
  const [total, setTotal] = useState<number>(initialTotal);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.total === "number") setTotal(data.total);
      } catch {}
    };
    const id = setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const animated = useAnimatedCount(total);
  const digits = animated.toLocaleString().split("");

  return (
    <div className="inline-flex items-center gap-2 bg-black/40 ring-1 ring-[#FFCB05]/30 rounded px-3 py-1 text-[#FFCB05]">
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/70">
        Runs
      </span>
      <div className="flex gap-[2px]" aria-live="polite" aria-label={`${total} calculations run`}>
        {digits.map((d, i) =>
          /[0-9]/.test(d) ? <FlipDigit key={i} digit={d} /> : (
            <span key={i} className="text-[#FFCB05]/80 px-[1px] text-sm font-bold leading-none self-center">{d}</span>
          )
        )}
      </div>
    </div>
  );
}

function FlipDigit({ digit }: { digit: string }) {
  return (
    <span
      className="relative inline-block bg-[#00274C] text-[#FFCB05] font-bold tabular-nums text-sm leading-none w-[0.8em] text-center rounded-[2px] py-[3px] border border-[#FFCB05]/20 shadow-[inset_0_-1px_0_rgba(0,0,0,0.6),_inset_0_1px_0_rgba(255,255,255,0.05)]"
      style={{ perspective: "60px" }}
      key={digit}
    >
      <span className="flip-in inline-block">{digit}</span>
    </span>
  );
}
