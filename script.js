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

const SOURCE = {
    name: "Not yet connected",
    detail: "Planned: King County overdose dashboard and Medical Examiner annual data.",
    retrieved: null
};

/* rate: illustrative events per 100,000 residents.
   trend: illustrative change against the previous period, in percent.
   band: how the row is coloured — high, medium or low. */
const CITIES = [
    { name: "Seattle", rate: 39.2, trend: 18.4, band: "high" },
    { name: "Auburn", rate: 34.8, trend: 11.7, band: "high" },
    { name: "Renton", rate: 28.6, trend: 6.2, band: "medium" },
    { name: "Kent", rate: 24.1, trend: -3.4, band: "medium" },
    { name: "Federal Way", rate: 19.7, trend: 2.1, band: "medium" },
    { name: "Bellevue", rate: 11.3, trend: -5.8, band: "low" },
    { name: "Redmond", rate: 8.9, trend: -1.2, band: "low" }
];

function highest() {
    /* The strongest signal, worked out from the list instead of typed
       into the page by hand. If the data changes, the headline follows. */
    return CITIES.reduce((worst, city) => city.rate > worst.rate ? city : worst, CITIES[0]);
}

function average() {
    const total = CITIES.reduce((sum, city) => sum + city.rate, 0);
    return (total / CITIES.length).toFixed(1);
}

function drawTable() {
    const table = document.getElementById("cityTable");
    if (!table)
        return;

    const top = highest().rate;
    table.innerHTML = "";

    CITIES.forEach(city => {
        const row = document.createElement("div");
        row.className = "city-row";

        /* Column 1: the name. */
        const name = document.createElement("div");
        name.className = "city-name";
        name.textContent = city.name;

        /* Column 2: a bar, as wide as the rate is high, relative to the
           worst city. */
        const wrap = document.createElement("div");
        wrap.className = "bar-wrap";

        const bar = document.createElement("div");
        bar.className = "city-bar";
        const fill = document.createElement("span");
        fill.style.width = Math.round((city.rate / top) * 100) + "%";
        bar.appendChild(fill);

        const meta = document.createElement("div");
        meta.className = "bar-meta";
        meta.textContent = city.band === "high" ? "High" : (city.band === "medium" ? "Moderate" : "Lower");

        wrap.appendChild(bar);
        wrap.appendChild(meta);

        /* Column 3: the rate. */
        const rate = document.createElement("div");
        rate.className = "metric";
        rate.textContent = city.rate.toFixed(1) + " / 100k";

        /* Column 4: the trend, up or down. */
        const trend = document.createElement("div");
        trend.className = "trend " + (city.trend >= 0 ? "up" : "down");
        trend.textContent = (city.trend >= 0 ? "+" : "") + city.trend.toFixed(1) + "%";

        /* Column 5: the honesty label. It is on every row on purpose. */
        const tag = document.createElement("div");
        tag.className = "bar-meta";
        tag.textContent = "Illustrative";

        row.append(name, wrap, rate, trend, tag);
        table.appendChild(row);
        /* textContent everywhere, so a value in the data can never turn
           into markup on the page. */
    });
}

function drawHeadlines() {
    const worst = highest();
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el)
            el.textContent = value;
    };

    set("stat-highest-city", worst.name);
    set("stat-avg-rate", average());
    set("stat-cities", String(CITIES.length));
    set("signal-number", worst.rate.toFixed(1));
    set("signal-city", worst.name + " illustrative response rate");
    /* The big number on the hero card now comes from the same list as
       the table, so the two can never disagree. */
}

function drawSource() {
    const box = document.getElementById("sourceNote");
    if (!box)
        return;

    box.textContent = "Data source: " + SOURCE.name + ". " + SOURCE.detail +
        (SOURCE.retrieved ? " Retrieved " + SOURCE.retrieved + "." : "");
}

drawTable();
drawHeadlines();
drawSource();
