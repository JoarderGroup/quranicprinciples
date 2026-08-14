import type { SupabaseClient } from "@supabase/supabase-js";

import type { CommandType, Faculty } from "@/lib/types";

export interface SoulIndexBucket<T extends string | number> {
  count: number;
  essay_ids: string[];
}

export interface FacultyBucket extends SoulIndexBucket<Faculty> {
  faculty: Faculty;
}

export interface CommandBucket extends SoulIndexBucket<CommandType> {
  command_type: CommandType;
}

export interface SurahBucket extends SoulIndexBucket<number> {
  surah: number;
}

/** Every count is sourced from published principles with an approved rendering. */
export interface SoulIndexAggregate {
  total_commands: number;
  total_published_essays: number;
  distinct_faculties: number;
  essay_ids: string[];
  faculty: FacultyBucket[];
  command_type: CommandBucket[];
  surah: SurahBucket[];
}

/**
 * Calls the security-invoker RPC. It deliberately does not aggregate in
 * TypeScript: the database is the authority for the published/approved gate.
 */
export async function getSoulIndexAggregate(
  client: SupabaseClient,
): Promise<SoulIndexAggregate> {
  const { data, error } = await client.rpc("soul_index_aggregate");

  if (error) throw error;
  return data as SoulIndexAggregate;
}
