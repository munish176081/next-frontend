/**
 * Scrolls to the first field with an error
 * @param errors - Record of field names and their error messages
 */
export function scrollToFirstError(errors: Record<string, string>): void {
  if (!errors || Object.keys(errors).length === 0) {
    return;
  }

  // Get the first error field name
  const firstErrorField = Object.keys(errors)[0];
  
  if (!firstErrorField) {
    return;
  }

  // Check if this is a parent field (mother, father, stud, bitch)
  const isParentField = firstErrorField.startsWith('mother') || 
                       firstErrorField.startsWith('father') || 
                       firstErrorField.startsWith('stud') || 
                       firstErrorField.startsWith('bitch');

  // If it's a parent field, try to expand the parent section first
  if (isParentField) {
    const parentType = firstErrorField.startsWith('mother') ? 'mother' :
                      firstErrorField.startsWith('father') ? 'father' :
                      firstErrorField.startsWith('stud') ? 'stud' :
                      firstErrorField.startsWith('bitch') ? 'bitch' : null;
    
    if (parentType) {
      // Find the parent section and expand it
      const parentSection = document.querySelector(`[aria-expanded="false"][data-parent-type="${parentType}"]`);
      if (parentSection) {
        // Click to expand
        (parentSection as HTMLElement).click();
        // Wait a bit for the section to expand
        setTimeout(() => {
          scrollToField(firstErrorField);
        }, 200);
        return;
      }
    }
  }

  scrollToField(firstErrorField);
}

/**
 * Helper function to scroll to a specific field
 */
function scrollToField(fieldName: string): void {
  // Try to find the field by data attribute
  // First, try the exact field name
  let fieldElement = document.querySelector(`[data-field-name="${fieldName}"]`);
  
  // If not found, try with parent field prefix (for nested fields like individualPuppies.name)
  if (!fieldElement && fieldName.includes('.')) {
    const parts = fieldName.split('.');
    // Try the first part (parent field)
    fieldElement = document.querySelector(`[data-field-name="${parts[0]}"]`);
    // If still not found, try the full path
    if (!fieldElement) {
      fieldElement = document.querySelector(`[data-field-name="${fieldName.replace(/\./g, '-')}"]`);
    }
  }

  // If still not found, try finding by input/select/textarea with name attribute
  if (!fieldElement) {
    const inputElement = document.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
    if (inputElement) {
      fieldElement = inputElement.closest('[data-field-name]') || inputElement.closest('div');
    }
  }

  // If found, scroll to it
  if (fieldElement) {
    // Use smooth scroll with offset for fixed headers
    const offset = 100; // Adjust based on your header height
    const elementPosition = fieldElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

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
  }
}

