/* Click sound, shared by every page.
 *
 * The file is decoded once into memory and each click plays a copy of
 * that memory, so fast clicks overlap instead of cutting each other off.
 * The switch in the top bar turns it off, and the choice is remembered.
 */

// Explain: Keep SOUND_FILE as "click.mp3". Keep HOVER_GAP_MS as 120. Keep MUTE_KEY as "sound.muted.v1".
const SOUND_FILE = "click.mp3";
const HOVER_GAP_MS = 120;
const MUTE_KEY = "sound.muted.v1";

// Explain: Initialize ctx as null. Initialize buffer as null. Read a saved value from this browser storage.
let ctx = null;
let buffer = null;
let muted = localStorage.getItem(MUTE_KEY) === "1";
// Explain: Initialize lastHover as 0. Define soundReady with inputs none. Check !ctx.
let lastHover = 0;

async function soundReady() {
    if (!ctx)
        // Explain: Set ctx using new (window.AudioContext || window.webkitAudioContext)(). Check ctx.state === "suspended". Continue the surrounding expression with await ctx.resume();.
        ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (ctx.state === "suspended")
        await ctx.resume();
    /* Browsers keep audio asleep until a person acts, so a page cannot
       make noise at a stranger. A click is that act. */

    // Explain: Check !buffer. Keep res as await fetch(SOUND_FILE). Keep raw as await res.arrayBuffer().
    if (!buffer) {
        const res = await fetch(SOUND_FILE);
        const raw = await res.arrayBuffer();
        // Explain: Set buffer using await ctx.decodeAudioData(raw). Close the current block or callback.
        buffer = await ctx.decodeAudioData(raw);
    }
}

// Explain: Define playClick with inputs volume. Check muted. Return from this function.
async function playClick(volume) {
    if (muted)
        return;

    /* Never make a cheerful noise during an emergency countdown. */
    // Explain: Find the HTML element that this code needs to read or update. Change the element classes that control its displayed state. Return from this function.
    const panel = document.getElementById("alertPanel");
    if (panel && panel.classList.contains("open"))
        return;

    // Explain: Run operations whose errors are handled below. Continue the surrounding expression with await soundReady();. Close the current block or callback.
    try {
        await soundReady();
    }
    // Explain: Handle an error from the preceding operation. Return from this function. Close the current block or callback.
    catch (err) {
        return;
        /* A missing file must never break a page. Fail in silence. */
    }

    // Explain: Keep source as ctx.createBufferSource(). Set source.buffer using buffer. Keep gain as ctx.createGain().
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    /* A buffer source is single use, so a new one is made each time.
       That is what lets two clicks overlap. */

    const gain = ctx.createGain();
    // Explain: Set gain.gain.value using volume. Call source.connect with the values shown here. Call source.start with the values shown here.
    gain.gain.value = volume;

    source.connect(gain).connect(ctx.destination);
    source.start();
// Explain: Close the current block or callback. Define isPressable with inputs el. Check !el || !el.closest.
}

function isPressable(el) {
    if (!el || !el.closest)
        // Explain: Return false. Return el.closest("button, .button, .primary-btn, .secondary-btn, .cit. Close the current block or callback.
        return false;
    return el.closest("button, .button, .primary-btn, .secondary-btn, .city-row, tbody tr, .site-nav a.link, .cat-card, .rows li");
    /* closest looks up from the thing you touched, so a click on the
       text inside a button still counts as the button. */
}

// Explain: Connect click to its handler. Check isPressable(ev.target. Call playClick with the values shown here.
document.addEventListener("click", ev => {
    if (isPressable(ev.target))
        playClick(0.5);
// Explain: Close the current block or callback. Connect pointerover to its handler. Check ev.pointerType !== "mouse".
});

document.addEventListener("pointerover", ev => {
    if (ev.pointerType !== "mouse")
        // Explain: Return from this function. Check !isPressable(ev.target.
        return;
    /* A finger has no hover. Without this, one tap makes two sounds. */

    if (!isPressable(ev.target))
        return;

    // Explain: Keep now as Date.now(). Check now - lastHover < HOVER_GAP_MS. Return from this function.
    const now = Date.now();
    if (now - lastHover < HOVER_GAP_MS)
        return;
    /* A mouse dragged across a row of buttons would otherwise fire a
       burst of clicks. */

    // Explain: Set lastHover using now. Call playClick with the values shown here. Close the current block or callback.
    lastHover = now;
    playClick(0.18);
});

// Explain: Connect pointerdown to its handler. Find the HTML element that this code needs to read or update. Check bar.
document.addEventListener("pointerdown", () => soundReady(), { once: true });
/* Warm the engine up on the first touch, so the first click is not silent. */

/* ---------- the mute switch ---------- */

const bar = document.querySelector(".site-nav .inner");

if (bar) {
    // Explain: Create a new HTML element for the generated interface. Set toggle.type using "button". Change the element classes that control its displayed state.
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mute";
    // Explain: Set plain visible text on toggle. Set an element attribute, including its accessible or visible state. Set toggle.onclick using () => {.
    toggle.textContent = muted ? "Sound off" : "Sound on";
    toggle.setAttribute("aria-pressed", muted ? "true" : "false");

    toggle.onclick = () => {
        // Explain: Set muted using !muted. Save a serialized value in this browser for later visits. Set plain visible text on toggle.
        muted = !muted;
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
        toggle.textContent = muted ? "Sound off" : "Sound on";
        // Explain: Set an element attribute, including its accessible or visible state. Close the current block or callback. Attach the generated content to its parent element.
        toggle.setAttribute("aria-pressed", muted ? "true" : "false");
    };

    bar.appendChild(toggle);
    /* Every page must let a person stop the noise, and must remember the
       choice. A sound you cannot switch off is a fault. */
// Explain: Close the current block or callback.
}
