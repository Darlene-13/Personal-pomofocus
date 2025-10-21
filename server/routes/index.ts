import type { Express } from 'express';

import authRoutes from './auth.ts';
import tasksRoutes from './tasks.ts';
import sessionsRoutes from './session.ts';
import streaksRoutes from './streak.ts';
import goalsRoutes from './goals.ts';

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