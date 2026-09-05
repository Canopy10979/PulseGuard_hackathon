/* The site map, in one place.
 *
 * Every page loads this file, so a page added here appears in the top
 * bar and the footer of the whole site at once. Before this, each page
 * carried its own hand-typed links and three of them led nowhere.
 *
 * A page marks itself with <body data-page="detect">, and the matching
 * link is highlighted.
 */

const SITE = [
    {
        group: "Overview",
        items: [
            { id: "home", href: "index.html", label: "Home" }
        ]
    },
    {
        group: "Detect",
        items: [
            { id: "detect", href: "fall-detection.html", label: "Monitoring demo" }
        ]
    },
    {
        group: "About",
        items: [
            { id: "about", href: "about.html", label: "Method & limits" }
        ]
    }
];

/* Pages in this list get an orange label and a banner. They are earlier
   experiments kept in the site on purpose, and a judge should never have
   to guess which pages are the main product. */
const TRIAL = ["safewalk", "shelters", "hazard"];

const here = document.body.dataset.page || "";

/* ---------- top bar ---------- */

function buildNav() {
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main-content";
    skip.textContent = "Skip to main content";

    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.setAttribute("aria-label", "Primary navigation");

    const inner = document.createElement("div");
    inner.className = "inner";

    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = "index.html";

    const mark = document.createElement("span");
    mark.className = "brand-mark";
    mark.textContent = "PG";

    const name = document.createElement("span");
    name.textContent = "Lifeline";

    brand.append(mark, name);
    inner.appendChild(brand);

    const groups = document.createElement("div");
    groups.className = "groups";

    SITE.forEach(section => {
        const box = document.createElement("div");
        box.className = "group";

        const title = document.createElement("div");
        title.className = "group-name";
        title.textContent = section.group;
        box.appendChild(title);

        const links = document.createElement("div");
        links.className = "group-links";

        section.items.forEach(item => {
            const a = document.createElement("a");
            a.className = item.id === here ? "link active" : "link";
            a.href = item.href;
            a.textContent = item.label;
            if (item.id === here)
                a.setAttribute("aria-current", "page");
            links.appendChild(a);
        });

        box.appendChild(links);
        groups.appendChild(box);
    });

    inner.appendChild(groups);

    const account = document.createElement("div");
    account.className = "nav-account";

    const login = document.createElement("a");
    login.href = "index.html#login";
    login.textContent = "Log in";

    const signup = document.createElement("a");
    signup.className = "signup-link";
    signup.href = "index.html#signup";
    signup.textContent = "Sign up";

    account.append(login, signup);
    inner.appendChild(account);
    nav.appendChild(inner);
    const main = document.querySelector("main");
    if (main && !main.id) main.id = "main-content";
    document.body.prepend(skip, nav);
    /* prepend, so the bar is the first thing in the page and the first
       thing a screen reader meets. */
}

/* ---------- footer ---------- */

function buildFooter() {
    const foot = document.createElement("footer");
    foot.className = "site-footer";

    const inner = document.createElement("div");
    inner.className = "inner";

    SITE.forEach(section => {
        const col = document.createElement("div");

        const h = document.createElement("h4");
        h.textContent = section.group;
        col.appendChild(h);

        section.items.forEach(item => {
            const a = document.createElement("a");
            a.href = item.href;
            a.textContent = item.label;
            col.appendChild(a);
        });

        inner.appendChild(col);
    });

    foot.appendChild(inner);
    document.body.appendChild(foot);
}

/* ---------- experiment banner ---------- */

function buildTrialBanner() {
    if (TRIAL.indexOf(here) < 0)
        return;

    const shell = document.querySelector(".shell") || document.querySelector("main");
    const banner = document.createElement("div");
    banner.className = "mode-banner bad container";
    /* container keeps the banner inside the same column as the page
       content instead of running edge to edge. */
    banner.textContent = "Supporting experiment. This page is not part of the main Lifeline " +
        "pitch, its data stays in this browser, and it is kept in the site to show the team's " +
        "earlier work.";

    const hero = shell.querySelector(".page-hero, .hero");
    if (hero)
        hero.after(banner);
    else
        shell.prepend(banner);
}

buildNav();
buildTrialBanner();
buildFooter();
