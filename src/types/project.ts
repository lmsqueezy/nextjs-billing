// Project-related type definitions aligned with database schema

// Base Project interface matching database schema
export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  idea: string;
  script?: string;
  scriptStyleId?: string;
  duration?: number; // in seconds
  status: "draft" | "script-ready" | "generating" | "completed" | "failed";
  format?: { width: number; height: number };
  settings?: any;
  // Video generation specific fields
  voice?: string;
  type?: string;
  mediaType?: string;
  isRemotion?: boolean;
  selectedModel?: string;
  audioType?: string;
  audioPrompt?: string;
  watermark?: boolean;
  isFeatured?: boolean;
  selectedMedia?: { images: string[]; videos: string[] };
  tiktokDescription?: string;
  youtubeDescription?: string;
  createdAt: string;
  updatedAt: string;
  segments?: ProjectSegment[];
  files?: ProjectFile[];
  layers?: ProjectLayer[];
  tracks?: ProjectTrack[];
}

// Project Segment interface matching database schema
export interface ProjectSegment {
  id: string;
  projectId: string;
  order: number;
  text: string;
  imagePrompt: string;
  videoPrompt?: string;
  duration?: number; // in seconds
  audioVolume: number;
  playBackRate: number;
  withBlur: boolean;
  backgroundMinimized: boolean;
  wordTimings?: any;
  // Direct URL references for easier access
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  // Additional segment properties
  media?: any[];
  elements?: any[];
  overlayId?: string;
  overlay?: OverlayAsset;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
}

// Project File interface matching database schema
export interface ProjectFile {
  id: string;
  projectId: string;
  segmentId?: string;
  fileType: 'image' | 'video' | 'audio' | 'overlay' | 'generated_video';
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  r2Key: string;
  r2Url: string;
  tempUrl?: string;
  uploadStatus: "uploading" | "completed" | "failed";
  metadata?: any;
  createdAt: string;
  expiresAt?: string;
}

// New interfaces for layers, tracks, and overlay assets
export interface ProjectLayer {
  id: string;
  projectId: string;
  type: string; // 'captions', 'backgroundAudio', 'combinedAudio'
  captionStyle?: {
    fontSize: number;
    fontFamily: string;
    activeWordColor: string;
    inactiveWordColor: string;
    backgroundColor: string;
    fontWeight: string;
    textTransform: string;
    textShadow: string;
    wordAnimation: string[];
    showEmojis: boolean;
    fromBottom: number;
    wordsPerBatch: number;
  };
  volume?: number;
  url?: string;
  assetId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTrack {
  id: string;
  projectId: string;
  name: string;
  type: string; // 'audio', 'video', 'overlay'
  settings?: any;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface OverlayAsset {
  id: string;
  name: string;
  description?: string;
  author?: string;
  url: string;
  preview?: string;
  type: string;
  isPublic: boolean;
  promptId?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Explicit interface for API response with populated relations
export interface ProjectSegmentWithFiles extends ProjectSegment {
  files: ProjectFile[];
}

export interface ProjectWithDetails
  extends Omit<Project, "segments" | "files"> {
  segments: ProjectSegmentWithFiles[];
  files: ProjectFile[];
  layers: ProjectLayer[];
  tracks: ProjectTrack[];
}

// API Request/Response types
export interface CreateProjectData {
  title?: string;
  idea: string;
  description?: string;
  scriptStyleId?: string;
  format?: { width: number; height: number };
  settings?: any;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  script?: string;
  scriptStyleId?: string;
  duration?: number;
  status?: Project["status"];
  format?: { width: number; height: number };
  settings?: any;
}

export interface CreateSegmentData {
  order: number;
  text: string;
  imagePrompt: string;
  videoPrompt?: string;
  duration?: number;
  audioVolume?: number;
  playBackRate?: number;
  withBlur?: boolean;
  backgroundMinimized?: boolean;
  wordTimings?: any;
}

export interface UpdateSegmentData {
  order?: number;
  text?: string;
  imagePrompt?: string;
  videoPrompt?: string;
  duration?: number;
  audioVolume?: number;
  playBackRate?: number;
  withBlur?: boolean;
  backgroundMinimized?: boolean;
  wordTimings?: any;
}

export interface CreateFileData {
  projectId: string;
  segmentId?: string;
  fileType: ProjectFile["fileType"];
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  metadata?: any;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

// File upload types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadOptions {
  onProgress?: (progress: FileUploadProgress) => void;
  signal?: AbortSignal;
}

// Backward compatibility - maps old ProjectData to new Project type
export interface LegacyProjectData {
  id: string;
  title: string;
  idea: string;
  inspirationUrls: string;
  script: string;
  transcripts: string[];
  scriptLines: string[];
  generatedImages: { [key: number]: string };
  generatedVideos: { [key: number]: string };
  segments?: Array<{
    text: string;
    imagePrompt: string;
    imageUrl?: string;
    audioUrl?: string;
    duration?: number;
    order: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

// Helper function to migrate legacy project data
export function migrateLegacyProject(
  legacy: LegacyProjectData,
): Partial<Project> {
  return {
    id: legacy.id,
    title: legacy.title,
    idea: legacy.idea,
    script: legacy.script,
    status: determineProjectStatus(legacy),
    createdAt: new Date(legacy.createdAt).toISOString(),
    updatedAt: new Date(legacy.updatedAt).toISOString(),
    segments:
      legacy.segments?.map((seg, index) => ({
        id: `legacy_${legacy.id}_${index}`,
        projectId: legacy.id,
        order: seg.order || index,
        text: seg.text,
        imagePrompt: seg.imagePrompt,
        duration: seg.duration,
        audioVolume: 1.0,
        playBackRate: 1.0,
        withBlur: false,
        backgroundMinimized: false,
        createdAt: new Date(legacy.createdAt).toISOString(),
        updatedAt: new Date(legacy.updatedAt).toISOString(),
      })) || [],
  };
}

function determineProjectStatus(legacy: LegacyProjectData): Project["status"] {
  if (legacy.segments && legacy.segments.length > 0) {
    const segmentsWithImages = legacy.segments.filter((s) => s.imageUrl).length;
    const segmentsWithAudio = legacy.segments.filter((s) => s.audioUrl).length;

    if (
      segmentsWithImages === legacy.segments.length &&
      segmentsWithAudio === legacy.segments.length
    ) {
      return "completed";
    } else if (segmentsWithImages > 0 || segmentsWithAudio > 0) {
      return "generating";
    } else {
      return "script-ready";
    }
  }

  if (Object.keys(legacy.generatedVideos || {}).length > 0) {
    return "completed";
  } else if (Object.keys(legacy.generatedImages || {}).length > 0) {
    return "generating";
  } else if (legacy.script) {
    return "script-ready";
  }

  return "draft";
}
