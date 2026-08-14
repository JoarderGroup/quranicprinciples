import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Wiring only — no queries live in this codebase yet;
 * Codex owns the data layer (Phase 2).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
