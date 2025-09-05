"use client";

import { useState, useRef, useEffect } from "react";
import { Player } from "@remotion/player";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoComposition } from "@/components/video-editor/video-composition";
import { VideoFramesPanel } from "@/components/video-editor/video-frames-panel";
import { FileUpload } from "@/components/ui/file-upload";
import { Loading } from "@/components/ui/loading";
import type { VideoSegment } from "@/types/video";
import {
  useVideoEditorContext,
  useVideoEditorPlayer,
  useVideoEditorModals,
} from "./providers/video-editor-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface VideoPlayerPanelProps {
  className?: string;
}

export function VideoPlayerPanel({ className }: VideoPlayerPanelProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Get state from context
  const { video, isLoading, error, actions } = useVideoEditorContext();
  const {
    isPlaying,
    currentTime,
    selectedFrameIndex,
    totalDuration,
    togglePlayPause,
    updateCurrentTime,
    selectFrame,
  } = useVideoEditorPlayer();
  const { showFileUpload, uploadSegmentId, hideFileUploadModal } =
    useVideoEditorModals();

  // Cleanup function to prevent destroy errors
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          // Properly cleanup the player reference
          if (typeof playerRef.current.pause === "function") {
            playerRef.current.pause();
          }
          playerRef.current = null;
        } catch (error) {
          console.warn("Error during player cleanup:", error);
        }
      }
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <Loading size="lg" />
          <p className="text-foreground/70">Loading video project...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-destructive">Failed to load video project</p>
          <p className="text-sm text-foreground/70">{error.message}</p>
          <Button onClick={actions.refreshVideo} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!video) {
    return (
      <div className="flex h-full w-full flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-foreground/70">No video project found</p>
          <Button onClick={actions.refreshVideo} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Calculate frame number for display
  const fps = 30;
  const totalFrames = Math.max(1, Math.floor(totalDuration * fps)); // Ensure at least 1 frame

  // File upload handler
  const handleFileUpload = (segmentId: string) => {
    if (actions.showFileUploadModal) {
      actions.showFileUploadModal(segmentId);
    }
  };

  // Create a timer to update currentTime when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentFrame === "function"
      ) {
        try {
          const frame = playerRef.current.getCurrentFrame() || 0;
          const newTime = frame / fps;
          if (newTime <= totalDuration) {
            updateCurrentTime(newTime);
          } else {
            // Video ended - pause playback and reset time
            togglePlayPause(); // This will set isPlaying to false, stopping all audio
            updateCurrentTime(0);
          }
        } catch (error) {
          // Handle any potential player errors
          console.warn("Player time update error:", error);
        }
      }
    }, 1000 / 30); // Update at 30fps

    return () => clearInterval(interval);
  }, [isPlaying, fps, totalDuration, updateCurrentTime, togglePlayPause]);

  return (
    <div className={`flex h-full w-full flex-1 flex-col ${className || ""}`}>
      {/* Video Player Area */}
      <div className="mx-auto flex h-full flex-1 items-center justify-center p-4">
        <div className="relative mx-auto h-full">
          {/* Video Container */}
          <div
            ref={containerRef}
            className="relative aspect-[9/16] h-full overflow-hidden rounded-2xl bg-black shadow-2xl"
          >
            {/* Remotion Player */}
            <Player
              className="h-80 w-full"
              ref={playerRef}
              component={VideoComposition}
              durationInFrames={totalFrames}
              compositionWidth={video.format?.width || 1080}
              compositionHeight={video.format?.height || 1920}
              fps={fps}
              style={{
                width: "100%",
                height: "100%",
              }}
              inputProps={{
                project: video,
              }}
              autoPlay={false}
              controls={true}
              loop={false}
              allowFullscreen
              doubleClickToFullscreen
              showVolumeControls={true}
              spaceKeyToPlayOrPause={false}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls and Segment Timeline */}
      <div className="mx-auto w-full p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Horizontal Segment Panel */}
          <VideoFramesPanel orientation="horizontal" showHeader={false} />
        </div>
      </div>

      {/* File Upload Dialog */}
      <Dialog open={showFileUpload} onOpenChange={hideFileUploadModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          {uploadSegmentId && (
            <FileUpload
              projectId={video._id}
              segmentId={uploadSegmentId}
              onUploadComplete={(file) => {
                toast.success(`${file.originalName} uploaded successfully`);
                hideFileUploadModal();
              }}
              onUploadError={(error) => {
                toast.error(`Upload failed: ${error}`);
              }}
              multiple={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
