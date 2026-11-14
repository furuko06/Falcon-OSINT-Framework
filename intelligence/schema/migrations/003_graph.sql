CREATE TABLE relationships(

    id INTEGER PRIMARY KEY,

    source INTEGER,

    target INTEGER,

    type TEXT,

    confidence INTEGER DEFAULT 100

);