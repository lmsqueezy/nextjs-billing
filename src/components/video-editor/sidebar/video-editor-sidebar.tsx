import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoSegment } from "@/types/video";
import { EditSegmentSidebar } from "./edit-segment-sidebar";
import { NewFrameSidebar } from "./new-frame-sidebar";
import {
  useVideoEditorSidebar,
  useVideoEditorOperations,
} from "../providers/video-editor-provider";

export type SidebarMode = "edit" | "new" | null;

interface VideoEditorSidebarProps {
  className?: string;
}

export function VideoEditorSidebar({
  className,
}: VideoEditorSidebarProps = {}) {
  // Get state from context
  const {
    isOpen,
    mode,
    selectedSegment,
    selectedSegmentIndex,
    insertAfterIndex,
    closeSidebar,
  } = useVideoEditorSidebar();

  const {
    isRegenerating,
    isGeneratingSegment,
    isConverting,
    regenerateImage,
    regenerateAudio,
    generateNewSegment,
    convertToVideo,
    updateSegment,
  } = useVideoEditorOperations();
  if (!isOpen) return null;

  return (
    <div className="h-full w-80 overflow-y-auto border-l border-gray-200 bg-white shadow-lg">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold">
          {mode === "edit" &&
            `Edit Segment #${(selectedSegmentIndex ?? 0) + 1}`}
          {mode === "new" &&
            `Add New Frame${
              insertAfterIndex !== undefined && insertAfterIndex >= 0
                ? ` After #${insertAfterIndex + 1}`
                : " At Beginning"
            }`}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={closeSidebar}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {mode === "edit" &&
          selectedSegment &&
          selectedSegmentIndex !== undefined && (
            <EditSegmentSidebar
              segment={selectedSegment}
              segmentIndex={selectedSegmentIndex}
              onRegenerateImage={regenerateImage}
              onRegenerateAudio={regenerateAudio}
              onConvertToVideo={convertToVideo}
              onSegmentUpdate={updateSegment}
              isRegenerating={isRegenerating !== null}
              isConverting={isConverting === selectedSegmentIndex}
              onClose={closeSidebar}
            />
          )}

        {mode === "new" && (
          <NewFrameSidebar
            insertAfterIndex={insertAfterIndex ?? -1}
            onGenerate={generateNewSegment}
            isGenerating={isGeneratingSegment}
            onClose={closeSidebar}
          />
        )}
      </div>
    </div>
  );
}
