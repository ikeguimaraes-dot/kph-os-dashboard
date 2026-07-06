"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  format: (v: number) => string;
}

/** Anima de 0 ao valor em ~1s (ease-out). Com reduced-motion, valor direto. */
export function CountUp({ value, format }: CountUpProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState<number>(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, reduced]);

  return <span className="tabular-nums">{format(display)}</span>;
}
