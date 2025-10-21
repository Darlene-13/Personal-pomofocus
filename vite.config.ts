import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES module environments
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(), // React + Fast Refresh support
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "client", "src"),       // Frontend source alias
            "@shared": path.resolve(__dirname, "shared"),        // Shared logic alias
            "@assets": path.resolve(__dirname, "attached_assets") // Static assets alias
        },
    },
    root: path.resolve(__dirname, "client"), // Frontend root directory
    build: {
        outDir: path.resolve(__dirname, "dist/public"), // Build output
        emptyOutDir: true, // Clean build directory before rebuilding
    },
    server: {
        https: false, // Disable HTTPS for local development
        open: true,  // Auto-open browser on dev start
        port: 5173,  // Custom dev server port
        host: true,  // Allow external connections
        proxy: {
            // Redirect API calls to backend Express server
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
                secure: false,
            },
        },
        fs: {
            strict: true,
            deny: ["**/.*"], // Disallow access to hidden files
        },
    },
});