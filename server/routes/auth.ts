import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, streaks } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// =================== Validation ===================
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists().withMessage('Password is required'),
];

// =================== Register ===================
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [newUser] = await db
            .insert(users)
            .values({
                email,
                password: hashedPassword,
                name: name || '',
            })
            .returning();

        // Create initial streak for user
        await db
            .insert(streaks)
            .values({
                userId: newUser.id,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
            })
            .catch(() => {
                // Streak might already exist, ignore
            });

        // Generate token
        const token = generateToken(newUser.id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', message: 'Internal server error' });
    }
});

// =================== Login ===================
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', message: 'Internal server error' });
    }
});

// =================== Get current user ===================
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, req.userId));

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// =================== Update user ===================
router.patch('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { name } = req.body;

        if (name && (typeof name !== 'string' || name.length > 255)) {
            return res.status(400).json({ error: 'Invalid name' });
        }

        const [updatedUser] = await db
            .update(users)
            .set({
                name: name || undefined,
                updatedAt: new Date(),
            })
            .where(eq(users.id, req.userId))
            .returning();

        res.json({
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            },
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// =================== Logout ===================
router.post('/logout', authenticateToken, (_req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;