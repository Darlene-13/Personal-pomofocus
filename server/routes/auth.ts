import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').optional().trim().isLength({ min: 1, max: 255 })
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
];

// Register new user
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

        // Create user
        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
            name: name || null,
        }).returning();

        // Generate token
        const token = generateToken(newUser[0].id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
                name: newUser[0].name,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', message: 'Internal server error' });
    }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await db.select().from(users).where(eq(users.email, email));
        if (user.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user[0].id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', message: 'Internal server error' });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const user = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            createdAt: users.createdAt,
        }).from(users).where(eq(users.id, req.userId!));

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: user[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Logout (client-side should remove token)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default router;