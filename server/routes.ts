import type { Express } from 'express';

import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import sessionsRoutes from './routes/session';
import streaksRoutes from './routes/streak';
import goalsRoutes from './routes/goals';

export function registerRoutes(app: Express): void {
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

    // 404 handler - must be after all other routes
    app.use((req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
}