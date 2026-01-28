/*
  Application Constants

  WHY CENTRALIZE CONSTANTS?
  1. Single source of truth - change once, updates everywhere
  2. Easy to find and modify
  3. Prevents typos from using strings directly
  4. Can be imported by any component that needs them
*/

// Default descriptor categories and phrases
// These are used when setting up a new company
export const DEFAULT_DESCRIPTOR_CATEGORIES = [
  {
    name: 'Servicequalität',
    descriptors: [
      'exzellenter Service von Anfang bis Ende',
      'schneller und effizienter Ablauf',
      'gründlich und detailorientiert',
      'hat meine Erwartungen übertroffen',
      'alles verlief reibungslos',
    ],
  },
  {
    name: 'Personal & Team',
    descriptors: [
      'freundliches und professionelles Team',
      'kompetente und hilfsbereite Mitarbeiter',
      'geduldig und verständnisvoll',
      'hervorragende Kommunikation',
      'ich fühlte mich willkommen und geschätzt',
    ],
  },
  {
    name: 'Preis & Leistung',
    descriptors: [
      'faire und transparente Preise',
      'tolles Preis-Leistungs-Verhältnis',
      'keine versteckten Kosten',
      'wettbewerbsfähige Preise',
    ],
  },
  {
    name: 'Gesamterlebnis',
    descriptors: [
      'kann ich sehr empfehlen',
      'werde definitiv wiederkommen',
      'hat meine Erwartungen übertroffen',
      'es war ein Vergnügen',
      'vertrauenswürdig und zuverlässig',
    ],
  },
];

// Review templates that combine selected descriptors
// The {descriptors} placeholder gets replaced with user selections
export const REVIEW_TEMPLATES = [
  'Ich hatte eine wunderbare Erfahrung. {descriptors}. Ich würde sie ohne Zögern weiterempfehlen.',
  'Wirklich beeindruckt von meinem Besuch. {descriptors}. Ich freue mich auf meinen nächsten Termin.',
  '{descriptors}. Insgesamt eine fantastische Erfahrung, die ich jedem empfehlen würde.',
  'Aus meiner Erfahrung kann ich sagen, dass {descriptors}. Fünf Sterne wohlverdient.',
];

// App-wide settings
export const APP_CONFIG = {
  appName: 'Review Bot',
  maxDescriptorsPerReview: 6, // Prevent overly long reviews
  minDescriptorsForReview: 2, // Ensure reviews have substance
};

// Status messages for user feedback
export const MESSAGES = {
  reviewCopied: 'Bewertung in die Zwischenablage kopiert!',
  selectMore: 'Bitte wählen Sie mindestens 2 Beschreibungen aus, um eine Bewertung zu erstellen.',
  selectLess: 'Bitte wählen Sie maximal 6 Beschreibungen für eine natürliche Bewertung.',
  linkOpening: 'Google Bewertungen werden geöffnet...',
  error: {
    loadCompanies: 'Unternehmen konnten nicht geladen werden. Bitte erneut versuchen.',
    loadDescriptors: 'Optionen konnten nicht geladen werden. Bitte erneut versuchen.',
    generic: 'Etwas ist schief gelaufen. Bitte erneut versuchen.',
  },
};

// ============================================
// LANGUAGE SETTINGS
// ============================================
export const LANGUAGES = {
  de: {
    code: 'de',
    name: 'Deutsch',
    nativeName: 'Deutsch',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
};

export const DEFAULT_LANGUAGE = 'de';

// ============================================
// NOTIFICATION INTERVAL OPTIONS
// ============================================
export const NOTIFICATION_INTERVALS = [
  { value: 7, label: { de: 'Wöchentlich', en: 'Weekly' } },
  { value: 14, label: { de: 'Alle 2 Wochen', en: 'Every 2 weeks' } },
  { value: 30, label: { de: 'Monatlich', en: 'Monthly' } },
  { value: 60, label: { de: 'Alle 2 Monate', en: 'Every 2 months' } },
  { value: 90, label: { de: 'Vierteljährlich', en: 'Quarterly' } },
];

// Test intervals for development - sends email immediately or after 2 minutes
// These use fractional days (1 minute = 1/1440 of a day)
export const TEST_INTERVALS = [
  { value: 0, label: { de: 'Sofort (Test)', en: 'Now (Test)' } },
  { value: 0.00139, label: { de: '2 Minuten (Test)', en: '2 Minutes (Test)' } }, // ~2 min in days
];

// Combined intervals for settings (production + test)
export const ALL_NOTIFICATION_INTERVALS = [...NOTIFICATION_INTERVALS, ...TEST_INTERVALS];

export const DEFAULT_NOTIFICATION_INTERVAL = 30;

// ============================================
// TIME SLOT OPTIONS
// ============================================
export const TIME_SLOTS = [
  { value: 'morning', label: { de: 'Morgens (9-12 Uhr)', en: 'Morning (9am-12pm)' } },
  { value: 'afternoon', label: { de: 'Nachmittags (12-17 Uhr)', en: 'Afternoon (12pm-5pm)' } },
  { value: 'evening', label: { de: 'Abends (17-20 Uhr)', en: 'Evening (5pm-8pm)' } },
];

// ============================================
// UI TEXT (Bilingual)
// ============================================
export const UI_TEXT = {
  de: {
    // Navigation
    dashboard: 'Dashboard',
    companies: 'Unternehmen',
    subscribers: 'Abonnenten',
    emailList: 'E-Mail-Liste',
    analytics: 'Analytik',
    settings: 'Einstellungen',
    qrCode: 'QR-Code',

    // Common actions
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    back: 'Zurück',
    next: 'Weiter',
    submit: 'Absenden',
    loading: 'Laden...',

    // Settings page
    settingsTitle: 'Einstellungen',
    languageLabel: 'Sprache',
    defaultIntervalLabel: 'Standard-Benachrichtigungsintervall',
    emailSettingsTitle: 'E-Mail-Einstellungen',
    savedSuccessfully: 'Erfolgreich gespeichert!',

    // QR Panel
    selectCompany: 'Unternehmen auswählen',
    reviewPage: 'Bewertungsseite',
    signupPage: 'Anmeldeseite',
    printQR: 'QR-Code drucken',
    scanToReview: 'Scannen zum Bewerten',
    scanToSignup: 'Scannen zum Anmelden',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    companies: 'Companies',
    subscribers: 'Subscribers',
    emailList: 'Email List',
    analytics: 'Analytics',
    settings: 'Settings',
    qrCode: 'QR Code',

    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    loading: 'Loading...',

    // Settings page
    settingsTitle: 'Settings',
    languageLabel: 'Language',
    defaultIntervalLabel: 'Default notification interval',
    emailSettingsTitle: 'Email Settings',
    savedSuccessfully: 'Saved successfully!',

    // QR Panel
    selectCompany: 'Select company',
    reviewPage: 'Review page',
    signupPage: 'Signup page',
    printQR: 'Print QR Code',
    scanToReview: 'Scan to leave a review',
    scanToSignup: 'Scan to sign up',
  },
};
