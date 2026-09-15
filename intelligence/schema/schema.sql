CREATE TABLE IF NOT EXISTS tools(

id INTEGER PRIMARY KEY,

name TEXT NOT NULL,

category TEXT,

subcategory TEXT,

country TEXT,

description TEXT,

website TEXT,

github TEXT,

license TEXT,

status TEXT,

offline INTEGER,

api INTEGER,

docker INTEGER,

vpn_friendly INTEGER,

tor_friendly INTEGER,

opsec_score INTEGER,

quality_score INTEGER,

last_verified TEXT

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
