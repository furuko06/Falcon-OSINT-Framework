export function renderCards(container, tools = []) {

    container.innerHTML = "";

    if (!tools.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h2>No tools found</h2>
                <p>The current search returned no results.</p>
            </div>
        `;

        return;
    }

    tools.forEach(tool => {

        const card = document.createElement("article");

        card.className = "tool-card";

        card.innerHTML = `
            <header class="tool-header">
                <h3>${tool.name}</h3>
                <span class="tool-status">${tool.status || "verified"}</span>
            </header>

            <p>${tool.description || "No description available."}</p>

            <div class="tool-meta">
                <span>${tool.category}</span>
                <span>${tool.country}</span>
            </div>
        `;

        container.appendChild(card);

    });

}