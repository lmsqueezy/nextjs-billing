import { Image, Film, Mic } from "lucide-react";

type EditMode = "image" | "video" | "script";

interface TabNavigationProps {
  activeTab: EditMode;
  onTabChange: (tab: EditMode) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => onTabChange("image")}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          activeTab === "image"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Image className="h-4 w-4" />
        Image
      </button>
      <button
        onClick={() => onTabChange("video")}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          activeTab === "video"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Film className="h-4 w-4" />
        Video
      </button>
      <button
        onClick={() => onTabChange("script")}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          activeTab === "script"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Mic className="h-4 w-4" />
        Script & Voice
      </button>
    </div>
  );
}
