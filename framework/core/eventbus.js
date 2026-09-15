const listeners = new Map();

export const EventBus = {

on(event,callback){

const list = listeners.get(event) || [];

list.push(callback);

listeners.set(event,list);

},

emit(event,payload){

const list = listeners.get(event) || [];

list.forEach(fn=>fn(payload));

}

};
