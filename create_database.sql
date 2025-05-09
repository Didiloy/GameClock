DROP TABLE IF EXISTS session_participants;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS server_members;
DROP TABLE IF EXISTS servers;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS platforms;
DROP TABLE IF EXISTS users;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS authenticated with Auth0
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PLATFORMS
CREATE TABLE platforms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- GAMES
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    grid TEXT,
    hero TEXT,
    logo TEXT
);

-- Types of servers (e.g., 'game', 'sports', 'work')
CREATE TABLE server_types (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL -- e.g., 'game', 'sports'
);

-- Localized labels for each type
CREATE TABLE server_type_translations (
    id SERIAL PRIMARY KEY,
    server_type_id INTEGER REFERENCES server_types(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,  -- e.g., 'en', 'fr'
    label TEXT NOT NULL,          -- e.g., 'game', 'jeux'
    UNIQUE (server_type_id, language_code)
);

-- SERVERS created by a user
CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    server_type_id INTEGER REFERENCES server_types(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: users <-> servers (memberships)
CREATE TABLE server_members (
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (server_id, user_id)
);

-- SESSIONS within a server
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
    platform_id INTEGER REFERENCES platforms(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    comment TEXT,
    was_cool BOOLEAN,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many: users who participated in a session
CREATE TABLE session_participants (
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, user_id)
);
