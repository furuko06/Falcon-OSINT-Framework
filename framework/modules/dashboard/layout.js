export function createDashboardSection() {
    const section = document.createElement("section");

    section.id = "dashboard";
    section.className = "dashboard";
    section.setAttribute("aria-label", "Falcon dashboard");

    section.innerHTML = `
        <div class="dashboard-header">
            <h2>Intelligence Overview</h2>
        </div>
        <div class="dashboard-grid" id="dashboard-widgets"></div>
    `;

    return section;
}

export function getDashboardGrid(container) {
    return container.querySelector("#dashboard-widgets");
}
