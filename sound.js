/* Click sound, shared by every page.
 *
 * The file is decoded once into memory and each click plays a copy of
 * that memory, so fast clicks overlap instead of cutting each other off.
 * The switch in the top bar turns it off, and the choice is remembered.
 */

const SOUND_FILE = "click.mp3";
const HOVER_GAP_MS = 120;
const MUTE_KEY = "sound.muted.v1";

let ctx = null;
let buffer = null;
let muted = localStorage.getItem(MUTE_KEY) === "1";
let lastHover = 0;

async function soundReady() {
    if (!ctx)
        ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (ctx.state === "suspended")
        await ctx.resume();
    /* Browsers keep audio asleep until a person acts, so a page cannot
       make noise at a stranger. A click is that act. */

    if (!buffer) {
        const res = await fetch(SOUND_FILE);
        const raw = await res.arrayBuffer();
        buffer = await ctx.decodeAudioData(raw);
    }
}

async function playClick(volume) {
    if (muted)
        return;

    /* Never make a cheerful noise during an emergency countdown. */
    const panel = document.getElementById("alertPanel");
    if (panel && panel.classList.contains("open"))
        return;

    try {
        await soundReady();
    }
    catch (err) {
        return;
        /* A missing file must never break a page. Fail in silence. */
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    /* A buffer source is single use, so a new one is made each time.
       That is what lets two clicks overlap. */

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain).connect(ctx.destination);
    source.start();
}

function isPressable(el) {
    if (!el || !el.closest)
        return false;
    return el.closest("button, .button, .primary-btn, .secondary-btn, .city-row, tbody tr, .site-nav a.link, .cat-card, .rows li");
    /* closest looks up from the thing you touched, so a click on the
       text inside a button still counts as the button. */
}

document.addEventListener("click", ev => {
    if (isPressable(ev.target))
        playClick(0.5);
});

document.addEventListener("pointerover", ev => {
    if (ev.pointerType !== "mouse")
        return;
    /* A finger has no hover. Without this, one tap makes two sounds. */

    if (!isPressable(ev.target))
        return;

    const now = Date.now();
    if (now - lastHover < HOVER_GAP_MS)
        return;
    /* A mouse dragged across a row of buttons would otherwise fire a
       burst of clicks. */

    lastHover = now;
    playClick(0.18);
});

document.addEventListener("pointerdown", () => soundReady(), { once: true });
/* Warm the engine up on the first touch, so the first click is not silent. */

/* ---------- the mute switch ---------- */

const bar = document.querySelector(".site-nav .inner");

if (bar) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mute";
    toggle.textContent = muted ? "Sound off" : "Sound on";
    toggle.setAttribute("aria-pressed", muted ? "true" : "false");

    toggle.onclick = () => {
        muted = !muted;
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
        toggle.textContent = muted ? "Sound off" : "Sound on";
        toggle.setAttribute("aria-pressed", muted ? "true" : "false");
    };

    bar.appendChild(toggle);
    /* Every page must let a person stop the noise, and must remember the
       choice. A sound you cannot switch off is a fault. */
}
