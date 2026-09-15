export const router = {

start(){

console.log("Router iniciado.");

history.replaceState({}, "", location.pathname);

}

};
