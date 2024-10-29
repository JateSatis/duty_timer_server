import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import { viteStaticCopy } from "vite-plugin-static-copy";
import compression from "vite-plugin-compression";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [
    // Vite plugin to handle Express and Node.js integration
    VitePluginNode({
      adapter: "express",
      appPath: "./src/index.ts",
      tsCompiler: "esbuild",
    }),

    // Copy static assets like .pem keys and .py files during build
    viteStaticCopy({
      targets: [
        { src: "src/keys/*.pem", dest: "keys" },
        { src: "src/python/sendEmail.py", dest: "python" },
        { src: "src/views/*.html", dest: "views" },
      ],
    }),

    // Enable compression to make build output smaller and faster to serve
    compression({
      algorithm: "brotliCompress", // Use Brotli for better compression
      threshold: 1024, // Compress files larger than 1 KB
    }),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
    }),
  ],

  // Production-specific optimizations
  build: {
    outDir: "dist", // Output directory
    minify: "esbuild", // Use esbuild for fast and optimized minification
    sourcemap: false, // Disable sourcemaps in production
    target: "node22", // Optimize for modern browsers/Node.js environments
    ssr: true,
    manifest: true,
    rollupOptions: {
      input: "./src/index.ts", // Specify your server entry point
      output: {
        entryFileNames: "[name].cjs", // Output main entry as [name].js
        format: "cjs", // Use CommonJS format for Node.js compatibility
      },
    },
  },
});
