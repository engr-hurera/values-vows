export type Gender = "man" | "woman";

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  city: string;
  profession: string;
  match: number;
  distanceKm: number;
  photo: string;
  privacyBlur: boolean;
  salah5x: boolean;
  willingToRelocate: boolean;
  separateHome: boolean;
  quranTafsir: boolean;
  waliLinked: boolean;
  languages: string[];
  tribe: string;
  about: string;
  livingAfterNikkah: string;
  timeline: string;
  interests: string[];
}

const img = (id: string, w = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PROFILES: Profile[] = [
  {
    id: "amina", name: "Amina Bello", age: 26, gender: "woman", city: "Kano, Nigeria", profession: "Pharmacist",
    match: 94, distanceKm: 12.5, photo: img("photo-1534528741775-53994a69daeb"), privacyBlur: true,
    salah5x: true, willingToRelocate: true, separateHome: true, quranTafsir: true, waliLinked: true,
    languages: ["Hausa", "English", "Arabic"], tribe: "Hausa",
    about: "Pharmacist who loves quiet mornings with the Quran. Hoping to build a home grounded in mercy, patience and shared growth.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "📖 Quran & Tafsir", "🌿 Gardening", "✈️ Umrah & Travel"],
  },
  {
    id: "yusuf", name: "Yusuf Adeyemi", age: 29, gender: "man", city: "Lagos, Nigeria", profession: "Architect",
    match: 91, distanceKm: 4.2, photo: img("photo-1506794778202-cad84cf45f1d"), privacyBlur: false,
    salah5x: true, willingToRelocate: false, separateHome: true, quranTafsir: false, waliLinked: false,
    languages: ["Yoruba", "English"], tribe: "Yoruba",
    about: "Practicing architect striving to build a peaceful Muslim home founded on Shura, kindness, and shared growth.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "📚 Islamic History", "🏃 Running"],
  },
  {
    id: "fatima", name: "Fatima Khan", age: 25, gender: "woman", city: "Lahore, Pakistan", profession: "Doctor",
    match: 88, distanceKm: 22, photo: img("photo-1517841905240-472988babdf9"), privacyBlur: false,
    salah5x: true, willingToRelocate: true, separateHome: false, quranTafsir: true, waliLinked: true,
    languages: ["Urdu", "English"], tribe: "Punjabi",
    about: "Junior doctor, family-oriented, and a big believer in kindness at home. I enjoy calligraphy and long walks after Maghrib.",
    livingAfterNikkah: "With Family (initially)", timeline: "Within 1–2 Years", interests: ["📖 Quran & Tafsir", "🖋️ Calligraphy", "🍲 Cooking"],
  },
  {
    id: "omar", name: "Omar Al-Rashid", age: 31, gender: "man", city: "London, UK", profession: "Software Engineer",
    match: 86, distanceKm: 38, photo: img("photo-1500648767791-00dcc994a43e"), privacyBlur: false,
    salah5x: true, willingToRelocate: true, separateHome: true, quranTafsir: true, waliLinked: false,
    languages: ["Arabic", "English"], tribe: "Arab",
    about: "Engineer by day, student of Tafsir by night. Looking for a partner to grow with in deen and dunya.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "📖 Quran & Tafsir", "⛰️ Hiking"],
  },
  {
    id: "zainab", name: "Zainab Musa", age: 27, gender: "woman", city: "Abuja, Nigeria", profession: "Teacher",
    match: 83, distanceKm: 9, photo: img("photo-1531123897727-8f129e1688ce"), privacyBlur: true,
    salah5x: false, willingToRelocate: false, separateHome: true, quranTafsir: true, waliLinked: true,
    languages: ["Hausa", "English"], tribe: "Fulani",
    about: "Primary school teacher with a soft spot for children's literature. Family, faith and laughter matter most to me.",
    livingAfterNikkah: "Separate Home", timeline: "Within 1–2 Years", interests: ["📖 Quran & Tafsir", "📚 Reading", "🎨 Crafts"],
  },
  {
    id: "bilal", name: "Bilal Hussain", age: 30, gender: "man", city: "Karachi, Pakistan", profession: "Accountant",
    match: 80, distanceKm: 15, photo: img("photo-1507003211169-0a1dd7228f2d"), privacyBlur: false,
    salah5x: true, willingToRelocate: true, separateHome: false, quranTafsir: false, waliLinked: false,
    languages: ["Urdu", "English", "Arabic"], tribe: "Sindhi",
    about: "Calm, organised, and close to my parents. Seeking a sincere partner who values honesty and simplicity.",
    livingAfterNikkah: "With Family (initially)", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "🏏 Cricket", "✈️ Umrah & Travel"],
  },
];

export const LANGUAGES = ["Hausa", "English", "Arabic", "Urdu", "Yoruba"];
export const TRIBES = ["Hausa", "Fulani", "Yoruba", "Punjabi", "Sindhi", "Arab"];

/** Woman-Only Blur Rule: only women who enabled privacy blur are blurred, until unblur is granted. Men are never blurred. */
export function shouldBlur(p: Pick<Profile, "gender" | "privacyBlur">, unblurGranted = false) {
  return p.gender === "woman" && p.privacyBlur && !unblurGranted;
}

export function getProfile(id: string) {
  return PROFILES.find((p) => p.id === id);
}

export function badgesFor(p: Profile) {
  const b: string[] = [];
  if (p.salah5x) b.push("🕌 5x Salah");
  if (p.willingToRelocate) b.push("✈️ Willing to Relocate");
  if (p.waliLinked) b.push("🛡️ Wali Linked");
  return b;
}

export interface Filters {
  languages: string[];
  tribes: string[];
  willingToRelocate: boolean;
  value: "separateHome" | "salah5x" | "quranTafsir" | null;
}

export const EMPTY_FILTERS: Filters = { languages: [], tribes: [], willingToRelocate: false, value: null };

export function applyFilters(list: Profile[], f: Filters) {
  return list.filter(
    (p) =>
      (f.languages.length === 0 || f.languages.some((l) => p.languages.includes(l))) &&
      (f.tribes.length === 0 || f.tribes.includes(p.tribe)) &&
      (!f.willingToRelocate || p.willingToRelocate) &&
      (!f.value || p[f.value]),
  );
}
