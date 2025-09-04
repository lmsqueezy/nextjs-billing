"use client";

import React from "react";
import { Composition, AbsoluteFill, Audio } from "remotion";
import type { Video as VideoType } from "@/types/video";
import { useSegmentTiming } from "./hooks/use-segment-timing";
import { VideoSegmentRenderer } from "./video-segment-renderer";
import { VideoWatermark } from "./video-watermark";

export interface VideoCompositionProps {
  video: VideoType;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  video,
}) => {
  const { getSegmentsToRender, fps } = useSegmentTiming(video);
  const segmentsToRender = getSegmentsToRender();
  // console.log("thoufic video in videocomposition", video);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      {/* Sequential Video/Media Segments with integrated captions */}
      <VideoSegmentRenderer
        segmentsToRender={segmentsToRender}
        fps={fps}
        segments={video?.segments}
        video={video}
      />
      <Audio
        src="https://assets.cursorshorts.com/cursorshorts/assets/backgroundMusic/temporex.mp3"
        volume={0.4}
        loop
      />

      {/* Watermark */}
      <VideoWatermark show={video.watermark} />
    </AbsoluteFill>
  );
};

// Wrapper component for Remotion with proper typing
const VideoCompositionWrapper: React.FC<any> = (props) => {
  return <VideoComposition {...props} />;
};

// Define the composition for Remotion with proper video data
export const RemotionVideo: React.FC<{ video: VideoType }> = ({ video }) => {
  // Calculate total duration in frames from all segments (ensuring voice is not cut)
  const totalDurationInSeconds = video.segments.reduce(
    (acc, segment) => acc + (segment.duration || 5), // Use actual duration or fallback to 5 seconds
    0,
  );
  const totalFrames = Math.round(totalDurationInSeconds * 30); // 30 fps

  return (
    <Composition
      id="VideoComposition"
      component={VideoCompositionWrapper}
      durationInFrames={totalFrames}
      fps={30}
      width={video.format.width}
      height={video.format.height}
      defaultProps={{
        video,
      }}
    />
  );
};
