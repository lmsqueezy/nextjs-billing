import { Film, RefreshCw, Video, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { VideoSegment } from "@/types/video";
import { useEffect } from "react";

interface VideoEditTabProps {
  segment: VideoSegment;
  videoPrompt: string;
  onPromptChange: (prompt: string) => void;
  onConvertToVideo: () => void;
  isConverting: boolean;
}

export function VideoEditTab({
  segment,
  videoPrompt,
  onPromptChange,
  onConvertToVideo,
  isConverting = false,
}: VideoEditTabProps) {
  const hasVideo = !!segment.videoUrl;
  const defaultPrompt = "A cinematic scene with subtle movement and natural motion";
  const originalPrompt = segment.videoPrompt || defaultPrompt;
  const hasChanges = videoPrompt !== originalPrompt;

  // Debug: Track when segment videoUrl changes
  useEffect(() => {
    console.log("VideoEditTab: segment videoUrl updated:", segment.videoUrl);
  }, [segment.videoUrl]);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Video Preview Section */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Current Video</label>
          <div className="relative mx-auto mt-2 aspect-[9/16] w-full max-w-48 overflow-hidden rounded-lg border bg-gray-100">
            {segment.videoUrl ? (
              <video
                src={segment.videoUrl}
                className="absolute inset-0 h-full w-full object-contain"
                controls
                muted
                loop
              />
            ) : segment.imageUrl ? (
              <div className="absolute inset-0">
                <img
                  src={segment.imageUrl}
                  alt="Source image"
                  className="h-full w-full object-contain opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Film className="mx-auto mb-2 h-8 w-8" />
                    <div className="text-xs">Ready to convert</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Video className="mx-auto mb-2 h-8 w-8" />
                  <div className="text-xs">No source image</div>
                </div>
              </div>
            )}

            {/* Conversion loading overlay */}
            {isConverting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex flex-col items-center gap-2 text-white">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="text-xs">Converting...</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Metadata */}
          {segment.videoUrl && (
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div>
                <span className="font-medium">Resolution:</span> 720p (9:16)
              </div>
              <div>
                <span className="font-medium">Format:</span> MP4
              </div>
              <div>
                <span className="font-medium">Duration:</span> ~5 seconds
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div className="space-y-4">
        {/* Model Info */}
        <div>
          <label className="text-sm font-medium">Model</label>
          <div className="mt-2 rounded-lg bg-gray-50 p-3">
            <div className="text-sm font-mono text-gray-700">
              fal-ai/wan/v2.2-a14b/image-to-video
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Wanxiang video generation model - optimized for realistic motion
            </div>
          </div>
        </div>

        {/* Video Prompt */}
        <div>
          <label className="text-sm font-medium">Motion Prompt</label>
          <Textarea
            value={videoPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the desired motion and camera movement..."
            className="mt-2"
            rows={3}
          />
          <div className="mt-1 text-xs text-gray-500">
            Describe how you want the image to animate (camera movement, object motion, etc.)
          </div>
          {hasChanges && (
            <div className="mt-1 text-xs text-blue-600">
              ⚡ Prompt modified - click "{hasVideo ? 'Regenerate Video' : 'Convert to Video'}" to apply changes
            </div>
          )}
        </div>

        {/* Convert Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onConvertToVideo} 
            disabled={isConverting || !segment.imageUrl}
          >
            {isConverting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {hasVideo ? 'Regenerating...' : 'Converting...'}
              </>
            ) : hasVideo ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Regenerate Video
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Convert to Video
              </>
            )}
          </Button>
        </div>

        {/* Helper Text */}
        {!segment.imageUrl ? (
          <div className="text-center text-xs text-gray-500">
            Generate an image first to enable video conversion
          </div>
        ) : hasVideo ? (
          <div className="text-center text-xs text-gray-500">
            Modify prompt above to regenerate with new motion
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500">
            Ready to convert image to video
          </div>
        )}
      </div>
    </div>
  );
}