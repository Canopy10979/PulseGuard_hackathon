/* Safeguard — collapse warning prototype.
 *
 * What this file does and does not do:
 *   It reads the accelerometer and orientation sensors of the device.
 *   An impact triggers a local alarm; two motion signals trigger a response check.
 *   It prepares a message for a person to send.
 *   It never sends anything, and it never calls emergency services.
 *
 * Every number that drives a decision is a named constant at the top,
 * so any member of the team can change one and explain the effect.
 */

/* ---------- settings ---------- */

// Explain: Keep IMPACT_MS2 as 25. Keep STILL_MS2 as 1.5. Keep STILL_MS as 8000.
const IMPACT_MS2 = 25;        /* about 2.5 g. Walking peaks near 15. */
const STILL_MS2 = 1.5;        /* how far from rest still counts as "not moving" */
const STILL_MS = 8000;        /* how long that stillness must last */
// Explain: Keep COUNTDOWN_S as 5. Keep DROP_ALARM_S as 10. Keep ARM_DELAY_S as 5.
const COUNTDOWN_S = 5;       /* seconds to answer before the alert is prepared */
const DROP_ALARM_S = 10;      /* alarm length after a hard phone drop */
const ARM_DELAY_S = 5;        /* time to put the phone down after pressing Start */
// Explain: Keep MIN_SIGNALS as 2. Keep SENSOR_TIMEOUT_MS as 4000. Keep LOCATION_OPTIONS as { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }.
const MIN_SIGNALS = 2;        /* motion signals required for a responsiveness check */
const SENSOR_TIMEOUT_MS = 4000;
const LOCATION_OPTIONS = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 };
// Explain: Keep CONTACT_KEY as "pulseguard.contact.v1". Keep SIGNALS as {. Set the impact field to { weight: 30, text: "Sudden movement above 2.5 g" }.
const CONTACT_KEY = "pulseguard.contact.v1";

/* Each signal, what it is worth, and the plain words shown on screen.
   The weights add up to 100 points; they are not a medical probability. */
const SIGNALS = {
    impact: { weight: 30, text: "Sudden movement above 2.5 g" },
    // Explain: Set the orientation field to { weight: 20, text: "Orientation changed more than 45 degrees" }. Set the stillness field to { weight: 25, text: "No movement for 8 s after the event" }. Set the noReply field to { weight: 15, text: "No answer during the countdown" }.
    orientation: { weight: 20, text: "Orientation changed more than 45 degrees" },
    stillness: { weight: 25, text: "No movement for 8 s after the event" },
    noReply: { weight: 15, text: "No answer during the countdown" },
    // Explain: Set the located field to { weight: 10, text: "Position obtained" }. Close the current block or callback. Keep fired as {}.
    located: { weight: 10, text: "Position obtained" }
};

/* ---------- state ---------- */

const fired = {};             /* which signals have fired in this event */
// Explain: Initialize simulated as false. Initialize sensorsOn as false. Initialize impactAt as null.
let simulated = false;        /* true when the run came from the button */
let sensorsOn = false;
let impactAt = null;
// Explain: Initialize stillSince as null. Initialize lastTilt as { beta: null, gamma: null }. Initialize timer as null.
let stillSince = null;
let lastTilt = { beta: null, gamma: null };
let timer = null;
// Explain: Initialize place as null. Initialize dropAlarmTimer as null. Initialize dropAlarmActive as false.
let place = null;
let dropAlarmTimer = null;
let dropAlarmActive = false;
// Explain: Initialize armingTimer as null. Initialize sensorWatchdog as null. Initialize accelerometer as null.
let armingTimer = null;
let sensorWatchdog = null;
let accelerometer = null;
// Explain: Initialize lastSampleAt as 0. Initialize armedAt as Infinity. Initialize session as 0.
let lastSampleAt = 0;
let armedAt = Infinity;
let session = 0;
// Explain: Initialize locationWatch as null. Initialize locationRequest as 0. Initialize locationExpiry as null.
let locationWatch = null;
let locationRequest = 0;
let locationExpiry = null;
// Explain: Initialize satelliteMap as null. Initialize locationMarker as null. Initialize accuracyCircle as null.
let satelliteMap = null;
let locationMarker = null;
let accuracyCircle = null;
// Browser defaults: the supplied Expo screen did not include config/settings.
// Explain: Keep SETTLE_MS as 1500. Keep RECOVERY_MS as 2000. Keep RECOVERY_MS2 as 3.
const SETTLE_MS = 1500;
const RECOVERY_MS = 2000;
const RECOVERY_MS2 = 3;
// Explain: Initialize recoverySince as null. Initialize aedRequest as 0. Initialize aedController as null.
let recoverySince = null;
let aedRequest = 0;
let aedController = null;
// Explain: Initialize aedOrigin as null. Initialize aedAttemptAt as 0. Initialize aedMarkers as [].
let aedOrigin = null;
let aedAttemptAt = 0;
let aedMarkers = [];
// Explain: Initialize alarmPlayed as 0. Initialize alarmLastTime as 0. Initialize alertPhase as "idle".
let alarmPlayed = 0;
let alarmLastTime = 0;
let alertPhase = "idle";

/* ---------- small helpers ---------- */

// Explain: Define $ with inputs selector. Find the HTML element that this code needs to read or update. Close the current block or callback.
function $(selector) {
    return document.querySelector(selector);
}

// Explain: Define signalCount with inputs none. Keep only items that satisfy the callback condition. Close the current block or callback.
function signalCount() {
    return ["impact", "orientation", "stillness"].filter(key => fired[key]).length;
}

// Explain: Define score with inputs none. Initialize total as 0. Run the callback for each item in the collection.
function score() {
    let total = 0;
    Object.keys(fired).forEach(key => {
        // Explain: Update total using SIGNALS[key].weight. Close the current block or callback. Return total.
        total += SIGNALS[key].weight;
    });
    return total;
// Explain: Close the current block or callback. Define fire with inputs key. Check fired[key].
}

/* ---------- the signal board ---------- */

function fire(key) {
    if (fired[key])
        // Explain: Return from this function. Set fired[key] using true. Call drawSignals with the values shown here.
        return;
    /* Each signal counts once per event, however many times it repeats. */

    fired[key] = true;
    drawSignals();
    // Explain: Call check with the values shown here. Close the current block or callback. Define startDropAlarm with inputs none.
    check();
}

function startDropAlarm() {
    // Explain: Check dropAlarmActive) return;. Set dropAlarmActive using true. Set alarmPlayed using 0.
    if (dropAlarmActive) return;
    dropAlarmActive = true;
    alarmPlayed = 0;
    // Explain: Set alarmLastTime using 0. Keep panel as $("#dropAlarm"). Change the element classes that control its displayed state.
    alarmLastTime = 0;
    const panel = $("#dropAlarm");
    panel.classList.add("open");
    // Explain: Set an element attribute, including its accessible or visible state. Set plain visible text on $("#alarmCountdown"). Keep audio as $("#alarmSound").
    panel.setAttribute("aria-hidden", "false");
    $("#alarmCountdown").textContent = DROP_ALARM_S;
    const audio = $("#alarmSound");
    // Explain: Set the playback position within the audio recording. Call playWarning with the values shown here. Call askPlace with the values shown here.
    audio.currentTime = 0;
    playWarning();
    askPlace();
    // Measure media progress: blocked or buffering audio consumes no alarm time.
    // Explain: Schedule repeated work at the interval specified by this call. Set the playback position within the audio recording. Check now >= alarmLastTime) alarmPlayed += now - alarmLastTime;.
    dropAlarmTimer = setInterval(() => {
        const now = audio.currentTime;
        if (now >= alarmLastTime) alarmPlayed += now - alarmLastTime;
        // Explain: Handle the alternative case when the earlier condition fails. Set alarmLastTime using now. Set plain visible text on $("#alarmCountdown").
        else if (Number.isFinite(audio.duration)) alarmPlayed += audio.duration - alarmLastTime + now;
        alarmLastTime = now;
        $("#alarmCountdown").textContent = Math.max(0, Math.ceil(DROP_ALARM_S - alarmPlayed));
        // Explain: Check alarmPlayed >= DROP_ALARM_S) stopDropAlarm();. Continue the surrounding expression with }, 50);. Close the current block or callback.
        if (alarmPlayed >= DROP_ALARM_S) stopDropAlarm();
    }, 50);
}

// Explain: Define audioFailure with inputs error. Check !dropAlarmActive) return;. Set plain visible text on $("#audioStatus").
function audioFailure(error) {
    if (!dropAlarmActive) return;
    $("#audioStatus").textContent = error?.name === "NotAllowedError"
        // Explain: Continue the conditional or combined expression from the previous line. Close the current block or callback.
        ? "Sound needs your permission. Press Play warning sound; the full ten seconds are still available."
        : "The warning MP3 could not play. Check your connection, then press Play warning sound to retry.";
}

// Explain: Define playWarning with inputs none. Check !dropAlarmActive) return;. Keep audio as $("#alarmSound").
function playWarning() {
    if (!dropAlarmActive) return;
    const audio = $("#alarmSound");
    // Recover a failed download and restart the full warning on an explicit retry.
    // Explain: Check audio.error. Call audio.load with the values shown here. Set alarmPlayed using 0.
    if (audio.error) {
        audio.load();
        alarmPlayed = 0;
        // Explain: Set alarmLastTime using 0. Close the current block or callback. Set audio.muted using false.
        alarmLastTime = 0;
    }
    audio.muted = false;
    // Explain: Set audio.volume using 1. Set audio.playbackRate using 1. Set plain visible text on $("#audioStatus").
    audio.volume = 1;
    audio.playbackRate = 1;
    $("#audioStatus").textContent = "Starting warning sound…";
    // Explain: Request audio playback and handle its asynchronous result. Pause the audio playback. Set plain visible text on $("#audioStatus").
    audio.play().then(() => {
        if (!dropAlarmActive) { audio.pause(); return; }
        $("#audioStatus").textContent = "Warning sound is playing. If you cannot hear it, check your device volume and browser-tab mute.";
    // Explain: Continue the surrounding expression with }).catch(audioFailure);. Close the current block or callback. Define testFromMarker with inputs none.
    }).catch(audioFailure);
}

function testFromMarker() {
    // Explain: Check timer || dropAlarmActive || alertPhase !== "idle") return;. Set simulated using true. Keep audio as $("#alarmSound").
    if (timer || dropAlarmActive || alertPhase !== "idle") return;
    simulated = true;
    const audio = $("#alarmSound");
    // Explain: Set audio.muted using true. Request audio playback and handle its asynchronous result. Call openAlert with the values shown here.
    audio.muted = true;
    audio.play().then(() => { if (!dropAlarmActive) { audio.pause(); audio.currentTime = 0; } audio.muted = false; }).catch(() => { audio.muted = false; });
    openAlert();
    // Explain: Set plain visible text on $("#alertTitle"). Close the current block or callback. Define stopDropAlarm with inputs none.
    $("#alertTitle").textContent = "Test alarm in five seconds";
}

function stopDropAlarm() {
    // Explain: Check !dropAlarmActive. Return from this function. Cancel scheduled timer work.
    if (!dropAlarmActive)
        return;

    clearInterval(dropAlarmTimer);
    // Explain: Set dropAlarmTimer using null. Set dropAlarmActive using false. Keep audio as $("#alarmSound").
    dropAlarmTimer = null;
    dropAlarmActive = false;
    const audio = $("#alarmSound");
    // Explain: Pause the audio playback. Set the playback position within the audio recording. Change the element classes that control its displayed state.
    audio.pause();
    audio.currentTime = 0;
    $("#dropAlarm").classList.remove("open");
    // Explain: Set an element attribute, including its accessible or visible state. Change the element classes that control its displayed state.
    $("#dropAlarm").setAttribute("aria-hidden", "true");
    $("#alertPanel").classList.add("open");
    $("#alertPanel").setAttribute("aria-hidden", "false");
    // Explain: Open the dialog as a modal prompt. Close the current block or callback. Define openNearbyCare with inputs none.
    if (!$("#careDialog").open) $("#careDialog").showModal();
}

function openNearbyCare() {
    // Explain: Check !place || Date.now() - place.at > 60000. Set plain visible text on $("#careStatus"). Call askPlace with the values shown here.
    if (!place || Date.now() - place.at > 60000) {
        $("#careStatus").textContent = "Refresh your location below before opening nearby care.";
        askPlace();
        // Explain: Return from this function. Close the current block or callback. Encode text so it can be safely included in a URL component.
        return;
    }
    const query = encodeURIComponent("emergency medical services near " + place.lat + "," + place.lon);
    // Explain: Open the requested destination in a separate browsing context. Close the dialog. Close the current block or callback.
    window.open("https://www.google.com/maps/search/?api=1&query=" + query, "_blank", "noopener");
    $("#careDialog").close();
}

// Explain: Define metresBetween with inputs a, b. Keep rad as value => value * Math.PI / 180. Keep dLat as rad(b.lat - a.lat).
function metresBetween(a, b) {
    const rad = value => value * Math.PI / 180;
    const dLat = rad(b.lat - a.lat);
    // Explain: Keep dLon as rad(b.lon - a.lon). Keep x as Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(. Take the square root to calculate a magnitude or distance term.
    const dLon = rad(b.lon - a.lon);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
// Explain: Close the current block or callback. Define listNearestCare with inputs none. Check !place || Date.now() - place.at > 60000.
}

async function listNearestCare() {
    if (!place || Date.now() - place.at > 60000) {
        // Explain: Set plain visible text on $("#placesStatus"). Call askPlace with the values shown here. Return from this function.
        $("#placesStatus").textContent = "Getting a fresh location before finding AEDs…";
        askPlace();
        return;
    // Explain: Close the current block or callback. Set aedAttemptAt using Date.now(). Keep origin as { ...place }.
    }
    aedAttemptAt = Date.now();
    const origin = { ...place };
    // Explain: Keep request as ++aedRequest. Check aedController) aedController.abort();. Set aedController using new AbortController().
    const request = ++aedRequest;
    if (aedController) aedController.abort();
    aedController = new AbortController();
    // Explain: Keep controller as aedController. Schedule delayed work once the timeout expires. Set aedOrigin using origin.
    const controller = aedController;
    const timeout = setTimeout(() => controller.abort(), 25000);
    aedOrigin = origin;
    // Explain: Call $ with the values shown here. Run the callback for each item in the collection. Set aedMarkers using [].
    $("#placesList").replaceChildren();
    aedMarkers.forEach(marker => marker.remove());
    aedMarkers = [];
    // Explain: Set plain visible text on $("#placesStatus"). Run operations whose errors are handled below. Keep query as '[out:json][timeout:20];nwr["emergency"="defibrillator"](aroun.
    $("#placesStatus").textContent = "Looking for mapped AEDs within 10 km…";
    try {
        const query = '[out:json][timeout:20];nwr["emergency"="defibrillator"](around:10000,' + origin.lat + ',' + origin.lon + ');out center tags;';
        // Explain: Keep response as await fetch("https://overpass-api.de/api/interpreter", {. Set the method field to "POST", body: new URLSearchParams({ data: query }), signal: co. Close the current block or callback.
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST", body: new URLSearchParams({ data: query }), signal: controller.signal
        });
        // Explain: Check !response.ok) throw new Error("AED service unavailable");. Keep data as await response.json(). Check request !== aedRequest) return;.
        if (!response.ok) throw new Error("AED service unavailable");
        const data = await response.json();
        if (request !== aedRequest) return;
        // Explain: Check data.remark) throw new Error("Incomplete AED response");. Transform each collection item into an output value. Continue the surrounding expression with ...item, lat: item.lat ?? item.center?.lat, lon: item.lon ?? item.c.
        if (data.remark) throw new Error("Incomplete AED response");
        const results = (data.elements || []).map(item => ({
            ...item, lat: item.lat ?? item.center?.lat, lon: item.lon ?? item.center?.lon
        // Explain: Keep only items that satisfy the callback condition. Transform each collection item into an output value. Reorder the collection using the comparator.
        })).filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lon))
            .map(item => ({ ...item, distance: metresBetween(origin, item) }))
            .sort((a, b) => a.distance - b.distance).slice(0, 5);
        // Explain: Run the callback for each item in the collection. Keep tags as item.tags || {}. Keep name as tags.name || tags["defibrillator:location"] || tags.operator |.
        results.forEach((item, index) => {
            const tags = item.tags || {};
            const name = tags.name || tags["defibrillator:location"] || tags.operator || "Mapped AED";
            // Explain: Create a new HTML element for the generated interface. Encode text so it can be safely included in a URL component.
            const row = document.createElement("li");
            const link = document.createElement("a");
            link.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(item.lat + "," + item.lon);
            // Explain: Set link.target using "_blank". Set link.rel using "noopener". Set plain visible text on link.
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = name;
            // Explain: Create a new HTML element for the generated interface. Set plain visible text on detail. Attach the generated content to its parent element.
            const detail = document.createElement("small");
            detail.textContent = Math.round(item.distance) + " m straight-line · Access: " + (tags.access || "not recorded") + " · Hours: " + (tags.opening_hours || "not recorded");
            row.append(link, detail);
            // Explain: Attach the generated content to its parent element. Check satelliteMap && typeof L !== "undefined". Create a new HTML element for the generated interface.
            $("#placesList").append(row);
            if (satelliteMap && typeof L !== "undefined") {
                const label = document.createElement("span");
                // Explain: Set plain visible text on label. Call aedMarkers.push with the values shown here. Close the current block or callback.
                label.textContent = (index + 1) + ". " + name;
                aedMarkers.push(L.marker([item.lat, item.lon]).bindPopup(label).addTo(satelliteMap));
            }
        // Explain: Close the current block or callback. Set plain visible text on $("#placesStatus"). Handle an error from the preceding operation.
        });
        $("#placesStatus").textContent = results.length + " mapped AEDs within 10 km, closest first. OpenStreetMap records may be incomplete; availability is not verified. Updated " + new Date().toLocaleTimeString() + ".";
    } catch (error) {
        // Explain: Check request !== aedRequest) return;. Set aedOrigin using null. Set plain visible text on $("#placesStatus").
        if (request !== aedRequest) return;
        aedOrigin = null;
        $("#placesStatus").textContent = "AED locations could not load. Try Find nearest AEDs again. No example locations are substituted.";
    // Explain: Cancel scheduled timer work. Close the current block or callback. Define clearSignals with inputs none.
    } finally { clearTimeout(timeout); }
}

function clearSignals() {
    // Explain: Run the callback for each item in the collection. Set impactAt using null. Set recoverySince using null.
    Object.keys(fired).forEach(key => delete fired[key]);
    impactAt = null;
    recoverySince = null;
    // Explain: Set stillSince using null. Set lastTilt using { beta: null, gamma: null }. Call drawSignals with the values shown here.
    stillSince = null;
    lastTilt = { beta: null, gamma: null };
    drawSignals();
// Explain: Close the current block or callback. Define drawSignals with inputs none. Keep list as $("#signalList").
}

function drawSignals() {
    const list = $("#signalList");
    // Explain: Check !list. Return from this function. Clear the previous rendered contents before rebuilding them.
    if (!list)
        return;

    list.innerHTML = "";
    // Explain: Run the callback for each item in the collection. Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
    Object.keys(SIGNALS).forEach(key => {
        const li = document.createElement("li");
        li.className = fired[key] ? "signal on" : "signal";
        // Explain: Set plain visible text on li. Continue the text or argument value used by the surrounding expression. Attach the generated content to its parent element.
        li.textContent = (fired[key] ? "Yes — " : "No — ") + SIGNALS[key].text +
            " (" + SIGNALS[key].weight + " points)";
        list.appendChild(li);
        /* textContent, never innerHTML. Nothing here can become markup. */
    // Explain: Close the current block or callback. Set plain visible text on $("#confidence"). Set plain visible text on $("#signalTally").
    });

    $("#confidence").textContent = score() + " points";
    $("#signalTally").textContent = signalCount() + " of " + MIN_SIGNALS + " needed";
// Explain: Close the current block or callback. Define check with inputs none. Check timer || alertPhase !== "idle" || $("#careDialog").open.
}

/* ---------- the escalation rule ---------- */

function check() {
    if (timer || alertPhase !== "idle" || $("#careDialog").open)
        // Explain: Return from this function. Check dropAlarmActive.
        return;
    /* A countdown is already running. */

    if (dropAlarmActive)
        return;
    /* Nearby-care options appear only after the ten-second alarm ends or is stopped. */

    // Explain: Check !sensorsOn. Return from this function. Check !fired.stillness || signalCount() < MIN_SIGNALS.
    if (!sensorsOn)
        return;

    if (!fired.stillness || signalCount() < MIN_SIGNALS)
        // Explain: Return from this function. Call openAlert with the values shown here. Close the current block or callback.
        return;
    /* Location is context, not corroborating motion evidence. */

    openAlert();
}

/* ---------- sensors ---------- */

// Explain: Define onMotion with inputs ev. Keep a as ev.accelerationIncludingGravity. Check !sensorsOn || !a || ![a.x, a.y, a.z].every(Number.isFinite.
function onMotion(ev) {
    const a = ev.accelerationIncludingGravity;
    if (!sensorsOn || !a || ![a.x, a.y, a.z].every(Number.isFinite))
        // Explain: Return from this function. Set lastSampleAt using Date.now(). Check lastSampleAt < armedAt) return;.
        return;
    lastSampleAt = Date.now();
    if (lastSampleAt < armedAt) return;
    // Explain: Change the element classes that control its displayed state. Set plain visible text on $("#stateTitle"). Set plain visible text on $("#stateNote").
    $("#monitorState").className = "monitor-state ready";
    $("#stateTitle").textContent = "Tracker active";
    $("#stateNote").textContent = "Receiving motion readings. Keep this page open.";
    // Explain: Check alertPhase === "idle") setMode("Motion readings received. Drop detectio. Take the square root to calculate a magnitude or distance term. Check timer || dropAlarmActive || alertPhase !== "idle") return;.
    if (alertPhase === "idle") setMode("Motion readings received. Drop detection is active.", false);

    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    /* At rest this reads about 9.81, because gravity is included. */

    if (timer || dropAlarmActive || alertPhase !== "idle") return;
    // Explain: Check mag > IMPACT_MS2 && impactAt === null. Set impactAt using Date.now(). Set recoverySince using null.
    if (mag > IMPACT_MS2 && impactAt === null) {
        impactAt = Date.now();
        recoverySince = null;
        // Explain: Set stillSince using null. Call fire with the values shown here. Call askPlace with the values shown here.
        stillSince = null;
        fire("impact");
        askPlace();
    // Explain: Close the current block or callback. Check impactAt === null) return;. Set plain visible text on $("#stateTitle").
    }
    if (impactAt === null) return;
    $("#stateTitle").textContent = "Possible drop — letting movement settle";
    // Explain: Check Date.now() - impactAt < SETTLE_MS) return;. Measure an absolute difference without a negative sign. Call clearSignals with the values shown here.
    if (Date.now() - impactAt < SETTLE_MS) return;
    if (Math.abs(mag - 9.81) > RECOVERY_MS2) {
        clearSignals();
        // Explain: Set plain visible text on $("#stateTitle"). Return from this function. Close the current block or callback.
        $("#stateTitle").textContent = "Movement resumed — monitoring";
        return;
    }
    // Explain: Check recoverySince === null) recoverySince = Date.now();. Set plain visible text on $("#stateTitle"). Check Date.now() - recoverySince < RECOVERY_MS) return;.
    if (recoverySince === null) recoverySince = Date.now();
    $("#stateTitle").textContent = "Checking recovery";
    if (Date.now() - recoverySince < RECOVERY_MS) return;
    // Explain: Measure an absolute difference without a negative sign. Check stillSince === null) stillSince = Date.now();. Set plain visible text on $("#stateTitle").
    if (Math.abs(mag - 9.81) < STILL_MS2) {
        if (stillSince === null) stillSince = Date.now();
        $("#stateTitle").textContent = "Drop confirmed — checking stillness";
        // Explain: Check Date.now() - stillSince >= STILL_MS) fire("stillness");. Continue the surrounding expression with } else stillSince = null;. Close the current block or callback.
        if (Date.now() - stillSince >= STILL_MS) fire("stillness");
    } else stillSince = null;
}

// Explain: Define onOrientation with inputs ev. Check !sensorsOn || Date.now() < armedAt || !Number.isFinite(ev.beta) || !Num. Return from this function.
function onOrientation(ev) {
    if (!sensorsOn || Date.now() < armedAt || !Number.isFinite(ev.beta) || !Number.isFinite(ev.gamma))
        return;

    // Explain: Check lastTilt.beta === null. Set lastTilt.beta using ev.beta. Set lastTilt.gamma using ev.gamma.
    if (lastTilt.beta === null) {
        lastTilt.beta = ev.beta;
        lastTilt.gamma = ev.gamma;
        // Explain: Return from this function. Close the current block or callback. Measure an absolute difference without a negative sign.
        return;
    }

    const change = Math.abs(ev.beta - lastTilt.beta) + Math.abs(ev.gamma - lastTilt.gamma);
    // Explain: Check impactAt !== null && change > 45. Call fire with the values shown here. Set lastTilt.beta using ev.beta.
    if (impactAt !== null && change > 45)
        fire("orientation");

    lastTilt.beta = ev.beta;
    // Explain: Set lastTilt.gamma using ev.gamma. Close the current block or callback. Define startSensors with inputs none.
    lastTilt.gamma = ev.gamma;
}

function startSensors() {
    // Explain: Connect devicemotion to its handler. Connect deviceorientation to its handler. Set sensorsOn using true.
    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("deviceorientation", onOrientation);
    sensorsOn = true;
    // Explain: Set simulated using false. Set lastSampleAt using 0. Schedule repeated work at the interval specified by this call.
    simulated = false;
    lastSampleAt = 0;
    sensorWatchdog = setInterval(() => {
        // Explain: Check !sensorsOn || Date.now() < armedAt) return;. Check !lastSampleAt || Date.now() - lastSampleAt > SENSOR_TIMEOUT_MS. Check !accelerometer && typeof window.Accelerometer === "function".
        if (!sensorsOn || Date.now() < armedAt) return;
        if (!lastSampleAt || Date.now() - lastSampleAt > SENSOR_TIMEOUT_MS) {
            if (!accelerometer && typeof window.Accelerometer === "function") {
                // Explain: Run operations whose errors are handled below. Set accelerometer using new window.Accelerometer({ frequency: 30 }). Connect reading to its handler.
                try {
                    accelerometer = new window.Accelerometer({ frequency: 30 });
                    accelerometer.addEventListener("reading", () => {
                        // Explain: Call onMotion with the values shown here. Close the current block or callback. Connect error to its handler.
                        onMotion({ accelerationIncludingGravity: accelerometer });
                    });
                    accelerometer.addEventListener("error", () => {
                        // Explain: Set plain visible text on $("#stateNote"). Close the current block or callback. Call accelerometer.start with the values shown here.
                        $("#stateNote").textContent = "Motion access is unavailable. Location can still be checked.";
                    });
                    accelerometer.start();
                // Explain: Handle an error from the preceding operation. Close the current block or callback. Change the element classes that control its displayed state.
                } catch (_) { /* The status below remains unavailable until real readings arrive. */ }
            }
            $("#monitorState").className = "monitor-state off";
            // Explain: Set plain visible text on $("#stateTitle"). Set plain visible text on $("#stateNote"). Call setMode with the values shown here.
            $("#stateTitle").textContent = "No motion readings";
            $("#stateNote").textContent = "This device/browser may lack motion sensors. Location is available separately.";
            setMode("No recent motion data. Drop detection is not active on this device.", true);
        // Explain: Close the current block or callback. Continue the surrounding expression with }, 1000);.
        }
    }, 1000);
}

// Explain: Define stopSensors with inputs none. Update session using 1. Update aedRequest using 1.
function stopSensors() {
    session += 1;
    aedRequest += 1;
    // Explain: Set aedOrigin using null. Check aedController) aedController.abort();. Update locationRequest using 1.
    aedOrigin = null;
    if (aedController) aedController.abort();
    locationRequest += 1;
    // Explain: Cancel scheduled timer work. Set armingTimer using null.
    clearInterval(armingTimer);
    clearInterval(sensorWatchdog);
    armingTimer = null;
    // Explain: Set sensorWatchdog using null. Detach the event handler so tracking stops.
    sensorWatchdog = null;
    window.removeEventListener("devicemotion", onMotion);
    window.removeEventListener("deviceorientation", onOrientation);
    // Explain: Check accelerometer) accelerometer.stop();. Set accelerometer using null. Stop receiving location updates for this watch.
    if (accelerometer) accelerometer.stop();
    accelerometer = null;
    if (locationWatch !== null) navigator.geolocation.clearWatch(locationWatch);
    // Explain: Set locationWatch using null. Set sensorsOn using false. Set armedAt using Infinity.
    locationWatch = null;
    sensorsOn = false;
    armedAt = Infinity;
    // Explain: Cancel scheduled timer work. Set dropAlarmActive using false. Pause the audio playback.
    clearInterval(dropAlarmTimer);
    dropAlarmActive = false;
    $("#alarmSound").pause();
    // Explain: Set the playback position within the audio recording. Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
    $("#alarmSound").currentTime = 0;
    $("#dropAlarm").classList.remove("open");
    $("#dropAlarm").setAttribute("aria-hidden", "true");
    // Explain: Close the dialog. Call closeAlert with the values shown here. Call setMode with the values shown here.
    if ($("#careDialog").open) $("#careDialog").close();
    closeAlert();
    setMode("Tracker stopped. Motion and location monitoring are off.", false);
    // Explain: Change the element classes that control its displayed state. Set plain visible text on $("#stateTitle"). Set plain visible text on $("#stateNote").
    $("#monitorState").className = "monitor-state off";
    $("#stateTitle").textContent = "Sensors off";
    $("#stateNote").textContent = "Press Start tracker to begin.";
    // Explain: Set plain visible text on $("#gpsStatus"). Set plain visible text on $("#mapStatus"). Call $ with the values shown here.
    $("#gpsStatus").textContent = place ? "Last fix ±" + place.acc + " m" : "Not tracking";
    $("#mapStatus").textContent = "Tracking stopped. The marker shows the last reported location.";
    $("#armTrackerBtn").disabled = false;
    // Explain: Set plain visible text on $("#armTrackerBtn"). Close the current block or callback. Define armTracker with inputs none.
    $("#armTrackerBtn").textContent = "Start tracker";
}

async function armTracker() {
    // Explain: Check sensorsOn || armingTimer) { stopSensors(); return; }. Check !window.isSecureContext. Call setMode with the values shown here.
    if (sensorsOn || armingTimer) { stopSensors(); return; }
    if (!window.isSecureContext) {
        setMode("Open this page over HTTPS or localhost to use motion and location.", true);
        // Explain: Return from this function. Close the current block or callback. Keep run as ++session.
        return;
    }
    const run = ++session;
    // Explain: Keep button as $("#armTrackerBtn"). Set button.disabled using true. Set plain visible text on button.
    const button = $("#armTrackerBtn");
    button.disabled = true;
    button.textContent = "Requesting access…";
    // Invoke permission APIs directly in the click gesture, before the arming timer.
    // Explain: Keep permissions as []. Run operations whose errors are handled below. Check typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.re.
    const permissions = [];
    try {
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function")
            // Explain: Request browser permission to receive sensor measurements. Check typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientati.
            permissions.push(DeviceMotionEvent.requestPermission());
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function")
            permissions.push(DeviceOrientationEvent.requestPermission());
        // A muted play during the tap prepares the selected MP3 without sounding the alarm.
        // Explain: Keep audio as $("#alarmSound"). Set audio.muted using true. Request audio playback and handle its asynchronous result.
        const audio = $("#alarmSound");
        audio.muted = true;
        audio.play().then(() => {
            // Explain: Pause the audio playback. Set audio.muted using false. Continue the surrounding expression with }).catch(() => { audio.muted = false; });.
            if (!dropAlarmActive) { audio.pause(); audio.currentTime = 0; }
            audio.muted = false;
        }).catch(() => { audio.muted = false; });
        // Explain: Keep answers as await Promise.all(permissions). Check run !== session) return;. Check answers.some(answer => answer !== "granted")) throw new Error("Motion p.
        const answers = await Promise.all(permissions);
        if (run !== session) return;
        if (answers.some(answer => answer !== "granted")) throw new Error("Motion permission was not granted.");
        // Explain: Call clearSignals with the values shown here. Set alertPhase using "idle". Call startSensors with the values shown here.
        clearSignals();
        alertPhase = "idle";
        startSensors();
        // Explain: Call startLocationWatch with the values shown here. Set armedAt using Date.now() + ARM_DELAY_S * 1000. Set button.disabled using false.
        startLocationWatch();
        armedAt = Date.now() + ARM_DELAY_S * 1000;
        button.disabled = false;
        // Explain: Set plain visible text on button. Set plain visible text on $("#stateTitle"). Keep update as () => {.
        button.textContent = "Cancel arming";
        $("#stateTitle").textContent = "Arming";
        const update = () => {
            // Explain: Keep left as Math.max(0, Math.ceil((armedAt - Date.now()) / 1000)). Call setMode with the values shown here. Check left === 0.
            const left = Math.max(0, Math.ceil((armedAt - Date.now()) / 1000));
            setMode("Tracker arming in " + left + "s. Place the device now.", false);
            if (left === 0) {
                // Explain: Cancel scheduled timer work. Set plain visible text on button. Set plain visible text on $("#stateTitle").
                clearInterval(armingTimer); armingTimer = null;
                button.textContent = "Stop tracker";
                $("#stateTitle").textContent = "Waiting for motion readings";
                // Explain: Set plain visible text on $("#stateNote"). Call setMode with the values shown here. Close the current block or callback.
                $("#stateNote").textContent = "Detection becomes active when valid sensor data arrives.";
                setMode("Armed. Waiting for a motion reading.", false);
            }
        // Explain: Close the current block or callback. Call update with the values shown here. Schedule repeated work at the interval specified by this call.
        };
        update();
        armingTimer = setInterval(update, 100);
    // Explain: Handle an error from the preceding operation. Check run !== session) return;. Call stopSensors with the values shown here.
    } catch (error) {
        if (run !== session) return;
        stopSensors();
        // Explain: Call setMode with the values shown here. Close the current block or callback.
        setMode(error.message || "Motion access could not be started.", true);
    }
}

// Explain: Define setMode with inputs text, bad. Keep box as $("#modeBanner"). Change the element classes that control its displayed state.
function setMode(text, bad) {
    const box = $("#modeBanner");
    box.className = bad ? "mode-banner bad" : "mode-banner";
    // Explain: Set plain visible text on box. Close the current block or callback. Define showPosition with inputs p.
    box.textContent = text;
}

/* ---------- position ---------- */

function showPosition(p) {
    // Explain: Keep c as p.coords. Check ![c.latitude, c.longitude, c.accuracy].every(Number.isFinite) || c.accu. Measure an absolute difference without a negative sign.
    const c = p.coords;
    if (![c.latitude, c.longitude, c.accuracy].every(Number.isFinite) || c.accuracy < 0 ||
        Math.abs(c.latitude) > 90 || Math.abs(c.longitude) > 180 || !Number.isFinite(p.timestamp)) return;
    // Explain: Check Date.now() - p.timestamp > 60000 || p.timestamp > Date.now() + 5000) re. Check place && p.timestamp < place.at) return;. Set place using { lat: c.latitude, lon: c.longitude, acc: Math.ceil(c.acc.
    if (Date.now() - p.timestamp > 60000 || p.timestamp > Date.now() + 5000) return;
    if (place && p.timestamp < place.at) return;
    place = { lat: c.latitude, lon: c.longitude, acc: Math.ceil(c.accuracy), at: p.timestamp };
    // Keep location visible as context without counting it as corroborating motion.
    // Explain: Set fired.located using true. Call drawSignals with the values shown here. Set plain visible text on $("#gpsStatus").
    fired.located = true;
    drawSignals();
    $("#gpsStatus").textContent = "±" + place.acc + " m";
    // Explain: Set plain visible text on $("#locationText"). Call place.lon.toFixed with the values shown here. Set plain visible text on $("#lastCheck").
    $("#locationText").textContent = "Latitude " + place.lat.toFixed(6) + ", longitude " +
        place.lon.toFixed(6) + ". Reported accuracy ±" + place.acc + " m.";
    $("#lastCheck").textContent = new Date(place.at).toLocaleTimeString();
    // Explain: Set plain visible text on $("#mapStatus"). Continue the text or argument value used by the surrounding expression. Call $ with the values shown here.
    $("#mapStatus").textContent = "Location updated " + new Date(place.at).toLocaleTimeString() +
        ". The circle shows the browser-reported accuracy radius. Satellite imagery is not live.";
    $("#satelliteLink").href = "https://www.google.com/maps/@?api=1&map_action=map&center=" +
        // Explain: Continue the surrounding expression with place.lat + "," + place.lon + "&zoom=17&basemap=satellite";. Call $ with the values shown here. Cancel scheduled timer work.
        place.lat + "," + place.lon + "&zoom=17&basemap=satellite";
    $("#satelliteLink").hidden = false;
    clearTimeout(locationExpiry);
    // Explain: Keep at as place.at. Schedule delayed work once the timeout expires. Check place && place.at === at.
    const at = place.at;
    locationExpiry = setTimeout(() => {
        if (place && place.at === at) {
            // Explain: Set plain visible text on $("#gpsStatus"). Set plain visible text on $("#mapStatus"). Close the current block or callback.
            $("#gpsStatus").textContent = "Last fix ±" + place.acc + " m";
            $("#mapStatus").textContent = "Last known position is over a minute old. Refresh location for a new fix.";
        }
    // Explain: Continue the surrounding expression with }, Math.max(0, 60000 - (Date.now() - at)));. Check typeof L !== "undefined". Check !satelliteMap.
    }, Math.max(0, 60000 - (Date.now() - at)));
    if (typeof L !== "undefined") {
        if (!satelliteMap) {
            // Explain: Initialize the map in the named HTML container. Create the map tile layer from the specified image service. Set the maxZoom field to 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics.
            satelliteMap = L.map("satelliteMap").setView([place.lat, place.lon], 15);
            L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community"
            // Explain: Continue the surrounding expression with }).on("tileerror", () => {. Set plain visible text on $("#mapStatus"). Continue the surrounding expression with }).addTo(satelliteMap);.
            }).on("tileerror", () => {
                $("#mapStatus").textContent = "Satellite tiles could not load. Coordinates remain available; use Open satellite map.";
            }).addTo(satelliteMap);
        // Explain: Close the current block or callback. Keep point as [place.lat, place.lon]. Check locationMarker.
        }
        const point = [place.lat, place.lon];
        if (locationMarker) {
            // Explain: Call locationMarker.setLatLng with the values shown here. Call accuracyCircle.setLatLng with the values shown here. Continue the surrounding expression with } else {.
            locationMarker.setLatLng(point);
            accuracyCircle.setLatLng(point).setRadius(place.acc);
        } else {
            // Explain: Create a map circle or marker for the given coordinates. Create a new HTML element for the generated interface. Set plain visible text on markerAction.
            locationMarker = L.circleMarker(point, { radius: 7, color: "white", fillColor: "#3366cc", fillOpacity: 1 }).addTo(satelliteMap);
            const markerAction = document.createElement("button");
            markerAction.textContent = "Test alarm: 5-second countdown, then 10-second sound";
            // Explain: Connect click to its handler. Call locationMarker.bindPopup with the values shown here. Create a map circle or marker for the given coordinates.
            markerAction.addEventListener("click", testFromMarker);
            locationMarker.bindPopup(markerAction);
            accuracyCircle = L.circle(point, { radius: place.acc, color: "#69b7ff", fillOpacity: 0.12 }).addTo(satelliteMap);
        // Explain: Close the current block or callback. Call satelliteMap.invalidateSize with the values shown here. Move and scale the map to the selected position or bounds.
        }
        satelliteMap.invalidateSize();
        satelliteMap.fitBounds(accuracyCircle.getBounds(), { maxZoom: 17, padding: [25, 25] });
    // Explain: Continue the surrounding expression with } else {. Set plain visible text on $("#mapStatus"). Close the current block or callback.
    } else {
        $("#mapStatus").textContent += " Embedded map is unavailable. Use Open satellite map.";
    }
    // Explain: Check (!aedOrigin && Date.now() - aedAttemptAt > 30000) || (aedOrigin && metr. Close the current block or callback. Define locationError with inputs error.
    if ((!aedOrigin && Date.now() - aedAttemptAt > 30000) || (aedOrigin && metresBetween(aedOrigin, place) > 100)) listNearestCare();
}

function locationError(error) {
    // Explain: Keep message as error.code === 1 ? "Location permission denied." :. Set error.code using == 3 ? "Location timed out. Try Refresh location." : "Loc. Set plain visible text on $("#gpsStatus").
    const message = error.code === 1 ? "Location permission denied." :
        error.code === 3 ? "Location timed out. Try Refresh location." : "Location is unavailable. Try again outdoors or with Wi-Fi enabled.";
    $("#gpsStatus").textContent = place ? "Last fix ±" + place.acc + " m" : "Unavailable";
    // Explain: Set plain visible text on $("#mapStatus"). Close the current block or callback. Define startLocationWatch with inputs none.
    $("#mapStatus").textContent = message + (place ? " The map shows the last known fix." : " No location has been plotted.");
}

function startLocationWatch() {
    // Explain: Check !navigator.geolocation) { locationError({ code: 2 }); return; }. Stop receiving location updates for this watch. Keep run as session.
    if (!navigator.geolocation) { locationError({ code: 2 }); return; }
    if (locationWatch !== null) navigator.geolocation.clearWatch(locationWatch);
    const run = session;
    // Explain: Watch device location and pass new fixes to the success callback. Check run === session) showPosition(p);. Continue the surrounding expression with }, error => { if (run === session) locationError(error); }, LOCATIO.
    locationWatch = navigator.geolocation.watchPosition(p => {
        if (run === session) showPosition(p);
    }, error => { if (run === session) locationError(error); }, LOCATION_OPTIONS);
// Explain: Close the current block or callback. Define askPlace with inputs none. Check locationWatch === null) startLocationWatch();.
}

function askPlace() {
    if (locationWatch === null) startLocationWatch();
    // Explain: Check !navigator.geolocation) { locationError({ code: 2 }); return; }. Keep request as ++locationRequest. Set plain visible text on $("#gpsStatus").
    if (!navigator.geolocation) { locationError({ code: 2 }); return; }
    const request = ++locationRequest;
    $("#gpsStatus").textContent = "Locating…";
    // Explain: Request one device location fix with success and failure callbacks. Check request === locationRequest) showPosition(p);. Continue the surrounding expression with }, error => { if (request === locationRequest) locationError(error).
    navigator.geolocation.getCurrentPosition(p => {
        if (request === locationRequest) showPosition(p);
    }, error => { if (request === locationRequest) locationError(error); }, LOCATION_OPTIONS);
// Explain: Close the current block or callback. Define openAlert with inputs none. Set alertPhase using "countdown".
}

/* ---------- countdown ---------- */

function openAlert() {
    alertPhase = "countdown";
    // Explain: Keep panel as $("#alertPanel"). Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
    const panel = $("#alertPanel");
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    // Explain: Clear the previous rendered contents before rebuilding them. Set plain visible text on $("#alertTitle"). Initialize left as COUNTDOWN_S.
    $("#preparedBox").innerHTML = "";
    $("#alertTitle").textContent = "Are you okay?";

    let left = COUNTDOWN_S;
    // Explain: Set plain visible text on $("#countdown"). Cancel scheduled timer work. Schedule repeated work at the interval specified by this call.
    $("#countdown").textContent = left;

    clearInterval(timer);
    timer = setInterval(() => {
        // Explain: Update left using 1. Set plain visible text on $("#countdown"). Check left <= 0.
        left -= 1;
        $("#countdown").textContent = left;
        if (left <= 0) {
            // Explain: Cancel scheduled timer work. Set timer using null. Set fired.noReply using true.
            clearInterval(timer);
            timer = null;
            fired.noReply = true;
            // Explain: Call drawSignals with the values shown here. Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
            drawSignals();
            $("#alertPanel").classList.remove("open");
            $("#alertPanel").setAttribute("aria-hidden", "true");
            // Explain: Call prepareAlert with the values shown here. Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
            prepareAlert();
            $("#alertPanel").classList.remove("open");
            $("#alertPanel").setAttribute("aria-hidden", "true");
            // Explain: Call startDropAlarm with the values shown here. Close the current block or callback. Continue the surrounding expression with }, 1000);.
            startDropAlarm();
        }
    }, 1000);
// Explain: Close the current block or callback. Define closeAlert with inputs none. Set alertPhase using "idle".
}

function closeAlert() {
    alertPhase = "idle";
    // Explain: Cancel scheduled timer work. Set timer using null. Keep panel as $("#alertPanel").
    clearInterval(timer);
    timer = null;
    const panel = $("#alertPanel");
    // Explain: Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state. Call clearSignals with the values shown here.
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    clearSignals();
// Explain: Close the current block or callback. Define contact with inputs none. Run operations whose errors are handled below.
}

/* ---------- the prepared message ---------- */

function contact() {
    try {
        // Explain: Read a saved value from this browser storage. Return saved && typeof saved.name === "string" && typeof saved.phone =. Handle an error from the preceding operation.
        const saved = JSON.parse(localStorage.getItem(CONTACT_KEY) || "null");
        return saved && typeof saved.name === "string" && typeof saved.phone === "string" ? saved : null;
    } catch (_) { return null; }
// Explain: Close the current block or callback. Define prepareAlert with inputs none. Set alertPhase using "prepared".
}

function prepareAlert() {
    alertPhase = "prepared";
    // Explain: Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
    $("#alertPanel").classList.add("open");
    $("#alertPanel").setAttribute("aria-hidden", "false");
    $("#alertPanel").setAttribute("aria-hidden", "false");
    // Explain: Cancel scheduled timer work. Set timer using null. Keep person as contact().
    clearInterval(timer);
    timer = null;

    const person = contact();
    // Explain: Keep where as place && Date.now() - place.at <= 60000. Continue the conditional or combined expression from the previous line.
    const where = place && Date.now() - place.at <= 60000
        ? place.lat.toFixed(5) + ", " + place.lon.toFixed(5) + " (accuracy " + place.acc + " m)"
        : "no recent position available";
    // Explain: Transform each collection item into an output value. Keep message as "Safeguard: no answer from this phone after a possible collaps. Continue the text or argument value used by the surrounding expression.
    const reasons = Object.keys(fired).map(key => SIGNALS[key].text).join("; ");

    const message = "Safeguard: no answer from this phone after a possible collapse. " +
        "Position: " + where + ". Signals: " + reasons + ". Confidence: " + score() + " points." +
        // Explain: Continue the surrounding expression with (simulated ? " THIS IS A DEMONSTRATION, not a real emergency." : "");. Keep box as $("#preparedBox"). Clear the previous rendered contents before rebuilding them.
        (simulated ? " THIS IS A DEMONSTRATION, not a real emergency." : "");

    const box = $("#preparedBox");
    box.innerHTML = "";
    // Explain: Set plain visible text on $("#alertTitle"). Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
    $("#alertTitle").textContent = "Alert ready to send";

    const note = document.createElement("p");
    note.className = "microcopy";
    // Explain: Set plain visible text on note. Continue the text or argument value used by the surrounding expression. Attach the generated content to its parent element.
    note.textContent = "Nothing has been sent. This prototype writes the message and opens " +
        "your own messaging app. A person presses send.";
    box.appendChild(note);

    // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set plain visible text on text.
    const text = document.createElement("div");
    text.className = "prepared-text";
    text.textContent = message;
    // Explain: Attach the generated content to its parent element. Check person. Create a new HTML element for the generated interface.
    box.appendChild(text);

    if (person) {
        const link = document.createElement("a");
        // Explain: Change the element classes that control its displayed state. Encode text so it can be safely included in a URL component. Set plain visible text on link.
        link.className = "button danger";
        link.href = "sms:" + person.phone + "?body=" + encodeURIComponent(message);
        link.textContent = "Open a message to " + person.name;
        // Explain: Attach the generated content to its parent element. Close the current block or callback. Handle the alternative case when the earlier condition fails.
        box.appendChild(link);
        /* The contact field now changes what the demo does. Before this,
           it was typed in and never read. */
    }
    else {
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Set plain visible text on warn.
        const warn = document.createElement("p");
        warn.className = "microcopy";
        warn.textContent = "No contact saved, so there is nobody to message. Save one above.";
        // Explain: Attach the generated content to its parent element. Close the current block or callback.
        box.appendChild(warn);
    }
}

/* ---------- wiring ---------- */

// Explain: Connect click to its handler.
$("#locationBtn").addEventListener("click", askPlace);
$("#findCareBtn").addEventListener("click", listNearestCare);
$("#armTrackerBtn").addEventListener("click", armTracker);

// Explain: Connect click to its handler. Keep name as $("#contactName").value.trim(). Keep phone as $("#contactPhone").value.trim().
$("#saveContact").addEventListener("click", () => {
    const name = $("#contactName").value.trim();
    const phone = $("#contactPhone").value.trim();

    // Explain: Check !name || !phone. Set plain visible text on $("#contactNote"). Return from this function.
    if (!name || !phone) {
        $("#contactNote").textContent = "Give a name and a number.";
        return;
    // Explain: Close the current block or callback. Save a serialized value in this browser for later visits. Set plain visible text on $("#contactNote").
    }

    localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: name, phone: phone }));
    $("#contactNote").textContent = "Saved in this browser only: " + name + ".";
// Explain: Close the current block or callback. Connect click to its handler.
});

$("#okayBtn").addEventListener("click", closeAlert);
$("#notifyBtn").addEventListener("click", prepareAlert);
// Explain: Connect click to its handler.
$("#stopAlarmBtn").addEventListener("click", stopDropAlarm);
$("#openCareBtn").addEventListener("click", openNearbyCare);
$("#closeCareBtn").addEventListener("click", () => $("#careDialog").close());
// Explain: Connect close to its handler. Check signalCount() >= MIN_SIGNALS) check();. Handle the alternative case when the earlier condition fails.
$("#careDialog").addEventListener("close", () => {
    if (signalCount() >= MIN_SIGNALS) check();
    else clearSignals();
// Explain: Close the current block or callback. Connect click to its handler. Check dropAlarmActive) playWarning();.
});
$("#retryAudioBtn").addEventListener("click", () => {
    if (dropAlarmActive) playWarning();
// Explain: Close the current block or callback. Connect click to its handler.
});
$("#stopLocationBtn").addEventListener("click", stopSensors);
$("#testAlarmBtn").addEventListener("click", testFromMarker);
// Explain: Connect pagehide to its handler. Keep saved as contact(). Check saved.
window.addEventListener("pagehide", stopSensors);

/* ---------- start ---------- */

const saved = contact();
if (saved) {
    // Explain: Call $ with the values shown here. Set plain visible text on $("#contactNote").
    $("#contactName").value = saved.name;
    $("#contactPhone").value = saved.phone;
    $("#contactNote").textContent = "Loaded from this browser: " + saved.name + ".";
// Explain: Close the current block or callback. Call drawSignals with the values shown here. Call setMode with the values shown here.
}

drawSignals();
setMode("Press Start tracker. Motion and location access will be requested before the five-second arming delay.", false);

// Explain: Check new URLSearchParams(location.search).has("embedded". Find the HTML element that this code needs to read or update. Close the current block or callback.
if (new URLSearchParams(location.search).has("embedded")) {
    document.querySelectorAll("header, .back-home").forEach(element => element.hidden = true);
}

// Keep the embedded tracker at its content height so the dashboard has one scroll.
// Explain: Check window.parent !== window && new URLSearchParams(location.search).has("e. Continue the surrounding expression with new ResizeObserver(() => parent.postMessage({ type: "safeguard-trac. Close the current block or callback.
if (window.parent !== window && new URLSearchParams(location.search).has("embedded")) {
    new ResizeObserver(() => parent.postMessage({ type: "safeguard-tracker-height", height: document.documentElement.scrollHeight }, location.origin)).observe(document.body);
}

// Report loading problems instead of claiming that a silent player is sounding.
// Explain: Connect error to its handler. Connect waiting to its handler. Set plain visible text on if (dropAlarmActive) $("#audioStatus").
$("#alarmSound").addEventListener("error", () => audioFailure($("#alarmSound").error));
$("#alarmSound").addEventListener("waiting", () => {
    if (dropAlarmActive) $("#audioStatus").textContent = "Warning sound is buffering. The sound timer will resume with playback.";
// Explain: Close the current block or callback. Connect playing to its handler. Set plain visible text on if (dropAlarmActive) $("#audioStatus").
});
$("#alarmSound").addEventListener("playing", () => {
    if (dropAlarmActive) $("#audioStatus").textContent = "Warning sound is playing. Stop ends it early.";
// Explain: Close the current block or callback.
});
