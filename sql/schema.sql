-- Schema do FutChamp para PostgreSQL
-- Execute: psql $DATABASE_URL -f sql/schema.sql

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT NOT NULL,
    photo_url   TEXT,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS championships (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL CHECK (type IN ('pontos_corridos', 'mata_mata')),
    status     TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado')),
    winner_id  INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS championship_players (
    championship_id INTEGER NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (championship_id, user_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id              SERIAL PRIMARY KEY,
    championship_id INTEGER NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
    round           INTEGER NOT NULL,
    home_user_id    INTEGER REFERENCES users(id),
    away_user_id    INTEGER REFERENCES users(id),
    home_score      INTEGER,
    away_score      INTEGER,
    played          BOOLEAN NOT NULL DEFAULT FALSE,
    next_match_id   INTEGER REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS "messages" (
    id              SERIAL PRIMARY KEY,
    "message"       VARCHAR(200) NOT NULL,
    user_id    INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS "roles" (
    id              SERIAL PRIMARY KEY,
	"role"          VARCHAR(200) NOT NULL,
    user_id    		INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS "permissions" (
    id              SERIAL PRIMARY KEY,
    role_id       	INTEGER REFERENCES roles(id),
    user_id    		INTEGER REFERENCES users(id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_matches_championship ON matches(championship_id);
CREATE INDEX IF NOT EXISTS idx_championship_players_champ ON championship_players(championship_id);
CREATE INDEX IF NOT EXISTS idx_championship_players_user ON championship_players(user_id);