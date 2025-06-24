import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The generated slug
 */
export function generateSlug(text) {
  if (!text || typeof text !== 'string') {
    return 'recipe';
  }

  return text
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces with single hyphen
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Ensure we have something
    || 'recipe';
}

/**
 * Ensure slug uniqueness by checking against existing slugs
 * @param {string} baseSlug - The base slug to check
 * @param {Array} existingSlugs - Array of existing slugs to check against
 * @returns {string} - A unique slug
 */
export function ensureUniqueSlug(baseSlug, existingSlugs = []) {
  let finalSlug = baseSlug;
  let counter = 0;

  while (existingSlugs.includes(finalSlug)) {
    counter++;
    finalSlug = `${baseSlug}-${counter}`;
  }

  return finalSlug;
}

/**
 * Format time in minutes to human readable format
 * @param {number} minutes - Time in minutes
 * @returns {string} - Formatted time string
 */
export function formatTime(minutes) {
  if (!minutes || minutes === 0) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Calculate total cooking time
 * @param {Object} recipe - Recipe object with prep_time and cook_time
 * @returns {number} - Total time in minutes
 */
export function getTotalTime(recipe) {
  return (recipe?.prep_time || 0) + (recipe?.cook_time || 0);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}