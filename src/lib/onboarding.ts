import type { Gender } from "./session";

export interface StepData {
  gender: Gender | null;
  fullName: string;
  dob: string;
  marital: string;
  currentCountry: string;
  bornCountry: string;
  ethnicity: string;
  languages: string;
  photos: string[];
  timeline: string;
}

export const MIN_AGE = 18;

/** Whole years between a YYYY-MM-DD birth date and today. */
export function ageFrom(dob: string, today = new Date()) {
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}

/** Account details are collected on the radar screen, so Step 4 only needs a Nikkah timeline. Height is optional. */
export function canAdvance(step: number, data: StepData, today = new Date()) {
  if (step === 0) return !!(data.gender && data.fullName.trim() && data.marital && data.currentCountry && data.bornCountry && data.ethnicity && data.languages) && ageFrom(data.dob, today) >= MIN_AGE;
  if (step === 1) return true;
  if (step === 2) return data.photos.some(Boolean);
  if (step === 3) return !!data.timeline;
  return false;
}

/** "14 May 1998 (28)", as on the showcase's Basic Details card. */
export function formatDob(dob: string, today = new Date()) {
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return "";
  const label = new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${label} (${ageFrom(dob, today)})`;
}
