import {router} from "./router.js";
import {state} from "./state.js";
import {info} from "./logger.js";

router.start();

info("Falcon iniciado.");

document.getElementById("app").insertAdjacentHTML(
"beforeend",
`<div class="card">
<h3>Core Engine</h3>
<p>Version ${state.version}</p>
</div>`
);
