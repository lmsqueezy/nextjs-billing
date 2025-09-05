/**
 * Consolidated hook for video editor that combines project data and player functionality
 * Works with database-backed projects and provides unified state management
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useProject, useUpdateSegment } from "./use-projects";
import { useUploadFile, useUploadBase64File } from "./use-files";
import { ProjectWithDetails, ProjectSegment } from "@/types/project";
import { toast } from "sonner";

// Consolidated hook interface for project editor
export interface UseProjectEditorProps {
  projectId: string;
}

export interface UseProjectEditorReturn {
  // Project Data
  project: ProjectWithDetails | null;
  isLoading: boolean;
  error: Error | null;
  
  // Player State
  isPlaying: boolean;
  currentTime: number;
  selectedFrameIndex: number;
  totalDuration: number;
  currentSegmentInfo: {
    segment: ProjectSegment;
    index: number;
    segmentStartTime: number;
  } | null;
  
  // Project Operations
  updateSegment: (
    segmentIndex: number,
    updates: Partial<ProjectSegment>,
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
  refreshProject: () => void;
  
  // Player Controls
  togglePlayPause: () => void;
  updateCurrentTime: (time: number) => void;
  selectFrame: (frameIndex: number) => void;
}

export function useProjectEditor({
  projectId,
}: UseProjectEditorProps): UseProjectEditorReturn {
  // Core hooks
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const updateSegmentMutation = useUpdateSegment();
  const uploadFile = useUploadFile();
  const uploadBase64File = useUploadBase64File();

  // Update a project segment
  const updateSegment = useCallback(
    async (segmentIndex: number, updates: Partial<ProjectSegment>) => {
      if (!project || !project.segments[segmentIndex]) {
        toast.error("Segment not found");
        return;
      }

      const currentSegment = project.segments[segmentIndex];
      const segmentId = currentSegment.id;

      if (!segmentId) {
        toast.error("Invalid segment ID");
        return;
      }

      try {
        // Apply updates directly to the segment
        const segmentUpdates: Partial<ProjectSegment> = {
          text: updates.text !== undefined ? updates.text : currentSegment.text,
          imagePrompt:
            updates.imagePrompt !== undefined
              ? updates.imagePrompt
              : currentSegment.imagePrompt,
          videoPrompt:
            updates.videoPrompt !== undefined
              ? (updates.videoPrompt ?? "")
              : (currentSegment.videoPrompt ?? ""),
          duration:
            updates.duration !== undefined
              ? updates.duration
              : currentSegment.duration,
          audioVolume:
            updates.audioVolume !== undefined
              ? updates.audioVolume
              : currentSegment.audioVolume,
          playBackRate:
            updates.playBackRate !== undefined
              ? updates.playBackRate
              : currentSegment.playBackRate,
          withBlur:
            updates.withBlur !== undefined
              ? updates.withBlur
              : currentSegment.withBlur,
          backgroundMinimized:
            updates.backgroundMinimized !== undefined
              ? updates.backgroundMinimized
              : currentSegment.backgroundMinimized,
          imageUrl:
            updates.imageUrl !== undefined
              ? updates.imageUrl
              : currentSegment.imageUrl,
          audioUrl:
            updates.audioUrl !== undefined
              ? updates.audioUrl
              : currentSegment.audioUrl,
          videoUrl:
            updates.videoUrl !== undefined
              ? updates.videoUrl
              : currentSegment.videoUrl,
          order:
            updates.order !== undefined ? updates.order : currentSegment.order,
        };

        // Handle word timings
        if (updates.wordTimings !== undefined) {
          segmentUpdates.wordTimings = updates.wordTimings;
        }

        await updateSegmentMutation.mutateAsync({
          projectId,
          segmentId,
          data: segmentUpdates,
        });

        // Handle file uploads if there are new data URLs
        const uploadPromises: Promise<any>[] = [];

        if (updates.imageUrl && updates.imageUrl.startsWith("data:")) {
          uploadPromises.push(
            uploadBase64File.mutateAsync({
              base64Data: updates.imageUrl,
              fileName: `segment_${segmentIndex}_image.png`,
              fileType: "image",
              projectId,
              segmentId,
            }),
          );
        }

        if (updates.audioUrl && updates.audioUrl.startsWith("data:")) {
          uploadPromises.push(
            uploadBase64File.mutateAsync({
              base64Data: updates.audioUrl,
              fileName: `segment_${segmentIndex}_audio.mp3`,
              fileType: "audio",
              projectId,
              segmentId,
            }),
          );
        }

        if (updates.audioUrl && updates.audioUrl.startsWith("blob:")) {
          // Convert blob URL to base64
          try {
            const response = await fetch(updates.audioUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            const audioData = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            uploadPromises.push(
              uploadBase64File.mutateAsync({
                base64Data: audioData,
                fileName: `segment_${segmentIndex}_audio.mp3`,
                fileType: "audio",
                projectId,
                segmentId,
              }),
            );
          } catch (error) {
            console.error("Failed to convert blob URL:", error);
          }
        }

        // Wait for all uploads to complete
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }

        toast.success("Segment updated successfully");
        
        // Note: No manual refresh needed - React Query will automatically update 
        // all consuming components via the cache update in the mutation's onSuccess
      } catch (error) {
        console.error("Failed to update segment:", error);
        toast.error("Failed to update segment");
      }
    },
    [project, projectId, updateSegmentMutation, uploadBase64File],
  );

  // Upload file for a specific segment
  const uploadSegmentFile = useCallback(
    async (segmentId: string, file: File, type: "image" | "audio") => {
      try {
        await uploadFile.mutateAsync({
          file,
          projectId,
          segmentId,
        });

        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
        );
      } catch (error) {
        console.error("Failed to upload file:", error);
        toast.error(`Failed to upload ${type}`);
      }
    },
    [projectId, uploadFile],
  );

  // Upload base64 file for a specific segment
  const uploadSegmentBase64File = useCallback(
    async (
      segmentId: string,
      base64Data: string,
      fileName: string,
      type: "image" | "audio",
    ) => {
      try {
        await uploadBase64File.mutateAsync({
          base64Data,
          fileName,
          fileType: type,
          projectId,
          segmentId,
        });

        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
        );
      } catch (error) {
        console.error("Failed to upload file:", error);
        toast.error(`Failed to upload ${type}`);
      }
    },
    [projectId, uploadBase64File],
  );

  const refreshProject = useCallback(() => {
    refetch();
  }, [refetch]);

  // Player state management (consolidated from useVideoPlayer)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  // Calculate total duration from project segments
  const totalDuration = project
    ? project.segments.reduce(
        (total, segment) => total + (segment.duration || 0),
        0,
      )
    : 0;

  // Get current segment info
  const currentSegmentInfo = useMemo(() => {
    if (!project || !project.segments.length) return null;

    let accumulatedTime = 0;
    for (let i = 0; i < project.segments.length; i++) {
      const segment = project.segments[i];
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
  }, [project, currentTime]);

  // Player controls
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const updateCurrentTime = useCallback(
    (time: number) => {
      setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
    },
    [totalDuration],
  );

  const selectFrame = useCallback(
    (frameIndex: number) => {
      if (!project) return;

      setSelectedFrameIndex(frameIndex);

      // Calculate time for this frame
      let accumulatedTime = 0;
      for (let i = 0; i < Math.min(frameIndex, project.segments.length); i++) {
        accumulatedTime += project.segments[i].duration || 0;
      }

      updateCurrentTime(accumulatedTime);
    },
    [project, updateCurrentTime],
  );

  // Reset player state when project changes
  useEffect(() => {
    if (project) {
      setCurrentTime(0);
      setSelectedFrameIndex(0);
      setIsPlaying(false);
    }
  }, [project?.status, project?.id]);

  return {
    // Project Data
    project: project || null,
    isLoading,
    error: error as Error | null,
    
    // Player State
    isPlaying,
    currentTime,
    selectedFrameIndex,
    totalDuration,
    currentSegmentInfo,
    
    // Project Operations
    updateSegment,
    uploadSegmentFile,
    uploadBase64File: uploadSegmentBase64File,
    refreshProject,
    
    // Player Controls
    togglePlayPause,
    updateCurrentTime,
    selectFrame,
  };
}

// Legacy hook for backward compatibility - delegates to useProjectEditor
export function useVideoEditor({
  projectId,
}: UseProjectEditorProps): UseProjectEditorReturn {
  return useProjectEditor({ projectId });
}

// Legacy hook for backward compatibility - now part of useProjectEditor
export function useVideoPlayer(project: ProjectWithDetails | null) {
  // This is now handled internally by useProjectEditor
  // Keeping this for any existing components that might still use it
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  const totalDuration = project
    ? project.segments.reduce(
        (total, segment) => total + (segment.duration || 0),
        0,
      )
    : 0;

  const currentSegmentInfo = useMemo(() => {
    if (!project || !project.segments.length) return null;

    let accumulatedTime = 0;
    for (let i = 0; i < project.segments.length; i++) {
      const segment = project.segments[i];
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
  }, [project, currentTime]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const updateCurrentTime = useCallback(
    (time: number) => {
      setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
    },
    [totalDuration],
  );

  const selectFrame = useCallback(
    (frameIndex: number) => {
      if (!project) return;

      setSelectedFrameIndex(frameIndex);

      let accumulatedTime = 0;
      for (let i = 0; i < Math.min(frameIndex, project.segments.length); i++) {
        accumulatedTime += project.segments[i].duration || 0;
      }

      updateCurrentTime(accumulatedTime);
    },
    [project, updateCurrentTime],
  );

  useEffect(() => {
    if (project) {
      setCurrentTime(0);
      setSelectedFrameIndex(0);
      setIsPlaying(false);
    }
  }, [project?.status, project?.id]);

  return {
    isPlaying,
    currentTime,
    selectedFrameIndex,
    totalDuration,
    currentSegmentInfo,
    togglePlayPause,
    updateCurrentTime,
    selectFrame,
  };
}
