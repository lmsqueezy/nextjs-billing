"use client";

import React from "react";
import { Composition, AbsoluteFill, Audio } from "remotion";
import type { ProjectWithDetails } from "@/types/project";
import { useSegmentTiming } from "./hooks/use-segment-timing";
import { VideoSegmentRenderer } from "./video-segment-renderer";
import { VideoWatermark } from "./video-watermark";

export interface VideoCompositionProps {
  project: ProjectWithDetails;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  project,
}) => {
  const { getSegmentsToRender, fps } = useSegmentTiming(project);
  const segmentsToRender = getSegmentsToRender();
  console.log("thoufic project in videocomposition", project);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      {/* Sequential Video/Media Segments with integrated captions */}
      <VideoSegmentRenderer
        segmentsToRender={segmentsToRender}
        fps={fps}
        segments={project?.segments}
        project={project}
      />
      <Audio
        src="https://assets.cursorshorts.com/cursorshorts/assets/backgroundMusic/temporex.mp3"
        volume={0.4}
        loop
      />

      {/* Watermark */}
      <VideoWatermark show={project?.watermark || false} />
    </AbsoluteFill>
  );
};

// Wrapper component for Remotion with proper typing
const VideoCompositionWrapper: React.FC<any> = (props) => {
  return <VideoComposition {...props} />;
};

// Define the composition for Remotion with proper project data
export const RemotionVideo: React.FC<{ project: ProjectWithDetails }> = ({
  project,
}) => {
  // Calculate total duration in frames from all segments (ensuring voice is not cut)
  const totalDurationInSeconds = project.segments.reduce(
    (acc, segment) => acc + (segment.duration || 5), // Use actual duration or fallback to 5 seconds
    0,
  );
  const totalFrames = Math.round(totalDurationInSeconds * 30); // 30 fps

  // Use default format if not specified
  const format = project.format || { width: 1080, height: 1920 };

  return (
    <Composition
      id="VideoComposition"
      component={VideoCompositionWrapper}
      durationInFrames={totalFrames}
      fps={30}
      width={format.width}
      height={format.height}
      defaultProps={{
        project,
      }}
    />
  );
};
