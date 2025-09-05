import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceSelector, ScriptInput } from "../../forms";
import { voiceOptions } from "@/lib/voice-options";
import type { ProjectSegment } from "@/types/project";

interface ScriptEditTabProps {
  segment: ProjectSegment;
  script: string;
  voice: string;
  onScriptChange: (script: string) => void;
  onVoiceChange: (voice: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${secs.padStart(4, "0")}s`;
}

export function ScriptEditTab({
  segment,
  script,
  voice,
  onScriptChange,
  onVoiceChange,
  onRegenerate,
  isRegenerating,
}: ScriptEditTabProps) {
  const hasChanges = script !== segment.text;

  return (
    <div className="space-y-4">
      {/* Current Audio Info */}
      {segment.audioUrl && (
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-2 text-sm font-medium text-gray-700">
            Current Audio
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>
              <span className="font-medium">Duration:</span>{" "}
              {formatTime(segment.duration)}
            </div>
            <div>
              <span className="font-medium">Text:</span> "{segment.text}"
            </div>
          </div>
        </div>
      )}

      <ScriptInput
        value={script}
        onChange={onScriptChange}
        label="Script Text"
        placeholder="Enter script text..."
        rows={4}
      />

      {hasChanges && (
        <div className="text-xs text-blue-600">
          ⚡ Script modified - click "Regenerate Audio" to apply changes
        </div>
      )}

      <VoiceSelector
        selectedVoice={voice}
        onVoiceChange={onVoiceChange}
        voices={voiceOptions}
      />

      <div className="flex justify-end pt-4">
        <Button onClick={onRegenerate} disabled={isRegenerating}>
          {isRegenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Regenerate Audio"
          )}
        </Button>
      </div>
    </div>
  );
}
