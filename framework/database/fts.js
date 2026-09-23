/**
 * Falcon Query Language Parser
 */

export function parseQuery(query) {

  const tokens = query.trim().split(/\s+/);

  const filters = {};

  const keywords = [];

  tokens.forEach(token => {

    if (token.includes(":")) {

      const [key, value] = token.split(":");

      filters[key] = value;

    } else {

      keywords.push(token);

    }

  });

  return { filters, keywords };

}