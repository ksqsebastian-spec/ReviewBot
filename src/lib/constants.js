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
    name: 'Service Quality',
    descriptors: [
      'excellent service from start to finish',
      'quick and efficient process',
      'thorough and attentive to detail',
      'went above and beyond expectations',
      'made the entire experience seamless',
    ],
  },
  {
    name: 'Staff & Team',
    descriptors: [
      'friendly and professional team',
      'knowledgeable and helpful staff',
      'patient and understanding',
      'great communication throughout',
      'made me feel welcome and valued',
    ],
  },
  {
    name: 'Value & Pricing',
    descriptors: [
      'fair and transparent pricing',
      'great value for the quality provided',
      'no hidden fees or surprises',
      'competitive rates',
    ],
  },
  {
    name: 'Overall Experience',
    descriptors: [
      'highly recommend to others',
      'will definitely return',
      'exceeded my expectations',
      'a pleasure to work with',
      'trustworthy and reliable',
    ],
  },
];

// Review templates that combine selected descriptors
// The {descriptors} placeholder gets replaced with user selections
export const REVIEW_TEMPLATES = [
  'I had a wonderful experience. {descriptors}. I would not hesitate to recommend them.',
  'Truly impressed with my visit. {descriptors}. Looking forward to my next appointment.',
  '{descriptors}. Overall, a fantastic experience that I would recommend to anyone.',
  'From my experience, I can say that {descriptors}. Five stars well deserved.',
];

// App-wide settings
export const APP_CONFIG = {
  appName: 'Review Bot',
  maxDescriptorsPerReview: 6, // Prevent overly long reviews
  minDescriptorsForReview: 2, // Ensure reviews have substance
};

// Status messages for user feedback
export const MESSAGES = {
  reviewCopied: 'Review copied to clipboard!',
  selectMore: 'Please select at least 2 descriptions to generate a review.',
  selectLess: 'Please select no more than 6 descriptions for a natural review.',
  linkOpening: 'Opening Google Reviews...',
  error: {
    loadCompanies: 'Unable to load companies. Please try again.',
    loadDescriptors: 'Unable to load options. Please try again.',
    generic: 'Something went wrong. Please try again.',
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
