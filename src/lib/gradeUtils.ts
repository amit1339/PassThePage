/**
 * Utility functions for grade level parsing, Hebrew grade mappings, and eligibility enforcement.
 */

export const HEBREW_GRADE_LETTERS: Record<number, string> = {
  7: 'ז',
  8: 'ח',
  9: 'ט',
  10: 'י',
  11: 'יא',
  12: 'יב',
};

export const HEBREW_LETTER_TO_GRADE: Record<string, number> = {
  'ז': 7,
  'ח': 8,
  'ט': 9,
  'י': 10,
  'יא': 11,
  'י"א': 11,
  'י׳א': 11,
  'י-א': 11,
  'יב': 12,
  'י"ב': 12,
  'י׳ב': 12,
  'י-ב': 12,
};

export function extractGradeNumber(gradeStr?: string | number | null): number | null {
  if (gradeStr === undefined || gradeStr === null) return null;
  if (typeof gradeStr === 'number') {
    return gradeStr >= 1 && gradeStr <= 12 ? gradeStr : null;
  }
  
  const trimmed = gradeStr.toString().trim();
  if (!trimmed) return null;

  // Check Hebrew letter direct match or stripped of quotes/prefixes
  const cleanHebrew = trimmed
    .replace(/["'״׳]/g, '')
    .replace(/^(?:שכבה|כיתה)\s+/i, '')
    .trim();

  if (cleanHebrew in HEBREW_LETTER_TO_GRADE) {
    return HEBREW_LETTER_TO_GRADE[cleanHebrew];
  }

  // Also check if Hebrew string contains יב, יא, י, ט, ח, ז
  if (/(?:שכבה|כיתה)?\s*יב\b/i.test(trimmed)) return 12;
  if (/(?:שכבה|כיתה)?\s*יא\b/i.test(trimmed)) return 11;
  if (/(?:שכבה|כיתה)?\s*י\b/i.test(trimmed)) return 10;
  if (/(?:שכבה|כיתה)?\s*ט\b/i.test(trimmed)) return 9;
  if (/(?:שכבה|כיתה)?\s*ח\b/i.test(trimmed)) return 8;
  if (/(?:שכבה|כיתה)?\s*ז\b/i.test(trimmed)) return 7;

  // Match standalone number or patterns like "8th", "Grade 8", "8"
  const match = trimmed.match(/\b(1[0-2]|[1-9])(?:th|st|nd|rd)?\b/i) || trimmed.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 12) return num;
  }
  return null;
}

export function formatGradeLetter(gradeNum?: number | string | null): string {
  if (!gradeNum) return '';
  const num = typeof gradeNum === 'number' ? gradeNum : extractGradeNumber(gradeNum);
  if (!num) return String(gradeNum);
  return HEBREW_GRADE_LETTERS[num] || String(num);
}

export function formatGradeText(gradeNum?: number | string | null, lang: 'en' | 'he' = 'he'): string {
  if (!gradeNum) return '';
  const num = typeof gradeNum === 'number' ? gradeNum : extractGradeNumber(gradeNum);
  if (!num) return String(gradeNum);
  if (lang === 'he') {
    const letter = HEBREW_GRADE_LETTERS[num];
    return letter ? `שכבה ${letter}` : `שכבה ${num}`;
  }
  return `Grade ${num}`;
}

export function isGradeEligible(
  studentGrade?: number | null,
  bookGradeLevel?: string | null
): { eligible: boolean; reason?: string; bookGrade?: number | null } {
  if (!studentGrade) {
    return { eligible: true };
  }

  const bookGrade = extractGradeNumber(bookGradeLevel);
  // If book has no specific grade level or is 'General', it's allowed
  if (bookGrade === null) {
    return { eligible: true, bookGrade: null };
  }

  if (bookGrade === studentGrade) {
    return { eligible: true, bookGrade };
  }

  const bookGradeHebrew = HEBREW_GRADE_LETTERS[bookGrade] || String(bookGrade);
  const studentGradeHebrew = HEBREW_GRADE_LETTERS[studentGrade] || String(studentGrade);

  return {
    eligible: false,
    bookGrade,
    reason: `Grade restriction: Student is in Grade ${studentGrade} (${studentGradeHebrew}), but this book is designated for Grade ${bookGrade} (${bookGradeHebrew}).`,
  };
}
