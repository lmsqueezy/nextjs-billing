import { Image, RefreshCw, Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageModelSelector } from "../../forms";
import { imageModels } from "@/lib/image-models";
import type { VideoSegment } from "@/types/video";
import { useEffect } from "react";

interface ImageEditTabProps {
  segment: VideoSegment;
  imagePrompt: string;
  imageModel: string;
  onPromptChange: (prompt: string) => void;
  onModelChange: (model: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function ImageEditTab({
  segment,
  imagePrompt,
  imageModel,
  onPromptChange,
  onModelChange,
  onRegenerate,
  isRegenerating,
}: ImageEditTabProps) {
  const hasChanges = imagePrompt !== segment.imagePrompt;
  const hasVideo = !!segment.videoUrl;

  // Debug: Track when segment imageUrl changes
  useEffect(() => {
    console.log("ImageEditTab: segment imageUrl updated:", segment.imageUrl);
  }, [segment.imageUrl]);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Left Column - Image Preview */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current Image</label>
          <div className="relative mx-auto mt-2 aspect-[9/16] w-full max-w-48 overflow-hidden rounded-lg border bg-gray-100">
            {segment.imageUrl ? (
              <img
                src={segment.imageUrl}
                alt={segment.imagePrompt}
                className="absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Image className="mx-auto mb-2 h-8 w-8" />
                  <div className="text-xs">No image</div>
                </div>
              </div>
            )}

            {/* Regeneration loading overlay */}
            {isRegenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex flex-col items-center gap-2 text-white">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="text-xs">Generating...</span>
                </div>
              </div>
            )}
          </div>

          {/* Image Metadata */}
          {segment.imageUrl && (
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div className="truncate">
                <span className="font-medium">Current prompt:</span>{" "}
                {segment.imagePrompt}
              </div>
              <div>
                <span className="font-medium">Resolution:</span> 1080×1920
                (9:16)
              </div>
            </div>
          )}

          {/* Video Impact Warning */}
          {hasVideo && (
            <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <div className="font-medium">Video Generated</div>
                  <div>This image has been converted to video. Regenerating will require re-converting to video.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Controls */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Image Prompt</label>
          <Textarea
            value={imagePrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Enter image prompt..."
            className="mt-2"
            rows={3}
          />
          {hasChanges && (
            <div className="mt-1 text-xs text-blue-600">
              ⚡ Prompt modified - click "Regenerate Image" to apply changes
              {hasVideo && <span className="text-yellow-600"> (will affect video)</span>}
            </div>
          )}
        </div>

        <ImageModelSelector
          selectedModel={imageModel}
          onModelChange={onModelChange}
          models={imageModels}
        />

        <div className="flex justify-end pt-4">
          <Button onClick={onRegenerate} disabled={isRegenerating}>
            {isRegenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Regenerate Image"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
