/**
 * Scrolls to the highest (furthest up) field with an error
 * @param errors - Record of field names and their error messages
 */
export function scrollToFirstError(errors: Record<string, string>): void {
  if (!errors || Object.keys(errors).length === 0) {
    return;
  }

  // Find the highest (furthest up) error field by checking DOM positions
  const errorFields = Object.keys(errors);
  let highestField: string | null = null;
  let highestPosition = Infinity;

  // First, try to find all error fields in the DOM and get their positions
  errorFields.forEach(fieldName => {
    const fieldElement = findFieldElement(fieldName);
    if (fieldElement) {
      const rect = fieldElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const absoluteTop = rect.top + scrollTop;
      
      if (absoluteTop < highestPosition) {
        highestPosition = absoluteTop;
        highestField = fieldName;
      }
    }
  });

  // If we couldn't find any fields in DOM, fall back to first error field
  if (!highestField) {
    highestField = errorFields[0];
  }

  if (!highestField) {
    return;
  }

  // Check if this is a parent field (mother, father, stud, bitch)
  const isParentField = highestField.startsWith('mother') || 
                       highestField.startsWith('father') || 
                       highestField.startsWith('stud') || 
                       highestField.startsWith('bitch');

  // If it's a parent field, try to expand the parent section first
  if (isParentField) {
    const parentType = highestField.startsWith('mother') ? 'mother' :
                      highestField.startsWith('father') ? 'father' :
                      highestField.startsWith('stud') ? 'stud' :
                      highestField.startsWith('bitch') ? 'bitch' : null;
    
    if (parentType) {
      // Find the parent section and expand it
      const parentSection = document.querySelector(`[aria-expanded="false"][data-parent-type="${parentType}"]`);
      if (parentSection) {
        // Click to expand
        (parentSection as HTMLElement).click();
        // Wait a bit for the section to expand
        setTimeout(() => {
          scrollToField(highestField!);
        }, 200);
        return;
      }
    }
  }

  scrollToField(highestField);
}

/**
 * Helper function to find a field element by name
 */
function findFieldElement(fieldName: string): HTMLElement | null {
  // Try to find the field by data attribute
  // First, try the exact field name
  let fieldElement = document.querySelector(`[data-field-name="${fieldName}"]`) as HTMLElement;
  
  // If not found, try with parent field prefix (for nested fields like individualPuppies.name)
  if (!fieldElement && fieldName.includes('.')) {
    const parts = fieldName.split('.');
    // Try the first part (parent field)
    fieldElement = document.querySelector(`[data-field-name="${parts[0]}"]`) as HTMLElement;
    // If still not found, try the full path
    if (!fieldElement) {
      fieldElement = document.querySelector(`[data-field-name="${fieldName.replace(/\./g, '-')}"]`) as HTMLElement;
    }
  }

  // If still not found, try finding by input/select/textarea with name attribute
  if (!fieldElement) {
    const inputElement = document.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
    if (inputElement) {
      fieldElement = (inputElement.closest('[data-field-name]') || inputElement.closest('div')) as HTMLElement;
    }
  }

  return fieldElement;
}

/**
 * Helper function to scroll to a specific field
 */
function scrollToField(fieldName: string): void {
  const fieldElement = findFieldElement(fieldName);

  // If found, scroll to it
  if (fieldElement) {
    // Use smooth scroll with offset for fixed headers
    const offset = 100; // Adjust based on your header height
    const elementPosition = fieldElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Also focus the input if it's an input element
      const input = fieldElement.querySelector('input, select, textarea') as HTMLElement;
      if (input && typeof input.focus === 'function') {
        setTimeout(() => {
          input.focus();
        }, 300); // Small delay to ensure scroll completes
      }
    });
  }
}


