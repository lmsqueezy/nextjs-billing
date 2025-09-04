import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export class R2Storage {
  private static client: S3Client;
  
  private static getClient() {
    if (!this.client) {
      // Extract the base endpoint without bucket name if it's included
      const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT!;
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
      
      // Remove bucket name from endpoint if it's there
      const baseEndpoint = endpoint.includes(`/${bucketName}`) 
        ? endpoint.replace(`/${bucketName}`, '')
        : endpoint;

      this.client = new S3Client({
        region: 'auto',
        endpoint: baseEndpoint,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: true, // Important for R2 compatibility
      });
    }
    return this.client;
  }

  /**
   * Upload a file buffer to R2 storage
   */
  static async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    const client = this.getClient();
    
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await client.send(command);
      return this.getPublicUrl(key);
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new Error('Failed to upload file to R2 storage');
    }
  }

  /**
   * Upload an image from base64 data with organized folder structure
   */
  static async uploadImageFromBase64(
    base64: string, 
    userId: string, 
    projectId: string, 
    segmentId?: string
  ): Promise<{key: string, url: string}> {
    try {
      // Remove data URL prefix if present
      const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      
      // Generate unique filename
      const fileId = uuidv4();
      const extension = this.getImageExtensionFromBase64(base64) || 'png';
      
      // Create organized folder structure: /{userId}/{projectId}/{segmentId?}/image/
      const folderPath = segmentId 
        ? `${userId}/${projectId}/${segmentId}/image`
        : `${userId}/${projectId}/image`;
      
      const key = `${folderPath}/${fileId}.${extension}`;
      const contentType = `image/${extension}`;
      
      const url = await this.uploadFile(buffer, key, contentType);
      
      return { key, url };
    } catch (error) {
      console.error('Error uploading base64 image to R2:', error);
      throw new Error('Failed to upload image to R2 storage');
    }
  }

  /**
   * Upload an image buffer with organized folder structure
   */
  static async uploadImage(
    buffer: Buffer, 
    userId: string, 
    projectId: string, 
    index: number,
    segmentId?: string,
    extension: string = 'jpg'
  ): Promise<{key: string, url: string}> {
    try {
      // Generate unique filename
      const fileId = uuidv4();
      const timestamp = Date.now();
      const filename = `image_${index}_${timestamp}.${extension}`;
      
      // Create organized folder structure: /{userId}/{projectId}/{segmentId?}/image/
      const folderPath = segmentId 
        ? `${userId}/${projectId}/${segmentId}/image`
        : `${userId}/${projectId}/image`;
      
      const key = `${folderPath}/${filename}`;
      const contentType = `image/${extension}`;
      
      const url = await this.uploadFile(buffer, key, contentType);
      
      return { key, url };
    } catch (error) {
      console.error('Error uploading image to R2:', error);
      throw new Error('Failed to upload image to R2 storage');
    }
  }

  /**
   * Upload an audio buffer with organized folder structure
   */
  static async uploadAudio(
    buffer: Buffer, 
    userId: string, 
    projectId: string, 
    index: number,
    segmentId?: string
  ): Promise<{key: string, url: string}> {
    try {
      // Generate unique filename
      const fileId = uuidv4();
      const timestamp = Date.now();
      const filename = `audio_${index}_${timestamp}.mp3`;
      
      // Create organized folder structure: /{userId}/{projectId}/{segmentId?}/audio/
      const folderPath = segmentId 
        ? `${userId}/${projectId}/${segmentId}/audio`
        : `${userId}/${projectId}/audio`;
      
      const key = `${folderPath}/${filename}`;
      const contentType = 'audio/mpeg';
      
      const url = await this.uploadFile(buffer, key, contentType);
      
      return { key, url };
    } catch (error) {
      console.error('Error uploading audio to R2:', error);
      throw new Error('Failed to upload audio to R2 storage');
    }
  }

  /**
   * Upload a video buffer with organized folder structure
   */
  static async uploadVideo(
    buffer: Buffer, 
    userId: string, 
    projectId: string, 
    index: number,
    segmentId?: string
  ): Promise<{key: string, url: string}> {
    try {
      // Generate unique filename
      const fileId = uuidv4();
      const timestamp = Date.now();
      const filename = `video_${index}_${timestamp}.mp4`;
      
      // Create organized folder structure: /{userId}/{projectId}/{segmentId?}/video/
      const folderPath = segmentId 
        ? `${userId}/${projectId}/${segmentId}/video`
        : `${userId}/${projectId}/video`;
      
      const key = `${folderPath}/${filename}`;
      const contentType = 'video/mp4';
      
      const url = await this.uploadFile(buffer, key, contentType);
      
      return { key, url };
    } catch (error) {
      console.error('Error uploading video to R2:', error);
      throw new Error('Failed to upload video to R2 storage');
    }
  }

  /**
   * Delete a file from R2 storage
   */
  static async deleteFile(key: string): Promise<void> {
    const client = this.getClient();
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
      });

      await client.send(command);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new Error('Failed to delete file from R2 storage');
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(key: string): string {
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (!publicUrl) {
      throw new Error('CLOUDFLARE_R2_PUBLIC_URL not configured');
    }
    
    // Handle both custom domains and standard R2 URLs
    const baseUrl = publicUrl.startsWith('http') ? publicUrl : `https://${publicUrl}`;
    return `${baseUrl}/${key}`;
  }

  /**
   * Upload file from URL (useful for external image URLs)
   */
  static async uploadFromUrl(
    url: string, 
    userId: string, 
    projectId: string, 
    fileType: string,
    segmentId?: string
  ): Promise<{key: string, url: string}> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      // Generate unique filename
      const fileId = uuidv4();
      const extension = this.getExtensionFromContentType(contentType);
      
      // Create organized folder structure
      const folderPath = segmentId 
        ? `${userId}/${projectId}/${segmentId}/${fileType}`
        : `${userId}/${projectId}/${fileType}`;
      
      const key = `${folderPath}/${fileId}.${extension}`;
      
      const publicUrl = await this.uploadFile(buffer, key, contentType);
      
      return { key, url: publicUrl };
    } catch (error) {
      console.error('Error uploading file from URL to R2:', error);
      throw new Error('Failed to upload file from URL to R2 storage');
    }
  }

  /**
   * Generate a unique file key with organized structure
   */
  static generateFileKey(
    userId: string, 
    projectId: string, 
    fileType: string, 
    fileName: string,
    segmentId?: string
  ): string {
    const fileId = uuidv4();
    const extension = fileName.split('.').pop() || 'bin';
    
    const folderPath = segmentId 
      ? `${userId}/${projectId}/${segmentId}/${fileType}`
      : `${userId}/${projectId}/${fileType}`;
    
    return `${folderPath}/${fileId}.${extension}`;
  }

  /**
   * Get file extension from base64 data URL
   */
  private static getImageExtensionFromBase64(base64: string): string | null {
    const match = base64.match(/^data:image\/([a-z]+);base64,/);
    return match ? match[1] : null;
  }

  /**
   * Get file extension from content type
   */
  private static getExtensionFromContentType(contentType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/mpeg': 'mp3',
      'application/pdf': 'pdf',
    };
    
    return typeMap[contentType] || 'bin';
  }

  /**
   * Delete all files for a project
   */
  static async deleteProjectFiles(userId: string, projectId: string): Promise<void> {
    // Note: This is a simplified implementation. In production, you might want to 
    // list objects with the prefix and delete them in batches
    console.warn('deleteProjectFiles not fully implemented - requires listing objects with prefix');
  }
}