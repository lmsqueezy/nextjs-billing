import path from "path";
import { Config } from "@remotion/cli/config";

// Remotion configuration
// Config.setVideoImageFormat("jpeg");
// Config.setOverwriteOutput(true);
// Config.setPixelFormat("yuv420p");
// Config.setCodec("h264");
// Config.setCrf(18);

// Configure webpack for module resolution and Node.js polyfills
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      alias: {
        ...currentConfiguration.resolve?.alias,
        "@": path.resolve(process.cwd(), "src"),
      },
      fallback: {
        ...currentConfiguration.resolve?.fallback,
        path: require.resolve("path-browserify"),
        fs: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
      },
    },
  };
});
