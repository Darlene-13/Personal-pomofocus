import { VercelRequest, VercelResponse } from "@vercel/node";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// --- Set up CORS headers helper ---
const setCorsHeaders = (req: Request, res: Response) => {
    const origin = req.headers.origin;

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${origin || 'no-origin'}`);

    const isAllowed = origin && (
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin === process.env.CLIENT_URL
    );

    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.setHeader('Access-Control-Max-Age', '86400');
        console.log(`✅ CORS headers set for: ${origin}`);
        return true;
    } else {
        console.log(`❌ Origin not allowed: ${origin}`);
        return false;
    }
};

// --- CORS Middleware ---
app.use((req, res, next) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') return res.status(204).end();

    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(data) {
        setCorsHeaders(req, res);
        return originalSend.call(this, data);
    };

    res.json = function(data) {
        setCorsHeaders(req, res);
        return originalJson.call(this, data);
    };

    next();
});

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api") || path === "/health") {
            console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
        }
    });

    next();
});

registerRoutes(app);

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    setCorsHeaders(req, res);

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('❗ Error:', { status, message, path: req.path, method: req.method });

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.toString() })
    });
});

// --- Wrap Express app for Vercel ---
// This is the critical fix - handle the request properly
export default async (req: VercelRequest, res: VercelResponse) => {
    // Handle the request through Express
    return new Promise<void>((resolve) => {
        app(req, res as any, () => {
            resolve();
        });

        res.on('finish', () => {
            resolve();
        });
    });
};