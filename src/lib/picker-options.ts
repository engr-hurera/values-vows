/** Option lists for the Custom Dropdown Picker, copied from the showcase plus the regions our members come from. */
export interface PickerOption { label: string; sub: string }
export type PickerType = "country" | "ethnicity" | "language" | "height" | "marital" | "sect" | "living";

/** Shown at the top of filter pickers; selecting it clears that filter. */
export const ANY = "Any";
export const ANY_OPTION: PickerOption = { label: ANY, sub: "No preference" };

const heights = [150, 155, 160, 165, 170, 175, 180, 185, 190, 195].map((cm) => {
  const inches = Math.round(cm / 2.54);
  return { label: `${Math.floor(inches / 12)}'${inches % 12}" (${cm} cm)`, sub: `${cm} cm` };
});

export const PICKER_DATASETS: Record<PickerType, PickerOption[]> = {
  country: [
    { label: "Australia", sub: "Sydney · Melbourne" },
    { label: "Austria", sub: "Vienna" },
    { label: "Bahrain", sub: "Manama" },
    { label: "Bangladesh", sub: "Dhaka · Sylhet" },
    { label: "Belgium", sub: "Brussels · Antwerp" },
    { label: "Canada", sub: "Toronto · Mississauga" },
    { label: "Egypt", sub: "Cairo · Alexandria" },
    { label: "France", sub: "Paris · Lyon" },
    { label: "Germany · Hamburg", sub: "Hamburg · Berlin · Frankfurt" },
    { label: "Indonesia", sub: "Jakarta" },
    { label: "Jordan", sub: "Amman" },
    { label: "Kuwait", sub: "Kuwait City" },
    { label: "Malaysia", sub: "Kuala Lumpur" },
    { label: "Morocco", sub: "Casablanca · Rabat" },
    { label: "Nigeria", sub: "Lagos · Abuja · Kano" },
    { label: "Oman", sub: "Muscat" },
    { label: "Pakistan", sub: "Lahore · Islamabad · Karachi" },
    { label: "Palestine", sub: "Jerusalem · Ramallah" },
    { label: "Qatar", sub: "Doha" },
    { label: "Saudi Arabia", sub: "Riyadh · Jeddah · Madinah" },
    { label: "Turkey", sub: "Istanbul · Ankara" },
    { label: "United Arab Emirates", sub: "Dubai · Abu Dhabi" },
    { label: "United Kingdom", sub: "London · Birmingham · Manchester" },
    { label: "United States", sub: "New York · Chicago · Houston" },
  ],
  ethnicity: [
    { label: "Arab · Egyptian", sub: "North African / Arab heritage" },
    { label: "Arab · Gulf / Khaleeji", sub: "Arabian Peninsula" },
    { label: "Arab · Levantine", sub: "Palestinian, Syrian, Jordanian, Lebanese" },
    { label: "Bangladeshi · Sylheti", sub: "South Asian heritage" },
    { label: "European · Revert", sub: "German, British, French, European" },
    { label: "Indian · Hyderabadi / North", sub: "South Asian heritage" },
    { label: "Kurdish", sub: "Anatolian / Mesopotamian heritage" },
    { label: "Malay / Indonesian", sub: "Southeast Asian heritage" },
    { label: "Moroccan / Amazigh", sub: "Maghreb heritage" },
    { label: "Nigerian · Fulani", sub: "West African heritage" },
    { label: "Nigerian · Hausa", sub: "West African heritage" },
    { label: "Nigerian · Yoruba", sub: "West African heritage" },
    { label: "Pakistani · Kashmiri", sub: "South Asian heritage" },
    { label: "Pakistani · Muhajir / Sindhi", sub: "South Asian heritage" },
    { label: "Pakistani · Pashtun", sub: "Khyber Pakhtunkhwa / Pashtun heritage" },
    { label: "Pakistani · Punjabi", sub: "Punjab / South Asian heritage" },
    { label: "Persian / Iranian", sub: "Persian heritage" },
    { label: "Somali / East African", sub: "Horn of Africa heritage" },
    { label: "Turkish · Anatolian", sub: "Turkish heritage" },
  ],
  language: [
    { label: "Arabic, English", sub: "Fluent speaker" },
    { label: "Bengali, English", sub: "Fluent speaker" },
    { label: "English, German", sub: "Fluent speaker" },
    { label: "Hausa, Arabic, English", sub: "Fluent speaker" },
    { label: "Hausa, English", sub: "Fluent speaker" },
    { label: "Pashto, Urdu, English", sub: "Fluent speaker" },
    { label: "Punjabi, Urdu, English", sub: "Fluent speaker" },
    { label: "Turkish, German, English", sub: "Fluent speaker" },
    { label: "Urdu, German, English", sub: "Fluent speaker" },
    { label: "Urdu, English", sub: "Fluent speaker" },
    { label: "Yoruba, English", sub: "Fluent speaker" },
  ],
  height: heights,
  marital: [
    { label: "Never married", sub: "First marriage" },
    { label: "Divorced", sub: "Lawfully divorced" },
    { label: "Widowed", sub: "Widowed" },
  ],
  sect: [
    { label: "Sunni · 5x Salah", sub: "Prays all 5 daily prayers" },
    { label: "Sunni · Hanafi · 5x Salah", sub: "Hanafi school · Prays 5x daily" },
    { label: "Sunni · Shafi'i · 5x Salah", sub: "Shafi'i school · Prays 5x daily" },
    { label: "Practicing Muslim · Any Sunni", sub: "Focused on core deen & character" },
  ],
  living: [
    { label: "Separate home", sub: "Independent apartment or house after marriage" },
    { label: "Near family (same city)", sub: "Own space close to parents" },
    { label: "Joint / family home", sub: "Living together with family" },
    { label: "Open to discussion", sub: "Flexible based on mutual agreement" },
  ],
};

/** Smart UX rule: lists with 5 or more options get the A–Z letter pills; shorter lists don't need them. */
export function usesAlphabet(optionCount: number) {
  return optionCount >= 5;
}

/** Unique first letters of the options, sorted, ignoring the "Any" choice. */
export function lettersFor(items: PickerOption[]) {
  return Array.from(new Set(items.filter((i) => i.label !== ANY).map((i) => (i.label[0] ?? "").toUpperCase()))).sort();
}

/** Same matching as the showcase: search label or sub-text, then optional first-letter filter. */
export function filterOptions(items: PickerOption[], query: string, letter: string) {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesSearch = !q || item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q);
    const matchesLetter = letter === "ALL" ? true : item.label !== ANY && item.label.toUpperCase().startsWith(letter);
    return matchesSearch && matchesLetter;
  });
}

/** "Germany · Hamburg" -> country "Germany", city "Hamburg"; "Pakistan" -> country only. */
export function splitCountry(label: string) {
  const [country, city = ""] = label.split(" · ").map((s) => s.trim());
  return { country: country ?? "", city };
}
