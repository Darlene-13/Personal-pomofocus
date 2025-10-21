import express from 'express';
import { db } from '../db';
import { streaks } from '../db/schema';
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
            const [newStreak] = await db.insert(streaks).values({
                userId: req.userId!,
                currentStreak: 0,
                longestStreak: 0,
            }).returning();

            userStreak = [newStreak];
        }

        res.json(userStreak[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch streak' });
    }
});

// Update streak (call this after each session)
router.post('/update', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const userStreakArr = await db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, req.userId!));

        if (userStreakArr.length === 0) return res.status(404).json({ error: 'User streak not found' });

        const userStreak = userStreakArr[0];
        const lastActiveDate = userStreak.lastActiveDate;
        let newStreak = userStreak.currentStreak;

        if (lastActiveDate === yesterday) {
            newStreak += 1;
        } else if (lastActiveDate !== today) {
            newStreak = 1;
        }

        const longestStreak = Math.max(newStreak, userStreak.longestStreak);

        const [updated] = await db
            .update(streaks)
            .set({
                currentStreak: newStreak,
                longestStreak,
                lastActiveDate: today,
                updated_at: new Date(), // match DB column name
            })
            .where(eq(streaks.userId, req.userId!))
            .returning();

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

export default router;
