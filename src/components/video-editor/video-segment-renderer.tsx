import React from "react";
import {
  AbsoluteFill,
  Video,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  Audio,
} from "remotion";
import type { ProjectSegment, ProjectWithDetails } from "@/types/project";
import { ProjectFileUtils } from "@/lib/file-utils";
import { SegmentCaption } from "./segment-caption";
import { getCaptionStyle, shouldRenderCaptions } from "../../lib/caption-utils";

interface VideoSegmentRendererProps {
  segmentsToRender: Array<{
    segment: ProjectSegment;
    originalIndex: number;
  }>;
  fps: number;
  segments: ProjectSegment[];
  project: ProjectWithDetails;
}

export const VideoSegmentRenderer: React.FC<VideoSegmentRendererProps> = ({
  segmentsToRender,
  fps,
  segments,
  project,
}) => {
  return (
    <>
      {segmentsToRender?.map(({ segment, originalIndex }) => (
        <SegmentComponent
          key={segment.id}
          segment={segment}
          originalIndex={originalIndex}
          fps={fps}
          segments={segments}
          project={project}
        />
      ))}
    </>
  );
};

interface SegmentComponentProps {
  segment: ProjectSegment;
  originalIndex: number;
  fps: number;
  segments: ProjectSegment[];
  project: ProjectWithDetails;
}

const SegmentComponent: React.FC<SegmentComponentProps> = ({
  segment,
  originalIndex,
  fps,
  segments,
  project,
}) => {
  const frame = useCurrentFrame();

  // Calculate frames for this segment
  const segmentFrames = Math.round((segment.duration || 5) * fps);

  const startFrame = segments
    .slice(0, originalIndex)
    .reduce((acc, seg) => acc + Math.round((seg.duration || 5) * fps), 0);

  // Create a smooth zoom-in transition over the segment duration
  const localFrame = frame - startFrame;
  const scaleEffect = interpolate(localFrame, [0, segmentFrames], [1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t * (3 - 2 * t), // Smooth ease-in-out (smoothstep)
  });

  // Get caption style and check if captions should be rendered
  const captionStyle = getCaptionStyle(project);
  const renderCaptions = shouldRenderCaptions(project);

  // Use file-based URL resolution
  const videoUrl = ProjectFileUtils.getFileUrl(
    ProjectFileUtils.getSegmentVideo(segment),
  );
  const imageUrl =
    segment.imageUrl ||
    ProjectFileUtils.getFileUrl(ProjectFileUtils.getSegmentImage(segment));
  const audioUrl = ProjectFileUtils.getFileUrl(
    ProjectFileUtils.getSegmentAudio(segment),
  );
  console.log("thoufic ", { project, videoUrl, imageUrl, audioUrl });

  return (
    <Sequence from={startFrame} durationInFrames={segmentFrames}>
      <AbsoluteFill>
        {/* Background Video/Image - prioritize generated video over image */}
        {videoUrl ? (
          <MediaElement src={videoUrl} scaleEffect={scaleEffect} />
        ) : imageUrl ? (
          <MediaElement src={imageUrl} scaleEffect={scaleEffect} />
        ) : // Fallback to segment URLs if file-based resolution fails
        segment.videoUrl ? (
          <MediaElement src={segment.videoUrl} scaleEffect={scaleEffect} />
        ) : segment.imageUrl ? (
          <MediaElement src={segment.imageUrl} scaleEffect={scaleEffect} />
        ) : (
          <FallbackBackground />
        )}

        {/* Audio - prioritize file-based URL */}
        {(audioUrl || segment.audioUrl) && (
          <Audio
            src={audioUrl || segment.audioUrl}
            volume={segment.audioVolume}
          />
        )}

        {/* Overlay Video */}
        {segment.overlay && (
          <Video
            src={segment.overlay.url}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.7,
              mixBlendMode: "overlay",
            }}
            muted
          />
        )}

        {/* Segment-specific captions */}
        <SegmentCaption
          segment={segment}
          captionStyle={captionStyle}
          fps={fps}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

interface MediaElementProps {
  src: string;
  scaleEffect: number;
}

const MediaElement: React.FC<MediaElementProps> = ({ src, scaleEffect }) => {
  const isBase64Image = src.startsWith("data:image/");
  const isVideo =
    !isBase64Image && (src.endsWith(".mp4") || src.endsWith(".webm"));

  const mediaStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
    transform: `scale(${scaleEffect})`,
  };

  if (isVideo) {
    return <Video src={src} style={mediaStyle} muted />;
  }

  return <Img src={src} style={mediaStyle} />;
};

const FallbackBackground: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(45deg, #8b4513 0%, #d4a574 30%, #654321 70%, #2c1810 100%)",
      opacity: 0.8,
    }}
  />
);
