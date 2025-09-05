"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { imageStyles, getDefaultImageStyle } from "@/lib/image-config";
import { imageModels, getDefaultImageModel } from "@/lib/image-models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Play,
  Eye,
  GamepadIcon,
  Target,
  Crown,
  User,
  Image as ImageIcon,
  Pause,
} from "lucide-react";
import { ScriptSection } from "@/components/create-video/script-section";
import { VoiceSelection } from "@/components/create-video/voice-selection";

const CreateVideoPage = () => {
  const [selectedVideoType, setSelectedVideoType] = useState("Faceless Video");
  const [script, setScript] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState("AI Images");
  const [selectedStyleId, setSelectedStyleId] = useState(
    getDefaultImageStyle().id,
  );
  const [selectedImageModel, setSelectedImageModel] = useState(
    getDefaultImageModel().id,
  );
  const [selectedVoice, setSelectedVoice] = useState("echo");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const videoTypes = [
    { id: "faceless", label: "Faceless Video", icon: Eye, active: true },
    // { id: "ugc", label: "UGC Video", icon: User },
    // { id: "gameplay", label: "Gameplay Video", icon: GamepadIcon },
    // { id: "ugc-ads", label: "UGC Ads", icon: Target },
    // { id: "italian", label: "Italian Brainrot", icon: Crown },
    // { id: "pov", label: "POV Video", icon: User },
  ];

  const generationPresets = imageStyles.map((style) => ({
    id: style.id,
    label: style.name,
    image: "",
    active: selectedStyleId === style.id,
  }));

  const handleGenerateVideo = async () => {
    if (!script.trim()) {
      alert("Please enter a script first");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep("Initializing video generation...");

    try {
      // Call the new create-video API
      const response = await fetch("/api/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          videoType: selectedVideoType,
          mediaType: selectedMediaType,
          styleId: selectedStyleId,
          imageModel: selectedImageModel,
          voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start video generation");
      }

      const { projectId, status, message } = await response.json();
      console.log("Video generation started:", { projectId, status, message });

      setCurrentStep("Video generation started. Processing in background...");
      setProgress(10);

      // Start polling for completion
      pollProjectStatus(projectId);
    } catch (error) {
      console.error("Error generating video:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      );
      setIsGenerating(false);
    }
  };

  // Polling function to check project status
  const pollProjectStatus = async (projectId: string) => {
    const maxAttempts = 120; // 10 minutes max (120 * 5 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        console.log(
          `Polling attempt ${attempts}/${maxAttempts} for project ${projectId}`,
        );

        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to check project status");
        }

        const { data: project } = await response.json();
        console.log("Project status:", project.status);

        // Update progress based on status
        if (project.status === "generating") {
          const progressPercent = Math.min(
            20 + (attempts * 60) / maxAttempts,
            90,
          );
          setProgress(progressPercent);
          setCurrentStep(
            `Generating video... (${Math.round(progressPercent)}%)`,
          );

          // Continue polling only if still generating
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 3000); // Poll every 3 seconds
          } else {
            throw new Error("Video generation timeout");
          }
        } else if (project.status === "completed") {
          setCurrentStep("Video generation completed!");
          setProgress(100);

          // Stop polling and redirect to video editor
          setTimeout(() => {
            router.push(`/video/${projectId}`);
          }, 2000);

          setIsGenerating(false);
          return; // Stop polling
        } else if (project.status === "failed") {
          setIsGenerating(false);
          throw new Error("Video generation failed on the server");
        } else {
          // Unknown status, keep polling but warn
          console.warn("Unknown project status:", project.status);
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 3000);
          } else {
            throw new Error("Video generation timeout");
          }
        }
      } catch (error) {
        console.error("Error checking project status:", error);

        if (attempts >= maxAttempts) {
          alert(
            "Video generation timeout. Please check your project status manually.",
          );
          setIsGenerating(false);
          return;
        }

        // Retry on error
        setTimeout(checkStatus, 5000); // Wait longer on error
      }
    };

    // Start the first check after a short delay
    setTimeout(checkStatus, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with breadcrumb and upgrade notice */}
      <div className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Create</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm">
              <Crown className="h-4 w-4 text-purple-600" />
              <span className="text-purple-900">You're on Free Plan</span>
              <span className="text-purple-700">
                Upgrade to export videos and more.
              </span>
              <Button
                size="sm"
                className="ml-2 bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main content */}
        <div className="max-w-2xl flex-1 p-6">
          <div className="space-y-8">
            {/* Title */}
            <div>
              <h1 className="mb-2 text-2xl font-semibold">
                Create a new video
              </h1>
              <p className="text-muted-foreground">
                Select a tool and pick your options to create your video
              </p>
            </div>

            {/* Video type selection */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {videoTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={type.active ? "default" : "outline"}
                      onClick={() => setSelectedVideoType(type.label)}
                      className={`flex items-center gap-2 ${
                        type.active
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Script section extracted */}
            <ScriptSection
              script={script}
              onChange={setScript}
              onGenerateClick={() => {
                // TODO: hook up AI script writer action
              }}
            />

            {/* Choose media type */}
            {/* <div className="space-y-3">
              <label className="text-sm font-medium">Choose media type</label>
              <div className="text-sm text-muted-foreground">
                Select what type of media will be used to illustrate your video
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      {selectedMediaType}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem
                    onClick={() => setSelectedMediaType("AI Images")}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    AI Images
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedMediaType("Stock Videos")}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Stock Videos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedMediaType("Stock Images")}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Stock Images
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}

            {/* Choose generation preset */}
            <div className="space-y-4">
              <label className="text-sm font-medium">
                Choose a generation preset
              </label>
              <div className="grid grid-cols-4 gap-3">
                {generationPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedStyleId(preset.id)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      preset.active
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="h-full w-full bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white">
                      {preset.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Image Model */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Choose image model</label>
              <div className="text-sm text-muted-foreground">
                Select the AI model that will generate your images
              </div>
              <div className="space-y-3">
                {imageModels.map((model) => (
                  <label
                    key={model.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all hover:bg-gray-50 ${
                      selectedImageModel === model.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="imageModel"
                      value={model.id}
                      checked={selectedImageModel === model.id}
                      onChange={(e) => setSelectedImageModel(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {model.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {model.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <VoiceSelection
              selectedVoice={selectedVoice}
              onVoiceSelect={setSelectedVoice}
            />

            {/* Generate button */}
            <div className="space-y-4">
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateVideo}
                className="w-full bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                size="lg"
                disabled={isGenerating || !script.trim()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Video"}
                <span className="ml-auto text-sm opacity-80">
                  Estimated cost: 100 credits
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar - Output Example */}
        <div className="w-80 border-l bg-gray-50/50 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Output</h3>
              <h3 className="font-medium">Example</h3>
            </div>

            <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-black">
              <video
                src="/demo/never-go-to-space-alone.mp4"
                // autoPlay
                // muted
                loop
                controls
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Background image simulation */}
              {/* <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #d4a574 0%, #8b4513 50%, #654321 100%)",
                }}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoPage;
