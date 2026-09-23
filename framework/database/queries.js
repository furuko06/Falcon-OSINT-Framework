/**
 * Falcon SQL Queries
 */

export const ToolQueries = {

  search: `
    SELECT *
    FROM tools
    WHERE tools_fts MATCH ?
    ORDER BY quality_score DESC
    LIMIT 50;
  `,

  byCategory: `
    SELECT *
    FROM tools
    WHERE category = ?
    ORDER BY quality_score DESC;
  `,

  byCountry: `
    SELECT *
    FROM tools
    WHERE country = ?
    ORDER BY name ASC;
  `,

  favorites: `
    SELECT t.*
    FROM bookmarks b
    JOIN tools t ON t.id = b.tool_id;
  `,

  byStatus: `
    SELECT *
    FROM tools
    WHERE status = ?;
  `,

  offlineTools: `
    SELECT *
    FROM tools
    WHERE offline = 1;
  `,

  torFriendly: `
    SELECT *
    FROM tools
    WHERE tor_friendly = 1;
  `

};

export const SystemQueries = {

  schemaVersion: `
    SELECT version
    FROM schema_version
    LIMIT 1;
  `,

  migrations: `
    SELECT *
    FROM migration_history
    ORDER BY applied_at ASC;
  `

};