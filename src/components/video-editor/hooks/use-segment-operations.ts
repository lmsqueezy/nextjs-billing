import { useState, useEffect, useCallback } from "react";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { getAudioDuration, estimateAudioDuration } from "@/lib/audio-utils";
import { addFileToSegment } from "@/hooks/use-video-editor";
import type { ProjectSegment } from "@/types/project";
import type { ProjectFile } from "@/types/video";
import type { SidebarMode } from "../sidebar/video-editor-sidebar";

type EditMode = "image" | "script" | null;

interface EditingState {
  index: number;
  mode: EditMode;
  imagePrompt: string;
  imageModel: string;
  script: string;
  voice: string;
}

interface NewFrameState {
  insertAfterIndex: number;
  script: string;
  voice: string;
  imageModel: string;
  isGenerating: boolean;
}

interface UseSegmentOperationsProps {
  segments: ProjectSegment[];
  projectId?: string;
  onSegmentUpdate?: (
    index: number,
    updates: Partial<ProjectSegment> & { files?: ProjectFile[] },
  ) => void;
  onSegmentInsert?: (index: number, newSegment: ProjectSegment) => void;
}

export function useSegmentOperations({
  segments,
  projectId,
  onSegmentUpdate,
  onSegmentInsert,
}: UseSegmentOperationsProps) {
  // Legacy dialog states removed - dialogs no longer used
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null);

  // Sidebar state management
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  const [sidebarSegment, setSidebarSegment] = useState<ProjectSegment | null>(
    null,
  );
  const [sidebarSegmentIndex, setSidebarSegmentIndex] = useState<number>(-1);
  const [sidebarInsertAfterIndex, setSidebarInsertAfterIndex] =
    useState<number>(-1);

  const { generateImage } = useImageGeneration();

  // Legacy dialog functions removed

  // Sidebar handlers
  const handleEditSegmentSidebar = (index: number, segment: ProjectSegment) => {
    setSidebarMode("edit");
    setSidebarSegment(segment);
    setSidebarSegmentIndex(index);
    // Don't call handleEdit - that triggers dialogs
  };

  const handleCreateNewFrameSidebar = (insertAfterIndex: number) => {
    setSidebarMode("new");
    setSidebarInsertAfterIndex(insertAfterIndex);
    // Don't call handleCreateNewFrame - that triggers dialogs
  };

  const closeSidebar = useCallback(() => {
    setSidebarMode(null);
    setSidebarSegment(null);
    setSidebarSegmentIndex(-1);
    setSidebarInsertAfterIndex(-1);
    // Don't clear old dialog states - they're unused now
  }, []);

  const handleRegenerateImage = useCallback(
    async (index: number, newPrompt: string, model: string) => {
      if (!onSegmentUpdate || !projectId) return;

      setIsRegenerating(index);
      console.log(
        `[useSegmentOperations] Starting image regeneration for segment ${index}`,
      );

      try {
        // Step 1: Generate the new image
        const result = await generateImage({
          prompt: newPrompt,
          model,
        });

        if (result.success && result.imageUrl) {
          const segment = segments[index];
          const segmentId = segment.id;

          let newFile: ProjectFile | null = null;

          if (segmentId) {
            // Step 2: Create file record in database and get complete file data
            try {
              const fileResponse = await fetch("/api/files", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  projectId,
                  segmentId,
                  fileType: "image",
                  fileName: `image_${segmentId}_${Date.now()}.jpg`,
                  mimeType: "image/jpeg",
                  fileSize: 1024, // Size will be determined by the storage service
                  sourceUrl: result.imageUrl,
                  metadata: {
                    prompt: newPrompt,
                    model,
                    generatedAt: new Date().toISOString(),
                  },
                }),
              });

              if (!fileResponse.ok) {
                const error = await fileResponse.json();
                throw new Error(`Failed to create file record: ${error.error}`);
              }

              const fileData = await fileResponse.json();
              newFile = fileData.data; // Extract the complete ProjectFile record
              console.log(
                `[useSegmentOperations] File record created:`,
                newFile,
              );
            } catch (fileError) {
              console.warn(
                "Failed to create file record, but continuing with segment update:",
                fileError,
              );
            }
          }

          // Step 3: Update the segment with both imageUrl AND updated files array
          const currentFiles = segment.files || [];
          let updatedFiles = currentFiles;

          // If we successfully created a file record, add it to the files array
          if (newFile) {
            updatedFiles = addFileToSegment(currentFiles, newFile);
            console.log(
              `[useSegmentOperations] Updated files array:`,
              updatedFiles,
            );
          }

          // Update the segment with coordinated data
          const updates = {
            imagePrompt: newPrompt,
            imageUrl: result.imageUrl,
            ...(newFile && { files: updatedFiles }), // Only include files if we have a new file
          };

          console.log(
            `[useSegmentOperations] Updating segment ${index} with:`,
            updates,
          );
          await onSegmentUpdate(index, updates);

          console.log(
            `[useSegmentOperations] Image regeneration completed successfully for segment ${index}`,
          );
        } else {
          console.error("Failed to regenerate image:", result.error);
          throw new Error(`Failed to regenerate image: ${result.error}`);
        }
      } catch (error) {
        console.error("Error regenerating image:", error);
        // Use toast instead of alert for better UX
        // Note: We'll import toast in the provider that uses this hook
        throw error; // Re-throw so the provider can handle the error notification
      } finally {
        setIsRegenerating(null);
      }
    },
    [segments, projectId, onSegmentUpdate, generateImage],
  );

  const handleRegenerateAudio = useCallback(
    async (index: number, newScript: string, voice: string) => {
      if (!onSegmentUpdate || !projectId) return;

      setIsRegenerating(index);
      try {
        // Step 1: Generate the new audio
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newScript,
            voice: voice,
            index: index,
          }),
        });

        if (response.ok) {
          const { audioUrl } = await response.json();

          // Get actual audio duration
          let actualDuration: number;
          try {
            actualDuration = await getAudioDuration(audioUrl);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(
              `Could not get actual duration for segment ${index}, using estimate:`,
              error,
            );
            actualDuration = estimateAudioDuration(newScript);
          }

          const segment = segments[index];
          const segmentId = segment.id;

          if (segmentId) {
            // Step 2: Create file record in database
            try {
              const fileResponse = await fetch("/api/files", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  projectId,
                  segmentId,
                  fileType: "audio",
                  fileName: `audio_${segmentId}_${Date.now()}.mp3`,
                  mimeType: "audio/mpeg",
                  fileSize: 0, // Size will be determined by the storage service
                  sourceUrl: audioUrl,
                  metadata: {
                    text: newScript,
                    voice,
                    duration: actualDuration,
                    generatedAt: new Date().toISOString(),
                  },
                }),
              });

              if (!fileResponse.ok) {
                const error = await fileResponse.json();
                throw new Error(`Failed to create file record: ${error.error}`);
              }

              const fileData = await fileResponse.json();
              console.log("File record created:", fileData);
            } catch (fileError) {
              console.warn(
                "Failed to create file record, but continuing with segment update:",
                fileError,
              );
            }
          }

          // Step 3: Update the segment
          const updatedSegment: ProjectSegment = {
            ...segments[index],
            text: newScript,
            audioUrl: audioUrl,
            duration: actualDuration,
          };
          onSegmentUpdate(index, updatedSegment);
        } else {
          const error = await response.json();
          // eslint-disable-next-line no-alert
          alert(`Failed to regenerate audio: ${error.error}`);
        }
      } catch (error) {
        console.error("Error regenerating audio:", error);
        alert("Error regenerating audio. Please try again.");
      } finally {
        setIsRegenerating(null);
        // setEditingState(null);
      }
    },
    [segments, projectId, onSegmentUpdate],
  );

  // Generate image prompt from script
  const generateImagePrompt = async (script: string): Promise<string> => {
    try {
      const response = await fetch("/api/generate-image-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          style: "dark_eerie_survival", // Use the existing style
        }),
      });

      if (response.ok) {
        const { imagePrompt } = await response.json();
        return imagePrompt;
      } else {
        console.error("Failed to generate image prompt");
        return `Dark, eerie scene representing: ${script}`;
      }
    } catch (error) {
      console.error("Error generating image prompt:", error);
      return `Dark, eerie scene representing: ${script}`;
    }
  };

  // Legacy dialog functions removed

  // Count words in script
  const countWords = (text: string): number => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  // Generate new frame with all assets
  const handleGenerateNewFrame = useCallback(
    async (script: string, voice: string, imageModel: string) => {
      if (!onSegmentInsert || sidebarInsertAfterIndex === -1) return;

      // Validate script length (max 50 words)
      const wordCount = countWords(script);
      if (wordCount > 50) {
        alert("Script must be 50 words or less. Current count: " + wordCount);
        return;
      }

      if (!script.trim()) {
        alert("Please enter a script for the new frame.");
        return;
      }

      // No need to set generation state - handled by sidebar

      try {
        // Step 1: Generate image prompt
        const imagePrompt = await generateImagePrompt(script);

        // Step 2: Generate image
        const imageResult = await generateImage({
          prompt: imagePrompt,
          model: imageModel,
        });

        if (!imageResult.success) {
          throw new Error("Failed to generate image: " + imageResult.error);
        }

        // Step 3: Generate audio
        const audioResponse = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: script,
            voice: voice,
            index: sidebarInsertAfterIndex + 1,
          }),
        });

        if (!audioResponse.ok) {
          const error = await audioResponse.json();
          throw new Error("Failed to generate audio: " + error.error);
        }

        const { audioUrl } = await audioResponse.json();

        // Get actual audio duration
        let actualDuration: number;
        try {
          actualDuration = await getAudioDuration(audioUrl);
        } catch (error) {
          console.warn("Could not get actual duration, using estimate:", error);
          actualDuration = estimateAudioDuration(script);
        }

        // Step 4: Create new segment
        const newSegment: ProjectSegment = {
          id: `segment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          projectId: projectId || "",
          text: script,
          imagePrompt: imagePrompt,
          imageUrl: imageResult.imageUrl!,
          audioUrl: audioUrl,
          audioVolume: 1,
          playBackRate: 1,
          duration: actualDuration,
          withBlur: false,
          backgroundMinimized: false,
          order: sidebarInsertAfterIndex + 1,
          media: [],
          wordTimings: [],
          elements: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Step 5: Insert new segment
        onSegmentInsert(sidebarInsertAfterIndex, newSegment);

        // Close sidebar after successful creation
        closeSidebar();
      } catch (error) {
        console.error("Error creating new frame:", error);
        alert("Error creating new frame: " + (error as Error).message);
      }
      // No finally block needed - generation state handled by sidebar
    },
    [sidebarInsertAfterIndex, onSegmentInsert, generateImage, closeSidebar],
  );

  // Legacy dialog close functions removed

  return {
    // Regeneration state (used by sidebar)
    isRegenerating,
    handleRegenerateImage,
    handleRegenerateAudio,
    handleGenerateNewFrame,

    // Sidebar state and handlers
    sidebarMode,
    sidebarSegment,
    sidebarSegmentIndex,
    sidebarInsertAfterIndex,
    handleEditSegmentSidebar,
    handleCreateNewFrameSidebar,
    closeSidebar,
  };
}
