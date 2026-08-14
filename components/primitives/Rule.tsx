/** Contract §Layout: 1px --rule hairline; 3px --ink marks a major break;
 * 3px --signal bounds a pull quote. */
export default function Rule({
  weight = "hairline",
  className = "",
}: {
  weight?: "hairline" | "major" | "signal";
  className?: string;
}) {
  const style =
    weight === "major"
      ? "border-t-[3px] border-ink"
      : weight === "signal"
        ? "border-t-[3px] border-signal"
        : "border-t border-rule";
  return <hr className={`m-0 border-0 ${style} ${className}`} />;
}
