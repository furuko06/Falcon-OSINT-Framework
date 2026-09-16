/**
 * Seed Loader
 */

export async function loadSeeds(database, json) {

  json.forEach(tool => {

    database.execute(`
      INSERT INTO tools(
        name,
        category,
        country,
        website
      )
      VALUES(
        '${tool.name}',
        '${tool.category}',
        '${tool.country}',
        '${tool.website}'
      );
    `);

  });

}