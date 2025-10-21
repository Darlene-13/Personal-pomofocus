import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";

dotenv.config();

const app = express();

// ✅ Use official CORS middleware
const allowedOrigins = [
    "https://personal-pomofocus.vercel.app",
    "https://personal-pomofocus-nt1xi07hs-darlene-wendys-projects.vercel.app",
    "http://localhost:5173"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

registerRoutes(app);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

export default app;
