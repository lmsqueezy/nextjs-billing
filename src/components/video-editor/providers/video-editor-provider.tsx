"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useVideoEditor, useVideoPlayer } from "@/hooks/use-video-editor";
import { useUpdateProject } from "@/hooks/use-projects";
import { useSegmentOperations } from "../hooks/use-segment-operations";
import type { Video, VideoSegment } from "@/types/video";
import type { Project } from "@/types/project";
import type { SidebarMode } from "../sidebar/video-editor-sidebar";

// ============================================================================
// Types
// ============================================================================

interface VideoEditorState {
  // Video Data (from useVideoEditor)
  video: Video | null;
  isLoading: boolean;
  error: Error | null;

  // Player State (from useVideoPlayer)
  isPlaying: boolean;
  currentTime: number;
  selectedFrameIndex: number;
  totalDuration: number;
  currentSegmentInfo: any;

  // UI State (consolidated from useSegmentOperations and local state)
  sidebar: {
    isOpen: boolean;
    mode: SidebarMode;
    selectedSegment: VideoSegment | null;
    selectedSegmentIndex: number;
    insertAfterIndex: number;
  };

  // Operation States (from useSegmentOperations + additional)
  operations: {
    isRegenerating: number | null;
    isGeneratingSegment: boolean;
    isConverting: number | null;
    isExporting: boolean;
    exportProgress: string;
  };

  // Modal States (local to provider)
  modals: {
    showVideoPreview: boolean;
    showFileUpload: boolean;
    exportedVideo: { url: string; filename: string } | null;
    uploadSegmentId: string | null;
  };

  // Volume/Audio State (local to provider)
  audio: {
    volume: number;
    isMuted: boolean;
  };
}

interface VideoEditorActions {
  // Player Actions (from useVideoPlayer)
  togglePlayPause: () => void;
  updateCurrentTime: (time: number) => void;
  selectFrame: (index: number) => void;

  // Audio Actions (local)
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Video Operations (from useVideoEditor + useSegmentOperations)
  updateSegment: (
    index: number,
    updates: Partial<VideoSegment>,
  ) => Promise<void>;
  updateVideo: (updates: Partial<Video>) => Promise<void>;
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

  // Regeneration Operations (from useSegmentOperations)
  regenerateImage: (
    index: number,
    prompt: string,
    model: string,
  ) => Promise<void>;
  regenerateAudio: (
    index: number,
    script: string,
    voice: string,
  ) => Promise<void>;
  generateNewSegment: (
    script: string,
    voice: string,
    imageModel: string,
  ) => Promise<void>;
  convertToVideo: (index: number, prompt?: string) => Promise<void>;

  // Sidebar Actions (from useSegmentOperations)
  openEditSidebar: (segment: VideoSegment, index: number) => void;
  openNewSegmentSidebar: (afterIndex: number) => void;
  closeSidebar: () => void;

  // Export Actions (local)
  exportVideo: (quality: string) => Promise<void>;

  // Modal Actions (local)
  showVideoPreviewModal: (videoData: { url: string; filename: string }) => void;
  hideVideoPreviewModal: () => void;
  showFileUploadModal: (segmentId: string) => void;
  hideFileUploadModal: () => void;

  // Segment Insert Action (handled by parent page currently)
  insertSegment: (afterIndex: number, segment: VideoSegment) => Promise<void>;
}

interface VideoEditorContextValue extends VideoEditorState {
  actions: VideoEditorActions;
}

// ============================================================================
// Context
// ============================================================================

const VideoEditorContext = createContext<VideoEditorContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface VideoEditorProviderProps {
  children: React.ReactNode;
  projectId: string;
  // Optional callback for segment insertion (handled by parent page)
  onSegmentInsert?: (
    afterIndex: number,
    segment: VideoSegment,
  ) => Promise<void>;
}

export function VideoEditorProvider({
  children,
  projectId,
  onSegmentInsert,
}: VideoEditorProviderProps) {
  // ========================================================================
  // Core Hooks Integration
  // ========================================================================

  // Use existing video editor hook
  const videoEditor = useVideoEditor({ projectId });
  
  // Use project update mutation
  const updateProjectMutation = useUpdateProject();

  // Use existing video player hook
  const videoPlayer = useVideoPlayer(videoEditor.video);

  // Enhanced segment update that ensures UI state is updated
  const updateSegment = useCallback(
    async (index: number, updates: Partial<VideoSegment>) => {
      // Call the original update function which handles:
      // 1. API call to update the segment
      // 2. File uploads if needed
      // 3. Cache invalidation through React Query
      await videoEditor.updateSegment(index, updates);

      // The useUpdateSegment mutation should automatically update the project cache,
      // which will trigger a re-render of the video state through the useMemo dependency
      // on project?.updatedAt in useVideoEditor
    },
    [videoEditor.updateSegment],
  );

  // Update video-level properties
  const updateVideo = useCallback(
    async (updates: Partial<Video>) => {
      // Map video properties to project properties
      const projectUpdates: Partial<Project> = {};
      
      if (updates.watermark !== undefined) {
        projectUpdates.watermark = updates.watermark;
      }
      
      await updateProjectMutation.mutateAsync({
        projectId,
        data: projectUpdates,
      });
    },
    [projectId, updateProjectMutation],
  );

  // Use existing segment operations hook
  const segmentOperations = useSegmentOperations({
    segments: videoEditor.video?.segments || [],
    projectId,
    onSegmentUpdate: updateSegment,
    onSegmentInsert: onSegmentInsert,
  });

  // ========================================================================
  // Local State (not handled by existing hooks)
  // ========================================================================

  // Audio state
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Operation states
  const [isGeneratingSegment, setIsGeneratingSegment] = useState(false);
  const [isConverting, setIsConverting] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  // Modal states
  const [modals, setModals] = useState({
    showVideoPreview: false,
    showFileUpload: false,
    exportedVideo: null as { url: string; filename: string } | null,
    uploadSegmentId: null as string | null,
  });

  // ========================================================================
  // Action Implementations
  // ========================================================================

  // Audio actions
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Export action
  const exportVideo = useCallback(
    async (quality: string) => {
      if (!videoEditor.video || isExporting) return;

      setIsExporting(true);
      setExportProgress("Preparing export...");

      try {
        const response = await fetch("/api/export-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoData: videoEditor.video,
            quality,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Export failed");
        }

        const result = await response.json();
        setExportProgress("Video ready!");

        // Show video preview modal
        setModals((prev) => ({
          ...prev,
          showVideoPreview: true,
          exportedVideo: {
            url: result.downloadUrl,
            filename: result.filename,
          },
        }));
      } catch (error) {
        console.error("Export failed:", error);
        throw error;
      } finally {
        setIsExporting(false);
        setExportProgress("");
      }
    },
    [videoEditor.video, isExporting],
  );

  // Modal actions
  const showVideoPreviewModal = useCallback(
    (videoData: { url: string; filename: string }) => {
      setModals((prev) => ({
        ...prev,
        showVideoPreview: true,
        exportedVideo: videoData,
      }));
    },
    [],
  );

  const hideVideoPreviewModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      showVideoPreview: false,
      exportedVideo: null,
    }));
  }, []);

  const showFileUploadModal = useCallback((segmentId: string) => {
    setModals((prev) => ({
      ...prev,
      showFileUpload: true,
      uploadSegmentId: segmentId,
    }));
  }, []);

  const hideFileUploadModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      showFileUpload: false,
      uploadSegmentId: null,
    }));
  }, []);

  // Enhanced segment generation with loading state
  const generateNewSegment = useCallback(
    async (script: string, voice: string, imageModel: string) => {
      setIsGeneratingSegment(true);
      try {
        await segmentOperations.handleGenerateNewFrame(
          script,
          voice,
          imageModel,
        );
      } finally {
        setIsGeneratingSegment(false);
      }
    },
    [segmentOperations.handleGenerateNewFrame],
  );

  // Image-to-video conversion action
  const convertToVideo = useCallback(
    async (index: number, prompt?: string) => {
      const segment = videoEditor.video?.segments?.[index];
      if (!segment?.imageUrl || isConverting !== null) return;

      setIsConverting(index);
      console.log(`[VideoEditorProvider] Starting image-to-video conversion for segment ${index}`);

      try {
        const response = await fetch("/api/image-to-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: segment.imageUrl,
            prompt: prompt || "A cinematic scene with subtle movement and natural motion",
            projectId,
            segmentId: segment.id,
            index,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Video conversion failed");
        }

        const result = await response.json();
        console.log(`[VideoEditorProvider] Video conversion successful for segment ${index}:`, result.videoUrl);

        // Update the segment with the generated video URL and prompt
        await updateSegment(index, { 
          videoUrl: result.videoUrl,
          videoPrompt: prompt || "A cinematic scene with subtle movement and natural motion"
        });

        console.log(`[VideoEditorProvider] Segment ${index} updated with video URL`);
        
        // Show success notification
        const { toast } = await import("sonner");
        toast.success("Image converted to video successfully!");
      } catch (error) {
        console.error(`[VideoEditorProvider] Video conversion failed for segment ${index}:`, error);
        
        // Show error notification
        const { toast } = await import("sonner");
        toast.error("Failed to convert image to video. Please try again.");
        
        throw error;
      } finally {
        setIsConverting(null);
      }
    },
    [videoEditor.video?.segments, isConverting, projectId, updateSegment],
  );

  // Segment insertion wrapper
  const insertSegment = useCallback(
    async (afterIndex: number, segment: VideoSegment) => {
      if (onSegmentInsert) {
        await onSegmentInsert(afterIndex, segment);
      }
    },
    [onSegmentInsert],
  );

  // ========================================================================
  // Context Value
  // ========================================================================

  const contextValue: VideoEditorContextValue = {
    // Video Data State
    video: videoEditor.video,
    isLoading: videoEditor.isLoading,
    error: videoEditor.error,

    // Player State
    isPlaying: videoPlayer.isPlaying,
    currentTime: videoPlayer.currentTime,
    selectedFrameIndex: videoPlayer.selectedFrameIndex,
    totalDuration: videoPlayer.totalDuration,
    currentSegmentInfo: videoPlayer.currentSegmentInfo,

    // UI State
    sidebar: {
      isOpen: segmentOperations.sidebarMode !== null,
      mode: segmentOperations.sidebarMode,
      selectedSegment: segmentOperations.sidebarSegment,
      selectedSegmentIndex: segmentOperations.sidebarSegmentIndex,
      insertAfterIndex: segmentOperations.sidebarInsertAfterIndex,
    },

    // Operation States
    operations: {
      isRegenerating: segmentOperations.isRegenerating,
      isGeneratingSegment,
      isConverting,
      isExporting,
      exportProgress,
    },

    // Modal States
    modals,

    // Audio State
    audio: {
      volume,
      isMuted,
    },

    // Actions
    actions: {
      // Player Actions
      togglePlayPause: videoPlayer.togglePlayPause,
      updateCurrentTime: videoPlayer.updateCurrentTime,
      selectFrame: videoPlayer.selectFrame,

      // Audio Actions
      setVolume,
      toggleMute,

      // Video Operations
      updateSegment,
      updateVideo,
      uploadSegmentFile: videoEditor.uploadSegmentFile,
      uploadBase64File: videoEditor.uploadBase64File,
      refreshVideo: videoEditor.refreshVideo,

      // Regeneration Operations
      regenerateImage: segmentOperations.handleRegenerateImage,
      regenerateAudio: segmentOperations.handleRegenerateAudio,
      generateNewSegment,
      convertToVideo,

      // Sidebar Actions
      openEditSidebar: (segment: VideoSegment, index: number) =>
        segmentOperations.handleEditSegmentSidebar(index, segment),
      openNewSegmentSidebar: segmentOperations.handleCreateNewFrameSidebar,
      closeSidebar: segmentOperations.closeSidebar,

      // Export Actions
      exportVideo,

      // Modal Actions
      showVideoPreviewModal,
      hideVideoPreviewModal,
      showFileUploadModal,
      hideFileUploadModal,

      // Segment Operations
      insertSegment,
    },
  };

  return (
    <VideoEditorContext.Provider value={contextValue}>
      {children}
    </VideoEditorContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

export function useVideoEditorContext() {
  const context = useContext(VideoEditorContext);
  if (!context) {
    throw new Error(
      "useVideoEditorContext must be used within VideoEditorProvider",
    );
  }
  return context;
}

// ============================================================================
// Specialized Hooks for Different Concerns
// ============================================================================

export function useVideoEditorPlayer() {
  const {
    isPlaying,
    currentTime,
    selectedFrameIndex,
    totalDuration,
    currentSegmentInfo,
    actions,
  } = useVideoEditorContext();
  return {
    isPlaying,
    currentTime,
    selectedFrameIndex,
    totalDuration,
    currentSegmentInfo,
    togglePlayPause: actions.togglePlayPause,
    updateCurrentTime: actions.updateCurrentTime,
    selectFrame: actions.selectFrame,
  };
}

export function useVideoEditorSidebar() {
  const { sidebar, actions } = useVideoEditorContext();
  return {
    ...sidebar,
    openEditSidebar: actions.openEditSidebar,
    openNewSegmentSidebar: actions.openNewSegmentSidebar,
    closeSidebar: actions.closeSidebar,
  };
}

export function useVideoEditorOperations() {
  const { operations, actions } = useVideoEditorContext();
  return {
    ...operations,
    updateSegment: actions.updateSegment,
    updateVideo: actions.updateVideo,
    insertSegment: actions.insertSegment,
    regenerateImage: actions.regenerateImage,
    regenerateAudio: actions.regenerateAudio,
    generateNewSegment: actions.generateNewSegment,
    convertToVideo: actions.convertToVideo,
    uploadSegmentFile: actions.uploadSegmentFile,
    uploadBase64File: actions.uploadBase64File,
    refreshVideo: actions.refreshVideo,
  };
}

export function useVideoEditorAudio() {
  const { audio, actions } = useVideoEditorContext();
  return {
    ...audio,
    setVolume: actions.setVolume,
    toggleMute: actions.toggleMute,
  };
}

export function useVideoEditorModals() {
  const { modals, actions } = useVideoEditorContext();
  return {
    ...modals,
    showVideoPreviewModal: actions.showVideoPreviewModal,
    hideVideoPreviewModal: actions.hideVideoPreviewModal,
    showFileUploadModal: actions.showFileUploadModal,
    hideFileUploadModal: actions.hideFileUploadModal,
  };
}

export function useVideoEditorExport() {
  const { operations, actions } = useVideoEditorContext();
  return {
    isExporting: operations.isExporting,
    exportProgress: operations.exportProgress,
    exportVideo: actions.exportVideo,
  };
}
