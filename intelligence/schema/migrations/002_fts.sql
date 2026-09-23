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