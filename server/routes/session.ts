import express from 'express';
import { db } from '../db';
import { sessions } from '../db/schema.sql';
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

// Create session
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { duration, sessionDate, sessionTime, taskId } = req.body;

        const newSession = await db.insert(sessions).values({
            userId: req.userId!,
            duration,
            sessionDate,
            sessionTime,
            taskId,
        }).returning();

        res.json(newSession[0]);
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
                date: sessions.sessionDate,
                totalMinutes: sql<number>`sum(${sessions.duration})`,
                sessionCount: sql<number>`count(*)`,
            })
            .from(sessions)
            .where(
                and(
                    eq(sessions.userId, req.userId!),
                    gte(sessions.sessionDate, sevenDaysAgo.toISOString().split('T')[0])
                )
            )
            .groupBy(sessions.sessionDate);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;