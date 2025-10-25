/**
 * Utility functions for handling availability status and ready dates
 */

export type AvailabilityStatus = 'available' | 'reserved' | 'adopted';

export interface AvailabilityInfo {
  status: AvailabilityStatus;
  readyDate: string | null;
  readyDateFormatted: string | null;
}

/**
 * Calculate the ready date (8 weeks from birth date)
 * @param birthDate - The puppy's date of birth (YYYY-MM-DD format)
 * @returns The ready date in YYYY-MM-DD format, or null if birthDate is invalid
 */
export function calculateReadyDate(birthDate: string): string | null {
  if (!birthDate) return null;
  
  try {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    
    // Add 8 weeks (56 days) to the birth date
    const readyDate = new Date(birth);
    readyDate.setDate(readyDate.getDate() + 56);
    
    return readyDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch (error) {
    console.error('Error calculating ready date:', error);
    return null;
  }
}

/**
 * Format the ready date for display (e.g., "Oct 20, 2024")
 * @param readyDate - The ready date in YYYY-MM-DD format
 * @returns Formatted date string or null if invalid
 */
export function formatReadyDate(readyDate: string | null): string | null {
  if (!readyDate) return null;
  
  try {
    const date = new Date(readyDate);
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting ready date:', error);
    return null;
  }
}

/**
 * Get availability information for a listing
 * @param availabilityStatus - The availability status from the listing
 * @param birthDate - The puppy's birth date (for individual puppies)
 * @param individualPuppies - Array of individual puppies (for litters)
 * @returns Availability information object
 */
export function getAvailabilityInfo(
  availabilityStatus: AvailabilityStatus,
  birthDate?: string,
  individualPuppies?: Array<{ puppyDateOfBirth?: string }>
): AvailabilityInfo {
  let readyDate: string | null = null;
  
  // For single puppy, use the birth date directly
  if (birthDate) {
    readyDate = calculateReadyDate(birthDate);
  }
  // For litters, use the earliest birth date from individual puppies
  else if (individualPuppies && individualPuppies.length > 0) {
    const birthDates = individualPuppies
      .map(puppy => puppy.puppyDateOfBirth)
      .filter(Boolean)
      .sort();
    
    if (birthDates.length > 0) {
      readyDate = calculateReadyDate(birthDates[0]);
    }
  }
  
  const readyDateFormatted = formatReadyDate(readyDate);
  
  return {
    status: availabilityStatus,
    readyDate,
    readyDateFormatted
  };
}

/**
 * Get the display text for availability badge
 * @param availabilityInfo - The availability information object
 * @returns Formatted display text for the badge
 */
export function getAvailabilityBadgeText(availabilityInfo: AvailabilityInfo): string {
  const { status, readyDateFormatted } = availabilityInfo;
  // sold_out
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  
  if (status === 'adopted' || !readyDateFormatted) {
    return `${statusText} • Ready —`;
  }
  
  return `${statusText} • Ready ${readyDateFormatted}`;
}

/**
 * Get the paw print icon SVG path for the availability badge
 * @returns SVG path string for the paw print icon
 */
export function getAvailabilityBadgeIconPath(): string {
  return "M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9C21 10.1 20.1 11 19 11C17.9 11 17 10.1 17 9C17 7.9 17.9 7 19 7C20.1 7 21 7.9 21 9ZM7 9C7 10.1 6.1 11 5 11C3.9 11 3 10.1 3 9C3 7.9 3.9 7 5 7C6.1 7 7 7.9 7 9ZM12 8C10.9 8 10 8.9 10 10V12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12V10C14 8.9 13.1 8 12 8ZM19 12C19 13.1 18.1 14 17 14C15.9 14 15 13.1 15 12C15 10.9 15.9 10 17 10C18.1 10 19 10.9 19 12ZM5 12C5 13.1 4.1 14 3 14C1.9 14 1 13.1 1 12C1 10.9 1.9 10 3 10C4.1 10 5 10.9 5 12Z";
}

/**
 * Get the CSS classes for availability badge based on status
 * @param status - The availability status
 * @returns CSS classes for styling the badge
 */
export function getAvailabilityBadgeClasses(status: AvailabilityStatus): string {
  const baseClasses = "px-3 py-1 text-sm font-medium rounded-full border flex items-center gap-1 whitespace-nowrap";
  
  switch (status) {
    case 'available':
      return `${baseClasses} bg-white text-purple-800 border-purple-300`;
    case 'reserved':
      return `${baseClasses} bg-white text-orange-800 border-orange-300`;
    case 'adopted':
      return `${baseClasses} bg-white text-gray-800 border-gray-300`;
    default:
      return `${baseClasses} bg-white text-purple-800 border-purple-300`;
  }
}
