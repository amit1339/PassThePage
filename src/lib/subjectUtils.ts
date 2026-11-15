/**
 * Centralized subject options, translations, and spine color mappings.
 */

export interface SubjectItem {
  value: string;
  he: string;
  en: string;
  color: string;
}

export const SUBJECT_OPTIONS: SubjectItem[] = [
  { value: 'תנ״ך', he: 'תנ״ך', en: 'Bible / Tanach', color: 'bg-amber-800' },
  { value: 'תרבות יהודית', he: 'תרבות יהודית', en: 'Jewish Culture', color: 'bg-sky-800' },
  { value: 'מדעים', he: 'מדעים', en: 'Science', color: 'bg-emerald-600' },
  { value: 'מתמטיקה', he: 'מתמטיקה', en: 'Mathematics', color: 'bg-[#B45309]' },
  { value: 'היסטוריה', he: 'היסטוריה', en: 'History', color: 'bg-stone-700' },
  { value: 'אנגלית', he: 'אנגלית', en: 'English', color: 'bg-[#0F2342]' },
  { value: 'ספרות', he: 'ספרות', en: 'Literature', color: 'bg-[#9E2A2B]' },
  { value: 'גיאוגרפיה', he: 'גיאוגרפיה', en: 'Geography', color: 'bg-teal-600' },
  { value: 'מדעי המחשב', he: 'מדעי המחשב', en: 'Computer Science', color: 'bg-indigo-700' },
  { value: 'שפות', he: 'שפות', en: 'Languages', color: 'bg-amber-700' },
  { value: 'אמנות', he: 'אמנות', en: 'Arts', color: 'bg-purple-700' },
  { value: 'אזרחות', he: 'אזרחות', en: 'Civics', color: 'bg-rose-700' },
];

const SUBJECT_LOOKUP: Record<string, { he: string; en: string; color: string }> = {
  // Hebrew entries
  'תנ״ך': { he: 'תנ״ך', en: 'Bible / Tanach', color: 'bg-amber-800' },
  'תנך': { he: 'תנ״ך', en: 'Bible / Tanach', color: 'bg-amber-800' },
  'תרבות יהודית': { he: 'תרבות יהודית', en: 'Jewish Culture', color: 'bg-sky-800' },
  'מדעים': { he: 'מדעים', en: 'Science', color: 'bg-emerald-600' },
  'מתמטיקה': { he: 'מתמטיקה', en: 'Mathematics', color: 'bg-[#B45309]' },
  'היסטוריה': { he: 'היסטוריה', en: 'History', color: 'bg-stone-700' },
  'אנגלית': { he: 'אנגלית', en: 'English', color: 'bg-[#0F2342]' },
  'ספרות': { he: 'ספרות', en: 'Literature', color: 'bg-[#9E2A2B]' },
  'גיאוגרפיה': { he: 'גיאוגרפיה', en: 'Geography', color: 'bg-teal-600' },
  'מדעי המחשב': { he: 'מדעי המחשב', en: 'Computer Science', color: 'bg-indigo-700' },
  'שפות': { he: 'שפות', en: 'Languages', color: 'bg-amber-700' },
  'אמנות': { he: 'אמנות', en: 'Arts', color: 'bg-purple-700' },
  'אזרחות': { he: 'אזרחות', en: 'Civics', color: 'bg-rose-700' },

  // English entries mapped to Hebrew equivalents
  Bible: { he: 'תנ״ך', en: 'Bible', color: 'bg-amber-800' },
  Tanach: { he: 'תנ״ך', en: 'Tanach', color: 'bg-amber-800' },
  'Jewish Culture': { he: 'תרבות יהודית', en: 'Jewish Culture', color: 'bg-sky-800' },
  Science: { he: 'מדעים', en: 'Science', color: 'bg-emerald-600' },
  Mathematics: { he: 'מתמטיקה', en: 'Mathematics', color: 'bg-[#B45309]' },
  History: { he: 'היסטוריה', en: 'History', color: 'bg-stone-700' },
  English: { he: 'אנגלית', en: 'English', color: 'bg-[#0F2342]' },
  Geography: { he: 'גיאוגרפיה', en: 'Geography', color: 'bg-teal-600' },
  Literature: { he: 'ספרות', en: 'Literature', color: 'bg-[#9E2A2B]' },
  'Computer Science': { he: 'מדעי המחשב', en: 'Computer Science', color: 'bg-indigo-700' },
  Languages: { he: 'שפות', en: 'Languages', color: 'bg-amber-700' },
  Arts: { he: 'אמנות', en: 'Arts', color: 'bg-purple-700' },
  Civics: { he: 'אזרחות', en: 'Civics', color: 'bg-rose-700' },
};

export function getSubjectLabel(subject?: string | null, lang: 'he' | 'en' = 'he'): string {
  if (!subject) return lang === 'he' ? 'כללי' : 'General';
  const found = SUBJECT_LOOKUP[subject] || SUBJECT_LOOKUP[subject.trim()];
  if (found) {
    return lang === 'he' ? found.he : found.en;
  }
  return subject;
}

export function getSubjectColor(subject?: string | null): string {
  if (!subject) return 'bg-[#B45309]';
  const found = SUBJECT_LOOKUP[subject] || SUBJECT_LOOKUP[subject.trim()];
  return found?.color || 'bg-[#B45309]';
}
