import express, { type Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './db';
import { users, streaks, tasks, sessions, goals } from './db/schema';
import { eq, and } from 'drizzle-orm';

dotenv.config();

// =================== FIX FOR ES MODULES ===================
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// =================== TYPES ===================
interface AuthRequest extends Request {
    userId?: number;
}

// =================== AUTH MIDDLEWARE ===================
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(403).json({ error: 'Invalid token' });
    }
}

// =================== MIDDLEWARE SETUP ===================
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:10000',
        process.env.CLIENT_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin || '')) {
        res.setHeader('Access-Control-Allow-Origin', origin!);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// =================== SERVE STATIC FILES ===================
const clientDistPath = path.join(__dirname, '../dist');
console.log(`📁 Serving static files from: ${clientDistPath}`);
app.use(express.static(clientDistPath));

// =================== HEALTH CHECK ===================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =================== AUTH ROUTES ===================
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().trim(),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
];

app.post('/api/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name } = req.body;
        const existing = await db.select().from(users).where(eq(users.email, email));

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await db
            .insert(users)
            .values({ email, password: hashedPassword, name: name || '' })
            .returning();

        await db.insert(streaks).values({
            userId: newUser.id,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
        });

        const token = generateToken(newUser.id);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser.id, email: newUser.email, name: newUser.name },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId!));

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.patch('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { name } = req.body;
        const [updated] = await db
            .update(users)
            .set({ name, updatedAt: new Date() })
            .where(eq(users.id, req.userId!))
            .returning();

        res.json({ user: updated });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// =================== TASKS ROUTES ===================
app.get('/api/tasks', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, req.userId!));
        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { text, priority } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const [newTask] = await db
            .insert(tasks)
            .values({ userId: req.userId!, text, priority: priority || 'medium' })
            .returning();

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.patch('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { text, completed, priority } = req.body;
        const [updated] = await db
            .update(tasks)
            .set({
                text,
                completed,
                priority,
                completedAt: completed ? new Date() : null,
            })
            .where(and(eq(tasks.id, parseInt(req.params.id)), eq(tasks.userId, req.userId!)))
            .returning();

        if (!updated) return res.status(404).json({ error: 'Task not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await db
            .delete(tasks)
            .where(and(eq(tasks.id, parseInt(req.params.id)), eq(tasks.userId, req.userId!)));
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// =================== SESSIONS ROUTES ===================
app.get('/api/sessions', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.userId, req.userId!));
        res.json(userSessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

app.post('/api/sessions', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { type, duration, date, time, taskId } = req.body;
        if (!type || !duration || !date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [newSession] = await db
            .insert(sessions)
            .values({ userId: req.userId!, type, duration, date, time, taskId })
            .returning();

        res.status(201).json(newSession);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// =================== GOALS ROUTES ===================
app.get('/api/goals', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userGoals = await db
            .select()
            .from(goals)
            .where(eq(goals.userId, req.userId!));
        res.json(userGoals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

app.post('/api/goals', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { type, target, metric, period } = req.body;
        if (!type || !target || !metric || !period) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [newGoal] = await db
            .insert(goals)
            .values({ userId: req.userId!, type, target, metric, period })
            .returning();

        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

app.patch('/api/goals/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { achieved } = req.body;
        const [updated] = await db
            .update(goals)
            .set({ achieved })
            .where(and(eq(goals.id, parseInt(req.params.id)), eq(goals.userId, req.userId!)))
            .returning();

        if (!updated) return res.status(404).json({ error: 'Goal not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// =================== STREAKS ROUTES ===================
app.get('/api/streaks', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [userStreak] = await db
            .select()
            .from(streaks)
            .where(eq(streaks.userId, req.userId!));

        if (!userStreak) return res.status(404).json({ error: 'Streak not found' });
        res.json(userStreak);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch streak' });
    }
});

app.patch('/api/streaks', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { currentStreak, longestStreak, lastActiveDate } = req.body;
        const [updated] = await db
            .update(streaks)
            .set({ currentStreak, longestStreak, lastActiveDate, updatedAt: new Date() })
            .where(eq(streaks.userId, req.userId!))
            .returning();

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

// =================== SPA FALLBACK ===================
// This must be AFTER all API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// =================== ERROR HANDLING ===================
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

// =================== START SERVER ===================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

export default app;