CREATE TABLE categories(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE countries(
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE licenses(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE tags(
    id INTEGER PRIMARY KEY,
    tag TEXT UNIQUE
);

CREATE TABLE tools(
    id INTEGER PRIMARY KEY,

    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,

    description TEXT,

    country TEXT,

    website TEXT,
    github TEXT,

    license TEXT,

    status TEXT DEFAULT 'verified',

    offline INTEGER DEFAULT 0,
    api INTEGER DEFAULT 0,
    docker INTEGER DEFAULT 0,

    vpn_friendly INTEGER DEFAULT 0,
    tor_friendly INTEGER DEFAULT 0,

    opsec_score INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0,

    last_verified TEXT
);

CREATE TABLE collections(
    id INTEGER PRIMARY KEY,
    name TEXT
);

CREATE TABLE bookmarks(
    id INTEGER PRIMARY KEY,
    tool_id INTEGER
);

CREATE TABLE schema_version(
    version INTEGER
);

CREATE TABLE migration_history(
    version INTEGER,
    name TEXT,
    applied_at TEXT
);

CREATE VIRTUAL TABLE tools_fts
USING fts5(
    name,
    description,
    category,
    subcategory,
    country,
    content='tools',
    content_rowid='id'
);