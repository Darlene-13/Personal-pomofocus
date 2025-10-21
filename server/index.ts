import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api") || path === "/health") {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            console.log(logLine);
        }
    });

    next();
});

(async () => {
    // Register API routes (this includes /health endpoint)
    const server = await registerRoutes(app);

    // Global error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        console.error('Error:', err);
        res.status(status).json({ message, error: err.toString() });
    });

    // Start server
    const PORT = parseInt(process.env.PORT || '5000', 10);

    server.listen(PORT, '0.0.0.0', () => {
        console.log('\n🚀 ================================');
        console.log(`🟢 Server running on port ${PORT}`);
        console.log(`📍 API: http://localhost:${PORT}/api`);
        console.log(`🏥 Health: http://localhost:${PORT}/health`);
        console.log(`🌍 Environment: ${app.get('env') || 'development'}`);
        console.log(`🔗 CORS: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
        console.log('🚀 ================================\n');
    });
})();

export default app;