# Enhanced Upload System Documentation

## Overview

The enhanced upload system supports images, videos, and documents with comprehensive security validation and optimized performance.

## Supported File Types

### 🖼️ Images (Max: 15MB)
- **JPEG/JPG** - `image/jpeg`, `image/jpg`
- **PNG** - `image/png`
- **GIF** - `image/gif`
- **WebP** - `image/webp`
- **BMP** - `image/bmp`
- **TIFF** - `image/tiff`
- **SVG** - `image/svg+xml`

### 🎥 Videos (Max: 500MB)
- **MP4** - `video/mp4`
- **AVI** - `video/avi`
- **MOV** - `video/mov`
- **WMV** - `video/wmv`
- **FLV** - `video/flv`
- **WebM** - `video/webm`
- **MKV** - `video/mkv`
- **3GP** - `video/3gp`
- **OGG** - `video/ogg`
- **M4V** - `video/m4v`

### 📄 Documents (Max: 25MB)
- **PDF** - `application/pdf`
- **Word (.doc)** - `application/msword`
- **Word (.docx)** - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Excel (.xls)** - `application/vnd.ms-excel`
- **Excel (.xlsx)** - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **PowerPoint (.ppt)** - `application/vnd.ms-powerpoint`
- **PowerPoint (.pptx)** - `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- **Text (.txt)** - `text/plain`
- **CSV** - `text/csv`
- **RTF** - `application/rtf`

## Security Features

### 🚫 Blocked File Types
The system automatically blocks dangerous file types:
- **Executables**: `.exe`, `.bat`, `.cmd`, `.com`, `.msi`
- **Scripts**: `.js`, `.php`, `.py`, `.rb`, `.pl`, `.sh`
- **Archives**: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`
- **Web files**: `.html`, `.htm`
- **Flash**: `.swf`

### 🔒 Security Validations
- **MIME type validation** - Prevents file type spoofing
- **File extension checking** - Additional security layer
- **Size limits** - Prevents abuse and storage issues
- **Content validation** - Backend double-checks file types

## Configuration

### Backend Configuration (`upload.service.ts`)
```typescript
private validateFileType(mimeType: string, fileType: FileType): void {
  const allowedMimeTypes = {
    [FileType.IMAGE]: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
      'image/bmp', 'image/tiff', 'image/svg+xml'
    ],
    [FileType.VIDEO]: [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
      'video/webm', 'video/mkv', 'video/3gp', 'video/ogg', 'video/m4v'
    ],
    [FileType.DOCUMENT]: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // ... more document types
    ],
  };
}
```

### Frontend Configuration (`listing-types.ts`)
```typescript
const MEDIA_FIELDS = {
  images: {
    name: 'images',
    label: 'Images',
    type: 'file' as const,
    required: false,
    fileConfig: {
      multiple: true,
      accept: 'image/*',
      maxSize: 15,        // 15MB
      minCount: 1
    },
    fieldCategory: 'media' as const
  },
  videos: {
    name: 'videos',
    label: 'Videos',
    type: 'file' as const,
    required: false,
    fileConfig: {
      multiple: true,
      accept: 'video/*',
      maxSize: 500,       // 500MB
      minCount: 1
    },
    fieldCategory: 'media' as const
  },
  documents: {
    name: 'documents',
    label: 'Documents',
    type: 'file' as const,
    required: false,
    fileConfig: {
      multiple: true,
      accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf',
      maxSize: 25,        // 25MB
      minCount: 1
    },
    fieldCategory: 'media' as const
  }
};
```

## File Validation Utility

### Usage Example
```typescript
import { FileValidator } from '@/_utils/file-validation';

// Validate single file
const file = event.target.files[0];
const validation = FileValidator.validateFile(file, {
  maxSize: 15,
  allowedTypes: ['image/jpeg', 'image/png'],
  blockedTypes: ['application/x-executable']
});

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  return;
}

// Validate multiple files
const files = Array.from(event.target.files);
const config = FileValidator.getPresetConfig('image');
const result = FileValidator.validateFiles(files, config);

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
  return;
}
```

### Preset Configurations
```typescript
// Get preset config for image files
const imageConfig = FileValidator.getPresetConfig('image');
// Returns: { maxSize: 15, allowedTypes: [...], maxCount: 20, minCount: 1 }

// Get preset config for video files
const videoConfig = FileValidator.getPresetConfig('video');
// Returns: { maxSize: 500, allowedTypes: [...], maxCount: 10, minCount: 1 }

// Get preset config for document files
const documentConfig = FileValidator.getPresetConfig('document');
// Returns: { maxSize: 25, allowedTypes: [...], maxCount: 15, minCount: 1 }
```

## Integration with Forms

### DynamicFormField Integration
The `DynamicFormField` component automatically uses the enhanced validation:

```typescript
// In DynamicFormField.tsx
case 'file':
  return (
    <div className="relative">
      <input
        type="file"
        multiple={field.fileConfig?.multiple !== false}
        accept={field.fileConfig?.accept}
        onChange={handleFileChange} // Enhanced validation here
        className="..."
      />
    </div>
  );
```

### File Upload Hook
```typescript
import { useFileUpload } from '@/_services/hooks/upload/use-file-upload';

const { uploadFile, isUploading } = useFileUpload({
  onSuccess: (result) => {
    console.log('Upload successful:', result.finalUrl);
  },
  onError: (error) => {
    console.error('Upload failed:', error);
  }
});

// Upload file with automatic type detection
uploadFile({ 
  file, 
  fileType: FileValidator.getFileType(file) 
});
```

## Error Handling

### Common Error Messages
- **"File type not allowed for security reasons"** - Blocked file type
- **"File size exceeds XMB limit"** - File too large
- **"At least X file(s) are required"** - Minimum count not met
- **"Maximum X file(s) are allowed"** - Maximum count exceeded
- **"Executable files are not allowed"** - Security violation

### Error Response Format
```typescript
interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

## Performance Optimizations

### Chunked Uploads
- Large files are automatically split into chunks
- Resume capability for interrupted uploads
- Progress tracking for better UX

### File Type Detection
- Automatic MIME type detection
- File extension validation
- Backend double-validation

### Storage Optimization
- Structured file paths: `uploads/{type}/{year}/{month}/{filename}`
- Automatic file deduplication
- CDN integration for fast delivery

## Usage Examples

### Basic File Upload
```typescript
const handleFileUpload = async (files: FileList) => {
  const fileArray = Array.from(files);
  const validation = FileValidator.validateFiles(fileArray, {
    maxSize: 15,
    allowedTypes: ['image/*'],
    maxCount: 5
  });

  if (!validation.isValid) {
    toast.error(validation.errors.join(', '));
    return;
  }

  // Upload files
  for (const file of fileArray) {
    await uploadFile({ file, fileType: FileValidator.getFileType(file) });
  }
};
```

### Listing Form Integration
```typescript
// In listing form
const handleImageUpload = (files: FileList) => {
  const validation = FileValidator.validateFiles(Array.from(files), 
    FileValidator.getPresetConfig('image')
  );

  if (!validation.isValid) {
    setError('images', validation.errors.join(', '));
    return;
  }

  // Process valid files
  setImages(Array.from(files));
};
```

## Best Practices

### Security
1. **Always validate on both frontend and backend**
2. **Use MIME type validation, not just file extensions**
3. **Implement file size limits**
4. **Block dangerous file types**
5. **Scan uploaded files for malware (optional)**

### Performance
1. **Use chunked uploads for large files**
2. **Implement progress indicators**
3. **Cache validation results**
4. **Use CDN for file delivery**
5. **Optimize image/video compression**

### User Experience
1. **Show clear error messages**
2. **Provide file type icons**
3. **Display upload progress**
4. **Allow file preview**
5. **Support drag-and-drop**

## Troubleshooting

### Common Issues
1. **"File type not allowed"** - Check MIME type configuration
2. **"File too large"** - Increase maxSize in configuration
3. **"Upload failed"** - Check network and server logs
4. **"Validation errors"** - Review file validation rules

### Debug Mode
Enable debug logging in the upload service:
```typescript
this.logger.log(`Validating file: ${fileName}, type: ${mimeType}, size: ${fileSize}`);
```

## Future Enhancements

### Planned Features
- **Image compression** - Automatic optimization
- **Video transcoding** - Convert to web-friendly formats
- **Document preview** - PDF and Office file previews
- **Bulk upload** - Multiple file selection
- **Drag-and-drop** - Enhanced UX
- **Upload resume** - Better interruption handling 