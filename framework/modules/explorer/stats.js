/**
 * Falcon Explorer Statistics Engine
 */

export function computeStats(tools = [], favorites = new Set()) {

    const categories = new Set();
    const countries = new Set();

    let offline = 0;
    let docker = 0;
    let api = 0;

    let qualityTotal = 0;
    let opsecTotal = 0;

    for (const tool of tools) {

        categories.add(tool.category);
        countries.add(tool.country);

        if (Number(tool.offline)) offline++;
        if (Number(tool.docker)) docker++;
        if (Number(tool.api)) api++;

        qualityTotal += Number(tool.quality_score);
        opsecTotal += Number(tool.opsec_score);

    }

    const averageQuality =
        tools.length === 0 ? 0 :
        Math.round(qualityTotal / tools.length);

    const averageOpsec =
        tools.length === 0 ? 0 :
        Math.round(opsecTotal / tools.length);

    return {

        tools: tools.length,

        categories: categories.size,

        countries: countries.size,

        favorites: favorites.size,

        offline,
        docker,
        api,

        averageQuality,
        averageOpsec

    };

}