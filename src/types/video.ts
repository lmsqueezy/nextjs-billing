// Base types
interface MediaFormat {
  width: number;
  height: number;
}

interface SelectedMedia {
  images: string[];
  videos: string[];
}

// Word timing interfaces
interface Word {
  text: string;
  start: number;
  end: number;
}

interface WordTiming {
  text: string;
  start: number;
  end: number;
  words: Word[];
}

// Media and overlay interfaces
interface Overlay {
  is_public: boolean;
  _id: string;
  type: string;
  name: string;
  description: string;
  author: string;
  url: string;
  preview: string;
  prompt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  images: any[];
}

interface MediaItem {
  effect: string;
  url: string;
  withBlur: boolean;
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
  volume: number;
  _id: string;
}

// Project File interface (for the files array in segments)
interface ProjectFile {
  id: string;
  fileType: "image" | "video" | "audio" | "overlay";
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  r2Key: string;
  r2Url: string;
  uploadStatus: "uploading" | "completed" | "failed";
  metadata?: any;
  createdAt: string;
  expiresAt?: string;
}

// Segment interface
interface VideoSegment {
  // Either id or _id must be present for identification
  id?: string; // New API response format
  _id?: string; // Legacy format - keep for backward compatibility
  text: string;
  imagePrompt: string;
  videoPrompt?: string;
  imageUrl?: string; // Made optional since it might come from files array
  audioUrl?: string; // Made optional since it might come from files array
  videoUrl?: string; // URL for generated video from image-to-video conversion
  audioVolume: number;
  playBackRate: number;
  duration: number;
  withBlur: boolean;
  wordTimings?: WordTiming[]; // Changed from Word[] to WordTiming[] for batched structure
  backgroundMinimized: boolean;
  order: number;
  overlay?: Overlay;
  media?: MediaItem[]; // Made optional for backward compatibility
  elements?: any[]; // Made optional
  files?: ProjectFile[]; // Added files array from API response
}

// Caption styling interface
interface CaptionStyle {
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
}

// Asset interface for background audio
interface Asset {
  _id: string;
  type: string;
  name: string;
  description: string;
  author: string;
  url: string;
  preview: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  low_volume?: string;
  is_public?: boolean;
  images: any[];
}

// Layer interfaces
interface BaseLayer {
  captionStyle: CaptionStyle;
  type: string;
  volume: number;
  _id: string;
}

interface BackgroundAudioLayer extends BaseLayer {
  type: "backgroundAudio";
  assetId: Asset;
}

interface CaptionsLayer extends BaseLayer {
  type: "captions";
}

interface CombinedAudioLayer extends BaseLayer {
  type: "combinedAudio";
  url: string;
}

type Layer = BackgroundAudioLayer | CaptionsLayer | CombinedAudioLayer;

// User plan interface
interface UserPlan {
  isPremium: boolean;
  name: string;
}

// Main video interface
interface Video {
  selectedMedia: SelectedMedia;
  format: MediaFormat;
  _id: string;
  user: string;
  status: string;
  script: string;
  voice: string;
  type: string;
  mediaType: string;
  isRemotion: boolean;
  selectedModel: string;
  audioType: string;
  audioPrompt: string;
  watermark: boolean;
  isFeatured: boolean;
  segments: VideoSegment[];
  layers: Layer[];
  tracks: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  tiktokDescription?: string;
  title?: string;
  youtubeDescription?: string;
}

// Root interface
interface VideoGenerationData {
  video: Video;
  userPlan: UserPlan;
}

// Export all interfaces
export type {
  VideoGenerationData,
  Video,
  VideoSegment,
  ProjectFile,
  Layer,
  CaptionStyle,
  Asset,
  MediaItem,
  Overlay,
  WordTiming,
  Word,
  SelectedMedia,
  MediaFormat,
  UserPlan,
};
