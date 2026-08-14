import type {
  AyahRef,
  Depth,
  Essay,
  Issue,
  Principle,
  Rendering,
} from "@/lib/types";

/* Issue 01 — AL-MĪZĀN. Editorial sample content from the vault boards
 * (Claude-authored). Āyah TEXT is never stored here — only references;
 * the text is fetched from the API at build time (lib/quran.ts). */

export const principle: Principle = {
  id: "p01",
  slug: "al-mizan",
  issue_no: 1,
  name_ar: "الميزان",
  name_translit: "Al-Mīzān",
  name_en: "The Balance",
  name_bn: "দাঁড়িপাল্লা",
  root_letters: "و-ز-ن",
  status: "published",
  published_at: "2026-08-01T00:00:00Z",
};

export const issue: Issue = {
  id: "i01",
  number: 1,
  title: "Al-Mīzān",
  principle_id: principle.id,
  published_at: "2026-08-01T00:00:00Z",
};

export const ayahRefs: AyahRef[] = [
  { id: "a01", essay_id: "e01", surah: 55, ayah: 7, root: "و-ز-ن", translation_edition: "eng-ummmuhammad" },
  { id: "a02", essay_id: "e01", surah: 55, ayah: 8, root: "و-ز-ن", translation_edition: "eng-ummmuhammad" },
  { id: "a03", essay_id: "e01", surah: 55, ayah: 9, root: "و-ز-ن", translation_edition: "eng-ummmuhammad" },
];

export const rootOccurrences = 23;

export const essay: Essay = {
  id: "e01",
  principle_id: principle.id,
  locale: "en",
  title: "The grocer who reset his scale every Friday",
  author: "Quranic Principles",
  word_count: 640,
  created_at: "2026-07-20T00:00:00Z",
  body_md: [
    "Nobody asked him to. No inspector came to his lane in Chittagong. The scale was old and it drifted — a gram here, two grams there — and drift always leaned the same way, toward the seller.",
    "He noticed this in his second year of trading. Not a theft, exactly. An accumulation. He calculated once, on the back of a receipt, what two grams over eleven thousand transactions came to, and then he stopped calculating.",
    '"I did not want to meet the āyah with that arithmetic," he said.',
    "The balance in Sūrah ar-Raḥmān is not introduced as commerce. It arrives between the sun and the moon and the sky raised overhead — cosmic furniture. Then, three verses later, it is a shopkeeper's brass.",
    "This is the move the sūrah makes and it is worth sitting with. The order is deliberate: creation, then balance, then *do not transgress within it*, then *establish the weight with justice*.",
    "Cosmology descends into the marketplace in four lines.",
  ].join("\n\n"),
};

export const standfirst =
  "For eleven years, before he walked to Jumuʿah, Abdul Karim took the brass weights off his scale and checked them against a coin.";

export const pullQuote =
  "The Qur'an puts the scale of the heavens and the scale in your hand in the same breath. That is the whole argument.";

export const deed = {
  prompt: "Name one weighing you will make honest this week.",
  body: "Time you owe. Money you counted. A promise you rounded down. Write it, do it once, and the āyah stops being a sentence you read.",
  next_ar: "المرآة",
  next_en: "The Mirror",
};

export const renderings: Record<Depth, Rendering> = {
  seed: {
    id: "r01",
    essay_id: essay.id,
    depth: "seed",
    locale: "en",
    approved_by: "human-pending",
    approved_at: null,
    body_md:
      "A grocer checked his scale every Friday for eleven years, because Allah set up a balance and asked us not to cheat in it.",
  },
  spark: {
    id: "r02",
    essay_id: essay.id,
    depth: "spark",
    locale: "en",
    approved_by: "human-pending",
    approved_at: null,
    body_md: [
      "A scale drifts. Always toward the seller.",
      "Abdul Karim noticed in his second year.",
      "Every Friday, before Jumuʿah: brass weights, checked against a coin.",
      "Eleven years. Nobody asked him to.",
      "The sūrah sets the balance between the sun and the sky — then hands it to a shopkeeper.",
      "Your scale is somewhere. Find which way it leans.",
    ].join("\n\n"),
  },
  story: {
    id: "r03",
    essay_id: essay.id,
    depth: "story",
    locale: "en",
    approved_by: "human-pending",
    approved_at: null,
    body_md: essay.body_md,
  },
  source: {
    id: "r04",
    essay_id: essay.id,
    depth: "source",
    locale: "en",
    approved_by: "human-pending",
    approved_at: null,
    body_md: [
      "The root و-ز-ن appears 23 times across the Qur'an — weight, measure, worth. In Sūrah ar-Raḥmān it lands three times in three consecutive āyāt (55:7–9), the densest cluster of the root anywhere in the text.",
      "The sequence is architectural: the heaven raised, the balance set, the prohibition (*do not transgress within the balance*), the command (*establish weight in justice*), the warning (*do not make deficient the balance*). Amr and nahy braided around a single instrument.",
      "The full verse table, morphology and tafsīr layer for this principle ships with the source view.",
    ].join("\n\n"),
  },
};

/** Contents list for the issue cover — board 02. */
export const inThisIssue = [
  { title: "The grocer who reset his scale every Friday", minutes: 4, dept: "waqiah" },
  { title: "Two grams, eleven thousand times", minutes: 2, dept: "mirah" },
  { title: "ʿUmar in the market of Madīnah", minutes: 3, dept: "athar" },
  { title: "Where does your scale lean?", minutes: 1, dept: "amal", seed: true },
];

/** The six-beat spine — board 03 right rail. */
export const spine = [
  { n: "01", key: "asl", en: "The Root", ar: "الأصل", line: "و-ز-ن across 23 āyāt — weight, measure, worth. Where the word first lands." },
  { n: "02", key: "waqiah", en: "The Incident", ar: "الواقعة", line: "Abdul Karim's brass weights. Chittagong, eleven years." },
  { n: "03", key: "mirah", en: "The Mirror", ar: "المرآة", line: "Where is your scale off by two grams — and which way does it lean?" },
  { n: "04", key: "uqdah", en: "The Knot", ar: "العقدة", line: "When being exact costs you the sale, and the other stalls are not exact." },
  { n: "05", key: "athar", en: "The Trace", ar: "الأثر", line: "ʿUmar ibn al-Khaṭṭāb walking the market of Madīnah, checking." },
  { n: "06", key: "amal", en: "The Deed", ar: "العمل", line: "Name one weighing you will make honest this week. Write it down." },
];

/** Popular reads — sidebar mock. */
export const popularReads = [
  { title: "The grocer who reset his scale every Friday", dept: "waqiah", minutes: 4, slug: "al-mizan" },
  { title: "ʿUmar in the market of Madīnah", dept: "athar", minutes: 3, slug: "al-mizan" },
  { title: "Two grams, eleven thousand times", dept: "mirah", minutes: 2, slug: "al-mizan" },
];
