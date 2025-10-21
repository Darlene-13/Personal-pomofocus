import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; // Make sure path is correct
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// --- CORS Configuration ---
// Reads the allowed frontend URL from Vercel Environment Variables
const allowedOrigin = process.env.CLIENT_URL;
app.use(cors({
    origin: allowedOrigin, // Use the specific origin from CLIENT_URL
    credentials: true      // Allow cookies/auth headers if needed
}));

// --- Body Parsing Middleware ---
app.use(express.json()); // For JSON request bodies
app.use(express.urlencoded({ extended: false })); // For form data (optional)

// --- Request Logging Middleware (Optional but recommended) ---
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    // Capture the response body if it's JSON
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    // Log after the response is finished
    res.on("finish", () => {
        const duration = Date.now() - start;
        // Only log API and health check routes
        if (path.startsWith("/api") || path === "/health") {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            // Truncate long logs
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            console.log(logLine); // This log appears in Vercel Functions logs
        }
    });
    next();
});

// --- Register API Routes ---
// This function adds your /api/auth, /api/tasks, etc. routes to the 'app'
registerRoutes(app);

// --- Global Error Handling Middleware ---
// Must be defined AFTER all routes
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Error:', err); // Log the full error in Vercel Functions logs
    res.status(status).json({ message, error: err.toString() });
});

// --- Export the app for Vercel ---
// This is the crucial line for serverless deployment.
// Remove any server.listen() calls.
export default app;