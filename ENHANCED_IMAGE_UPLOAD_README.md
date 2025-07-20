# Enhanced Image Upload Implementation

## Overview

This implementation provides a comprehensive image upload solution that integrates with the backend R2 API and provides a modern, user-friendly interface for uploading images in listing forms.

## Features

### 1. Backend Integration
- Uses the existing `/uploads/simple` endpoint for direct R2 uploads
- Leverages the `useSimpleUpload` hook for consistent upload handling
- Supports all file types: images, videos, and documents

### 2. Enhanced User Interface
- **Drag & Drop Support**: Users can drag images directly onto the upload area
- **Visual Feedback**: Shows upload progress and status indicators
- **Image Preview Grid**: Displays uploaded images in a responsive grid layout
- **Remove Functionality**: Users can remove individual images with hover effects

### 3. Validation & Requirements
- **Minimum Photo Requirements**: Enforces minimum image counts (e.g., 3 photos for puppy listings)
- **File Size Validation**: Configurable maximum file sizes (default 5MB)
- **File Type Validation**: Ensures only image files are uploaded
- **Real-time Feedback**: Shows validation status with color-coded indicators

### 4. Form Integration
- **Dynamic Form Fields**: Automatically detects image upload fields in listing types
- **Error Handling**: Displays validation errors inline
- **Data Persistence**: Properly handles edit mode with existing images

## Components

### EnhancedImageUpload
The main component that handles image uploads with the following props:

```typescript
interface EnhancedImageUploadProps {
  label: string;                    // Field label
  value: string[];                  // Array of uploaded image URLs
  onChange: (urls: string[]) => void; // Callback when images change
  error?: string;                   // Validation error message
  minCount?: number;                // Minimum required images (default: 3)
  maxCount?: number;                // Maximum allowed images (default: 10)
  maxSize?: number;                 // Max file size in MB (default: 5)
  accept?: string;                  // File type filter (default: 'image/*')
  className?: string;               // Additional CSS classes
}
```

### DynamicFormField Integration
The `DynamicFormField` component automatically uses `EnhancedImageUpload` for file fields that accept images:

```typescript
// In DynamicFormField.tsx
case 'file':
  if (field.fileConfig?.accept?.includes('image/*')) {
    return (
      <EnhancedImageUpload
        label={field.label}
        value={Array.isArray(value) ? value : []}
        onChange={(urls) => onChange(field.name, urls)}
        error={error}
        minCount={field.fileConfig?.minCount}
        maxCount={field.fileConfig?.maxCount}
        maxSize={field.fileConfig?.maxSize}
        accept={field.fileConfig?.accept}
      />
    );
  }
```

## Configuration

### Listing Types Configuration
Image upload fields are configured in `listing-types.ts`:

```typescript
{
  name: 'puppyImages',
  label: 'Upload Puppy Images',
  type: 'file',
  required: true,
  fileConfig: {
    accept: 'image/*',
    maxSize: 5,        // 5MB max
    minCount: 3,       // Minimum 3 photos required
    maxCount: 10       // Maximum 10 photos allowed
  }
}
```

### Validation Rules
- **Puppy Listings**: Minimum 3 photos required
- **Semen Listings**: Minimum 1 photo required
- **Stud Listings**: Minimum 1 photo required
- **Other Services**: Minimum 1 photo required

## Usage Examples

### Basic Usage
```tsx
<EnhancedImageUpload
  label="Upload Photos"
  value={images}
  onChange={setImages}
  minCount={3}
  maxCount={10}
/>
```

### With Validation
```tsx
<EnhancedImageUpload
  label="Puppy Images"
  value={formData.puppyImages || []}
  onChange={(urls) => handleFieldChange('puppyImages', urls)}
  error={errors.puppyImages}
  minCount={3}
  maxCount={10}
  maxSize={5}
/>
```

## Backend API

The implementation uses the existing backend upload endpoints:

### Simple Upload Endpoint
```
POST /uploads/simple
Content-Type: multipart/form-data

Body:
- file: File object
- fileType: 'image' | 'video' | 'document'
```

### Response
```json
{
  "url": "https://cdn.pups4sale.com.au/uploads/images/2024/01/image.jpg",
  "fileName": "image.jpg",
  "fileSize": 1024000
}
```

## Error Handling

### Client-side Validation
- File type validation (images only)
- File size validation (configurable limits)
- Minimum/maximum count validation
- Real-time feedback with visual indicators

### Server-side Integration
- Upload progress tracking
- Error toast notifications
- Automatic retry on failure
- Graceful fallback for failed uploads

## Styling

The component uses Tailwind CSS classes and provides:
- Responsive grid layout for image previews
- Hover effects for image removal
- Color-coded validation status
- Loading states during upload
- Error states with clear messaging

## Future Enhancements

1. **Image Cropping**: Add image cropping functionality
2. **Bulk Upload**: Support for selecting multiple files at once
3. **Upload Progress**: Show individual file upload progress
4. **Image Optimization**: Client-side image compression
5. **Drag Reordering**: Allow users to reorder images by dragging 