"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * The only entrance animation on the site — contract §Motion:
 * 700ms, cubic-bezier(.2,.7,.3,1), 14px rise, 60ms stagger, never more than
 * six in a chain. Reveals only, never illustrations.
 * prefers-reduced-motion renders static, no exceptions.
 */
export default function Reveal({
  index = 0,
  className = "",
  children,
}: {
  /** Position in a stagger chain. Clamped to 6 (contract). */
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.7,
        ease: [0.2, 0.7, 0.3, 1],
        delay: Math.min(index, 5) * 0.06,
      }}
    >
      {children}
    </motion.div>
  );
}
