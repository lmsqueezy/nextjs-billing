import React, { useState, useEffect } from "react";
import type { VideoSegment } from "@/types/video";
import { Button } from "@/components/ui/button";
import { TabNavigation, ImageEditTab, VideoEditTab, ScriptEditTab } from "../dialogs/tabs";

type EditMode = "image" | "video" | "script";

interface EditSegmentSidebarProps {
  segment: VideoSegment;
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
  onConvertToVideo?: (index: number, prompt?: string) => Promise<void>;
  onSegmentUpdate?: (index: number, updatedSegment: VideoSegment) => void;
  isRegenerating: boolean;
  isConverting?: boolean;
  onClose: () => void;
}

export function EditSegmentSidebar({
  segment,
  segmentIndex,
  onRegenerateImage,
  onRegenerateAudio,
  onConvertToVideo,
  onSegmentUpdate,
  isRegenerating,
  isConverting = false,
  onClose,
}: EditSegmentSidebarProps) {
  const [activeTab, setActiveTab] = useState<EditMode>("image");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("flux-schnell");
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("echo");
  const [videoPrompt, setVideoPrompt] = useState("A cinematic scene with subtle movement and natural motion");

  // Debug: Log the props - this will show if the component is re-rendering
  useEffect(() => {
    console.log(
      "EditSegmentSidebar RENDER - segment:",
      segment ? "segment exists" : "no segment",
      "segmentIndex:",
      segmentIndex,
    );
  }, [segment, segmentIndex]);

  // Initialize form values when segment changes
  useEffect(() => {
    if (segment) {
      console.log(
        "EditSegmentSidebar: segment updated, imageUrl:",
        segment.imageUrl,
      );
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

  return (
    <div className="h-full space-y-4">
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "image" && (
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

        {activeTab === "video" && (
          <VideoEditTab
            segment={segment}
            videoPrompt={videoPrompt}
            onPromptChange={setVideoPrompt}
            onConvertToVideo={handleConvertToVideo}
            isConverting={isConverting}
          />
        )}

        {activeTab === "script" && (
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
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
