import React, { useState, useEffect } from "react";
import type { VideoSegment } from "@/types/video";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TabNavigation, ImageEditTab, VideoEditTab, ScriptEditTab } from "./tabs";

type EditMode = "image" | "video" | "script";

interface EditSegmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  segment: VideoSegment | null;
  segmentIndex: number;
  onRegenerateImage: (
    index: number,
    prompt: string,
    model: string,
  ) => Promise<void>;
  onRegenerateAudio: (
    index: number,
    script: string,
    voice: string,
  ) => Promise<void>;
  onSegmentUpdate?: (index: number, updatedSegment: VideoSegment) => void;
  isRegenerating: boolean;
  onConvertToVideo?: (index: number, prompt: string) => Promise<void>;
  isConverting?: boolean;
  asContent?: boolean; // When true, returns only DialogContent without Dialog wrapper
}

export function EditSegmentDialog({
  isOpen,
  onClose,
  segment,
  segmentIndex,
  onRegenerateImage,
  onRegenerateAudio,
  onSegmentUpdate,
  isRegenerating,
  onConvertToVideo,
  isConverting = false,
  asContent = false,
}: EditSegmentDialogProps) {
  const [activeTab, setActiveTab] = useState<EditMode>("image");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("flux-schnell");
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("echo");
  const [videoPrompt, setVideoPrompt] = useState("A cinematic scene with subtle movement and natural motion");

  // Debug: Log the props - this will show if the component is re-rendering

  // Debug: Track isOpen changes
  useEffect(() => {
    console.log(
      "EditSegmentDialog RENDER - isOpen:",
      isOpen,
      "segment:",
      segment ? "segment exists" : "no segment",
      "segmentIndex:",
      segmentIndex,
    );
  }, [isOpen, segment, segmentIndex]);

  // Initialize form values when segment changes
  useEffect(() => {
    if (segment) {
      console.log("EditSegmentDialog: segment updated, imageUrl:", segment.imageUrl);
      setImagePrompt(segment.imagePrompt);
      setScript(segment.text);
      setImageModel("flux-schnell");
      setVoice("echo");
      // Use stored video prompt or default
      setVideoPrompt(segment.videoPrompt || "A cinematic scene with subtle movement and natural motion");
    }
  }, [segment]);

  const handleRegenerateImage = () => {
    void onRegenerateImage(segmentIndex, imagePrompt, imageModel);
  };

  const handleRegenerateAudio = () => {
    void onRegenerateAudio(segmentIndex, script, voice);
  };

  const handleConvertToVideo = () => {
    if (onConvertToVideo) {
      void onConvertToVideo(segmentIndex, videoPrompt);
    }
  };

  const handleImagePromptChange = (newPrompt: string) => {
    setImagePrompt(newPrompt);
    if (segment && onSegmentUpdate) {
      const updatedSegment: VideoSegment = {
        ...segment,
        imagePrompt: newPrompt,
      };
      // onSegmentUpdate(segmentIndex, updatedSegment);
    }
  };

  const handleScriptChange = (newScript: string) => {
    setScript(newScript);
    if (segment && onSegmentUpdate) {
      const updatedSegment: VideoSegment = {
        ...segment,
        text: newScript,
      };
      // onSegmentUpdate(segmentIndex, updatedSegment);
    }
  };

  const handleSave = () => {
    if (segment && onSegmentUpdate) {
      const updatedSegment: VideoSegment = {
        ...segment,
        text: script,
        imagePrompt: imagePrompt,
        videoPrompt: videoPrompt,
      };
      onSegmentUpdate(segmentIndex, updatedSegment);
    }
  };

  const dialogContent = (
    <>
      <DialogHeader>
        <DialogTitle>Edit Segment #{segmentIndex}</DialogTitle>
      </DialogHeader>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-4 space-y-4">
        {activeTab === "image" && segment && (
          <ImageEditTab
            segment={segment}
            imagePrompt={imagePrompt}
            imageModel={imageModel}
            onPromptChange={handleImagePromptChange}
            onModelChange={setImageModel}
            onRegenerate={handleRegenerateImage}
            isRegenerating={isRegenerating}
          />
        )}

        {activeTab === "video" && segment && (
          <VideoEditTab
            segment={segment}
            videoPrompt={videoPrompt}
            onPromptChange={setVideoPrompt}
            onConvertToVideo={handleConvertToVideo}
            isConverting={isConverting}
          />
        )}

        {activeTab === "script" && segment && (
          <ScriptEditTab
            segment={segment}
            script={script}
            voice={voice}
            onScriptChange={handleScriptChange}
            onVoiceChange={setVoice}
            onRegenerate={handleRegenerateAudio}
            isRegenerating={isRegenerating}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </>
  );

  if (asContent) {
    return <DialogContent className="max-w-2xl">{dialogContent}</DialogContent>;
  }

  const handleOpenChange = (open: boolean) => {
    console.log(
      "EditSegmentDialog: onOpenChange called with open:",
      open,
      "isOpen:",
      isOpen,
    );
    // Only close if the dialog was actually open and is now being closed
    // This prevents race conditions when the dialog is first opening
    if (!open && isOpen) {
      console.log("EditSegmentDialog: Calling onClose due to dialog close");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">{dialogContent}</DialogContent>
    </Dialog>
  );
}
