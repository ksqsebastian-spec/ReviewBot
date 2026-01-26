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
