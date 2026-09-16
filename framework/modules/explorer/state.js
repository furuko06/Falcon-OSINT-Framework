/**
 * Falcon Explorer State Store
 * M3.1.1
 */

const listeners = new Set();

export const ExplorerState = {

    initialized:false,

    theme:"dark",

    query:"",

    filters:{
        category:null,
        country:null,
        offline:false,
        docker:false,
        api:false,
        favorites:false
    },

    categories:[],

    tools:[],

    results:[],

    favorites:new Set(),

    stats:{
        tools:0,
        categories:0
    }

};

export function subscribe(callback){

    listeners.add(callback);

    return ()=>listeners.delete(callback);

}

export function updateState(patch){

    Object.assign(ExplorerState,patch);

    listeners.forEach(listener=>listener(ExplorerState));

}

export function updateFilters(filters){

    ExplorerState.filters = {
        ...ExplorerState.filters,
        ...filters
    };

    listeners.forEach(listener=>listener(ExplorerState));

}