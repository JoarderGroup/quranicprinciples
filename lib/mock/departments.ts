import type { Department } from "@/lib/types";

/** The ten departments — 04-Departments.md. Arabic names are the running
 * heads in ALL locales; that rule is what makes three locales one magazine. */
const CREATED_AT = "2026-08-01T00:00:00Z";

export const departments: Department[] = [
  { id: "d01", key: "asl", name_ar: "الأصل", name_translit: "Al-Aṣl", name_en: "The Root", name_bn: "মূল", created_at: CREATED_AT },
  { id: "d02", key: "waqiah", name_ar: "الواقعة", name_translit: "Al-Wāqiʿah", name_en: "The Incident", name_bn: "ঘটনা", created_at: CREATED_AT },
  { id: "d03", key: "mirah", name_ar: "المرآة", name_translit: "Al-Mirʾāh", name_en: "The Mirror", name_bn: "আয়না", created_at: CREATED_AT },
  { id: "d04", key: "uqdah", name_ar: "العقدة", name_translit: "Al-ʿUqdah", name_en: "The Knot", name_bn: "গিঁট", created_at: CREATED_AT },
  { id: "d05", key: "athar", name_ar: "الأثر", name_translit: "Al-Athar", name_en: "The Trace", name_bn: "পদচিহ্ন", created_at: CREATED_AT },
  { id: "d06", key: "amal", name_ar: "العمل", name_translit: "Al-ʿAmal", name_en: "The Deed", name_bn: "আমল", created_at: CREATED_AT },
  { id: "d07", key: "sawt", name_ar: "الصوت", name_translit: "Aṣ-Ṣawt", name_en: "The Voice", name_bn: "কণ্ঠ", created_at: CREATED_AT },
  { id: "d08", key: "mufradat", name_ar: "المفردات", name_translit: "Al-Mufradāt", name_en: "The Words", name_bn: "শব্দ", created_at: CREATED_AT },
  { id: "d09", key: "sual", name_ar: "السؤال", name_translit: "As-Suʾāl", name_en: "The Question", name_bn: "প্রশ্ন", created_at: CREATED_AT },
  { id: "d10", key: "kharitah", name_ar: "الخريطة", name_translit: "Al-Kharīṭah", name_en: "The Map", name_bn: "মানচিত্র", created_at: CREATED_AT },
];

export const departmentByKey = (key: string) =>
  departments.find((d) => d.key === key);
