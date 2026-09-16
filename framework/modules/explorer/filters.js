import { ExplorerState, updateState, updateFilters } from "./state.js";

export function applyFilters(filters={}){

    updateFilters(filters);

    let results = [...ExplorerState.tools];

    const current = ExplorerState.filters;

    if(current.category){

        results = results.filter(
            tool=>tool.category===current.category
        );

    }

    if(current.country){

        results = results.filter(
            tool=>tool.country===current.country
        );

    }

    if(current.offline){

        results = results.filter(tool=>tool.offline===1);

    }

    if(current.docker){

        results = results.filter(tool=>tool.docker===1);

    }

    if(current.api){

        results = results.filter(tool=>tool.api===1);

    }

    updateState({results});

}

export function clearFilters(){

    updateState({
        filters:{
            category:null,
            country:null,
            offline:false,
            docker:false,
            api:false,
            favorites:false
        },
        results:ExplorerState.tools
    });

}