"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useProjectEditor } from "@/hooks/use-video-editor";
import { useUpdateProject } from "@/hooks/use-projects";
import { useSegmentOperations } from "../hooks/use-segment-operations";
import type { ProjectWithDetails, ProjectSegment } from "@/types/project";
import type { ProjectFile } from "@/types/video";
import type { SidebarMode } from "../sidebar/video-editor-sidebar";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface VideoEditorState {
  // Project Data (from useVideoEditor)
  project: ProjectWithDetails | null;
  video?: ProjectWithDetails | null; // Alias for backward compatibility
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
    selectedSegment: ProjectSegment | null;
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

  // Project Operations (from useVideoEditor + useSegmentOperations)
  updateSegment: (
    index: number,
    updates: Partial<ProjectSegment> & { files?: ProjectFile[] },
  ) => Promise<void>;
  updateProject: (updates: Partial<ProjectWithDetails>) => Promise<void>;
  updateVideo: (updates: Partial<ProjectWithDetails>) => Promise<void>; // Alias for backward compatibility
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
  refreshVideo: () => void; // Alias for backward compatibility

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
  openEditSidebar: (segment: ProjectSegment, index: number) => void;
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
  insertSegment: (afterIndex: number, segment: ProjectSegment) => Promise<void>;
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
    segment: ProjectSegment,
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

  // Use consolidated project editor hook
  const projectEditor = useProjectEditor({ projectId });

  // Use project update mutation
  const updateProjectMutation = useUpdateProject();

  // Enhanced segment update with proper React Query cache management
  const updateSegment = useCallback(
    async (
      index: number,
      updates: Partial<ProjectSegment> & { files?: ProjectFile[] },
    ) => {
      if (!projectEditor.project || !projectEditor.project.segments[index]) {
        toast.error("Segment not found");
        return;
      }

      try {
        console.log(
          `[VideoEditorProvider] Updating segment ${index}:`,
          updates,
        );

        // Call the consolidated update function which handles:
        // 1. API call to update the segment
        // 2. File uploads if needed
        // 3. React Query cache updates through onSuccess mutations
        // 4. Automatic re-renders for all consuming components via React Query
        await projectEditor.updateSegment(index, updates);

        console.log(
          `[VideoEditorProvider] Segment ${index} update completed successfully`,
        );
      } catch (error) {
        console.error(
          `[VideoEditorProvider] Failed to update segment ${index}:`,
          error,
        );
        toast.error("Failed to update segment");
        throw error;
      }
    },
    [projectEditor],
  );

  // Update project-level properties
  const updateProject = useCallback(
    async (updates: Partial<ProjectWithDetails>) => {
      await updateProjectMutation.mutateAsync({
        projectId,
        data: updates,
      });
    },
    [projectId, updateProjectMutation],
  );

  // Use existing segment operations hook with enhanced update function
  const segmentOperations = useSegmentOperations({
    segments: projectEditor.project?.segments || [],
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
      if (!projectEditor.project || isExporting) return;

      setIsExporting(true);
      setExportProgress("Preparing export...");

      try {
        const response = await fetch("/api/export-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoData: projectEditor.project,
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
    [projectEditor.project, isExporting],
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

  // Image-to-video conversion action with enhanced state sync
  const convertToVideo = useCallback(
    async (index: number, prompt?: string) => {
      const segment = projectEditor.project?.segments?.[index];
      if (!segment?.imageUrl || isConverting !== null) return;

      setIsConverting(index);
      console.log(
        `[VideoEditorProvider] Starting image-to-video conversion for segment ${index}`,
      );

      try {
        const response = await fetch("/api/image-to-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: segment.imageUrl,
            prompt:
              prompt ||
              "A cinematic scene with subtle movement and natural motion",
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
        console.log(
          `[VideoEditorProvider] Video conversion successful for segment ${index}:`,
          result.videoUrl,
        );

        // Update the segment with the generated video URL and prompt
        // This will automatically trigger fresh data for all consuming components
        await updateSegment(index, {
          videoUrl: result.videoUrl,
          videoPrompt:
            prompt ||
            "A cinematic scene with subtle movement and natural motion",
        });

        console.log(
          `[VideoEditorProvider] Segment ${index} updated with video URL`,
        );

        // Show success notification
        toast.success("Image converted to video successfully!");
      } catch (error) {
        console.error(
          `[VideoEditorProvider] Video conversion failed for segment ${index}:`,
          error,
        );

        // Show error notification
        toast.error("Failed to convert image to video. Please try again.");

        throw error;
      } finally {
        setIsConverting(null);
      }
    },
    [projectEditor.project?.segments, isConverting, projectId, updateSegment],
  );

  // Segment insertion wrapper
  const insertSegment = useCallback(
    async (afterIndex: number, segment: ProjectSegment) => {
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
    // Project Data State - now from consolidated hook
    project: projectEditor.project,
    video: projectEditor.project, // Alias for backward compatibility
    isLoading: projectEditor.isLoading,
    error: projectEditor.error,

    // Player State - now from consolidated hook
    isPlaying: projectEditor.isPlaying,
    currentTime: projectEditor.currentTime,
    selectedFrameIndex: projectEditor.selectedFrameIndex,
    totalDuration: projectEditor.totalDuration,
    currentSegmentInfo: projectEditor.currentSegmentInfo,

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
      // Player Actions - now from consolidated hook
      togglePlayPause: projectEditor.togglePlayPause,
      updateCurrentTime: projectEditor.updateCurrentTime,
      selectFrame: projectEditor.selectFrame,

      // Audio Actions
      setVolume,
      toggleMute,

      // Project Operations - enhanced with guaranteed state sync
      updateSegment,
      updateProject,
      updateVideo: updateProject, // Alias for backward compatibility
      uploadSegmentFile: projectEditor.uploadSegmentFile,
      uploadBase64File: projectEditor.uploadBase64File,
      refreshProject: projectEditor.refreshProject,
      refreshVideo: projectEditor.refreshProject, // Alias for backward compatibility

      // Regeneration Operations
      regenerateImage: async (index: number, prompt: string, model: string) => {
        try {
          await segmentOperations.handleRegenerateImage(index, prompt, model);
          toast.success("Image regenerated successfully!");
        } catch (error) {
          console.error("Image regeneration failed:", error);
          toast.error("Failed to regenerate image. Please try again.");
        }
      },
      regenerateAudio: segmentOperations.handleRegenerateAudio,
      generateNewSegment,
      convertToVideo,

      // Sidebar Actions
      openEditSidebar: (segment: ProjectSegment, index: number) =>
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
