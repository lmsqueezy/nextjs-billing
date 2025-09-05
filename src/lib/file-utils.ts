import { lookup } from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { ProjectFile, ProjectSegment } from "@/types/project";

export class FileUtils {
  /**
   * Convert base64 to Buffer
   */
  static base64ToBuffer(base64: string): Buffer {
    // Remove data URL prefix if present
    const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(cleanBase64, 'base64');
  }

  /**
   * Validate file type against allowed types
   */
  static validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Generate a unique file name
   */
  static generateFileName(originalName: string, userId: string, projectId: string): string {
    const fileId = uuidv4();
    const extension = this.getFileExtension(originalName);
    const timestamp = Date.now();
    return `${userId}_${projectId}_${timestamp}_${fileId}.${extension}`;
  }

  /**
   * Extract image metadata from buffer
   */
  static async extractImageMetadata(buffer: Buffer): Promise<{width: number, height: number}> {
    try {
      // This is a basic implementation. For production, consider using a library like 'sharp'
      // For now, we'll return default dimensions
      return { width: 1024, height: 768 };
    } catch (error) {
      console.error('Error extracting image metadata:', error);
      throw new Error('Failed to extract image metadata');
    }
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : 'bin';
  }

  /**
   * Get MIME type from file extension
   */
  static getMimeType(filename: string): string {
    const mimeType = lookup(filename);
    return mimeType || 'application/octet-stream';
  }

  /**
   * Validate file size
   */
  static validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  /**
   * Convert bytes to human-readable format
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Validate image dimensions
   */
  static validateImageDimensions(
    width: number, 
    height: number, 
    maxWidth: number, 
    maxHeight: number
  ): boolean {
    return width <= maxWidth && height <= maxHeight;
  }

  /**
   * Generate safe filename by removing special characters
   */
  static sanitizeFilename(filename: string): string {
    // Remove or replace special characters
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .toLowerCase();
  }

  /**
   * Check if file is an image
   */
  static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a video
   */
  static isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  /**
   * Check if file is audio
   */
  static isAudio(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  /**
   * Get file type category
   */
  static getFileTypeCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
    if (this.isImage(mimeType)) return 'image';
    if (this.isVideo(mimeType)) return 'video';
    if (this.isAudio(mimeType)) return 'audio';
    if (mimeType === 'application/pdf' || mimeType.includes('document')) return 'document';
    return 'other';
  }

  /**
   * Extract base64 content and metadata from data URL
   */
  static parseDataUrl(dataUrl: string): {
    mimeType: string;
    base64: string;
    extension: string;
  } {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid data URL format');
    }

    const mimeType = match[1];
    const base64 = match[2];
    const extension = this.getExtensionFromMimeType(mimeType);

    return { mimeType, base64, extension };
  }

  /**
   * Get file extension from MIME type
   */
  static getExtensionFromMimeType(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
      'audio/mp3': 'mp3',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/webm': 'webm',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
    };
    
    return typeMap[mimeType] || 'bin';
  }

  /**
   * Validate file against security constraints
   */
  static validateFileSecurity(
    mimeType: string, 
    filename: string, 
    size: number
  ): { valid: boolean; error?: string } {
    // Dangerous file types
    const dangerousTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-ms-dos-executable',
      'application/javascript',
      'text/javascript',
    ];

    if (dangerousTypes.includes(mimeType)) {
      return { valid: false, error: 'File type not allowed for security reasons' };
    }

    // Dangerous extensions
    const dangerousExtensions = [
      'exe', 'bat', 'com', 'cmd', 'scr', 'pif', 'vbs', 'js', 'jar', 
      'app', 'deb', 'pkg', 'rpm', 'dmg', 'iso'
    ];

    const extension = this.getFileExtension(filename);
    if (dangerousExtensions.includes(extension)) {
      return { valid: false, error: 'File extension not allowed for security reasons' };
    }

    // Maximum file size (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (size > maxSize) {
      return { valid: false, error: `File size exceeds maximum limit of ${this.formatFileSize(maxSize)}` };
    }

    return { valid: true };
  }

  /**
   * Create file metadata object
   */
  static createFileMetadata(
    filename: string,
    mimeType: string,
    size: number,
    additionalData?: Record<string, any>
  ) {
    return {
      originalName: filename,
      sanitizedName: this.sanitizeFilename(filename),
      mimeType,
      size,
      formattedSize: this.formatFileSize(size),
      extension: this.getFileExtension(filename),
      category: this.getFileTypeCategory(mimeType),
      uploadedAt: new Date().toISOString(),
      ...additionalData,
    };
  }
}

// Project File Utilities for Video Editor
export class ProjectFileUtils {
  /**
   * Get the image file for a segment
   */
  static getSegmentImage(segment: ProjectSegment): ProjectFile | null {
    if (!segment.files) return null;
    
    const imageFiles = segment.files.filter(file => file.fileType === 'image');
    return this.getLatestFile(imageFiles);
  }

  /**
   * Get the audio file for a segment
   */
  static getSegmentAudio(segment: ProjectSegment): ProjectFile | null {
    if (!segment.files) return null;
    
    const audioFiles = segment.files.filter(file => file.fileType === 'audio');
    return this.getLatestFile(audioFiles);
  }

  /**
   * Get the video file for a segment (generated video)
   */
  static getSegmentVideo(segment: ProjectSegment): ProjectFile | null {
    if (!segment.files) return null;
    
    const videoFiles = segment.files.filter(file => file.fileType === 'generated_video');
    return this.getLatestFile(videoFiles);
  }

  /**
   * Get the URL for a file, prioritizing r2Url over tempUrl
   */
  static getFileUrl(file: ProjectFile | null): string {
    if (!file) return '';
    
    // Prioritize r2Url (permanent storage) over tempUrl
    return file.r2Url || file.tempUrl || '';
  }

  /**
   * Get the latest file from an array of files (by createdAt timestamp)
   */
  static getLatestFile(files: ProjectFile[]): ProjectFile | null {
    if (files.length === 0) return null;
    if (files.length === 1) return files[0];
    
    // Sort by createdAt descending and return the most recent
    return files.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }

  /**
   * Get file by specific type, with fallback to latest
   */
  static getFileByType(
    files: ProjectFile[], 
    fileType: ProjectFile['fileType']
  ): ProjectFile | null {
    const filteredFiles = files.filter(file => file.fileType === fileType);
    return this.getLatestFile(filteredFiles);
  }

  /**
   * Check if a file is ready for use (upload completed)
   */
  static isFileReady(file: ProjectFile | null): boolean {
    if (!file) return false;
    return file.uploadStatus === 'completed' && !!(file.r2Url || file.tempUrl);
  }

  /**
   * Get segment URLs in a convenient object format
   */
  static getSegmentUrls(segment: ProjectSegment): {
    imageUrl: string;
    audioUrl: string;
    videoUrl: string;
  } {
    return {
      imageUrl: this.getFileUrl(this.getSegmentImage(segment)),
      audioUrl: this.getFileUrl(this.getSegmentAudio(segment)),
      videoUrl: this.getFileUrl(this.getSegmentVideo(segment)),
    };
  }

  /**
   * Get segment files organized by type
   */
  static getSegmentFiles(segment: ProjectSegment): {
    images: ProjectFile[];
    audio: ProjectFile[];
    videos: ProjectFile[];
    all: ProjectFile[];
  } {
    if (!segment.files) {
      return { images: [], audio: [], videos: [], all: [] };
    }

    return {
      images: segment.files.filter(file => file.fileType === 'image'),
      audio: segment.files.filter(file => file.fileType === 'audio'),
      videos: segment.files.filter(file => file.fileType === 'generated_video'),
      all: segment.files,
    };
  }

  /**
   * Check if segment has all required files for rendering
   */
  static isSegmentReady(segment: ProjectSegment): boolean {
    const image = this.getSegmentImage(segment);
    const audio = this.getSegmentAudio(segment);
    
    return this.isFileReady(image) && this.isFileReady(audio);
  }
}