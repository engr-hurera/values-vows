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
  currentCountry: string;
  bornCountry: string;
  ethnicity: string;
  sect: string;
  marital: string;
  /** Only true after a real identity check; no sample member has one. */
  verifiedId: boolean;
}

type Roots = Pick<Profile, "currentCountry" | "bornCountry" | "ethnicity" | "sect" | "marital">;
const S5 = "Sunni · 5x Salah", HANAFI = "Sunni · Hanafi · 5x Salah", SHAFII = "Sunni · Shafi'i · 5x Salah", ANY_SUNNI = "Practicing Muslim · Any Sunni";
const roots = (currentCountry: string, bornCountry: string, ethnicity: string, sect: string, marital = "Never married"): Roots => ({ currentCountry, bornCountry, ethnicity, sect, marital });
const ROOTS: Record<string, Roots> = {
  amina: roots("Nigeria", "Nigeria", "Nigerian · Hausa", S5),
  yusuf: roots("Nigeria", "Nigeria", "Nigerian · Yoruba", S5),
  fatima: roots("Pakistan", "Pakistan", "Pakistani · Punjabi", HANAFI),
  omar: roots("United Kingdom", "Jordan", "Arab · Levantine", SHAFII),
  zainab: roots("Nigeria", "Nigeria", "Nigerian · Fulani", ANY_SUNNI, "Divorced"),
  bilal: roots("Pakistan", "Pakistan", "Pakistani · Muhajir / Sindhi", HANAFI),
  maryam: roots("Nigeria", "Nigeria", "Nigerian · Hausa", S5),
  khadija: roots("United Kingdom", "United Kingdom", "Pakistani · Punjabi", HANAFI),
  aisha: roots("Nigeria", "Nigeria", "Nigerian · Fulani", S5),
  hafsa: roots("Pakistan", "Pakistan", "Pakistani · Muhajir / Sindhi", ANY_SUNNI),
  hamza: roots("Nigeria", "Nigeria", "Nigerian · Hausa", S5),
  idris: roots("United Kingdom", "Pakistan", "Pakistani · Punjabi", HANAFI),
  tariq: roots("Nigeria", "Nigeria", "Nigerian · Fulani", S5),
  salman: roots("Pakistan", "Pakistan", "Pakistani · Punjabi", ANY_SUNNI, "Divorced"),
};

const img = (id: string, w = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const BASE: Omit<Profile, keyof Roots | "verifiedId">[] = [
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
  {
    id: "maryam", name: "Maryam Yusuf", age: 24, gender: "woman", city: "Kaduna, Nigeria", profession: "Nurse",
    match: 90, distanceKm: 18, photo: img("photo-1544005313-94ddf0286df2"), privacyBlur: false,
    salah5x: true, willingToRelocate: true, separateHome: true, quranTafsir: false, waliLinked: true,
    languages: ["Hausa", "English"], tribe: "Hausa",
    about: "Paediatric nurse who finds peace in caring for others. I want a home full of dhikr, laughter and good food.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "🍲 Cooking", "🌿 Gardening"],
  },
  {
    id: "khadija", name: "Khadija Rahman", age: 28, gender: "woman", city: "Birmingham, UK", profession: "Lawyer",
    match: 85, distanceKm: 41, photo: img("photo-1524504388940-b1c1722653e1"), privacyBlur: false,
    salah5x: true, willingToRelocate: false, separateHome: true, quranTafsir: true, waliLinked: true,
    languages: ["English", "Urdu"], tribe: "Punjabi",
    about: "Family lawyer, avid reader and weekend Quran student. Looking for steadiness, sincerity and good character.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["📖 Quran & Tafsir", "📚 Reading", "✈️ Umrah & Travel"],
  },
  {
    id: "aisha", name: "Aisha Ibrahim", age: 26, gender: "woman", city: "Kano, Nigeria", profession: "Data Analyst",
    match: 81, distanceKm: 7, photo: img("photo-1438761681033-6461ffad8d80"), privacyBlur: true,
    salah5x: true, willingToRelocate: true, separateHome: false, quranTafsir: true, waliLinked: false,
    languages: ["Hausa", "Arabic", "English"], tribe: "Fulani",
    about: "Numbers by day, Tafsir circles by evening. I value honesty, patience and a shared love of learning.",
    livingAfterNikkah: "With Family (initially)", timeline: "Within 1–2 Years", interests: ["📖 Quran & Tafsir", "🧩 Puzzles", "🏃 Walking"],
  },
  {
    id: "hafsa", name: "Hafsa Siddiqui", age: 27, gender: "woman", city: "Karachi, Pakistan", profession: "Graphic Designer",
    match: 78, distanceKm: 26, photo: img("photo-1487412720507-e7ab37603c6f"), privacyBlur: false,
    salah5x: false, willingToRelocate: true, separateHome: true, quranTafsir: false, waliLinked: false,
    languages: ["Urdu", "English"], tribe: "Sindhi",
    about: "Designer with a love for Islamic geometric art. Hoping for a gentle, supportive partner in deen.",
    livingAfterNikkah: "Separate Home", timeline: "Within 1–2 Years", interests: ["🖋️ Calligraphy", "🎨 Crafts", "☕ Coffee"],
  },
  {
    id: "hamza", name: "Hamza Okafor", age: 30, gender: "man", city: "Abuja, Nigeria", profession: "Civil Engineer",
    match: 89, distanceKm: 6, photo: img("photo-1472099645785-5658abf4ff4e"), privacyBlur: false,
    salah5x: true, willingToRelocate: true, separateHome: true, quranTafsir: true, waliLinked: true,
    languages: ["Hausa", "English"], tribe: "Hausa",
    about: "Engineer who loves building bridges, literally and between people. Seeking a home of mercy and Shura.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "📖 Quran & Tafsir", "⚽ Football"],
  },
  {
    id: "idris", name: "Idris Malik", age: 32, gender: "man", city: "Manchester, UK", profession: "Doctor",
    match: 84, distanceKm: 33, photo: img("photo-1519085360753-af0119f7cbe7"), privacyBlur: false,
    salah5x: true, willingToRelocate: false, separateHome: true, quranTafsir: true, waliLinked: false,
    languages: ["English", "Urdu", "Arabic"], tribe: "Punjabi",
    about: "GP and part-time Arabic student. I want a partner to walk with towards Jannah, with kindness first.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "📚 Islamic History", "⛰️ Hiking"],
  },
  {
    id: "tariq", name: "Tariq Bello", age: 28, gender: "man", city: "Kano, Nigeria", profession: "Entrepreneur",
    match: 82, distanceKm: 3, photo: img("photo-1492562080023-ab3db95bfbce"), privacyBlur: false,
    salah5x: true, willingToRelocate: true, separateHome: true, quranTafsir: false, waliLinked: true,
    languages: ["Hausa", "English", "Arabic"], tribe: "Fulani",
    about: "Running a small halal food business. Close to my family, serious about Nikah, and always up for a road trip.",
    livingAfterNikkah: "Separate Home", timeline: "Within 6–12 Months", interests: ["🕌 5x Salah", "🍲 Cooking", "✈️ Umrah & Travel"],
  },
  {
    id: "salman", name: "Salman Qureshi", age: 29, gender: "man", city: "Lahore, Pakistan", profession: "Teacher",
    match: 77, distanceKm: 20, photo: img("photo-1539571696357-5a69c17a67c6"), privacyBlur: false,
    salah5x: false, willingToRelocate: true, separateHome: false, quranTafsir: true, waliLinked: false,
    languages: ["Urdu", "English"], tribe: "Punjabi",
    about: "Secondary school teacher who loves poetry and Tafsir. Gentle, patient and family-minded.",
    livingAfterNikkah: "With Family (initially)", timeline: "Within 1–2 Years", interests: ["📖 Quran & Tafsir", "📚 Reading", "🏏 Cricket"],
  },
];

export const PROFILES: Profile[] = BASE.map((p) => ({ ...p, ...ROOTS[p.id]!, verifiedId: false }));

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

export const DISTANCE_MAX_KM = 100;
export const AGE_LIMITS: [number, number] = [18, 60];

/** Filter values; "" means Any. */
export interface Filters {
  currentCountry: string;
  bornCountry: string;
  ethnicity: string;
  sect: string;
  maxDistanceKm: number;
  ageRange: [number, number];
  /** Barakah Gold filters */
  living: string;
  marital: string;
  waliOnly: boolean;
  verifiedOnly: boolean;
  value: "separateHome" | "salah5x" | "quranTafsir" | null;
}

export const EMPTY_FILTERS: Filters = {
  currentCountry: "", bornCountry: "", ethnicity: "", sect: "",
  maxDistanceKm: DISTANCE_MAX_KM, ageRange: [18, 45],
  living: "", marital: "", waliOnly: false, verifiedOnly: false, value: null,
};

/** Post-Nikah living arrangement in the picker's wording. */
export function livingFor(p: Pick<Profile, "livingAfterNikkah">) {
  return p.livingAfterNikkah === "Separate Home" ? "Separate home" : "Joint / family home";
}

/** "Sunni · 5x Salah" covers every school that prays 5x; "Any Sunni" covers everyone; a named school must match. */
export function sectMatches(profileSect: string, filter: string) {
  if (!filter || filter === "Practicing Muslim · Any Sunni") return true;
  if (filter === "Sunni · 5x Salah") return profileSect.endsWith("5x Salah");
  return profileSect === filter;
}

/** Country pickers may include a city ("Germany · Hamburg"); compare the country part only. */
const countryOf = (label: string) => label.split(" · ")[0]!.trim();

export function applyFilters(list: Profile[], f: Filters) {
  return list.filter(
    (p) =>
      (!f.currentCountry || countryOf(p.currentCountry) === countryOf(f.currentCountry)) &&
      (!f.bornCountry || countryOf(p.bornCountry) === countryOf(f.bornCountry)) &&
      (!f.ethnicity || p.ethnicity === f.ethnicity) &&
      sectMatches(p.sect, f.sect) &&
      (f.maxDistanceKm >= DISTANCE_MAX_KM || p.distanceKm <= f.maxDistanceKm) &&
      p.age >= f.ageRange[0] && p.age <= f.ageRange[1] &&
      (!f.living || f.living === "Open to discussion" || livingFor(p) === f.living) &&
      (!f.marital || p.marital === f.marital) &&
      (!f.waliOnly || p.waliLinked) &&
      (!f.verifiedOnly || p.verifiedId) &&
      (!f.value || p[f.value]),
  );
}
