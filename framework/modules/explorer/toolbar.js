import { search } from "./search.js";

export function renderToolbar(container){

    container.innerHTML = `
        <input
            id="falcon-search"
            class="search-input"
            placeholder="Search tools..."
        />
    `;

    const input = container.querySelector("#falcon-search");

    let timer;

    input.addEventListener("input",event=>{

        clearTimeout(timer);

        timer = setTimeout(()=>{

            search(event.target.value);

        },250);

    });

}