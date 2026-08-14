/*
 * Supabase database types for the Phase 2 schema.
 *
 * Regenerate after applying migrations with:
 *   supabase gen types --linked --schema public > lib/database.types.ts
 *
 * The generated-schema verification is intentionally part of Phase 2's final
 * remote validation; this checked-in definition keeps all queries typed before
 * that live generation step.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Insert<Row> = Partial<Row>;
type Update<Row> = Partial<Row>;

export interface Database {
  public: {
    Tables: {
      profile: Table<{
        id: string;
        role: Database["public"]["Enums"]["user_role"];
        created_at: string;
      }>;
      department: Table<{
        id: string;
        key: string;
        name_ar: string;
        name_translit: string;
        name_en: string;
        name_bn: string;
        created_at: string;
      }>;
      principle: Table<{
        id: string;
        slug: string;
        issue_no: number;
        name_ar: string;
        name_translit: string;
        name_en: string;
        name_bn: string;
        root_letters: string;
        status: Database["public"]["Enums"]["publication_status"];
        published_at: string | null;
        created_at: string;
      }>;
      essay: Table<{
        id: string;
        principle_id: string;
        locale: Database["public"]["Enums"]["locale"];
        title: string;
        body_md: string;
        author: string;
        word_count: number;
        supersedes_id: string | null;
        submitted_by: string | null;
        created_at: string;
      }>;
      rendering: Table<{
        id: string;
        essay_id: string;
        depth: Database["public"]["Enums"]["rendering_depth"];
        locale: Database["public"]["Enums"]["locale"];
        body_md: string;
        approved_by: string | null;
        approved_at: string | null;
        created_at: string;
      }>;
      ayah_ref: Table<{
        id: string;
        essay_id: string;
        surah: number;
        ayah: number;
        root: string;
        translation_edition: string;
        created_at: string;
      }>;
      soul_tag: Table<{
        id: string;
        essay_id: string;
        command_type: Database["public"]["Enums"]["command_type"];
        faculty: Database["public"]["Enums"]["faculty"];
        ayah_ref_id: string;
        created_at: string;
      }>;
      card: Table<{
        id: string;
        principle_id: string;
        rendering_id: string;
        ratio: Database["public"]["Enums"]["card_ratio"];
        locale: Database["public"]["Enums"]["locale"];
        image_path: string;
        generated_at: string;
        created_at: string;
      }>;
      issue: Table<{
        id: string;
        number: number;
        title: string;
        principle_id: string;
        published_at: string | null;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      soul_index_aggregate: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
    Enums: {
      locale: "en" | "ar" | "bn";
      publication_status: "draft" | "published";
      rendering_depth: "seed" | "spark" | "story" | "source";
      command_type: "amr" | "nahy" | "wasiyyah";
      faculty: "qalb" | "nafs" | "aql" | "lisan" | "basar" | "sam" | "yad" | "jawarih";
      card_ratio: "9:16" | "1:1" | "4:5" | "a4";
      user_role: "owner" | "editor" | "rawi";
    };
    CompositeTypes: Record<string, never>;
  };
}

type Table<Row> = {
  Row: Row;
  Insert: Insert<Row>;
  Update: Update<Row>;
  Relationships: [];
};
