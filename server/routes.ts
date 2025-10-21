import type { Express } from 'express';
import { createServer, type Server } from 'http';

import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import sessionsRoutes from './routes/session';
import streaksRoutes from './routes/streak';
import goalsRoutes from './routes/goals';

export async function registerRoutes(app: Express): Promise<Server> {
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Auth routes
    app.use('/api/auth', authRoutes);

    // Tasks routes
    app.use('/api/tasks', tasksRoutes);

    // Sessions routes
    app.use('/api/sessions', sessionsRoutes);

    // Streaks routes
    app.use('/api/streaks', streaksRoutes);

    // Goals routes
    app.use('/api/goals', goalsRoutes);

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
        console.error('Error:', err);
        res.status(err.status || 500).json({
            error: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    });

    const httpServer = createServer(app);

    return httpServer;
}