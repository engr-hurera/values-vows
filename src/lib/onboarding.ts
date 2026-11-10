import type { Gender } from "./session";

export function canAdvance(step: number, data: { gender: Gender | null; firstName: string; dob: string; city: string; country: string; photos: string[]; sect: string; timeline: string; email: string; password: string }) {
  if (step === 0) return !!(data.gender && data.firstName.trim() && data.dob && data.city.trim() && data.country.trim());
  if (step === 1) return true;
  if (step === 2) return data.photos.some(Boolean);
  if (step === 3) return !!(data.sect && data.timeline && /^\S+@\S+\.\S+$/.test(data.email) && data.password.length >= 6);
  return false;
}