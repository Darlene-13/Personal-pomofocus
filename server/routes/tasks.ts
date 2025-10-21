import express from 'express';
import { db } from '../db';
import { tasks } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, req.userId!))
            .orderBy(tasks.createdAt);

        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Create task
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { text, priority } = req.body;

        const newTask = await db.insert(tasks).values({
            userId: req.userId!,
            text,
            priority: priority || 'medium',
        }).returning();

        res.json(newTask[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update task
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { completed, text, priority } = req.body;

        const updatedTask = await db
            .update(tasks)
            .set({
                completed,
                text,
                priority,
                completedAt: completed ? new Date() : null,
            })
            .where(and(eq(tasks.id, parseInt(id)), eq(tasks.userId, req.userId!)))
            .returning();

        res.json(updatedTask[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        await db
            .delete(tasks)
            .where(and(eq(tasks.id, parseInt(id)), eq(tasks.userId, req.userId!)));

        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;