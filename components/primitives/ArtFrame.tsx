import type { ReactNode } from "react";

/**
 * Placeholder illustration frame. Real illustration is BLOCKED on
 * docs/DEPICTION-RULE.md (decision D1) — this ships the correct aspect
 * ratio and caption-box position with a deep→signal field, the placeholder
 * grammar boards 03/05 use. Never animated (contract §Motion).
 */
export default function ArtFrame({
  ratio = "16/10",
  caption,
  overlay,
  className = "",
}: {
  /** CSS aspect-ratio value, e.g. "16/10", "1/1". */
  ratio?: string;
  /** Mono caption bar pinned to the bottom edge. */
  caption?: ReactNode;
  /** Free-positioned content over the frame (comic caption boxes). */
  overlay?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-deep ${className}`} style={{ aspectRatio: ratio }}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 85% 100%, var(--signal) 0%, transparent 55%), linear-gradient(135deg, var(--deep) 30%, var(--ink) 100%)",
        }}
      />
      {overlay}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-ink px-4 py-2 text-paper">
          {caption}
        </div>
      )}
    </div>
  );
}
