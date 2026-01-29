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
// Written in a casual, human tone - avoiding overly formal AI-sounding language
export const REVIEW_TEMPLATES = [
  'Sehr zufrieden! {descriptors}. Kann ich nur empfehlen.',
  'War heute da und muss sagen: {descriptors}. Gerne wieder!',
  '{descriptors}. Hat mir gut gefallen, komme bestimmt nochmal.',
  'Top Erfahrung gemacht. {descriptors}. Daumen hoch!',
  '{descriptors}. Bin wirklich positiv überrascht worden.',
  'Kann ich empfehlen. {descriptors}. Hat alles gepasst.',
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
export const DEFAULT_LANGUAGE = 'de';

// ============================================
// UI TEXT (German only - app is German)
// ============================================
export const UI_TEXT = {
  // Navigation
  dashboard: 'Dashboard',
  companies: 'Unternehmen',
  qrCode: 'QR-Code',

  // Common actions
  save: 'Speichern',
  cancel: 'Abbrechen',
  delete: 'Löschen',
  edit: 'Bearbeiten',
  add: 'Hinzufügen',
  back: 'Zurück',
  loading: 'Laden...',

  // QR Panel
  selectCompany: 'Unternehmen auswählen',
  reviewPage: 'Bewertungsseite',
  printQR: 'QR-Code drucken',
  scanToReview: 'Scannen zum Bewerten',
};
