/**
 * Test script to verify ElevenLabs rate limiting (max 3 concurrent requests)
 * This script simulates multiple audio generation requests to test the ConcurrencyLimiter
 */

import { VideoGenerationService, VideoSegmentData } from "@/lib/video-generation-service";
import { SpeechService } from "@/lib/speech-service";

// Mock segment data for testing
const testSegments: VideoSegmentData[] = [
  { text: "This is test segment 1", imagePrompt: "Test image 1", order: 0 },
  { text: "This is test segment 2", imagePrompt: "Test image 2", order: 1 },
  { text: "This is test segment 3", imagePrompt: "Test image 3", order: 2 },
  { text: "This is test segment 4", imagePrompt: "Test image 4", order: 3 },
  { text: "This is test segment 5", imagePrompt: "Test image 5", order: 4 },
  { text: "This is test segment 6", imagePrompt: "Test image 6", order: 5 },
];

// Mock created segments for testing
const mockCreatedSegments = testSegments.map((_, index) => ({
  id: `test-segment-${index}`,
}));

async function testRateLimiting() {
  console.log("=== Testing ElevenLabs Rate Limiting ===");
  console.log(`Testing with ${testSegments.length} segments`);
  
  // Test ElevenLabs voice (Rachel)
  const elevenLabsVoice = "21m00Tcm4TlvDq8ikWAM";
  
  // Test OpenAI voice (Echo)
  const openAiVoice = "echo";
  
  console.log("\n1. Testing voice detection:");
  console.log(`ElevenLabs voice "${elevenLabsVoice}" detected as: ${SpeechService.isElevenLabsVoice(elevenLabsVoice) ? "ElevenLabs" : "OpenAI"}`);
  console.log(`OpenAI voice "${openAiVoice}" detected as: ${SpeechService.isElevenLabsVoice(openAiVoice) ? "ElevenLabs" : "OpenAI"}`);
  
  console.log("\n2. Testing concurrent execution monitoring:");
  
  // Track concurrent requests
  let currentConcurrency = 0;
  let maxConcurrency = 0;
  const concurrencyLog: { time: number; count: number; action: string; segment: number }[] = [];
  
  // Mock the generateAudio method to track concurrency
  const originalGenerateAudio = VideoGenerationService['generateAudio'];
  
  // Override generateAudio to track concurrency without actually making API calls
  (VideoGenerationService as any).generateAudio = async function(
    text: string,
    voice: string,
    userId: string,
    projectId: string,
    segmentId: string,
    index: number
  ) {
    const startTime = Date.now();
    currentConcurrency++;
    maxConcurrency = Math.max(maxConcurrency, currentConcurrency);
    
    concurrencyLog.push({
      time: startTime,
      count: currentConcurrency,
      action: "start",
      segment: index
    });
    
    console.log(`[${new Date().toISOString()}] Segment ${index}: Started (Concurrent: ${currentConcurrency})`);
    
    // Simulate processing time (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    currentConcurrency--;
    const endTime = Date.now();
    
    concurrencyLog.push({
      time: endTime,
      count: currentConcurrency,
      action: "end",
      segment: index
    });
    
    console.log(`[${new Date().toISOString()}] Segment ${index}: Completed (Concurrent: ${currentConcurrency})`);
    
    // Return mock result
    return {
      audioUrl: `https://mock-audio-${index}.mp3`,
      key: `mock-key-${index}`,
      duration: processingTime / 1000,
      wordTimings: [],
    };
  };
  
  try {
    console.log(`\n3. Testing with ElevenLabs voice (should limit to 3 concurrent):`);
    const startTime = Date.now();
    
    maxConcurrency = 0;
    currentConcurrency = 0;
    concurrencyLog.length = 0;
    
    const result = await VideoGenerationService['generateMediaInParallel'](
      testSegments,
      mockCreatedSegments,
      undefined, // styleId
      elevenLabsVoice,
      "test-user",
      "test-project",
      "flux-schnell" // imageModel
    );
    
    const totalTime = Date.now() - startTime;
    
    console.log(`\n=== RESULTS ===`);
    console.log(`Total execution time: ${totalTime}ms`);
    console.log(`Maximum concurrent requests: ${maxConcurrency}`);
    console.log(`Expected maximum for ElevenLabs: 3`);
    console.log(`✅ Test ${maxConcurrency <= 3 ? "PASSED" : "FAILED"}: Concurrency limit respected`);
    
    // Test with OpenAI voice
    console.log(`\n4. Testing with OpenAI voice (should allow unlimited concurrent):`);
    
    maxConcurrency = 0;
    currentConcurrency = 0;
    concurrencyLog.length = 0;
    
    const startTime2 = Date.now();
    
    const result2 = await VideoGenerationService['generateMediaInParallel'](
      testSegments,
      mockCreatedSegments,
      undefined, // styleId
      openAiVoice,
      "test-user",
      "test-project-2",
      "flux-schnell" // imageModel
    );
    
    const totalTime2 = Date.now() - startTime2;
    
    console.log(`\nTotal execution time: ${totalTime2}ms`);
    console.log(`Maximum concurrent requests: ${maxConcurrency}`);
    console.log(`Expected maximum for OpenAI: ${testSegments.length} (unlimited)`);
    console.log(`✅ Test ${maxConcurrency === testSegments.length ? "PASSED" : "FAILED"}: OpenAI requests run concurrently`);
    
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    // Restore original method
    (VideoGenerationService as any).generateAudio = originalGenerateAudio;
  }
}

// Run the test
if (require.main === module) {
  testRateLimiting()
    .then(() => {
      console.log("\n=== Test completed ===");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

export { testRateLimiting };