/*
  Utility Functions

  This file contains helper functions used across the application.
  If a function is used in 2+ places, it belongs here.
*/

/**
 * Creates a URL-friendly slug from a string
 * Example: "Dr. Smith's Clinic" → "dr-smiths-clinic"
 *
 * WHY SLUGS?
 * - Clean URLs are better for SEO and sharing
 * - Easier to read than UUIDs
 * - /review/sunrise-dental vs /review/a1b2c3d4-e5f6...
 *
 * @param {string} text - The text to convert
 * @returns {string} URL-friendly slug
 */
export function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Capitalizes the first letter of a string
 *
 * @param {string} text
 * @returns {string}
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Combines selected descriptors into a natural-sounding sentence
 *
 * WHY THIS APPROACH?
 * Instead of just joining with commas, we use proper grammar:
 * - Two items: "A and B"
 * - Three+ items: "A, B, and C" (Oxford comma for clarity)
 *
 * @param {string[]} descriptors - Array of descriptor phrases
 * @returns {string} Grammatically correct sentence fragment
 */
export function combineDescriptors(descriptors) {
  if (!descriptors || descriptors.length === 0) return '';
  if (descriptors.length === 1) return descriptors[0];
  if (descriptors.length === 2) return `${descriptors[0]} und ${descriptors[1]}`;

  // German style: "A, B und C" (no comma before "und")
  const allButLast = descriptors.slice(0, -1).join(', ');
  const last = descriptors[descriptors.length - 1];
  return `${allButLast} und ${last}`;
}

/**
 * Generates a complete review from selected descriptors
 *
 * @param {string[]} descriptors - Selected descriptor phrases
 * @param {string[]} templates - Array of review templates
 * @returns {string} Complete review text
 */
export function generateReview(descriptors, templates) {
  if (!descriptors || descriptors.length === 0) return '';

  // Pick a random template for variety
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Capitalize first descriptor if it starts the review
  const combined = combineDescriptors(descriptors);
  const capitalizedCombined = capitalize(combined);

  // Replace placeholder, handling both sentence positions
  let review = template.replace('{descriptors}', combined);

  // If descriptors start the sentence, capitalize
  if (template.startsWith('{descriptors}')) {
    review = template.replace('{descriptors}', capitalizedCombined);
  }

  return review;
}

/**
 * Copies text to clipboard with fallback for older browsers
 *
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether the copy succeeded
 */
export async function copyToClipboard(text) {
  try {
    // Modern approach (most browsers)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (error) {
    console.error('copyToClipboard: Fehler beim Kopieren:', error);
    return false;
  }
}

/**
 * Formats a date for display in German format
 *
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Validates an email address
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generates a Google review URL from a place ID or existing URL
 * Google uses place IDs or direct search URLs
 *
 * @param {string} placeIdOrUrl - Google Place ID or full URL
 * @returns {string} Complete Google review URL
 */
export function getGoogleReviewUrl(placeIdOrUrl) {
  // If it's already a full URL, return as-is
  if (placeIdOrUrl.startsWith('http')) {
    return placeIdOrUrl;
  }

  // Otherwise, assume it's a Place ID
  return `https://search.google.com/local/writereview?placeid=${placeIdOrUrl}`;
}
