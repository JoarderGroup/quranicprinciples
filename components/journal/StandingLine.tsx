/** Permanent editorial furniture on every Journal page (Prompt I §2.6) —
 * not removable, not conditional. Tokens only, no new visual values. */
export default function StandingLine({ className = "" }: { className?: string }) {
  return (
    <p className={`font-editorial text-[15px] italic leading-[1.5] text-muted ${className}`}>
      Quranic Principles is a magazine, not a madrasa. We are readers and
      writers, not scholars. Nothing here is a ruling. Where we cite, check
      us.
    </p>
  );
}
