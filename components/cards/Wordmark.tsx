import MonoLabel from "@/components/primitives/MonoLabel";

/** "No watermark beyond the wordmark" (Prompt G §5) — the one mark every
 * exported card carries, regardless of type or ratio. */
export default function Wordmark({ className = "" }: { className?: string }) {
  return <MonoLabel className={`opacity-70 ${className}`}>quranicprinciples.com</MonoLabel>;
}
