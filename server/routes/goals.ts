import express from 'express';
import { db } from '../db';
import { goals, sessions } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and, sql } from 'drizzle-orm';

const router = express.Router();

// Get all goals for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userGoals = await db
            .select()
            .from(goals)
            .where(eq(goals.userId, req.userId!))
            .orderBy(goals.createdAt);

        res.json(userGoals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Get goal by type and period (e.g., daily goal for today)
router.get('/:type/:period', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { type, period } = req.params;

        const goal = await db
            .select()
            .from(goals)
            .where(
                and(
                    eq(goals.userId, req.userId!),
                    eq(goals.type, type),
                    eq(goals.period, period)
                )
            );

        if (!goal.length) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json(goal[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goal' });
    }
});

// Create goal
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { type, target, metric, period } = req.body;

        // Validate input
        if (!['daily', 'weekly', 'monthly'].includes(type)) {
            return res.status(400).json({ error: 'Invalid goal type' });
        }
        if (!['hours', 'sessions'].includes(metric)) {
            return res.status(400).json({ error: 'Invalid metric' });
        }
        if (!target || target <= 0) {
            return res.status(400).json({ error: 'Target must be greater than 0' });
        }

        const newGoal = await db
            .insert(goals)
            .values({
                userId: req.userId!,
                type,
                target,
                metric,
                period,
                achieved: false,
            })
            .returning();

        res.status(201).json(newGoal[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// Update goal
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { target, achieved } = req.body;

        const updatedGoal = await db
            .update(goals)
            .set({
                target: target !== undefined ? target : undefined,
                achieved: achieved !== undefined ? achieved : undefined,
            })
            .where(and(eq(goals.id, parseInt(id)), eq(goals.userId, req.userId!)))
            .returning();

        if (!updatedGoal.length) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json(updatedGoal[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const deleted = await db
            .delete(goals)
            .where(and(eq(goals.id, parseInt(id)), eq(goals.userId, req.userId!)))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// Check goal progress
router.get('/:id/progress', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const goal = await db
            .select()
            .from(goals)
            .where(and(eq(goals.id, parseInt(id)), eq(goals.userId, req.userId!)));

        if (!goal.length) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        const goalData = goal[0];
        const metric = goalData.metric; // 'hours' or 'sessions'

        // Calculate progress based on metric and period
        let progress = 0;

        if (metric === 'hours') {
            const result = await db
                .select({
                    totalMinutes: sql<number>`sum(${sessions.duration})`,
                })
                .from(sessions)
                .where(
                    and(
                        eq(sessions.userId, req.userId!),
                        eq(sessions.date, goalData.period)
                    )
                );

            progress = result[0]?.totalMinutes ? Math.floor(result[0].totalMinutes / 60) : 0;
        } else if (metric === 'sessions') {
            const result = await db
                .select({
                    sessionCount: sql<number>`count(*)`,
                })
                .from(sessions)
                .where(
                    and(
                        eq(sessions.userId, req.userId!),
                        eq(sessions.date, goalData.period)
                    )
                );

            progress = result[0]?.sessionCount || 0;
        }

        const achieved = progress >= goalData.target;

        res.json({
            goalId: goalData.id,
            target: goalData.target,
            progress,
            achieved,
            remaining: Math.max(0, goalData.target - progress),
            percentComplete: Math.min(100, Math.round((progress / goalData.target) * 100)),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goal progress' });
    }
});

export default router;