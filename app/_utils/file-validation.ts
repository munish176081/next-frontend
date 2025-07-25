export interface FileValidationConfig {
  maxSize: number; // in MB
  allowedTypes: string[];
  blockedTypes: string[];
  maxCount?: number;
  minCount?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class FileValidator {
  private static readonly DEFAULT_CONFIG: FileValidationConfig = {
    maxSize: 10,
    allowedTypes: [],
    blockedTypes: [
      'application/x-executable', 'application/x-msdownload', 'application/x-msi',
      'application/x-shockwave-flash', 'application/x-sh', 'application/x-bat',
      'application/x-cmd', 'application/x-com', 'application/x-exe',
      'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
      'application/x-7z-compressed', 'application/x-tar', 'application/x-gzip',
      'text/html', 'text/javascript', 'application/javascript', 'application/x-javascript',
      'application/x-php', 'application/x-python', 'application/x-ruby',
      'application/x-perl', 'application/x-shellscript'
    ],
    maxCount: 10,
    minCount: 1
  };

  static validateFiles(
    files: File[],
    config: Partial<FileValidationConfig> = {}
  ): FileValidationResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file count
    if (finalConfig.minCount && files.length < finalConfig.minCount) {
      errors.push(`At least ${finalConfig.minCount} file(s) are required`);
    }

    if (finalConfig.maxCount && files.length > finalConfig.maxCount) {
      errors.push(`Maximum ${finalConfig.maxCount} file(s) are allowed`);
    }

    // Validate each file
    files.forEach((file, index) => {
      const fileResult = this.validateFile(file, finalConfig);
      errors.push(...fileResult.errors.map(err => `File ${index + 1} (${file.name}): ${err}`));
      warnings.push(...fileResult.warnings.map(warn => `File ${index + 1} (${file.name}): ${warn}`));
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateFile(
    file: File,
    config: FileValidationConfig
  ): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    const maxSizeBytes = config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size exceeds ${config.maxSize}MB limit`);
    }

    // Check for blocked file types
    if (config.blockedTypes.includes(file.type)) {
      errors.push(`File type not allowed for security reasons`);
    }

    // Check allowed file types
    if (config.allowedTypes.length > 0) {
      const isAllowed = config.allowedTypes.some(type => {
        if (type.includes('*')) {
          // Handle wildcard patterns like 'image/*', 'video/*'
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
      });

      if (!isAllowed) {
        errors.push(`File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
      }
    }

    // Additional security checks
    if (file.name.toLowerCase().includes('.exe') || file.name.toLowerCase().includes('.bat')) {
      errors.push(`Executable files are not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static getFileType(file: File): 'image' | 'video' | 'document' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  }

  static getFileIcon(file: File): string {
    const type = this.getFileType(file);
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'document':
        if (file.type === 'application/pdf') return '📄';
        if (file.type.includes('word')) return '📝';
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
        if (file.type.includes('powerpoint') || file.type.includes('presentation')) return '📈';
        return '📄';
      default:
        return '📎';
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getPresetConfig(type: 'image' | 'video' | 'document'): FileValidationConfig {
    switch (type) {
      case 'image':
        return {
          maxSize: 15,
          allowedTypes: [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'image/bmp', 'image/tiff', 'image/svg+xml'
          ],
          blockedTypes: this.DEFAULT_CONFIG.blockedTypes,
          maxCount: 20,
          minCount: 1
        };
      case 'video':
        return {
          maxSize: 500,
          allowedTypes: [
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
            'video/webm', 'video/mkv', 'video/3gp', 'video/ogg', 'video/m4v'
          ],
          blockedTypes: this.DEFAULT_CONFIG.blockedTypes,
          maxCount: 10,
          minCount: 1
        };
      case 'document':
        return {
          maxSize: 25,
          allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'application/rtf'
          ],
          blockedTypes: this.DEFAULT_CONFIG.blockedTypes,
          maxCount: 15,
          minCount: 1
        };
      default:
        return this.DEFAULT_CONFIG;
    }
  }
} 