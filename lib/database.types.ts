/*
 * Supabase database types — generated, not hand-maintained.
 *
 * Regenerate after applying migrations:
 *   supabase gen types typescript --local > lib/database.types.ts
 *
 * This file previously carried a hand-written approximation (Phase 2) that
 * had drifted from the real schema — missing essay.supersedes_id,
 * essay.submitted_by, card.rendering_id, and the profile/user_role table
 * entirely (flagged during the Prompt H integration pass, _BUILD-LOG.md
 * 2026-08-15). Regenerating from the live local schema for the Journal
 * migration (Prompt I) closes all four gaps as a side effect of using the
 * real generator instead of another hand-written pass — see that entry's
 * log note for the full before/after.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ayah_ref: {
        Row: {
          ayah: number
          created_at: string
          essay_id: string
          id: string
          root: string
          surah: number
          translation_edition: string
        }
        Insert: {
          ayah: number
          created_at?: string
          essay_id: string
          id?: string
          root: string
          surah: number
          translation_edition: string
        }
        Update: {
          ayah?: number
          created_at?: string
          essay_id?: string
          id?: string
          root?: string
          surah?: number
          translation_edition?: string
        }
        Relationships: [
          {
            foreignKeyName: "ayah_ref_essay_id_fkey"
            columns: ["essay_id"]
            isOneToOne: false
            referencedRelation: "essay"
            referencedColumns: ["id"]
          },
        ]
      }
      card: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          image_path: string
          locale: Database["public"]["Enums"]["locale"]
          principle_id: string
          ratio: Database["public"]["Enums"]["card_ratio"]
          rendering_id: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          image_path: string
          locale: Database["public"]["Enums"]["locale"]
          principle_id: string
          ratio: Database["public"]["Enums"]["card_ratio"]
          rendering_id: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          image_path?: string
          locale?: Database["public"]["Enums"]["locale"]
          principle_id?: string
          ratio?: Database["public"]["Enums"]["card_ratio"]
          rendering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_rendering_id_fkey"
            columns: ["rendering_id"]
            isOneToOne: false
            referencedRelation: "rendering"
            referencedColumns: ["id"]
          },
        ]
      }
      department: {
        Row: {
          created_at: string
          id: string
          key: string
          name_ar: string
          name_bn: string
          name_en: string
          name_translit: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name_ar: string
          name_bn: string
          name_en: string
          name_translit: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name_ar?: string
          name_bn?: string
          name_en?: string
          name_translit?: string
        }
        Relationships: []
      }
      essay: {
        Row: {
          author: string
          body_md: string
          created_at: string
          id: string
          locale: Database["public"]["Enums"]["locale"]
          principle_id: string
          submitted_by: string | null
          supersedes_id: string | null
          title: string
          word_count: number
        }
        Insert: {
          author: string
          body_md: string
          created_at?: string
          id?: string
          locale: Database["public"]["Enums"]["locale"]
          principle_id: string
          submitted_by?: string | null
          supersedes_id?: string | null
          title: string
          word_count: number
        }
        Update: {
          author?: string
          body_md?: string
          created_at?: string
          id?: string
          locale?: Database["public"]["Enums"]["locale"]
          principle_id?: string
          submitted_by?: string | null
          supersedes_id?: string | null
          title?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "essay_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "essay_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "essay"
            referencedColumns: ["id"]
          },
        ]
      }
      issue: {
        Row: {
          created_at: string
          id: string
          number: number
          principle_id: string
          published_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          number: number
          principle_id: string
          published_at?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          number?: number
          principle_id?: string
          published_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principle"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_ayah_ref: {
        Row: {
          ayah: number
          created_at: string
          entry_id: string
          id: string
          surah: number
          translation_edition: string
        }
        Insert: {
          ayah: number
          created_at?: string
          entry_id: string
          id?: string
          surah: number
          translation_edition: string
        }
        Update: {
          ayah?: number
          created_at?: string
          entry_id?: string
          id?: string
          surah?: number
          translation_edition?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_ayah_ref_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_ayah_ref_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry_public"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_citation_audit: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          claim: string
          created_at: string
          entry_id: string
          id: string
          new_source_label: string | null
          new_source_url: string | null
          prior_source_label: string | null
          prior_source_url: string | null
          reason: string
          verification_result: Database["public"]["Enums"]["journal_citation_verification"]
          verifier: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          claim: string
          created_at?: string
          entry_id: string
          id?: string
          new_source_label?: string | null
          new_source_url?: string | null
          prior_source_label?: string | null
          prior_source_url?: string | null
          reason: string
          verification_result: Database["public"]["Enums"]["journal_citation_verification"]
          verifier: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          claim?: string
          created_at?: string
          entry_id?: string
          id?: string
          new_source_label?: string | null
          new_source_url?: string | null
          prior_source_label?: string | null
          prior_source_url?: string | null
          reason?: string
          verification_result?: Database["public"]["Enums"]["journal_citation_verification"]
          verifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_citation_audit_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_citation_audit_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry_public"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_claim: {
        Row: {
          claim: string
          created_at: string
          entry_id: string
          entry_ordinal: number
          id: string
          source_label: string | null
          source_url: string | null
          tier: Database["public"]["Enums"]["journal_claim_tier"]
        }
        Insert: {
          claim: string
          created_at?: string
          entry_id: string
          entry_ordinal: number
          id?: string
          source_label?: string | null
          source_url?: string | null
          tier: Database["public"]["Enums"]["journal_claim_tier"]
        }
        Update: {
          claim?: string
          created_at?: string
          entry_id?: string
          entry_ordinal?: number
          id?: string
          source_label?: string | null
          source_url?: string | null
          tier?: Database["public"]["Enums"]["journal_claim_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "journal_claim_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_claim_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry_public"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author: string
          created_at: string
          deck: string
          editorial_status: Database["public"]["Enums"]["journal_editorial_status"]
          entries: Json
          id: string
          locale: Database["public"]["Enums"]["locale"]
          publication_status: Database["public"]["Enums"]["journal_publication_status"]
          raw_source: string
          review_reason: string | null
          sequence_number: number
          series_id: string
          slug: string
          submitted_by: string | null
          title: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author: string
          created_at?: string
          deck: string
          editorial_status?: Database["public"]["Enums"]["journal_editorial_status"]
          entries: Json
          id?: string
          locale: Database["public"]["Enums"]["locale"]
          publication_status?: Database["public"]["Enums"]["journal_publication_status"]
          raw_source: string
          review_reason?: string | null
          sequence_number: number
          series_id: string
          slug: string
          submitted_by?: string | null
          title: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author?: string
          created_at?: string
          deck?: string
          editorial_status?: Database["public"]["Enums"]["journal_editorial_status"]
          entries?: Json
          id?: string
          locale?: Database["public"]["Enums"]["locale"]
          publication_status?: Database["public"]["Enums"]["journal_publication_status"]
          raw_source?: string
          review_reason?: string | null
          sequence_number?: number
          series_id?: string
          slug?: string
          submitted_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "journal_series"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_minor_edit: {
        Row: {
          actor: string | null
          after_text: string
          automated: boolean
          before_text: string
          created_at: string
          entry_id: string
          id: string
          reason: string
          scope: Database["public"]["Enums"]["journal_minor_edit_scope"]
        }
        Insert: {
          actor?: string | null
          after_text: string
          automated?: boolean
          before_text: string
          created_at?: string
          entry_id: string
          id?: string
          reason: string
          scope: Database["public"]["Enums"]["journal_minor_edit_scope"]
        }
        Update: {
          actor?: string | null
          after_text?: string
          automated?: boolean
          before_text?: string
          created_at?: string
          entry_id?: string
          id?: string
          reason?: string
          scope?: Database["public"]["Enums"]["journal_minor_edit_scope"]
        }
        Relationships: [
          {
            foreignKeyName: "journal_minor_edit_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_minor_edit_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entry_public"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_series: {
        Row: {
          created_at: string
          id: string
          key: Database["public"]["Enums"]["journal_series_key"]
          name_en: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: Database["public"]["Enums"]["journal_series_key"]
          name_en: string
          sort_order: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: Database["public"]["Enums"]["journal_series_key"]
          name_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      principle: {
        Row: {
          created_at: string
          id: string
          issue_no: number
          name_ar: string
          name_bn: string
          name_en: string
          name_translit: string
          published_at: string | null
          root_letters: string
          slug: string
          status: Database["public"]["Enums"]["publication_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          issue_no: number
          name_ar: string
          name_bn: string
          name_en: string
          name_translit: string
          published_at?: string | null
          root_letters: string
          slug: string
          status?: Database["public"]["Enums"]["publication_status"]
        }
        Update: {
          created_at?: string
          id?: string
          issue_no?: number
          name_ar?: string
          name_bn?: string
          name_en?: string
          name_translit?: string
          published_at?: string | null
          root_letters?: string
          slug?: string
          status?: Database["public"]["Enums"]["publication_status"]
        }
        Relationships: []
      }
      profile: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      rendering: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body_md: string
          created_at: string
          depth: Database["public"]["Enums"]["rendering_depth"]
          essay_id: string
          id: string
          locale: Database["public"]["Enums"]["locale"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body_md: string
          created_at?: string
          depth: Database["public"]["Enums"]["rendering_depth"]
          essay_id: string
          id?: string
          locale: Database["public"]["Enums"]["locale"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body_md?: string
          created_at?: string
          depth?: Database["public"]["Enums"]["rendering_depth"]
          essay_id?: string
          id?: string
          locale?: Database["public"]["Enums"]["locale"]
        }
        Relationships: [
          {
            foreignKeyName: "rendering_essay_id_fkey"
            columns: ["essay_id"]
            isOneToOne: false
            referencedRelation: "essay"
            referencedColumns: ["id"]
          },
        ]
      }
      soul_tag: {
        Row: {
          ayah_ref_id: string
          command_type: Database["public"]["Enums"]["command_type"]
          created_at: string
          essay_id: string
          faculty: Database["public"]["Enums"]["faculty"]
          id: string
        }
        Insert: {
          ayah_ref_id: string
          command_type: Database["public"]["Enums"]["command_type"]
          created_at?: string
          essay_id: string
          faculty: Database["public"]["Enums"]["faculty"]
          id?: string
        }
        Update: {
          ayah_ref_id?: string
          command_type?: Database["public"]["Enums"]["command_type"]
          created_at?: string
          essay_id?: string
          faculty?: Database["public"]["Enums"]["faculty"]
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "soul_tag_ayah_ref_id_fkey"
            columns: ["ayah_ref_id"]
            isOneToOne: false
            referencedRelation: "ayah_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soul_tag_essay_id_fkey"
            columns: ["essay_id"]
            isOneToOne: false
            referencedRelation: "essay"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      journal_entry_public: {
        Row: {
          author: string | null
          created_at: string | null
          deck: string | null
          editorial_status:
            | Database["public"]["Enums"]["journal_editorial_status"]
            | null
          entries: Json | null
          id: string | null
          locale: Database["public"]["Enums"]["locale"] | null
          sequence_number: number | null
          series_key: Database["public"]["Enums"]["journal_series_key"] | null
          series_name: string | null
          series_sort_order: number | null
          slug: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      soul_index_aggregate: { Args: never; Returns: Json }
    }
    Enums: {
      card_ratio: "9:16" | "1:1" | "4:5" | "a4"
      command_type: "amr" | "nahy" | "wasiyyah"
      faculty:
        | "qalb"
        | "nafs"
        | "aql"
        | "lisan"
        | "basar"
        | "sam"
        | "yad"
        | "jawarih"
      journal_citation_verification:
        | "verified"
        | "unverifiable"
        | "materially_changed"
      journal_claim_tier: "cited" | "observed" | "cut"
      journal_editorial_status: "clear" | "human_review_pending"
      journal_minor_edit_scope:
        | "title"
        | "deck"
        | "heading"
        | "spelling"
        | "grammar"
        | "punctuation"
        | "formatting"
        | "clarity"
      journal_publication_status: "draft" | "published"
      journal_series_key:
        | "foundation"
        | "soul"
        | "philosophy"
        | "convergence"
        | "civilization"
      locale: "en" | "ar" | "bn"
      publication_status: "draft" | "published"
      rendering_depth: "seed" | "spark" | "story" | "source"
      user_role: "owner" | "editor" | "rawi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      card_ratio: ["9:16", "1:1", "4:5", "a4"],
      command_type: ["amr", "nahy", "wasiyyah"],
      faculty: [
        "qalb",
        "nafs",
        "aql",
        "lisan",
        "basar",
        "sam",
        "yad",
        "jawarih",
      ],
      journal_citation_verification: [
        "verified",
        "unverifiable",
        "materially_changed",
      ],
      journal_claim_tier: ["cited", "observed", "cut"],
      journal_editorial_status: ["clear", "human_review_pending"],
      journal_minor_edit_scope: [
        "title",
        "deck",
        "heading",
        "spelling",
        "grammar",
        "punctuation",
        "formatting",
        "clarity",
      ],
      journal_publication_status: ["draft", "published"],
      journal_series_key: [
        "foundation",
        "soul",
        "philosophy",
        "convergence",
        "civilization",
      ],
      locale: ["en", "ar", "bn"],
      publication_status: ["draft", "published"],
      rendering_depth: ["seed", "spark", "story", "source"],
      user_role: ["owner", "editor", "rawi"],
    },
  },
} as const
