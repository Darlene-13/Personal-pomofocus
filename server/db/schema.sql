-- =============== USERS ==================
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

-- =============== TASKS ==================
CREATE TABLE IF NOT EXISTS tasks (
                                     id SERIAL PRIMARY KEY,
                                     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
    );

-- =============== SESSIONS ==================
CREATE TABLE IF NOT EXISTS sessions (
                                        id SERIAL PRIMARY KEY,
                                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,           -- 'work' or 'break'
    duration INTEGER NOT NULL,           -- in minutes
    date VARCHAR(20) NOT NULL,           -- ISO date string
    time VARCHAR(20),                    -- time string
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

-- =============== GOALS ==================
CREATE TABLE IF NOT EXISTS goals (
                                     id SERIAL PRIMARY KEY,
                                     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,           -- 'daily', 'weekly', 'monthly'
