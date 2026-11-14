import { formatGradeLetter } from './gradeUtils';

export type Language = 'en' | 'he';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  titlesMetric: (count: number) => string;
  studentsMetric: (count: number) => string;
  issuedMetric: (count: number) => string;
  seedDbButton: string;
  seedingText: string;
  seededText: string;
  enrollStudentButton: string;
  addBookButton: string;
  languageButton: string;

  // Header Banner & Ledger Title
  circLedgerTitle: string;
  circLedgerSubtitle: string;
  searchByBook: string;
  searchByStudent: string;

  // Search Bars
  searchBookPlaceholder: string;
  searchStudentPlaceholder: string;
  searchShortcut: string;

  // Book Search View
  copiesCirculation: string;
  availableInStorage: (count: number) => string;
  updateDetails: string;
  classFilter: string;
  allClasses: (count: number) => string;
  allCopiesInInventory: string;
  noActiveBorrowings: string;
  quickAccessTitles: string;
  quickAccessTitlesSub: string;
  titlesCataloged: (count: number) => string;
  viewRoster: string;
  availShort: string;
  noBooksMatch: (q: string) => string;
  tryExactIsbn: string;
  toSearch: string;
  toSwitchMode: string;
  toInspect: string;

  // Student Search View
  studentDossier: string;
  activeRentalsHeld: string;
  issueTextbookButton: string;
  activeCustodyRecord: (count: number) => string;
  checkedOut: string;
  due: string;
  returnBook: string;
  returningBook: string;
  noOutstandingLoans: string;
  zeroBorrowed: string;
  quickAccessStudents: string;
  quickAccessStudentsSub: string;
  studentsEnrolledCount: (count: number) => string;
  viewDossier: string;
  noStudentsMatch: (q: string) => string;
  tryExactStudentId: string;
  returnedHistoryTitle: (count: number) => string;
  returnedDateLabel: string;
  noReturnedHistory: string;

  // Class Accordion
  gradeAndClass: (grade: string, section?: string) => string;
  cohort: (cls: string) => string;
  copiesOut: (count: number) => string;
  studentIdLabel: string;
  copyBarcodeLabel: string;
  issuedDateLabel: string;
  markReturnedButton: string;
  returningLabel: string;

  // Status Badges
  statusActive: string;
  statusReturned: string;
  statusOverdue: string;

  // Modals - Add Book
  addBookTitle: string;
  addBookSub: string;
  bookTitleLabel: string;
  isbnLabel: string;
  subjectLabel: string;
  gradeLevelLabel: string;
  totalCopiesLabel: string;
  cancelButton: string;
  saveBookButton: string;
  savingButton: string;

  // Modals - Edit Book
  editBookTitle: string;
  editBookSub: (title: string) => string;
  saveChangesButton: string;
  updatingButton: string;

  // Modals - Add Student
  enrollStudentTitle: string;
  enrollStudentSub: string;
  fullNameLabel: string;
  matriculationIdLabel: string;
  classHomeroomLabel: string;
  studentGradeLabel: string;
  registeringButton: string;
  confirmEnrollStudent: string;

  // Modals - Issue Textbook
  issueRentalTitle: string;
  issueRentalSub: (name: string) => string;
  selectBookLabel: string;
  gradeMatchTag: (grade: number) => string;
  gradeMismatchTag: (grade: number) => string;
  filterGradeOnly: (grade: number) => string;
  showingAllGrades: string;
  barcodeStickerLabel: string;
  completeIssuanceButton: string;
  issuingButton: string;
  noEligibleBooksFound: (grade: number) => string;
  noBooksInCatalog: string;

  // Modals - Import Students Excel
  importExcelButton: string;
  importExcelTitle: string;
  importExcelSub: string;
  dragOrClickExcel: string;
  parsingExcel: string;
  previewStudentsTitle: (count: number) => string;
  importSuccess: (count: number) => string;
  importConfirmButton: (count: number) => string;
  importingButton: string;
  invalidExcelFormat: string;
  selectExcelFilePrompt: string;
  sampleFileHint: string;

  // Footer & Alerts
  footerText: string;
  firestoreLiveBadge: string;
  securityRulesTitle: string;
  securityRulesNotice: string;
  quickFixRules: string;
  databaseEmptyTitle: string;
  databaseEmptyNotice: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'PassThePage',
    appSubtitle: 'Curriculum Inventory',
    titlesMetric: (c) => (c === 1 ? 'title' : 'titles'),
    studentsMetric: (c) => (c === 1 ? 'student' : 'students'),
    issuedMetric: () => 'issued',
    seedDbButton: 'Seed DB',
    seedingText: 'Seeding...',
    seededText: 'Seeded',
    enrollStudentButton: 'Enroll Student',
    addBookButton: 'Add Book',
    languageButton: 'עברית',

    circLedgerTitle: 'Circulation Ledger',
    circLedgerSubtitle: 'Rapid classroom textbook tracking, batch cohort queries, and custody records',
    searchByBook: 'Search by Book',
    searchByStudent: 'Search by Student',

    searchBookPlaceholder: 'Search textbook title, subject, or ISBN...',
    searchStudentPlaceholder: 'Search student by full name or ID (e.g. Maya Lin, 2026-1001)...',
    searchShortcut: '⌘K',

    copiesCirculation: 'Copies in circulation',
    availableInStorage: (c) => `${c} available in storage`,
    updateDetails: 'Update Details',
    classFilter: 'Class Filter:',
    allClasses: (c) => `All Classes (${c})`,
    allCopiesInInventory: 'All copies currently in inventory',
    noActiveBorrowings: 'No active student borrowings recorded for this textbook.',
    quickAccessTitles: 'Quick-Access Curriculum Titles',
    quickAccessTitlesSub: 'Select any registered textbook card to inspect enrolled class cohorts',
    titlesCataloged: (c) => `${c} ${c === 1 ? 'title' : 'titles'} cataloged`,
    viewRoster: 'View Roster',
    availShort: 'avail.',
    noBooksMatch: (q) => `No textbooks matched "${q}"`,
    tryExactIsbn: 'Try searching by exact ISBN or use "+ Add Book" in the navigation bar to register it.',
    toSearch: 'to search',
    toSwitchMode: 'to switch mode',
    toInspect: 'to inspect',

    studentDossier: 'Student Dossier',
    activeRentalsHeld: 'Active rentals held',
    issueTextbookButton: 'Issue Textbook',
    activeCustodyRecord: (c) => `Active Textbook Custody Record (${c})`,
    checkedOut: 'Checked out:',
    due: 'Due:',
    returnBook: 'Return Book',
    returningBook: 'Returning...',
    noOutstandingLoans: 'No outstanding textbook loans',
    zeroBorrowed: 'This student currently holds zero borrowed textbooks.',
    quickAccessStudents: 'Quick-Access Student Directory',
    quickAccessStudentsSub: 'Select any enrolled student profile to inspect custody records or issue copies',
    studentsEnrolledCount: (c) => `${c} ${c === 1 ? 'student' : 'students'} enrolled`,
    viewDossier: 'View Dossier',
    noStudentsMatch: (q) => `No student files matched "${q}"`,
    tryExactStudentId: 'Try searching by exact student ID (e.g. 2026-1001) or use "+ Enroll Student" above.',
    returnedHistoryTitle: (c) => `Returned Books History (${c})`,
    returnedDateLabel: 'Returned:',
    noReturnedHistory: 'No returned textbook history recorded for this student.',

    gradeAndClass: (grade, section) => (section ? `Grade ${grade} — Class ${section}` : `Grade ${grade}`),
    cohort: (cls) => `Cohort ${cls}`,
    copiesOut: (c) => `${c} ${c === 1 ? 'copy' : 'copies'}`,
    studentIdLabel: 'ID:',
    copyBarcodeLabel: 'Barcode:',
    issuedDateLabel: 'Issued',
    markReturnedButton: 'Mark Returned',
    returningLabel: 'Returning...',

    statusActive: 'Active Loan',
    statusReturned: 'Returned to Inventory',
    statusOverdue: 'Overdue Term',

    addBookTitle: 'Add New Textbook',
    addBookSub: 'Register a new catalog title to the collection',
    bookTitleLabel: 'Book Title',
    isbnLabel: 'ISBN',
    subjectLabel: 'Subject',
    gradeLevelLabel: 'Grade Level',
    totalCopiesLabel: 'Total Copies',
    cancelButton: 'Cancel',
    saveBookButton: 'Add Textbook',
    savingButton: 'Saving...',

    editBookTitle: 'Update Textbook Details',
    editBookSub: (title) => `Edit catalog details for ${title}`,
    saveChangesButton: 'Save Changes',
    updatingButton: 'Updating...',

    enrollStudentTitle: 'Enroll New Student',
    enrollStudentSub: 'Register student credentials for library circulation',
    fullNameLabel: 'Full Legal Name',
    matriculationIdLabel: 'Student ID / Matriculation No.',
    classHomeroomLabel: 'Class / Homeroom',
    studentGradeLabel: 'Grade Level',
    registeringButton: 'Registering...',
    confirmEnrollStudent: 'Enroll Student',

    issueRentalTitle: 'Issue Textbook Rental',
    issueRentalSub: (name) => `Assigning custody to ${name}`,
    selectBookLabel: 'Select Book Title',
    gradeMatchTag: (grade) => `Grade ${grade}`,
    gradeMismatchTag: (grade) => `Requires Grade ${grade}`,
    filterGradeOnly: (grade) => `Grade ${grade} Only`,
    showingAllGrades: 'Showing All',
    barcodeStickerLabel: 'Copy Barcode / Sticker ID',
    completeIssuanceButton: 'Complete Issuance',
    issuingButton: 'Issuing...',
    noEligibleBooksFound: (g) => `No books designated for Grade ${g}. Click "Showing All" to browse.`,
    noBooksInCatalog: 'No books found.',

    importExcelButton: 'Import Excel',
    importExcelTitle: 'Import Students from Excel',
    importExcelSub: 'Bulk upload class rosters via .xlsx spreadsheet',
    dragOrClickExcel: 'Drop an .xlsx student roster here, or click to browse',
    parsingExcel: 'Reading Excel workbook...',
    previewStudentsTitle: (c) => `Preview (${c} students detected)`,
    importSuccess: (c) => `Successfully enrolled ${c} students!`,
    importConfirmButton: (c) => `Import ${c} Students`,
    importingButton: 'Importing to Firestore...',
    invalidExcelFormat: 'Could not detect required columns (ID, Name, Grade, Class) in this Excel sheet.',
    selectExcelFilePrompt: 'Please select an Excel (.xlsx) file',
    sampleFileHint: 'Supports standard Ministry/School rosters with ת.ז, שם, כיתה, מקבילה',

    footerText: 'PassThePage · Boutique Editorial Circulation System ·',
    firestoreLiveBadge: 'Cloud Firestore Live',
    securityRulesTitle: 'Firebase Security Rules Need Activation',
    securityRulesNotice: 'Your Firestore database returned permission-denied. Please publish read/write rules in the Firebase Console.',
    quickFixRules: 'Paste into Firebase Console > Cloud Firestore > Rules:',
    databaseEmptyTitle: 'Connected to Cloud Firestore — Database Empty',
    databaseEmptyNotice: 'Your Firestore database has 0 entries. Click "Seed DB" to populate demo data or "Add Book" to start fresh.',
  },

  he: {
    appTitle: 'PassThePage',
    appSubtitle: 'מצאי ספרי לימוד',
    titlesMetric: (c) => (c === 1 ? 'כותר' : 'כותרים'),
    studentsMetric: (c) => (c === 1 ? 'תלמיד' : 'תלמידים'),
    issuedMetric: () => 'מושאלים',
    seedDbButton: 'טעינת דוגמה',
    seedingText: 'טוען...',
    seededText: 'נטען',
    enrollStudentButton: 'רישום תלמיד',
    addBookButton: 'הוספת ספר',
    languageButton: 'English',

    circLedgerTitle: 'יומן השאלת ספרים',
    circLedgerSubtitle: 'מעקב השאלות ספרים כיתתי, שאילתות שכבה וניהול מצאי ספרי לימוד',
    searchByBook: 'חיפוש לפי ספר',
    searchByStudent: 'חיפוש לפי תלמיד',

    searchBookPlaceholder: 'חיפוש לפי שם ספר, מקצוע או מסת״ב...',
    searchStudentPlaceholder: 'חיפוש תלמיד לפי שם מלא או ת.ז./מזהה (למשל מיה לוי, 2026-1001)...',
    searchShortcut: '⌘K',

    copiesCirculation: 'עותקים בהשאלה',
    availableInStorage: (c) => `${c} זמינים במחסן המלאי`,
    updateDetails: 'עדכון פרטים',
    classFilter: 'סינון כיתה:',
    allClasses: (c) => `כל הכיתות (${c})`,
    allCopiesInInventory: 'כל העותקים נמצאים במלאי בית הספר',
    noActiveBorrowings: 'אין השאלות פעילות לספר לימוד זה כרגע.',
    quickAccessTitles: 'ספרי לימוד - גישה מהירה',
    quickAccessTitlesSub: 'בחר ספר לימוד מהקטלוג לצפייה ברשימת הכיתות והתלמידים השואלים',
    titlesCataloged: (c) => `${c} ${c === 1 ? 'ספר' : 'ספרים'} בקטלוג`,
    viewRoster: 'לרשימת הכיתה',
    availShort: 'זמינים',
    noBooksMatch: (q) => `לא נמצאו ספרי לימוד התואמים את "${q}"`,
    tryExactIsbn: 'נסה לחפש לפי מסת״ב מדויק או לחץ על "+ הוספת ספר" בסרגל העליון.',
    toSearch: 'לחיפוש',
    toSwitchMode: 'להחלפת מצב',
    toInspect: 'לבחירה',

    studentDossier: 'תיק תלמיד',
    activeRentalsHeld: 'ספרים מושאלים',
    issueTextbookButton: 'השאלת ספר לתלמיד',
    activeCustodyRecord: (c) => `ספרים בהחזקת התלמיד (${c})`,
    checkedOut: 'תאריך השאלה:',
    due: 'מועד החזרה:',
    returnBook: 'החזרת ספר',
    returningBook: 'מבצע החזרה...',
    noOutstandingLoans: 'אין ספרים מושאלים לתלמיד זה',
    zeroBorrowed: 'התלמיד אינו מחזיק כרגע בספרי לימוד שהושאלו מהספרייה.',
    quickAccessStudents: 'רשימת תלמידים - גישה מהירה',
    quickAccessStudentsSub: 'בחר כרטיס תלמיד לצפייה ברשימת הספרים המושאלים או לביצוע השאלה',
    studentsEnrolledCount: (c) => `${c} ${c === 1 ? 'תלמיד' : 'תלמידים'} רשומים`,
    viewDossier: 'לתיק התלמיד',
    noStudentsMatch: (q) => `לא נמצאו תלמידים התואמים את "${q}"`,
    tryExactStudentId: 'נסה לחפש לפי מזהה תלמיד מלא או לחץ על "+ רישום תלמיד" בסרגל העליון.',
    returnedHistoryTitle: (c) => `היסטוריית ספרים שהוחזרו (${c})`,
    returnedDateLabel: 'תאריך החזרה:',
    noReturnedHistory: 'אין עדיין היסטוריית ספרים שהוחזרו לתלמיד זה.',

    gradeAndClass: (grade, section) => (section ? `שכבה ${grade} — כיתה ${section}` : `שכבה ${grade}`),
    cohort: (cls) => `כיתה ${cls}`,
    copiesOut: (c) => `${c} ${c === 1 ? 'עותק' : 'עותקים'}`,
    studentIdLabel: 'מזהה:',
    copyBarcodeLabel: 'ברקוד:',
    issuedDateLabel: 'הושאל',
    markReturnedButton: 'סימון כהוחזר',
    returningLabel: 'מעדכן...',

    statusActive: 'בהשאלה פעילה',
    statusReturned: 'הוחזר למלאי',
    statusOverdue: 'באיחור החזרה',

    addBookTitle: 'הוספת ספר לימוד חדש',
    addBookSub: 'רישום כותר חדש לקטלוג הספרים של בית הספר',
    bookTitleLabel: 'שם הספר',
    isbnLabel: 'מסת״ב (ISBN)',
    subjectLabel: 'מקצוע לימוד',
    gradeLevelLabel: 'שכבת גיל / כיתה',
    totalCopiesLabel: 'סה״כ עותקים במלאי',
    cancelButton: 'ביטול',
    saveBookButton: 'הוספת ספר',
    savingButton: 'שומר...',

    editBookTitle: 'עדכון פרטי ספר לימוד',
    editBookSub: (title) => `עריכת פרטי קטלוג עבור "${title}"`,
    saveChangesButton: 'שמירת שינויים',
    updatingButton: 'מעדכן...',

    enrollStudentTitle: 'רישום תלמיד חדש',
    enrollStudentSub: 'הזנת פרטי תלמיד במערכת השאלת הספרים',
    fullNameLabel: 'שם מלא',
    matriculationIdLabel: 'מספר ת.ז. / מזהה תלמיד',
    classHomeroomLabel: 'כיתת אם (למשל: 10-A, י-1)',
    studentGradeLabel: 'שכבת גיל',
    registeringButton: 'רושם...',
    confirmEnrollStudent: 'רישום תלמיד',

    issueRentalTitle: 'השאלת ספר לימוד',
    issueRentalSub: (name) => `השאלה לתלמיד/ה: ${name}`,
    selectBookLabel: 'בחירת ספר לימוד מהקטלוג',
    gradeMatchTag: (grade) => `שכבה ${formatGradeLetter(grade)}`,
    gradeMismatchTag: (grade) => `מיועד לשכבה ${formatGradeLetter(grade)}`,
    filterGradeOnly: (grade) => `שכבה ${formatGradeLetter(grade)} בלבד`,
    showingAllGrades: 'הצגת כל השכבות',
    barcodeStickerLabel: 'ברקוד / מזהה מדבקת עותק',
    completeIssuanceButton: 'אישור השאלה',
    issuingButton: 'מבצע השאלה...',
    noEligibleBooksFound: (g) => `לא נמצאו ספרים המיועדים לשכבה ${formatGradeLetter(g)}. לחץ "הצגת כל השכבות" לעיון.`,
    noBooksInCatalog: 'לא נמצאו ספרים בקטלוג.',

    importExcelButton: 'ייבוא מאקסל',
    importExcelTitle: 'ייבוא תלמידים מקובץ אקסל',
    importExcelSub: 'הזנה מרוכזת של רשימות תלמידים מקובץ .xlsx',
    dragOrClickExcel: 'גרור ושחרר קובץ אקסל (.xlsx) לכאן, או לחץ לבחירת קובץ',
    parsingExcel: 'קורא את גיליון האקסל...',
    previewStudentsTitle: (c) => `תצוגה מקדימה (${c} תלמידים זוהו בקובץ)`,
    importSuccess: (c) => `ייבוא ${c} תלמידים הושלם בהצלחה!`,
    importConfirmButton: (c) => `ייבוא ${c} תלמידים למערכת`,
    importingButton: 'מייבא למסד הנתונים...',
    invalidExcelFormat: 'לא נמצאו עמודות תלמידים מזוהות (ת.ז, שם פרטי/משפחה, כיתה, מקבילה). אנא בדוק את מבנה הקובץ.',
    selectExcelFilePrompt: 'אנא בחר קובץ אקסל (.xlsx)',
    sampleFileHint: 'תומך בפורמט קובץ בית-ספרי עם עמודות ת.ז, שם משפחה, שם פרטי, כיתה, מקבילה',

    footerText: 'PassThePage · מערכת ניהול השאלת ספרי לימוד ·',
    firestoreLiveBadge: 'סנכרון ענן חי (Firestore)',
    securityRulesTitle: 'נדרשת הפעלת הרשאות ב-Firebase',
    securityRulesNotice: 'מסד הנתונים החזיר שגיאת הרשאות (permission-denied). יש לעדכן את כללי האבטחה ב-Firebase Console.',
    quickFixRules: 'הדבק בכרטיסיית Rules ב-Cloud Firestore:',
    databaseEmptyTitle: 'מחובר ל-Cloud Firestore — מסד הנתונים ריק',
    databaseEmptyNotice: 'במסד הנתונים יש 0 רשומות. לחץ על "טעינת דוגמה" למילוי ספרים ותלמידים לדוגמה או "הוספת ספר" להזנה ידנית.',
  },
};
