import {
    type User,
    type NewUser,
    type Task,
    type NewTask,
    type Session,
    type NewSession,
    type Goal,
    type NewGoal,
    type Streak,
    type NewStreak
} from "./db/schema";

export interface IStorage {
    // User operations
    getUser(id: number): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    createUser(user: NewUser): Promise<User>;
    updateUser(id: number, updates: Partial<NewUser>): Promise<User | undefined>;

    // Task operations
    getTasks(userId?: number): Promise<Task[]>;
    getTask(id: number): Promise<Task | undefined>;
    createTask(task: NewTask): Promise<Task>;
    updateTask(id: number, updates: Partial<NewTask>): Promise<Task | undefined>;
    deleteTask(id: number): Promise<boolean>;

    // Session operations
    getSessions(userId?: number): Promise<Session[]>;
    getSession(id: number): Promise<Session | undefined>;
    createSession(session: NewSession): Promise<Session>;
    getSessionsByDateRange(userId: number, startDate: string, endDate: string): Promise<Session[]>;

    // Goal operations
    getGoals(userId: number): Promise<Goal[]>;
    getGoal(id: number): Promise<Goal | undefined>;
    createGoal(goal: NewGoal): Promise<Goal>;
    updateGoal(id: number, updates: Partial<NewGoal>): Promise<Goal | undefined>;
    deleteGoal(id: number): Promise<boolean>;

    // Streak operations
    getStreak(userId: number): Promise<Streak | undefined>;
    createStreak(streak: NewStreak): Promise<Streak>;
    updateStreak(userId: number, updates: Partial<NewStreak>): Promise<Streak | undefined>;
}

export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private tasks: Map<number, Task>;
    private sessions: Map<number, Session>;
    private goals: Map<number, Goal>;
    private streaks: Map<number, Streak>;
    private currentId: { user: number; task: number; session: number; goal: number; streak: number };

    constructor() {
        this.users = new Map();
        this.tasks = new Map();
        this.sessions = new Map();
        this.goals = new Map();
        this.streaks = new Map();
        this.currentId = { user: 1, task: 1, session: 1, goal: 1, streak: 1 };
    }

    // User operations
    async getUser(id: number): Promise<User | undefined> {
        return this.users.get(id);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find(
            (user) => user.email === email
        );
    }

    async createUser(newUser: NewUser): Promise<User> {
        const id = this.currentId.user++;
        const now = new Date();
        const user: User = {
            id,
            email: newUser.email,
            password: newUser.password,
            name: newUser.name || null,
            createdAt: now,
            updatedAt: now,
        };
        this.users.set(id, user);
        return user;
    }

    async updateUser(id: number, updates: Partial<NewUser>): Promise<User | undefined> {
        const user = this.users.get(id);
        if (!user) return undefined;

        const updatedUser: User = {
            ...user,
            ...updates,
            updatedAt: new Date(),
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }

    // Task operations
    async getTasks(userId?: number): Promise<Task[]> {
        const allTasks = Array.from(this.tasks.values());
        const filteredTasks = userId
            ? allTasks.filter(task => task.userId === userId)
            : allTasks;

        return filteredTasks.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    async getTask(id: number): Promise<Task | undefined> {
        return this.tasks.get(id);
    }

    async createTask(newTask: NewTask): Promise<Task> {
        const id = this.currentId.task++;
        const task: Task = {
            id,
            userId: newTask.userId || null,
            text: newTask.text,
            completed: newTask.completed ?? false,
            priority: newTask.priority || 'medium',
            createdAt: new Date(),
            completedAt: newTask.completed ? new Date() : null,
        };
        this.tasks.set(id, task);
        return task;
    }

    async updateTask(id: number, updates: Partial<NewTask>): Promise<Task | undefined> {
        const task = this.tasks.get(id);
        if (!task) return undefined;

        const updatedTask: Task = {
            ...task,
            ...updates,
            completedAt: updates.completed && !task.completed ? new Date() : task.completedAt,
        };
        this.tasks.set(id, updatedTask);
        return updatedTask;
    }

    async deleteTask(id: number): Promise<boolean> {
        return this.tasks.delete(id);
    }

    // Session operations
    async getSessions(userId?: number): Promise<Session[]> {
        const allSessions = Array.from(this.sessions.values());
        const filteredSessions = userId
            ? allSessions.filter(session => session.userId === userId)
            : allSessions;

        return filteredSessions.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    async getSession(id: number): Promise<Session | undefined> {
        return this.sessions.get(id);
    }

    async createSession(newSession: NewSession): Promise<Session> {
        const id = this.currentId.session++;
        const session: Session = {
            id,
            userId: newSession.userId || null,
            type: newSession.type,
            duration: newSession.duration,
            date: newSession.date,
            time: newSession.time || null,
            taskId: newSession.taskId || null,
            createdAt: new Date(),
        };
        this.sessions.set(id, session);
        return session;
    }

    async getSessionsByDateRange(
        userId: number,
        startDate: string,
        endDate: string
    ): Promise<Session[]> {
        return Array.from(this.sessions.values())
            .filter(session =>
                session.userId === userId &&
                session.date >= startDate &&
                session.date <= endDate
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Goal operations
    async getGoals(userId: number): Promise<Goal[]> {
        return Array.from(this.goals.values())
            .filter(goal => goal.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getGoal(id: number): Promise<Goal | undefined> {
        return this.goals.get(id);
    }

    async createGoal(newGoal: NewGoal): Promise<Goal> {
        const id = this.currentId.goal++;
        const goal: Goal = {
            id,
            userId: newGoal.userId,
            type: newGoal.type,
            target: newGoal.target,
            metric: newGoal.metric,
            period: newGoal.period,
            achieved: newGoal.achieved ?? false,
            createdAt: new Date(),
        };
        this.goals.set(id, goal);
        return goal;
    }

    async updateGoal(id: number, updates: Partial<NewGoal>): Promise<Goal | undefined> {
        const goal = this.goals.get(id);
        if (!goal) return undefined;

        const updatedGoal: Goal = {
            ...goal,
            ...updates,
        };
        this.goals.set(id, updatedGoal);
        return updatedGoal;
    }

    async deleteGoal(id: number): Promise<boolean> {
        return this.goals.delete(id);
    }

    // Streak operations
    async getStreak(userId: number): Promise<Streak | undefined> {
        return Array.from(this.streaks.values()).find(
            streak => streak.userId === userId
        );
    }

    async createStreak(newStreak: NewStreak): Promise<Streak> {
        const id = this.currentId.streak++;
        const streak: Streak = {
            id,
            userId: newStreak.userId,
            currentStreak: newStreak.currentStreak ?? 0,
            longestStreak: newStreak.longestStreak ?? 0,
            lastActiveDate: newStreak.lastActiveDate || null,
            updatedAt: new Date(),
        };
        this.streaks.set(id, streak);
        return streak;
    }

    async updateStreak(userId: number, updates: Partial<NewStreak>): Promise<Streak | undefined> {
        const streak = await this.getStreak(userId);
        if (!streak) return undefined;

        const updatedStreak: Streak = {
            ...streak,
            ...updates,
            updatedAt: new Date(),
        };
        this.streaks.set(streak.id, updatedStreak);
        return updatedStreak;
    }
}

export const storage = new MemStorage();