import express from 'express';
import { db } from '../db';
import { sessions } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and, gte, sql } from 'drizzle-orm';

const router = express.Router();

// Get all sessions for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.userId, req.userId!))
            .orderBy(sessions.createdAt);

        res.json(userSessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get sessions by date
router.get('/:date', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { date } = req.params;

        const dateSessions = await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(sessions.userId, req.userId!),
                    eq(sessions.date, date)
                )
            )
            .orderBy(sessions.createdAt);

        res.json(dateSessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Create session
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { type, duration, date, time, taskId } = req.body;

        // Validate input
        if (!['work', 'break'].includes(type)) {
            return res.status(400).json({ error: 'Type must be "work" or "break"' });
        }
        if (!duration || duration <= 0) {
            return res.status(400).json({ error: 'Duration must be greater than 0' });
        }
        if (!date) {
            return res.status(400).json({ error: 'Date is required (YYYY-MM-DD format)' });
        }

        const newSession = await db
            .insert(sessions)
            .values({
                userId: req.userId!,
                type,
                duration,
                date,
                time: time || null,
                taskId: taskId || null,
            })
            .returning();

        res.status(201).json(newSession[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Get stats (last 7 days)
router.get('/stats/weekly', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stats = await db
            .select({
                date: sessions.date,
                type: sessions.type,
                totalMinutes: sql<number>`sum(${sessions.duration})`,
                sessionCount: sql<number>`count(*)`,
            })
            .from(sessions)
            .where(
                and(
                    eq(sessions.userId, req.userId!),
                    gte(sessions.date, sevenDaysAgo.toISOString().split('T')[0])
                )
            )
            .groupBy(sessions.date, sessions.type);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get stats by type (work vs break)
router.get('/stats/by-type', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const stats = await db
            .select({
                type: sessions.type,
                totalMinutes: sql<number>`sum(${sessions.duration})`,
                sessionCount: sql<number>`count(*)`,
            })
            .from(sessions)
            .where(eq(sessions.userId, req.userId!))
            .groupBy(sessions.type);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;