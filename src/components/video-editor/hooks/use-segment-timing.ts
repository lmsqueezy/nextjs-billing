import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ProjectWithDetails } from "@/types/project";

export const useSegmentTiming = (project: ProjectWithDetails) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const getCurrentSegmentAndTime = () => {
    let cumulativeFrames = 0;

    for (const segment of project.segments) {
      const segmentFrames = Math.round((segment.duration || 5) * fps);
      const segmentEndFrame = cumulativeFrames + segmentFrames;

      if (frame >= cumulativeFrames && frame < segmentEndFrame) {
        const relativeFrame = frame - cumulativeFrames;
        const relativeTime = relativeFrame / fps;
        return { segment, relativeTime, cumulativeFrames, segmentFrames };
      }

      cumulativeFrames = segmentEndFrame;
    }

    // If frame is past all segments, return the last segment
    const lastSegment = project.segments[project.segments.length - 1];
    const lastSegmentFrames = Math.round((lastSegment?.duration || 5) * fps);
    return {
      segment: lastSegment,
      relativeTime: lastSegment?.duration || 5,
      cumulativeFrames: cumulativeFrames - lastSegmentFrames,
      segmentFrames: lastSegmentFrames,
    };
  };

  const getSegmentsToRender = () => {
    const currentSegmentIndex = (() => {
      let cumulativeFrames = 0;
      for (let i = 0; i < project?.segments.length; i++) {
        const segmentFrames = Math.round((project.segments[i].duration || 5) * fps);
        const segmentEndFrame = cumulativeFrames + segmentFrames;
        if (frame >= cumulativeFrames && frame < segmentEndFrame) {
          return i;
        }
        cumulativeFrames = segmentEndFrame;
      }
      return project?.segments.length - 1;
    })();

    // Render current segment and ±1 adjacent segments
    const windowSize = 1;
    const startIndex = Math.max(0, currentSegmentIndex - windowSize);
    const endIndex = Math.min(
      project?.segments.length - 1,
      currentSegmentIndex + windowSize,
    );

    return project?.segments
      .slice(startIndex, endIndex + 1)
      .map((segment, relativeIndex) => ({
        segment,
        originalIndex: startIndex + relativeIndex,
      }));
  };

  return {
    frame,
    fps,
    getCurrentSegmentAndTime,
    getSegmentsToRender,
  };
};
