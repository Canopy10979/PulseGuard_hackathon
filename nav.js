/* The site map, in one place.
 *
 * Every page loads this file, so a page added here appears in the top
 * bar and the footer of the whole site at once. Before this, each page
 * carried its own hand-typed links and three of them led nowhere.
 *
 * A page marks itself with <body data-page="detect">, and the matching
 * link is highlighted.
 */

// Explain: Keep SITE as [. Start or continue the collection of structured values. Set the group field to "Overview".
const SITE = [
    {
        group: "Overview",
        // Explain: Set the items field to [. Start or continue the collection of structured values. Close the current block or callback.
        items: [
            { id: "home", href: "index.html", label: "Home" }
        ]
    // Explain: Close the current block or callback. Start or continue the collection of structured values. Set the group field to "Detect".
    },
    {
        group: "Detect",
        // Explain: Set the items field to [. Start or continue the collection of structured values. Close the current block or callback.
        items: [
            { id: "detect", href: "fall-detection.html", label: "Drop tracker" }
        ]
    // Explain: Close the current block or callback. Start or continue the collection of structured values. Set the group field to "About".
    },
    {
        group: "About",
        // Explain: Set the items field to [. Start or continue the collection of structured values. Close the current block or callback.
        items: [
            { id: "about", href: "about.html", label: "Method & limits" }
        ]
    // Explain: Close the current block or callback. Keep TRIAL as ["safewalk", "shelters", "hazard"].
    }
];

/* Pages in this list get an orange label and a banner. They are earlier
   experiments kept in the site on purpose, and a judge should never have
   to guess which pages are the main product. */
const TRIAL = ["safewalk", "shelters", "hazard"];

// Explain: Keep here as document.body.dataset.page || "". Define buildNav with inputs none. Create a new HTML element for the generated interface.
const here = document.body.dataset.page || "";

/* ---------- top bar ---------- */

function buildNav() {
    const skip = document.createElement("a");
    // Explain: Change the element classes that control its displayed state. Set skip.href using "#main-content". Set plain visible text on skip.
    skip.className = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "Skip to main content";

    // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Primary navigation");

    // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
    const inner = document.createElement("div");
    inner.className = "inner";

    const brand = document.createElement("a");
    // Explain: Change the element classes that control its displayed state. Set brand.href using "index.html". Create a new HTML element for the generated interface.
    brand.className = "brand";
    brand.href = "index.html";

    const mark = document.createElement("span");
    // Explain: Change the element classes that control its displayed state. Set plain visible text on mark. Create a new HTML element for the generated interface.
    mark.className = "brand-mark";
    mark.textContent = "PG";

    const name = document.createElement("span");
    // Explain: Set plain visible text on name. Attach the generated content to its parent element.
    name.textContent = "Safeguard";

    brand.append(mark, name);
    inner.appendChild(brand);

    // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Run the callback for each item in the collection.
    const groups = document.createElement("div");
    groups.className = "groups";

    SITE.forEach(section => {
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
        const box = document.createElement("div");
        box.className = "group";

        const title = document.createElement("div");
        // Explain: Change the element classes that control its displayed state. Set plain visible text on title. Attach the generated content to its parent element.
        title.className = "group-name";
        title.textContent = section.group;
        box.appendChild(title);

        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Run the callback for each item in the collection.
        const links = document.createElement("div");
        links.className = "group-links";

        section.items.forEach(item => {
            // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set a.href using item.href.
            const a = document.createElement("a");
            a.className = item.id === here ? "link active" : "link";
            a.href = item.href;
            // Explain: Set plain visible text on a. Check item.id === here. Set an element attribute, including its accessible or visible state.
            a.textContent = item.label;
            if (item.id === here)
                a.setAttribute("aria-current", "page");
            // Explain: Attach the generated content to its parent element. Close the current block or callback.
            links.appendChild(a);
        });

        box.appendChild(links);
        // Explain: Attach the generated content to its parent element. Close the current block or callback.
        groups.appendChild(box);
    });

    inner.appendChild(groups);

    // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
    const account = document.createElement("div");
    account.className = "nav-account";

    const login = document.createElement("a");
    // Explain: Set login.href using "index.html#login". Set plain visible text on login. Create a new HTML element for the generated interface.
    login.href = "index.html#login";
    login.textContent = "Log in";

    const signup = document.createElement("a");
    // Explain: Change the element classes that control its displayed state. Set signup.href using "index.html#signup". Set plain visible text on signup.
    signup.className = "signup-link";
    signup.href = "index.html#signup";
    signup.textContent = "Sign up";

    // Explain: Attach the generated content to its parent element.
    account.append(login, signup);
    inner.appendChild(account);
    nav.appendChild(inner);
    // Explain: Find the HTML element that this code needs to read or update. Check main && !main.id) main.id = "main-content";. Call document.body.prepend with the values shown here.
    const main = document.querySelector("main");
    if (main && !main.id) main.id = "main-content";
    document.body.prepend(skip, nav);
    /* prepend, so the bar is the first thing in the page and the first
       thing a screen reader meets. */
// Explain: Close the current block or callback. Define buildFooter with inputs none. Create a new HTML element for the generated interface.
}

/* ---------- footer ---------- */

function buildFooter() {
    const foot = document.createElement("footer");
    // Explain: Change the element classes that control its displayed state. Create a new HTML element for the generated interface.
    foot.className = "site-footer";

    const inner = document.createElement("div");
    inner.className = "inner";

    // Explain: Run the callback for each item in the collection. Create a new HTML element for the generated interface.
    SITE.forEach(section => {
        const col = document.createElement("div");

        const h = document.createElement("h4");
        // Explain: Set plain visible text on h. Attach the generated content to its parent element. Run the callback for each item in the collection.
        h.textContent = section.group;
        col.appendChild(h);

        section.items.forEach(item => {
            // Explain: Create a new HTML element for the generated interface. Set a.href using item.href. Set plain visible text on a.
            const a = document.createElement("a");
            a.href = item.href;
            a.textContent = item.label;
            // Explain: Attach the generated content to its parent element. Close the current block or callback.
            col.appendChild(a);
        });

        inner.appendChild(col);
    // Explain: Close the current block or callback. Attach the generated content to its parent element.
    });

    foot.appendChild(inner);
    document.body.appendChild(foot);
// Explain: Close the current block or callback. Define buildTrialBanner with inputs none. Check TRIAL.indexOf(here) < 0.
}

/* ---------- experiment banner ---------- */

function buildTrialBanner() {
    if (TRIAL.indexOf(here) < 0)
        // Explain: Return from this function. Find the HTML element that this code needs to read or update. Create a new HTML element for the generated interface.
        return;

    const shell = document.querySelector(".shell") || document.querySelector("main");
    const banner = document.createElement("div");
    // Explain: Change the element classes that control its displayed state. Set plain visible text on banner. Continue the text or argument value used by the surrounding expression.
    banner.className = "mode-banner bad container";
    /* container keeps the banner inside the same column as the page
       content instead of running edge to edge. */
    banner.textContent = "Supporting experiment. This page is not part of the main Safeguard " +
        "pitch, its data stays in this browser, and it is kept in the site to show the team's " +
        // Explain: Continue the text or argument value used by the surrounding expression. Find the HTML element that this code needs to read or update. Check hero.
        "earlier work.";

    const hero = shell.querySelector(".page-hero, .hero");
    if (hero)
        // Explain: Call hero.after with the values shown here. Handle the alternative case when the earlier condition fails. Call shell.prepend with the values shown here.
        hero.after(banner);
    else
        shell.prepend(banner);
// Explain: Close the current block or callback. Call buildNav with the values shown here. Call buildTrialBanner with the values shown here.
}

buildNav();
buildTrialBanner();
// Explain: Call buildFooter with the values shown here.
buildFooter();
