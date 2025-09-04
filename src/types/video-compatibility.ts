/**
 * Compatibility layer between old Video types and new Project types
 * This allows video editor components to work with the new database-backed projects
 */

import { Project, ProjectSegment, ProjectFile } from "./project";
import { Video, VideoSegment, MediaFormat, CaptionStyle, Layer } from "./video";

// Extended interfaces that bridge old and new systems
export interface VideoEditorProject extends Project {
  // Video editor specific properties
  format: MediaFormat;
  watermark?: boolean;
  layers?: Layer[];
  captionStyle?: CaptionStyle;
  voiceId?: string;
  audioType?: string;
  audioPrompt?: string;
  mediaType?: string;
  selectedModel?: string;
  isRemotion?: boolean;
}

export interface VideoEditorSegment extends ProjectSegment {
  // Additional video editor properties
  imageUrl?: string; // Computed from files
  audioUrl?: string; // Computed from files
  media?: any[]; // Legacy media items
  elements?: any[]; // Legacy elements
  overlay?: any; // Legacy overlay
  _id?: string; // Legacy MongoDB ID for compatibility
}

// Utility functions to convert between formats
export class VideoProjectAdapter {
  /**
   * Convert a database Project to a Video editor compatible format
   */
  static projectToVideo(
    project: Project,
    projectFiles: ProjectFile[] = [],
  ): Video {
    console.log("projectToVideo", project);
    // Use nested files from segments if available, otherwise fall back to separate projectFiles array
    const segments =
      project.segments?.length && project.segments[0].files
        ? this.convertSegmentsWithNestedFiles(project.segments || [])
        : this.convertSegmentsWithFiles(project.segments || [], projectFiles);

    return {
      _id: project.id,
      user: project.userId,
      title: project.title,
      script: project.script || "",
      status: project.status,
      format: project.format || { width: 1080, height: 1920 },
      segments,
      // Default values for video editor
      selectedMedia: { images: [], videos: [] },
      voice: project.voice || "default",
      type: project.type || "faceless_video",
      mediaType: "image",
      isRemotion: true,
      selectedModel: "default",
      audioType: "tts",
      audioPrompt: "",
      watermark: project.watermark || false,
      isFeatured: false,
      layers: project.layers || [],
      tracks: [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      __v: 0,
    };
  }

  /**
   * Convert project segments with nested files to video segments
   */
  static convertSegmentsWithNestedFiles(
    segments: ProjectSegment[],
  ): VideoSegment[] {
    return segments.map((segment) => {
      // Files are nested within the segment
      const segmentFiles = segment.files || [];
      const imageFile = segmentFiles.find((file) => file.fileType === "image");
      const audioFile = segmentFiles.find((file) => file.fileType === "audio");
      const videoFile = segmentFiles.find((file) => file.fileType === "generated_video");

      return {
        id: segment.id,
        _id: segment.id, // Keep for backward compatibility
        text: segment.text,
        imagePrompt: segment.imagePrompt,
        imageUrl:
          imageFile?.r2Url || imageFile?.tempUrl || segment.imageUrl || "",
        audioUrl:
          audioFile?.r2Url || audioFile?.tempUrl || segment.audioUrl || "",
        videoUrl:
          videoFile?.r2Url || videoFile?.tempUrl || segment.videoUrl || "",
        audioVolume: segment.audioVolume,
        playBackRate: segment.playBackRate,
        duration: Math.max(1, segment.duration || 5), // Default to 5 seconds minimum
        withBlur: segment.withBlur,
        backgroundMinimized: segment.backgroundMinimized,
        order: segment.order,
        wordTimings: segment.wordTimings ? segment.wordTimings : [],
        media: [],
        elements: [],
      };
    });
  }

  /**
   * Convert project segments with associated files to video segments
   */
  static convertSegmentsWithFiles(
    segments: ProjectSegment[],
    projectFiles: ProjectFile[],
  ): VideoSegment[] {
    return segments.map((segment, index) => {
      // Find files for this segment
      const segmentFiles = projectFiles.filter(
        (file) => file.segmentId === segment.id,
      );
      const imageFile = segmentFiles.find((file) => file.fileType === "image");
      const audioFile = segmentFiles.find((file) => file.fileType === "audio");
      const videoFile = segmentFiles.find((file) => file.fileType === "generated_video");

      return {
        id: segment.id,
        _id: segment.id, // Keep for backward compatibility
        text: segment.text,
        imagePrompt: segment.imagePrompt,
        imageUrl: imageFile?.r2Url || imageFile?.tempUrl || "",
        audioUrl: audioFile?.r2Url || audioFile?.tempUrl || "",
        videoUrl: videoFile?.r2Url || videoFile?.tempUrl || segment.videoUrl || "",
        audioVolume: segment.audioVolume,
        playBackRate: segment.playBackRate,
        duration: Math.max(1, segment.duration || 5), // Default to 5 seconds minimum
        withBlur: segment.withBlur,
        backgroundMinimized: segment.backgroundMinimized,
        order: segment.order,
        wordTimings: segment.wordTimings ? [segment.wordTimings] : [],
        media: [],
        elements: [],
      };
    });
  }

  /**
   * Convert video segments back to project segments (for updates)
   */
  static videoSegmentsToProjectSegments(
    videoSegments: VideoSegment[],
  ): Partial<ProjectSegment>[] {
    return videoSegments.map((segment) => ({
      id: segment._id,
      text: segment.text,
      imagePrompt: segment.imagePrompt,
      order: segment.order,
      duration: segment.duration,
      audioVolume: segment.audioVolume,
      playBackRate: segment.playBackRate,
      withBlur: segment.withBlur,
      backgroundMinimized: segment.backgroundMinimized,
      wordTimings: segment.wordTimings?.[0] || undefined,
    }));
  }

  /**
   * Extract file URLs from video segments that need to be uploaded
   */
  static extractFileUploads(
    videoSegments: VideoSegment[],
    projectId: string,
  ): Array<{
    segmentId: string;
    type: "image" | "audio";
    url: string;
    order: number;
  }> {
    const uploads: Array<{
      segmentId: string;
      type: "image" | "audio";
      url: string;
      order: number;
    }> = [];

    videoSegments.forEach((segment) => {
      if (segment.imageUrl && segment.imageUrl.startsWith("data:")) {
        uploads.push({
          segmentId: segment._id || "",
          type: "image",
          url: segment.imageUrl,
          order: segment.order,
        });
      }

      if (
        segment.audioUrl &&
        (segment.audioUrl.startsWith("data:") ||
          segment.audioUrl.startsWith("blob:"))
      ) {
        uploads.push({
          segmentId: segment._id || segment.id || "",
          type: "audio",
          url: segment.audioUrl,
          order: segment.order,
        });
      }
    });

    return uploads;
  }

  /**
   * Calculate total video duration from segments
   */
  static calculateTotalDuration(segments: VideoSegment[]): number {
    const totalDuration = segments.reduce(
      (total, segment) => total + (segment.duration || 0),
      0,
    );
    // Return at least 1 second duration to prevent player errors
    return Math.max(1, totalDuration);
  }

  /**
   * Get segment at specific time
   */
  static getSegmentAtTime(
    segments: VideoSegment[],
    currentTime: number,
  ): {
    segment: VideoSegment;
    index: number;
    segmentStartTime: number;
  } | null {
    let accumulatedTime = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentDuration = segment.duration || 0;

      if (
        currentTime >= accumulatedTime &&
        currentTime < accumulatedTime + segmentDuration
      ) {
        return {
          segment,
          index: i,
          segmentStartTime: accumulatedTime,
        };
      }

      accumulatedTime += segmentDuration;
    }

    return null;
  }

  /**
   * Convert time to frame number
   */
  static timeToFrame(time: number, fps: number = 30): number {
    return Math.floor(time * fps);
  }

  /**
   * Convert frame to time
   */
  static frameToTime(frame: number, fps: number = 30): number {
    return frame / fps;
  }
}

// Hook to use video editor with projects
export interface UseVideoEditorProps {
  projectId: string;
}

export interface UseVideoEditorReturn {
  video: Video | null;
  isLoading: boolean;
  error: Error | null;
  updateSegment: (
    segmentIndex: number,
    updates: Partial<VideoSegment>,
  ) => Promise<void>;
  uploadSegmentFile: (
    segmentId: string,
    file: File,
    type: "image" | "audio",
  ) => Promise<void>;
  uploadBase64File: (
    segmentId: string,
    base64Data: string,
    fileName: string,
    type: "image" | "audio",
  ) => Promise<void>;
  refreshVideo: () => void;
}
