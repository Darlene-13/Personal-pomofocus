import express from 'express';
import { db } from '../db';
import { streaks } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = express.Router();

// GET /streak - Get user streak
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        let userStreak = await db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, userId));

        if (userStreak.length === 0) {
            // Create initial streak
            const [newStreak] = await db
                .insert(streaks)
                .values({
                    userId,
                    current_streak: 0,
                    longest_streak: 0,
                })
                .returning();

            userStreak = [newStreak];
        }

        res.json(userStreak[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch streak' });
    }
});

// POST /streak/update - Update streak after a session
router.post('/update', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const userStreakArr = await db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, userId));

        if (userStreakArr.length === 0) {
            return res.status(404).json({ error: 'User streak not found' });
        }

        const userStreak = userStreakArr[0];
        const lastActive = userStreak.last_active_date; // match schema
        let newStreak = userStreak.current_streak;

        if (lastActive === yesterday) {
            newStreak += 1;
        } else if (lastActive !== today) {
            newStreak = 1;
        }

        const longestStreak = Math.max(newStreak, userStreak.longest_streak);

        const [updated] = await db
            .update(streaks)
            .set({
                current_streak: newStreak,
                longest_streak: longestStreak,
                last_active_date: today,
                updated_at: new Date(),
            })
            .where(eq(streaks.userId, userId))
            .returning();

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

export default router;
