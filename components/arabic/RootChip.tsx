import Bidi from "./Bidi";
import MonoLabel from "@/components/primitives/MonoLabel";

/** Source line fragment: `ROOT و-ز-ن · 23 OCCURRENCES` — the Arabic root is
 * bidi-isolated so the run never reorders. */
export default function RootChip({
  root,
  occurrences,
  className = "",
}: {
  root: string;
  occurrences?: number;
  className?: string;
}) {
  return (
    <MonoLabel className={className}>
      root <Bidi className="font-arabic-ui text-[12px] normal-case tracking-normal">{root}</Bidi>
      {typeof occurrences === "number" && <> &middot; {occurrences} occurrences</>}
    </MonoLabel>
  );
}
