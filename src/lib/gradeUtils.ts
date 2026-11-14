/**
 * Utility functions for grade level parsing and eligibility enforcement.
 */

export function extractGradeNumber(gradeStr?: string | number | null): number | null {
  if (gradeStr === undefined || gradeStr === null) return null;
  if (typeof gradeStr === 'number') return gradeStr;
  
  const trimmed = gradeStr.trim();
  // Match standalone number or patterns like "8th", "Grade 8", "8"
  const match = trimmed.match(/\b(1[0-2]|[1-9])(?:th|st|nd|rd)?\b/i) || trimmed.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 12) return num;
  }
  return null;
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

  return {
    eligible: false,
    bookGrade,
    reason: `Grade restriction: Student is in Grade ${studentGrade}, but this book is designated for Grade ${bookGrade}.`,
  };
}
