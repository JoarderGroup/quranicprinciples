import type { ReactNode } from "react";
import MonoLabel from "./MonoLabel";

/** Contract §Layout: a mono --signal label sits above every H2. */
export default function SectionLabel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <MonoLabel as="p" className={`text-signal ${className}`}>
      {children}
    </MonoLabel>
  );
}
