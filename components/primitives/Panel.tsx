import type { ElementType, ReactNode } from "react";

/** Contract §Layout: panels butt against each other over a --rule background.
 * No rounded corners, no drop shadows on content. */
export default function Panel({
  as: Tag = "div",
  surface = "paper",
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  surface?: "paper" | "recessed" | "ink";
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  const bg =
    surface === "ink"
      ? "bg-ink text-paper"
      : surface === "recessed"
        ? "bg-paper-2"
        : "bg-paper";
  return (
    <Tag className={`${bg} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
