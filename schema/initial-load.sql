
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('lab_admin', 'lab_supervisor', 'lab_user');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Store a hashed password, never plaintext.
    role user_role NOT NULL DEFAULT 'lab_user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experiments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experiment_versions (
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    notes TEXT, -- Optional notes for what changed in this version.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Each version number must be unique for a given experiment.
    UNIQUE (experiment_id, version_number)
);

CREATE TABLE flowcharts (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES experiment_versions(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Default Flowchart',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE flowchart_nodes (
    id SERIAL PRIMARY KEY,
    flowchart_id INTEGER NOT NULL REFERENCES flowcharts(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL, -- The string ID from SvelteFlow (e.g., '1', 'random-string').
    type TEXT,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    data JSONB, -- Stores the 'data' object, e.g., { "label": "some Node" }.
    origin_x REAL,
    origin_y REAL,
    -- A node ID must be unique within its flowchart.
    UNIQUE (flowchart_id, node_id)
);

CREATE TABLE flowchart_edges (
    id SERIAL PRIMARY KEY,
    flowchart_id INTEGER NOT NULL REFERENCES flowcharts(id) ON DELETE CASCADE,
    edge_id TEXT NOT NULL, -- The string ID from SvelteFlow (e.g., '1-2').
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    type TEXT,
    data JSONB, -- For storing extra edge data if needed.
    -- An edge ID must be unique within its flowchart.
    UNIQUE (flowchart_id, edge_id)
);

CREATE TABLE experiment_files (
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- e.g., 'image/png', 'application/pdf'
    storage_path TEXT NOT NULL, -- The path to the file on your server or cloud storage.
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
    session_token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--CREATE ROLE exp_mgmt_sys;

GRANT CONNECT ON DATABASE wft TO wft_app;
GRANT USAGE ON SCHEMA public TO wft_app;

-- 1. exp_mgmt_sys (Application Role) & 2. lab_admin (Admin Role)
-- These roles need full control over the data.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO wft_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO wft_app;

INSERT INTO users (id, email, password_hash, role, created_at) VALUES (1, 'lab-admin@leiza.de', '$2a$06$mZD5wmTYeiKOC.GA20F7P.WqZOWqe31hJsdoF2x6ehOftDhA4grrS', 'lab_admin', NOW());
