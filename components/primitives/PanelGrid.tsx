import type { ReactNode } from "react";

/** Panels separated by 1px --rule gutters: gap-px over a --rule background.
 * Children must be Panels (or carry their own surface colour). */
export default function PanelGrid({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`grid gap-px border border-rule bg-rule ${className}`}>
      {children}
    </div>
  );
}
