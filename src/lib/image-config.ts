export interface ImageStyle {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  aspectRatio?: string;
}

export const imageStyles: ImageStyle[] = [
  {
    id: "dark-eerie-photorealistic",
    name: "Dark & Eerie Photorealistic",
    description:
      "Photorealistic POV images with dark, eerie atmosphere with direct flashlight",
    model: "fal-ai/flux/schnell", // Cheapest Flux model - Schnell is fastest/cheapest
    systemPrompt:
      "A photorealistic POV image where the camera is looking into zone,  camera direct flash light. The scene should be dark and atmospheric with dramatic shadows created by the harsh camera flash. The lighting creates stark contrasts between illuminated and dark areas, giving an eerie, unsettling mood. The image should not be overly dark; maintain enough illumination so that all aspects of the scene remain clearly visible.",
    aspectRatio: "9:16", // Vertical aspect ratio for short videos
  },
  {
    id: "cinematic-dark",
    name: "Cinematic Dark",
    description: "Cinematic style dark imagery with professional lighting",
    model: "fal-ai/flux/schnell",
    systemPrompt:
      "A cinematic, photorealistic image with dramatic dark lighting, professional cinematography style. The scene should have a dark, moody atmosphere with careful attention to lighting and shadows.",
    aspectRatio: "9:16",
  },
  {
    id: "4k-realistc",
    name: "4K realistic",
    description: "4K realistic image with professional lighting",
    model: "fal-ai/flux/schnell",
    systemPrompt:
      "A 4K realistic image with professional lighting, professional cinematography style. The scene should have a realistic, professional atmosphere with careful attention to lighting and shadows.",
    aspectRatio: "9:16",
  },
  {
    id: "gpt-image-1",
    name: "GPT Image 1 ",
    description: "High-quality images generated using OpenAI's gpt image model",
    model: "gpt-image-1",
    systemPrompt:
      "A high-quality, detailed image with professional composition and lighting. The image should be visually striking, well-composed, and suitable for professional video content. Focus on clarity, detail, and visual appeal.",
    aspectRatio: "9:16",
  },
];

export const getImageStyle = (id: string): ImageStyle | undefined => {
  return imageStyles.find((style) => style.id === id);
};

export const getDefaultImageStyle = (): ImageStyle => {
  return imageStyles[0]; // Default to dark-eerie-photorealistic
};
