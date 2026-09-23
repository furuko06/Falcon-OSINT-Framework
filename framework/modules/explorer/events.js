/**
 * Falcon Event Bus
 */

const bus = new EventTarget();

export function emit(event,detail={}){

    bus.dispatchEvent(
        new CustomEvent(event,{detail})
    );

}

export function on(event,callback){

    const handler = event=>callback(event.detail);

    bus.addEventListener(event,handler);

    return ()=>bus.removeEventListener(event,handler);

}