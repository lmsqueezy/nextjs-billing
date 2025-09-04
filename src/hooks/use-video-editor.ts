/**
 * Hook for video editor that works with database-backed projects
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useProject, useUpdateSegment } from "./use-projects";
import { useUploadFile, useUploadBase64File } from "./use-files";
import {
  VideoProjectAdapter,
  UseVideoEditorReturn,
  UseVideoEditorProps,
} from "@/types/video-compatibility";
import { Video, VideoSegment } from "@/types/video";
import { ProjectSegment } from "@/types/project";
import { toast } from "sonner";

export function useVideoEditor({
  projectId,
}: UseVideoEditorProps): UseVideoEditorReturn {
  // Core hooks
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  // Project files are now included in the project data when using ?include=details
  // No need for separate projectFiles query since API returns nested files
  const updateSegmentMutation = useUpdateSegment();
  const uploadFile = useUploadFile();
  const uploadBase64File = useUploadBase64File();

  // Convert project to video format whenever data meaningfully changes
  const video = useMemo(() => {
    console.log("useVideoEditor: project changed", project);
    if (!project) {
      return null;
    }

    // Pass empty array for projectFiles since files are nested in segments
    return VideoProjectAdapter.projectToVideo(project, []);
  }, [
    // Only depend on values that meaningfully affect the conversion
    project?.id,
    project?.title,
    project?.script,
    project?.status,
    project?.format,
    project?.updatedAt,
    JSON.stringify(
      project?.segments?.map((s) => ({
        id: s.id,
        text: s.text,
        imagePrompt: s.imagePrompt,
        order: s.order,
        duration: s.duration,
        audioVolume: s.audioVolume,
        playBackRate: s.playBackRate,
        withBlur: s.withBlur,
        backgroundMinimized: s.backgroundMinimized,
        wordTimings: s.wordTimings,
        videoUrl: s.videoUrl,
        updatedAt: s.updatedAt,
      })),
    ),
    // Files are now included in segments, so include them in dependency check
    JSON.stringify(
      project?.segments
        ?.flatMap((s) => s.files || [])
        .map((f) => ({
          id: f.id,
          segmentId: f.segmentId,
          fileType: f.fileType,
          r2Url: f.r2Url,
          tempUrl: f.tempUrl,
          uploadStatus: f.uploadStatus,
          createdAt: f.createdAt,
        })),
    ),
  ]);
  // console.log("thoufic video", video);

  // Update a video segment
  const updateSegment = useCallback(
    async (segmentIndex: number, updates: Partial<VideoSegment>) => {
      if (!video || !video.segments[segmentIndex]) {
        toast.error("Segment not found");
        return;
      }

      const currentSegment = video.segments[segmentIndex];
      const segmentId = currentSegment._id;

      if (!segmentId) {
        toast.error("Invalid segment ID");
        return;
      }

      try {
        // Convert video segment updates to project segment format
        const segmentUpdates: Partial<ProjectSegment> = {
          text: updates.text !== undefined ? updates.text : currentSegment.text,
          imagePrompt:
            updates.imagePrompt !== undefined
              ? updates.imagePrompt
              : currentSegment.imagePrompt,
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
          videoUrl:
            updates.videoUrl !== undefined
              ? updates.videoUrl
              : currentSegment.videoUrl,
          order:
            updates.order !== undefined ? updates.order : currentSegment.order,
        };

        // Handle word timings conversion
        if (updates.wordTimings && updates.wordTimings.length > 0) {
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

        if (
          updates.audioUrl &&
          (updates.audioUrl.startsWith("data:") ||
            updates.audioUrl.startsWith("blob:"))
        ) {
          // Convert blob URL to base64 if needed
          let audioData = updates.audioUrl;
          if (updates.audioUrl.startsWith("blob:")) {
            try {
              const response = await fetch(updates.audioUrl);
              const blob = await response.blob();
              const reader = new FileReader();
              audioData = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.error("Failed to convert blob URL:", error);
            }
          }

          uploadPromises.push(
            uploadBase64File.mutateAsync({
              base64Data: audioData,
              fileName: `segment_${segmentIndex}_audio.mp3`,
              fileType: "audio",
              projectId,
              segmentId,
            }),
          );
        }

        // Wait for all uploads to complete
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }

        toast.success("Segment updated successfully");
      } catch (error) {
        console.error("Failed to update segment:", error);
        toast.error("Failed to update segment");
      }
    },
    [video, projectId, updateSegmentMutation, uploadBase64File],
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

  const refreshVideo = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    video,
    isLoading,
    error: error as Error | null,
    updateSegment,
    uploadSegmentFile,
    uploadBase64File: uploadSegmentBase64File,
    refreshVideo,
  };
}

// Additional utility hook for video player state management
export function useVideoPlayer(video: Video | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  // Calculate total duration
  const totalDuration = video
    ? VideoProjectAdapter.calculateTotalDuration(video.segments)
    : 0;

  // Get current segment info
  const currentSegmentInfo = video
    ? VideoProjectAdapter.getSegmentAtTime(video.segments, currentTime)
    : null;

  // Play/pause toggle
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Update current time
  const updateCurrentTime = useCallback(
    (time: number) => {
      setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
    },
    [totalDuration],
  );

  // Select frame by index
  const selectFrame = useCallback(
    (frameIndex: number) => {
      if (!video) return;

      setSelectedFrameIndex(frameIndex);

      // Calculate time for this frame (assuming segments are played in order)
      let accumulatedTime = 0;
      for (let i = 0; i < Math.min(frameIndex, video.segments.length); i++) {
        accumulatedTime += video.segments[i].duration || 0;
      }

      updateCurrentTime(accumulatedTime);
    },
    [video, updateCurrentTime],
  );

  // Reset player state when video changes
  useEffect(() => {
    if (video) {
      setCurrentTime(0);
      setSelectedFrameIndex(0);
      setIsPlaying(false);
    }
  }, [video?.status, video?._id]);

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
