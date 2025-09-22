/**
 * Utility functions for text manipulation
 */

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string | undefined | null, maxLength: number = 120): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    // If we found a space in the last 20% of the text, use that
    return text.substring(0, lastSpaceIndex) + '...';
  }
  
  // Otherwise, just cut at maxLength and add ellipsis
  return truncated + '...';
}

/**
 * Truncates text for breed card descriptions
 * @param text - The description text
 * @returns Truncated description suitable for breed cards
 */
export function truncateBreedDescription(text: string | undefined | null): string {
  return truncateText(text, 100);
}

/**
 * Truncates text for breed type card descriptions
 * @param text - The description text
 * @returns Truncated description suitable for breed type cards
 */
export function truncateBreedTypeDescription(text: string | undefined | null): string {
  return truncateText(text, 120);
}
