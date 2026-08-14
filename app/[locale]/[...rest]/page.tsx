import { notFound } from "next/navigation";

/** Routes not built yet (archive, about, /d/*, /source) 404 into the
 * localized not-found — they belong to later phases. */
export default function CatchAll() {
  notFound();
}
