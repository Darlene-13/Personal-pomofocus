import express from 'express';
import { db } from '../db';
import { streaks, sessions } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get user streak
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        let userStreak = await db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, req.userId!));

        if (userStreak.length === 0) {
            // Create initial streak
            userStreak = await db.insert(streaks).values({
                userId: req.userId!,
                currentStreak: 0,
                longestStreak: 0,
            }).returning();
        }

        res.json(userStreak[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch streak' });
    }
});

// Update streak (call this after each session)
router.post('/update', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const userStreak = await db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, req.userId!));

        if (userStreak.length === 0) return;

        const lastActiveDate = userStreak[0].lastActiveDate;
        let newStreak = userStreak[0].currentStreak;

        if (lastActiveDate === yesterday) {
            newStreak += 1;
        } else if (lastActiveDate !== today) {
            newStreak = 1;
        }

        const longestStreak = Math.max(newStreak, userStreak[0].longestStreak);

        const updated = await db
            .update(streaks)
            .set({
                currentStreak: newStreak,
                longestStreak,
                lastActiveDate: today,
                updatedAt: new Date(),
            })
            .where(eq(streaks.userId, req.userId!))
            .returning();

        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

export default router;