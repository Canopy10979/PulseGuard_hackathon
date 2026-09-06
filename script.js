/* Homepage script.
 *
 * The earlier index.html loaded a script.js that did not exist, so the
 * city table stayed empty and the buttons did nothing. This file is that
 * missing script. It does NOT share code with app.js, because app.js
 * looks for elements that only the PulseGuard page has.
 *
 * IMPORTANT: every number below is illustrative placeholder data written
 * by the team for the prototype. None of it is a measurement. Replace
 * CITIES with real figures and fill in SOURCE before any public claim.
 */

// Explain: Keep SOURCE as {. Set the name field to "Not yet connected". Set the detail field to "Planned: King County overdose dashboard and Medical Examiner .
const SOURCE = {
    name: "Not yet connected",
    detail: "Planned: King County overdose dashboard and Medical Examiner annual data.",
    // Explain: Set the retrieved field to null. Close the current block or callback. Keep CITIES as [.
    retrieved: null
};

/* rate: illustrative events per 100,000 residents.
   trend: illustrative change against the previous period, in percent.
   band: how the row is coloured — high, medium or low. */
const CITIES = [
    // Explain: Start or continue the collection of structured values.
    { name: "Seattle", rate: 39.2, trend: 18.4, band: "high" },
    { name: "Auburn", rate: 34.8, trend: 11.7, band: "high" },
    { name: "Renton", rate: 28.6, trend: 6.2, band: "medium" },
    // Explain: Start or continue the collection of structured values.
    { name: "Kent", rate: 24.1, trend: -3.4, band: "medium" },
    { name: "Federal Way", rate: 19.7, trend: 2.1, band: "medium" },
    { name: "Bellevue", rate: 11.3, trend: -5.8, band: "low" },
    // Explain: Start or continue the collection of structured values. Close the current block or callback. Define highest with inputs none.
    { name: "Redmond", rate: 8.9, trend: -1.2, band: "low" }
];

function highest() {
    /* The strongest signal, worked out from the list instead of typed
       into the page by hand. If the data changes, the headline follows. */
    // Explain: Return CITIES.reduce((worst, city) => city.rate > worst.rate ? city : . Close the current block or callback. Define average with inputs none.
    return CITIES.reduce((worst, city) => city.rate > worst.rate ? city : worst, CITIES[0]);
}

function average() {
    // Explain: Keep total as CITIES.reduce((sum, city) => sum + city.rate, 0). Return (total / CITIES.length).toFixed(1). Close the current block or callback.
    const total = CITIES.reduce((sum, city) => sum + city.rate, 0);
    return (total / CITIES.length).toFixed(1);
}

// Explain: Define drawTable with inputs none. Find the HTML element that this code needs to read or update. Check !table.
function drawTable() {
    const table = document.getElementById("cityTable");
    if (!table)
        // Explain: Return from this function. Keep top as highest().rate. Clear the previous rendered contents before rebuilding them.
        return;

    const top = highest().rate;
    table.innerHTML = "";

    // Explain: Run the callback for each item in the collection. Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
    CITIES.forEach(city => {
        const row = document.createElement("div");
        row.className = "city-row";

        /* Column 1: the name. */
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set plain visible text on name.
        const name = document.createElement("div");
        name.className = "city-name";
        name.textContent = city.name;

        /* Column 2: a bar, as wide as the rate is high, relative to the
           worst city. */
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
        const wrap = document.createElement("div");
        wrap.className = "bar-wrap";

        const bar = document.createElement("div");
        // Explain: Change the element classes that control its displayed state. Create a new HTML element for the generated interface. Set fill.style.width using Math.round((city.rate / top) * 100) + "%".
        bar.className = "city-bar";
        const fill = document.createElement("span");
        fill.style.width = Math.round((city.rate / top) * 100) + "%";
        // Explain: Attach the generated content to its parent element. Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
        bar.appendChild(fill);

        const meta = document.createElement("div");
        meta.className = "bar-meta";
        // Explain: Set plain visible text on meta. Attach the generated content to its parent element.
        meta.textContent = city.band === "high" ? "High" : (city.band === "medium" ? "Moderate" : "Lower");

        wrap.appendChild(bar);
        wrap.appendChild(meta);

        /* Column 3: the rate. */
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set plain visible text on rate.
        const rate = document.createElement("div");
        rate.className = "metric";
        rate.textContent = city.rate.toFixed(1) + " / 100k";

        /* Column 4: the trend, up or down. */
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set plain visible text on trend.
        const trend = document.createElement("div");
        trend.className = "trend " + (city.trend >= 0 ? "up" : "down");
        trend.textContent = (city.trend >= 0 ? "+" : "") + city.trend.toFixed(1) + "%";

        /* Column 5: the honesty label. It is on every row on purpose. */
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set plain visible text on tag.
        const tag = document.createElement("div");
        tag.className = "bar-meta";
        tag.textContent = "Illustrative";

        // Explain: Attach the generated content to its parent element. Close the current block or callback.
        row.append(name, wrap, rate, trend, tag);
        table.appendChild(row);
        /* textContent everywhere, so a value in the data can never turn
           into markup on the page. */
    });
// Explain: Close the current block or callback. Define drawHeadlines with inputs none. Keep worst as highest().
}

function drawHeadlines() {
    const worst = highest();
    // Explain: Keep set as (id, value) => {. Find the HTML element that this code needs to read or update. Check el.
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el)
            // Explain: Set plain visible text on el. Close the current block or callback. Call set with the values shown here.
            el.textContent = value;
    };

    set("stat-highest-city", worst.name);
    // Explain: Call set with the values shown here.
    set("stat-avg-rate", average());
    set("stat-cities", String(CITIES.length));
    set("signal-number", worst.rate.toFixed(1));
    // Explain: Call set with the values shown here. Close the current block or callback. Define drawSource with inputs none.
    set("signal-city", worst.name + " illustrative response rate");
    /* The big number on the hero card now comes from the same list as
       the table, so the two can never disagree. */
}

function drawSource() {
    // Explain: Find the HTML element that this code needs to read or update. Check !box. Return from this function.
    const box = document.getElementById("sourceNote");
    if (!box)
        return;

    // Explain: Set plain visible text on box. Continue the surrounding expression with (SOURCE.retrieved ? " Retrieved " + SOURCE.retrieved + "." : "");. Close the current block or callback.
    box.textContent = "Data source: " + SOURCE.name + ". " + SOURCE.detail +
        (SOURCE.retrieved ? " Retrieved " + SOURCE.retrieved + "." : "");
}

// Explain: Call drawTable with the values shown here. Call drawHeadlines with the values shown here. Call drawSource with the values shown here.
drawTable();
drawHeadlines();
drawSource();
