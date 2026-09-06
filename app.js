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
// Explain: Close the current block or callback. Keep aedVenueCache as new Map(). Define insideBuilding with inputs point, geometry.
}

// Venue information is cached in memory only; it expires after ten minutes.
const aedVenueCache = new Map();
function insideBuilding(point, geometry) {
    // Explain: Check !geometry || geometry.length < 4) return false;. Keep first as geometry[0], last = geometry[geometry.length - 1]. Check first.lat !== last.lat || first.lon !== last.lon) return false;.
    if (!geometry || geometry.length < 4) return false;
    const first = geometry[0], last = geometry[geometry.length - 1];
    if (first.lat !== last.lat || first.lon !== last.lon) return false;
    // Explain: Initialize inside as false. Repeat the loop while its control condition holds. Keep a as geometry[i], b = geometry[j].
    let inside = false;
    for (let i = 0, j = geometry.length - 1; i < geometry.length; j = i++) {
        const a = geometry[i], b = geometry[j];
        // Explain: Check !Number.isFinite(a.lat) || !Number.isFinite(a.lon)) return false;. Check (a.lat > point.lat) !== (b.lat > point.lat) &&. Continue the surrounding expression with point.lon < (b.lon - a.lon) * (point.lat - a.lat) / (b.lat - a.lat).
        if (!Number.isFinite(a.lat) || !Number.isFinite(a.lon)) return false;
        if ((a.lat > point.lat) !== (b.lat > point.lat) &&
            point.lon < (b.lon - a.lon) * (point.lat - a.lat) / (b.lat - a.lat) + a.lon) inside = !inside;
    // Explain: Close the current block or callback. Return inside.
    }
    return inside;
}
// Explain: Define buildingFootprint with inputs building. Keep g as building.geometry. Transform each collection item into an output value.
function buildingFootprint(building) {
    const g = building.geometry;
    return (Math.max(...g.map(p => p.lat)) - Math.min(...g.map(p => p.lat))) *
        // Explain: Transform each collection item into an output value. Close the current block or callback. Define aedAddress with inputs tags.
        (Math.max(...g.map(p => p.lon)) - Math.min(...g.map(p => p.lon)));
}
function aedAddress(tags) {
    // Explain: Keep only items that satisfy the callback condition. Close the current block or callback.
    const street = tags["addr:full"] || [tags["addr:housenumber"], tags["addr:street"] || tags["addr:place"]].filter(Boolean).join(" ");
    return street ? [street, tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(", ") : "";
}
// Explain: Define aedPlaceDetails with inputs item, buildings. Keep tags as item.tags || {}. Keep only items that satisfy the callback condition.
function aedPlaceDetails(item, buildings) {
    const tags = item.tags || {};
    // Only a containing outline supplies a building name; a nearby business is not evidence.
    const host = buildings.filter(b => b.tags?.building && insideBuilding(item, b.geometry))
        // Explain: Reorder the collection using the comparator. Keep address as aedAddress(tags) || aedAddress(host?.tags || {}). Keep recordedName as /^(aed|mapped aed|defibrillator)$/i.test(tags.name || "") ? "".
        .sort((a, b) => buildingFootprint(a) - buildingFootprint(b))[0];
    const address = aedAddress(tags) || aedAddress(host?.tags || {});
    const recordedName = /^(aed|mapped aed|defibrillator)$/i.test(tags.name || "") ? "" : tags.name;
    // Explain: Keep name as host?.tags?.name || recordedName || address || "AED at " + ite. Keep notes as [tags["defibrillator:location"], tags.description]. Check recordedName && recordedName !== name) notes.unshift(recordedName);.
    const name = host?.tags?.name || recordedName || address || "AED at " + item.lat.toFixed(5) + ", " + item.lon.toFixed(5);
    const notes = [tags["defibrillator:location"], tags.description];
    if (recordedName && recordedName !== name) notes.unshift(recordedName);
    // Explain: Check tags.level !== undefined) notes.push("Level " + tags.level);. Keep only items that satisfy the callback condition. Set the source field to host?.tags?.name ? "Building matched from mapped outline" : re.
    if (tags.level !== undefined) notes.push("Level " + tags.level);
    return { name, address, directions: [...new Set(notes.filter(Boolean))].join(" · "),
        source: host?.tags?.name ? "Building matched from mapped outline" : recordedName ? "Name recorded on AED map entry" : "Venue name not recorded" };
// Explain: Close the current block or callback. Define resolveAedPlaces with inputs results, signal. Keep key as item => item.type + "/" + item.id + "/" + item.lat + "/" + ite.
}
async function resolveAedPlaces(results, signal) {
    const key = item => item.type + "/" + item.id + "/" + item.lat + "/" + item.lon;
    // Explain: Keep only items that satisfy the callback condition. Initialize buildings as [], complete = missing.length === 0. Check missing.length && !signal.aborted.
    const missing = results.filter(item => (aedVenueCache.get(key(item))?.expires || 0) < Date.now());
    let buildings = [], complete = missing.length === 0;
    if (missing.length && !signal.aborted) {
        // Explain: Keep lookup as new AbortController(). Keep abort as () => lookup.abort(). Connect abort to its handler.
        const lookup = new AbortController();
        const abort = () => lookup.abort();
        signal.addEventListener("abort", abort, { once: true });
        // Explain: Schedule delayed work once the timeout expires. Run operations whose errors are handled below. Transform each collection item into an output value.
        const limit = setTimeout(abort, 8000);
        try {
            // Small bounding boxes batch the five building lookups into one request.
            const boxes = missing.map(item => {
                // Explain: Keep dy as 0.002, dx = dy / Math.max(0.1, Math.cos(item.lat * Math.PI / 1. Return 'way["building"](' + [item.lat - dy, item.lon - dx, item.lat + . Close the current block or callback.
                const dy = 0.002, dx = dy / Math.max(0.1, Math.cos(item.lat * Math.PI / 180));
                return 'way["building"](' + [item.lat - dy, item.lon - dx, item.lat + dy, item.lon + dx].join(",") + ');';
            });
            // Explain: Keep venueQuery as '[out:json][timeout:6];(' + boxes.join("") + ');out geom tags;'. Keep response as await fetch("https://overpass-api.de/api/interpreter", {. Set the method field to "POST", body: new URLSearchParams({ data: venueQuery }), signa.
            const venueQuery = '[out:json][timeout:6];(' + boxes.join("") + ');out geom tags;';
            const response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST", body: new URLSearchParams({ data: venueQuery }), signal: lookup.signal
            // Explain: Close the current block or callback. Check !response.ok) throw new Error("Building lookup unavailable");. Keep data as await response.json().
            });
            if (!response.ok) throw new Error("Building lookup unavailable");
            const data = await response.json();
            // Explain: Check data.remark || !Array.isArray(data.elements)) throw new Error("Incomple. Set buildings using data.elements. Set complete using true.
            if (data.remark || !Array.isArray(data.elements)) throw new Error("Incomplete building lookup");
            buildings = data.elements;
            complete = true;
        // Explain: Handle an error from the preceding operation. Continue the surrounding expression with } finally {. Cancel scheduled timer work.
        } catch (_) {
            // An unavailable name lookup must not discard the actual AED coordinates.
        } finally {
            clearTimeout(limit);
            // Explain: Detach the event handler so tracking stops. Close the current block or callback.
            signal.removeEventListener("abort", abort);
        }
    }
    // Explain: Transform each collection item into an output value. Keep cached as aedVenueCache.get(key(item)). Check cached && cached.expires > Date.now()) return cached.details;.
    const places = results.map(item => {
        const cached = aedVenueCache.get(key(item));
        if (cached && cached.expires > Date.now()) return cached.details;
        // Explain: Keep details as aedPlaceDetails(item, buildings). Check complete) aedVenueCache.set(key(item), { details, expires: Date.now() +. Return details.
        const details = aedPlaceDetails(item, buildings);
        if (complete) aedVenueCache.set(key(item), { details, expires: Date.now() + 600000 });
        return details;
    // Explain: Close the current block or callback. Continue the surrounding expression with while (aedVenueCache.size > 128) aedVenueCache.delete(aedVenueCache. Return { places, complete }.
    });
    while (aedVenueCache.size > 128) aedVenueCache.delete(aedVenueCache.keys().next().value);
    return { places, complete };
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
        // Explain: Set plain visible text on $("#placesStatus"). Keep venues as await resolveAedPlaces(results, controller.signal). Check request !== aedRequest) return;.
        $("#placesStatus").textContent = "Finding place names for the nearest AEDs…";
        const venues = await resolveAedPlaces(results, controller.signal);
        if (request !== aedRequest) return;
        // Explain: Run the callback for each item in the collection. Keep tags as item.tags || {}. Keep venue as venues.places[index].
        results.forEach((item, index) => {
            const tags = item.tags || {};
            const venue = venues.places[index];
            // Explain: Keep name as venue.name. Create a new HTML element for the generated interface.
            const name = venue.name;
            const row = document.createElement("li");
            const link = document.createElement("a");
            // Explain: Encode text so it can be safely included in a URL component. Set link.target using "_blank". Set link.rel using "noopener".
            link.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(item.lat + "," + item.lon);
            link.target = "_blank";
            link.rel = "noopener";
            // Explain: Set plain visible text on link. Create a new HTML element for the generated interface. Set plain visible text on detail.
            link.textContent = name;
            const detail = document.createElement("small");
            detail.textContent = Math.round(item.distance) + " m straight-line · Access: " + (tags.access || "not recorded") + " · Hours: " + (tags.opening_hours || "not recorded");
            // Explain: Attach the generated content to its parent element. Create a new HTML element for the generated interface. Set plain visible text on locationDetail.
            row.append(link);
            const locationDetail = document.createElement("small");
            locationDetail.textContent = [venue.address !== name ? venue.address : "", venue.directions].filter(Boolean).join(" · ");
            // Explain: Set plain visible text on if (locationDetail. Create a new HTML element for the generated interface. Set plain visible text on source.
            if (locationDetail.textContent) row.append(locationDetail);
            const source = document.createElement("small");
            source.textContent = venue.source;
            // Explain: Attach the generated content to its parent element. Check satelliteMap && typeof L !== "undefined".
            row.append(detail, source);
            $("#placesList").append(row);
            if (satelliteMap && typeof L !== "undefined") {
                // Explain: Create a new HTML element for the generated interface. Set plain visible text on label. Call aedMarkers.push with the values shown here.
                const label = document.createElement("span");
                label.textContent = (index + 1) + ". " + name + (venue.address ? " — " + venue.address : "") + (venue.directions ? " · " + venue.directions : "");
                aedMarkers.push(L.marker([item.lat, item.lon]).bindPopup(label).addTo(satelliteMap));
            // Explain: Close the current block or callback. Set plain visible text on $("#placesStatus").
            }
        });
        $("#placesStatus").textContent = results.length + " mapped AEDs within 10 km, closest first. OpenStreetMap records may be incomplete; availability is not verified. Updated " + new Date().toLocaleTimeString() + "." + (venues.complete ? "" : " Some place names could not load; AED coordinates are still shown.");
    // Explain: Handle an error from the preceding operation. Check request !== aedRequest) return;. Set aedOrigin using null.
    } catch (error) {
        if (request !== aedRequest) return;
        aedOrigin = null;
        // Explain: Set plain visible text on $("#placesStatus"). Cancel scheduled timer work. Close the current block or callback.
        $("#placesStatus").textContent = "AED locations could not load. Try Find nearest AEDs again. No example locations are substituted.";
    } finally { clearTimeout(timeout); }
}

// Explain: Define clearSignals with inputs none. Run the callback for each item in the collection. Set impactAt using null.
function clearSignals() {
    Object.keys(fired).forEach(key => delete fired[key]);
    impactAt = null;
    // Explain: Set recoverySince using null. Set stillSince using null. Set lastTilt using { beta: null, gamma: null }.
    recoverySince = null;
    stillSince = null;
    lastTilt = { beta: null, gamma: null };
    // Explain: Call drawSignals with the values shown here. Close the current block or callback. Define drawSignals with inputs none.
    drawSignals();
}

function drawSignals() {
    // Explain: Keep list as $("#signalList"). Check !list. Return from this function.
    const list = $("#signalList");
    if (!list)
        return;

    // Explain: Clear the previous rendered contents before rebuilding them. Run the callback for each item in the collection. Create a new HTML element for the generated interface.
    list.innerHTML = "";
    Object.keys(SIGNALS).forEach(key => {
        const li = document.createElement("li");
        // Explain: Change the element classes that control its displayed state. Set plain visible text on li. Continue the text or argument value used by the surrounding expression.
        li.className = fired[key] ? "signal on" : "signal";
        li.textContent = (fired[key] ? "Yes — " : "No — ") + SIGNALS[key].text +
            " (" + SIGNALS[key].weight + " points)";
        // Explain: Attach the generated content to its parent element. Close the current block or callback. Set plain visible text on $("#confidence").
        list.appendChild(li);
        /* textContent, never innerHTML. Nothing here can become markup. */
    });

    $("#confidence").textContent = score() + " points";
    // Explain: Set plain visible text on $("#signalTally"). Close the current block or callback. Define check with inputs none.
    $("#signalTally").textContent = signalCount() + " of " + MIN_SIGNALS + " needed";
}

/* ---------- the escalation rule ---------- */

function check() {
    // Explain: Check timer || alertPhase !== "idle" || $("#careDialog").open. Return from this function. Check dropAlarmActive.
    if (timer || alertPhase !== "idle" || $("#careDialog").open)
        return;
    /* A countdown is already running. */

    if (dropAlarmActive)
        // Explain: Return from this function. Check !sensorsOn.
        return;
    /* Nearby-care options appear only after the ten-second alarm ends or is stopped. */

    if (!sensorsOn)
        return;

    // Explain: Check !fired.stillness || signalCount() < MIN_SIGNALS. Return from this function. Call openAlert with the values shown here.
    if (!fired.stillness || signalCount() < MIN_SIGNALS)
        return;
    /* Location is context, not corroborating motion evidence. */

    openAlert();
// Explain: Close the current block or callback. Define onMotion with inputs ev. Keep a as ev.accelerationIncludingGravity.
}

/* ---------- sensors ---------- */

function onMotion(ev) {
    const a = ev.accelerationIncludingGravity;
    // Explain: Check !sensorsOn || !a || ![a.x, a.y, a.z].every(Number.isFinite. Return from this function. Set lastSampleAt using Date.now().
    if (!sensorsOn || !a || ![a.x, a.y, a.z].every(Number.isFinite))
        return;
    lastSampleAt = Date.now();
    // Explain: Check lastSampleAt < armedAt) return;. Change the element classes that control its displayed state. Set plain visible text on $("#stateTitle").
    if (lastSampleAt < armedAt) return;
    $("#monitorState").className = "monitor-state ready";
    $("#stateTitle").textContent = "Tracker active";
    // Explain: Set plain visible text on $("#stateNote"). Check alertPhase === "idle") setMode("Motion readings received. Drop detectio. Take the square root to calculate a magnitude or distance term.
    $("#stateNote").textContent = "Receiving motion readings. Keep this page open.";
    if (alertPhase === "idle") setMode("Motion readings received. Drop detection is active.", false);

    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    /* At rest this reads about 9.81, because gravity is included. */

    // Explain: Check timer || dropAlarmActive || alertPhase !== "idle") return;. Check mag > IMPACT_MS2 && impactAt === null. Set impactAt using Date.now().
    if (timer || dropAlarmActive || alertPhase !== "idle") return;
    if (mag > IMPACT_MS2 && impactAt === null) {
        impactAt = Date.now();
        // Explain: Set recoverySince using null. Set stillSince using null. Call fire with the values shown here.
        recoverySince = null;
        stillSince = null;
        fire("impact");
        // Explain: Call askPlace with the values shown here. Close the current block or callback. Check impactAt === null) return;.
        askPlace();
    }
    if (impactAt === null) return;
    // Explain: Set plain visible text on $("#stateTitle"). Check Date.now() - impactAt < SETTLE_MS) return;. Measure an absolute difference without a negative sign.
    $("#stateTitle").textContent = "Possible drop — letting movement settle";
    if (Date.now() - impactAt < SETTLE_MS) return;
    if (Math.abs(mag - 9.81) > RECOVERY_MS2) {
        // Explain: Call clearSignals with the values shown here. Set plain visible text on $("#stateTitle"). Return from this function.
        clearSignals();
        $("#stateTitle").textContent = "Movement resumed — monitoring";
        return;
    // Explain: Close the current block or callback. Check recoverySince === null) recoverySince = Date.now();. Set plain visible text on $("#stateTitle").
    }
    if (recoverySince === null) recoverySince = Date.now();
    $("#stateTitle").textContent = "Checking recovery";
    // Explain: Check Date.now() - recoverySince < RECOVERY_MS) return;. Measure an absolute difference without a negative sign. Check stillSince === null) stillSince = Date.now();.
    if (Date.now() - recoverySince < RECOVERY_MS) return;
    if (Math.abs(mag - 9.81) < STILL_MS2) {
        if (stillSince === null) stillSince = Date.now();
        // Explain: Set plain visible text on $("#stateTitle"). Check Date.now() - stillSince >= STILL_MS) fire("stillness");. Continue the surrounding expression with } else stillSince = null;.
        $("#stateTitle").textContent = "Drop confirmed — checking stillness";
        if (Date.now() - stillSince >= STILL_MS) fire("stillness");
    } else stillSince = null;
// Explain: Close the current block or callback. Define onOrientation with inputs ev. Check !sensorsOn || Date.now() < armedAt || !Number.isFinite(ev.beta) || !Num.
}

function onOrientation(ev) {
    if (!sensorsOn || Date.now() < armedAt || !Number.isFinite(ev.beta) || !Number.isFinite(ev.gamma))
        // Explain: Return from this function. Check lastTilt.beta === null. Set lastTilt.beta using ev.beta.
        return;

    if (lastTilt.beta === null) {
        lastTilt.beta = ev.beta;
        // Explain: Set lastTilt.gamma using ev.gamma. Return from this function. Close the current block or callback.
        lastTilt.gamma = ev.gamma;
        return;
    }

    // Explain: Measure an absolute difference without a negative sign. Check impactAt !== null && change > 45. Call fire with the values shown here.
    const change = Math.abs(ev.beta - lastTilt.beta) + Math.abs(ev.gamma - lastTilt.gamma);
    if (impactAt !== null && change > 45)
        fire("orientation");

    // Explain: Set lastTilt.beta using ev.beta. Set lastTilt.gamma using ev.gamma. Close the current block or callback.
    lastTilt.beta = ev.beta;
    lastTilt.gamma = ev.gamma;
}

// Explain: Define startSensors with inputs none. Connect devicemotion to its handler. Connect deviceorientation to its handler.
function startSensors() {
    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("deviceorientation", onOrientation);
    // Explain: Set sensorsOn using true. Set simulated using false. Set lastSampleAt using 0.
    sensorsOn = true;
    simulated = false;
    lastSampleAt = 0;
    // Explain: Schedule repeated work at the interval specified by this call. Check !sensorsOn || Date.now() < armedAt) return;. Check !lastSampleAt || Date.now() - lastSampleAt > SENSOR_TIMEOUT_MS.
    sensorWatchdog = setInterval(() => {
        if (!sensorsOn || Date.now() < armedAt) return;
        if (!lastSampleAt || Date.now() - lastSampleAt > SENSOR_TIMEOUT_MS) {
            // Explain: Check !accelerometer && typeof window.Accelerometer === "function". Run operations whose errors are handled below. Set accelerometer using new window.Accelerometer({ frequency: 30 }).
            if (!accelerometer && typeof window.Accelerometer === "function") {
                try {
                    accelerometer = new window.Accelerometer({ frequency: 30 });
                    // Explain: Connect reading to its handler. Call onMotion with the values shown here. Close the current block or callback.
                    accelerometer.addEventListener("reading", () => {
                        onMotion({ accelerationIncludingGravity: accelerometer });
                    });
                    // Explain: Connect error to its handler. Set plain visible text on $("#stateNote"). Close the current block or callback.
                    accelerometer.addEventListener("error", () => {
                        $("#stateNote").textContent = "Motion access is unavailable. Location can still be checked.";
                    });
                    // Explain: Call accelerometer.start with the values shown here. Handle an error from the preceding operation. Close the current block or callback.
                    accelerometer.start();
                } catch (_) { /* The status below remains unavailable until real readings arrive. */ }
            }
            // Explain: Change the element classes that control its displayed state. Set plain visible text on $("#stateTitle"). Set plain visible text on $("#stateNote").
            $("#monitorState").className = "monitor-state off";
            $("#stateTitle").textContent = "No motion readings";
            $("#stateNote").textContent = "This device/browser may lack motion sensors. Location is available separately.";
            // Explain: Call setMode with the values shown here. Close the current block or callback. Continue the surrounding expression with }, 1000);.
            setMode("No recent motion data. Drop detection is not active on this device.", true);
        }
    }, 1000);
// Explain: Close the current block or callback. Define stopSensors with inputs none. Update session using 1.
}

function stopSensors() {
    session += 1;
    // Explain: Update aedRequest using 1. Set aedOrigin using null. Check aedController) aedController.abort();.
    aedRequest += 1;
    aedOrigin = null;
    if (aedController) aedController.abort();
    // Explain: Update locationRequest using 1. Cancel scheduled timer work.
    locationRequest += 1;
    clearInterval(armingTimer);
    clearInterval(sensorWatchdog);
    // Explain: Set armingTimer using null. Set sensorWatchdog using null. Detach the event handler so tracking stops.
    armingTimer = null;
    sensorWatchdog = null;
    window.removeEventListener("devicemotion", onMotion);
    // Explain: Detach the event handler so tracking stops. Check accelerometer) accelerometer.stop();. Set accelerometer using null.
    window.removeEventListener("deviceorientation", onOrientation);
    if (accelerometer) accelerometer.stop();
    accelerometer = null;
    // Explain: Stop receiving location updates for this watch. Set locationWatch using null. Set sensorsOn using false.
    if (locationWatch !== null) navigator.geolocation.clearWatch(locationWatch);
    locationWatch = null;
    sensorsOn = false;
    // Explain: Set armedAt using Infinity. Cancel scheduled timer work. Set dropAlarmActive using false.
    armedAt = Infinity;
    clearInterval(dropAlarmTimer);
    dropAlarmActive = false;
    // Explain: Pause the audio playback. Set the playback position within the audio recording. Change the element classes that control its displayed state.
    $("#alarmSound").pause();
    $("#alarmSound").currentTime = 0;
    $("#dropAlarm").classList.remove("open");
    // Explain: Set an element attribute, including its accessible or visible state. Close the dialog. Call closeAlert with the values shown here.
    $("#dropAlarm").setAttribute("aria-hidden", "true");
    if ($("#careDialog").open) $("#careDialog").close();
    closeAlert();
    // Explain: Call setMode with the values shown here. Change the element classes that control its displayed state. Set plain visible text on $("#stateTitle").
    setMode("Tracker stopped. Motion and location monitoring are off.", false);
    $("#monitorState").className = "monitor-state off";
    $("#stateTitle").textContent = "Sensors off";
    // Explain: Set plain visible text on $("#stateNote"). Set plain visible text on $("#gpsStatus"). Set plain visible text on $("#mapStatus").
    $("#stateNote").textContent = "Press Start tracker to begin.";
    $("#gpsStatus").textContent = place ? "Last fix ±" + place.acc + " m" : "Not tracking";
    $("#mapStatus").textContent = "Tracking stopped. The marker shows the last reported location.";
    // Explain: Call $ with the values shown here. Set plain visible text on $("#armTrackerBtn"). Close the current block or callback.
    $("#armTrackerBtn").disabled = false;
    $("#armTrackerBtn").textContent = "Start tracker";
}

// Explain: Define armTracker with inputs none. Check sensorsOn || armingTimer) { stopSensors(); return; }. Check !window.isSecureContext.
async function armTracker() {
    if (sensorsOn || armingTimer) { stopSensors(); return; }
    if (!window.isSecureContext) {
        // Explain: Call setMode with the values shown here. Return from this function. Close the current block or callback.
        setMode("Open this page over HTTPS or localhost to use motion and location.", true);
        return;
    }
    // Explain: Keep run as ++session. Keep button as $("#armTrackerBtn"). Set button.disabled using true.
    const run = ++session;
    const button = $("#armTrackerBtn");
    button.disabled = true;
    // Explain: Set plain visible text on button. Keep permissions as []. Run operations whose errors are handled below.
    button.textContent = "Requesting access…";
    // Invoke permission APIs directly in the click gesture, before the arming timer.
    const permissions = [];
    try {
        // Explain: Check typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.re. Request browser permission to receive sensor measurements. Check typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientati.
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function")
            permissions.push(DeviceMotionEvent.requestPermission());
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function")
            // Explain: Request browser permission to receive sensor measurements. Keep audio as $("#alarmSound"). Set audio.muted using true.
            permissions.push(DeviceOrientationEvent.requestPermission());
        // A muted play during the tap prepares the selected MP3 without sounding the alarm.
        const audio = $("#alarmSound");
        audio.muted = true;
        // Explain: Request audio playback and handle its asynchronous result. Pause the audio playback. Set audio.muted using false.
        audio.play().then(() => {
            if (!dropAlarmActive) { audio.pause(); audio.currentTime = 0; }
            audio.muted = false;
        // Explain: Continue the surrounding expression with }).catch(() => { audio.muted = false; });. Keep answers as await Promise.all(permissions). Check run !== session) return;.
        }).catch(() => { audio.muted = false; });
        const answers = await Promise.all(permissions);
        if (run !== session) return;
        // Explain: Check answers.some(answer => answer !== "granted")) throw new Error("Motion p. Call clearSignals with the values shown here. Set alertPhase using "idle".
        if (answers.some(answer => answer !== "granted")) throw new Error("Motion permission was not granted.");
        clearSignals();
        alertPhase = "idle";
        // Explain: Call startSensors with the values shown here. Call startLocationWatch with the values shown here. Set armedAt using Date.now() + ARM_DELAY_S * 1000.
        startSensors();
        startLocationWatch();
        armedAt = Date.now() + ARM_DELAY_S * 1000;
        // Explain: Set button.disabled using false. Set plain visible text on button. Set plain visible text on $("#stateTitle").
        button.disabled = false;
        button.textContent = "Cancel arming";
        $("#stateTitle").textContent = "Arming";
        // Explain: Keep update as () => {. Keep left as Math.max(0, Math.ceil((armedAt - Date.now()) / 1000)). Call setMode with the values shown here.
        const update = () => {
            const left = Math.max(0, Math.ceil((armedAt - Date.now()) / 1000));
            setMode("Tracker arming in " + left + "s. Place the device now.", false);
            // Explain: Check left === 0. Cancel scheduled timer work. Set plain visible text on button.
            if (left === 0) {
                clearInterval(armingTimer); armingTimer = null;
                button.textContent = "Stop tracker";
                // Explain: Set plain visible text on $("#stateTitle"). Set plain visible text on $("#stateNote"). Call setMode with the values shown here.
                $("#stateTitle").textContent = "Waiting for motion readings";
                $("#stateNote").textContent = "Detection becomes active when valid sensor data arrives.";
                setMode("Armed. Waiting for a motion reading.", false);
            // Explain: Close the current block or callback. Call update with the values shown here.
            }
        };
        update();
        // Explain: Schedule repeated work at the interval specified by this call. Handle an error from the preceding operation. Check run !== session) return;.
        armingTimer = setInterval(update, 100);
    } catch (error) {
        if (run !== session) return;
        // Explain: Call stopSensors with the values shown here. Call setMode with the values shown here. Close the current block or callback.
        stopSensors();
        setMode(error.message || "Motion access could not be started.", true);
    }
// Explain: Close the current block or callback. Define setMode with inputs text, bad. Keep box as $("#modeBanner").
}

function setMode(text, bad) {
    const box = $("#modeBanner");
    // Explain: Change the element classes that control its displayed state. Set plain visible text on box. Close the current block or callback.
    box.className = bad ? "mode-banner bad" : "mode-banner";
    box.textContent = text;
}

/* ---------- position ---------- */

// Explain: Define showPosition with inputs p. Keep c as p.coords. Check ![c.latitude, c.longitude, c.accuracy].every(Number.isFinite) || c.accu.
function showPosition(p) {
    const c = p.coords;
    if (![c.latitude, c.longitude, c.accuracy].every(Number.isFinite) || c.accuracy < 0 ||
        // Explain: Measure an absolute difference without a negative sign. Check Date.now() - p.timestamp > 60000 || p.timestamp > Date.now() + 5000) re. Check place && p.timestamp < place.at) return;.
        Math.abs(c.latitude) > 90 || Math.abs(c.longitude) > 180 || !Number.isFinite(p.timestamp)) return;
    if (Date.now() - p.timestamp > 60000 || p.timestamp > Date.now() + 5000) return;
    if (place && p.timestamp < place.at) return;
    // Explain: Set place using { lat: c.latitude, lon: c.longitude, acc: Math.ceil(c.acc. Set fired.located using true. Call drawSignals with the values shown here.
    place = { lat: c.latitude, lon: c.longitude, acc: Math.ceil(c.accuracy), at: p.timestamp };
    // Keep location visible as context without counting it as corroborating motion.
    fired.located = true;
    drawSignals();
    // Explain: Set plain visible text on $("#gpsStatus"). Set plain visible text on $("#locationText"). Call place.lon.toFixed with the values shown here.
    $("#gpsStatus").textContent = "±" + place.acc + " m";
    $("#locationText").textContent = "Latitude " + place.lat.toFixed(6) + ", longitude " +
        place.lon.toFixed(6) + ". Reported accuracy ±" + place.acc + " m.";
    // Explain: Set plain visible text on $("#lastCheck"). Set plain visible text on $("#mapStatus"). Continue the text or argument value used by the surrounding expression.
    $("#lastCheck").textContent = new Date(place.at).toLocaleTimeString();
    $("#mapStatus").textContent = "Location updated " + new Date(place.at).toLocaleTimeString() +
        ". The circle shows the browser-reported accuracy radius. Satellite imagery is not live.";
    // Explain: Call $ with the values shown here. Continue the surrounding expression with place.lat + "," + place.lon + "&zoom=17&basemap=satellite";.
    $("#satelliteLink").href = "https://www.google.com/maps/@?api=1&map_action=map&center=" +
        place.lat + "," + place.lon + "&zoom=17&basemap=satellite";
    $("#satelliteLink").hidden = false;
    // Explain: Cancel scheduled timer work. Keep at as place.at. Schedule delayed work once the timeout expires.
    clearTimeout(locationExpiry);
    const at = place.at;
    locationExpiry = setTimeout(() => {
        // Explain: Check place && place.at === at. Set plain visible text on $("#gpsStatus"). Set plain visible text on $("#mapStatus").
        if (place && place.at === at) {
            $("#gpsStatus").textContent = "Last fix ±" + place.acc + " m";
            $("#mapStatus").textContent = "Last known position is over a minute old. Refresh location for a new fix.";
        // Explain: Close the current block or callback. Continue the surrounding expression with }, Math.max(0, 60000 - (Date.now() - at)));. Check typeof L !== "undefined".
        }
    }, Math.max(0, 60000 - (Date.now() - at)));
    if (typeof L !== "undefined") {
        // Explain: Check !satelliteMap. Initialize the map in the named HTML container. Create the map tile layer from the specified image service.
        if (!satelliteMap) {
            satelliteMap = L.map("satelliteMap").setView([place.lat, place.lon], 15);
            L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                // Explain: Set the maxZoom field to 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics. Continue the surrounding expression with }).on("tileerror", () => {. Set plain visible text on $("#mapStatus").
                maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community"
            }).on("tileerror", () => {
                $("#mapStatus").textContent = "Satellite tiles could not load. Coordinates remain available; use Open satellite map.";
            // Explain: Continue the surrounding expression with }).addTo(satelliteMap);. Close the current block or callback. Keep point as [place.lat, place.lon].
            }).addTo(satelliteMap);
        }
        const point = [place.lat, place.lon];
        // Explain: Check locationMarker. Call locationMarker.setLatLng with the values shown here. Call accuracyCircle.setLatLng with the values shown here.
        if (locationMarker) {
            locationMarker.setLatLng(point);
            accuracyCircle.setLatLng(point).setRadius(place.acc);
        // Explain: Continue the surrounding expression with } else {. Create a map circle or marker for the given coordinates. Create a new HTML element for the generated interface.
        } else {
            locationMarker = L.circleMarker(point, { radius: 7, color: "white", fillColor: "#3366cc", fillOpacity: 1 }).addTo(satelliteMap);
            const markerAction = document.createElement("button");
            // Explain: Set plain visible text on markerAction. Connect click to its handler. Call locationMarker.bindPopup with the values shown here.
            markerAction.textContent = "Test alarm: 5-second countdown, then 10-second sound";
            markerAction.addEventListener("click", testFromMarker);
            locationMarker.bindPopup(markerAction);
            // Explain: Create a map circle or marker for the given coordinates. Close the current block or callback. Call satelliteMap.invalidateSize with the values shown here.
            accuracyCircle = L.circle(point, { radius: place.acc, color: "#69b7ff", fillOpacity: 0.12 }).addTo(satelliteMap);
        }
        satelliteMap.invalidateSize();
        // Explain: Move and scale the map to the selected position or bounds. Continue the surrounding expression with } else {. Set plain visible text on $("#mapStatus").
        satelliteMap.fitBounds(accuracyCircle.getBounds(), { maxZoom: 17, padding: [25, 25] });
    } else {
        $("#mapStatus").textContent += " Embedded map is unavailable. Use Open satellite map.";
    // Explain: Close the current block or callback. Check (!aedOrigin && Date.now() - aedAttemptAt > 30000) || (aedOrigin && metr.
    }
    if ((!aedOrigin && Date.now() - aedAttemptAt > 30000) || (aedOrigin && metresBetween(aedOrigin, place) > 100)) listNearestCare();
}

// Explain: Define locationError with inputs error. Keep message as error.code === 1 ? "Location permission denied." :. Set error.code using == 3 ? "Location timed out. Try Refresh location." : "Loc.
function locationError(error) {
    const message = error.code === 1 ? "Location permission denied." :
        error.code === 3 ? "Location timed out. Try Refresh location." : "Location is unavailable. Try again outdoors or with Wi-Fi enabled.";
    // Explain: Set plain visible text on $("#gpsStatus"). Set plain visible text on $("#mapStatus"). Close the current block or callback.
    $("#gpsStatus").textContent = place ? "Last fix ±" + place.acc + " m" : "Unavailable";
    $("#mapStatus").textContent = message + (place ? " The map shows the last known fix." : " No location has been plotted.");
}

// Explain: Define startLocationWatch with inputs none. Check !navigator.geolocation) { locationError({ code: 2 }); return; }. Stop receiving location updates for this watch.
function startLocationWatch() {
    if (!navigator.geolocation) { locationError({ code: 2 }); return; }
    if (locationWatch !== null) navigator.geolocation.clearWatch(locationWatch);
    // Explain: Keep run as session. Watch device location and pass new fixes to the success callback. Check run === session) showPosition(p);.
    const run = session;
    locationWatch = navigator.geolocation.watchPosition(p => {
        if (run === session) showPosition(p);
    // Explain: Continue the surrounding expression with }, error => { if (run === session) locationError(error); }, LOCATIO. Close the current block or callback. Define askPlace with inputs none.
    }, error => { if (run === session) locationError(error); }, LOCATION_OPTIONS);
}

function askPlace() {
    // Explain: Check locationWatch === null) startLocationWatch();. Check !navigator.geolocation) { locationError({ code: 2 }); return; }. Keep request as ++locationRequest.
    if (locationWatch === null) startLocationWatch();
    if (!navigator.geolocation) { locationError({ code: 2 }); return; }
    const request = ++locationRequest;
    // Explain: Set plain visible text on $("#gpsStatus"). Request one device location fix with success and failure callbacks. Check request === locationRequest) showPosition(p);.
    $("#gpsStatus").textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(p => {
        if (request === locationRequest) showPosition(p);
    // Explain: Continue the surrounding expression with }, error => { if (request === locationRequest) locationError(error). Close the current block or callback. Define openAlert with inputs none.
    }, error => { if (request === locationRequest) locationError(error); }, LOCATION_OPTIONS);
}

/* ---------- countdown ---------- */

function openAlert() {
    // Explain: Set alertPhase using "countdown". Keep panel as $("#alertPanel"). Change the element classes that control its displayed state.
    alertPhase = "countdown";
    const panel = $("#alertPanel");
    panel.classList.add("open");
    // Explain: Set an element attribute, including its accessible or visible state. Clear the previous rendered contents before rebuilding them. Set plain visible text on $("#alertTitle").
    panel.setAttribute("aria-hidden", "false");
    $("#preparedBox").innerHTML = "";
    $("#alertTitle").textContent = "Are you okay?";

    // Explain: Initialize left as COUNTDOWN_S. Set plain visible text on $("#countdown"). Cancel scheduled timer work.
    let left = COUNTDOWN_S;
    $("#countdown").textContent = left;

    clearInterval(timer);
    // Explain: Schedule repeated work at the interval specified by this call. Update left using 1. Set plain visible text on $("#countdown").
    timer = setInterval(() => {
        left -= 1;
        $("#countdown").textContent = left;
        // Explain: Check left <= 0. Cancel scheduled timer work. Set timer using null.
        if (left <= 0) {
            clearInterval(timer);
            timer = null;
            // Explain: Set fired.noReply using true. Call drawSignals with the values shown here. Change the element classes that control its displayed state.
            fired.noReply = true;
            drawSignals();
            $("#alertPanel").classList.remove("open");
            // Explain: Set an element attribute, including its accessible or visible state. Call prepareAlert with the values shown here. Change the element classes that control its displayed state.
            $("#alertPanel").setAttribute("aria-hidden", "true");
            prepareAlert();
            $("#alertPanel").classList.remove("open");
            // Explain: Set an element attribute, including its accessible or visible state. Call startDropAlarm with the values shown here. Close the current block or callback.
            $("#alertPanel").setAttribute("aria-hidden", "true");
            startDropAlarm();
        }
    // Explain: Continue the surrounding expression with }, 1000);. Close the current block or callback. Define closeAlert with inputs none.
    }, 1000);
}

function closeAlert() {
    // Explain: Set alertPhase using "idle". Cancel scheduled timer work. Set timer using null.
    alertPhase = "idle";
    clearInterval(timer);
    timer = null;
    // Explain: Keep panel as $("#alertPanel"). Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
    const panel = $("#alertPanel");
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    // Explain: Call clearSignals with the values shown here. Close the current block or callback. Define contact with inputs none.
    clearSignals();
}

/* ---------- the prepared message ---------- */

function contact() {
    // Explain: Run operations whose errors are handled below. Read a saved value from this browser storage. Return saved && typeof saved.name === "string" && typeof saved.phone =.
    try {
        const saved = JSON.parse(localStorage.getItem(CONTACT_KEY) || "null");
        return saved && typeof saved.name === "string" && typeof saved.phone === "string" ? saved : null;
    // Explain: Handle an error from the preceding operation. Close the current block or callback. Define prepareAlert with inputs none.
    } catch (_) { return null; }
}

function prepareAlert() {
    // Explain: Set alertPhase using "prepared". Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state.
    alertPhase = "prepared";
    $("#alertPanel").classList.add("open");
    $("#alertPanel").setAttribute("aria-hidden", "false");
    // Explain: Set an element attribute, including its accessible or visible state. Cancel scheduled timer work. Set timer using null.
    $("#alertPanel").setAttribute("aria-hidden", "false");
    clearInterval(timer);
    timer = null;

    // Explain: Keep person as contact(). Keep where as place && Date.now() - place.at <= 60000. Continue the conditional or combined expression from the previous line.
    const person = contact();
    const where = place && Date.now() - place.at <= 60000
        ? place.lat.toFixed(5) + ", " + place.lon.toFixed(5) + " (accuracy " + place.acc + " m)"
        // Explain: Continue the conditional or combined expression from the previous line. Transform each collection item into an output value. Keep message as "Safeguard: no answer from this phone after a possible collaps.
        : "no recent position available";
    const reasons = Object.keys(fired).map(key => SIGNALS[key].text).join("; ");

    const message = "Safeguard: no answer from this phone after a possible collapse. " +
        // Explain: Continue the text or argument value used by the surrounding expression. Continue the surrounding expression with (simulated ? " THIS IS A DEMONSTRATION, not a real emergency." : "");. Keep box as $("#preparedBox").
        "Position: " + where + ". Signals: " + reasons + ". Confidence: " + score() + " points." +
        (simulated ? " THIS IS A DEMONSTRATION, not a real emergency." : "");

    const box = $("#preparedBox");
    // Explain: Clear the previous rendered contents before rebuilding them. Set plain visible text on $("#alertTitle"). Create a new HTML element for the generated interface.
    box.innerHTML = "";
    $("#alertTitle").textContent = "Alert ready to send";

    const note = document.createElement("p");
    // Explain: Change the element classes that control its displayed state. Set plain visible text on note. Continue the text or argument value used by the surrounding expression.
    note.className = "microcopy";
    note.textContent = "Nothing has been sent. This prototype writes the message and opens " +
        "your own messaging app. A person presses send.";
    // Explain: Attach the generated content to its parent element. Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
    box.appendChild(note);

    const text = document.createElement("div");
    text.className = "prepared-text";
    // Explain: Set plain visible text on text. Attach the generated content to its parent element. Check person.
    text.textContent = message;
    box.appendChild(text);

    if (person) {
        // Explain: Create a new HTML element for the generated interface. Change the element classes that control its displayed state. Encode text so it can be safely included in a URL component.
        const link = document.createElement("a");
        link.className = "button danger";
        link.href = "sms:" + person.phone + "?body=" + encodeURIComponent(message);
        // Explain: Set plain visible text on link. Attach the generated content to its parent element. Close the current block or callback.
        link.textContent = "Open a message to " + person.name;
        box.appendChild(link);
        /* The contact field now changes what the demo does. Before this,
           it was typed in and never read. */
    }
    // Explain: Handle the alternative case when the earlier condition fails. Create a new HTML element for the generated interface. Change the element classes that control its displayed state.
    else {
        const warn = document.createElement("p");
        warn.className = "microcopy";
        // Explain: Set plain visible text on warn. Attach the generated content to its parent element. Close the current block or callback.
        warn.textContent = "No contact saved, so there is nobody to message. Save one above.";
        box.appendChild(warn);
    }
// Explain: Close the current block or callback. Connect click to its handler.
}

/* ---------- wiring ---------- */

$("#locationBtn").addEventListener("click", askPlace);
$("#findCareBtn").addEventListener("click", listNearestCare);
// Explain: Connect click to its handler. Keep name as $("#contactName").value.trim().
$("#armTrackerBtn").addEventListener("click", armTracker);

$("#saveContact").addEventListener("click", () => {
    const name = $("#contactName").value.trim();
    // Explain: Keep phone as $("#contactPhone").value.trim(). Check !name || !phone. Set plain visible text on $("#contactNote").
    const phone = $("#contactPhone").value.trim();

    if (!name || !phone) {
        $("#contactNote").textContent = "Give a name and a number.";
        // Explain: Return from this function. Close the current block or callback. Save a serialized value in this browser for later visits.
        return;
    }

    localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: name, phone: phone }));
    // Explain: Set plain visible text on $("#contactNote"). Close the current block or callback. Connect click to its handler.
    $("#contactNote").textContent = "Saved in this browser only: " + name + ".";
});

$("#okayBtn").addEventListener("click", closeAlert);
// Explain: Connect click to its handler.
$("#notifyBtn").addEventListener("click", prepareAlert);
$("#stopAlarmBtn").addEventListener("click", stopDropAlarm);
$("#openCareBtn").addEventListener("click", openNearbyCare);
// Explain: Connect click to its handler. Connect close to its handler. Check signalCount() >= MIN_SIGNALS) check();.
$("#closeCareBtn").addEventListener("click", () => $("#careDialog").close());
$("#careDialog").addEventListener("close", () => {
    if (signalCount() >= MIN_SIGNALS) check();
    // Explain: Handle the alternative case when the earlier condition fails. Close the current block or callback. Connect click to its handler.
    else clearSignals();
});
$("#retryAudioBtn").addEventListener("click", () => {
    // Explain: Check dropAlarmActive) playWarning();. Close the current block or callback. Connect click to its handler.
    if (dropAlarmActive) playWarning();
});
$("#stopLocationBtn").addEventListener("click", stopSensors);
// Explain: Connect click to its handler. Connect pagehide to its handler. Keep saved as contact().
$("#testAlarmBtn").addEventListener("click", testFromMarker);
window.addEventListener("pagehide", stopSensors);

/* ---------- start ---------- */

const saved = contact();
// Explain: Check saved. Call $ with the values shown here.
if (saved) {
    $("#contactName").value = saved.name;
    $("#contactPhone").value = saved.phone;
    // Explain: Set plain visible text on $("#contactNote"). Close the current block or callback. Call drawSignals with the values shown here.
    $("#contactNote").textContent = "Loaded from this browser: " + saved.name + ".";
}

drawSignals();
// Explain: Call setMode with the values shown here. Check new URLSearchParams(location.search).has("embedded". Find the HTML element that this code needs to read or update.
setMode("Press Start tracker. Motion and location access will be requested before the five-second arming delay.", false);

if (new URLSearchParams(location.search).has("embedded")) {
    document.querySelectorAll("header, .back-home").forEach(element => element.hidden = true);
// Explain: Close the current block or callback. Check window.parent !== window && new URLSearchParams(location.search).has("e. Continue the surrounding expression with new ResizeObserver(() => parent.postMessage({ type: "safeguard-trac.
}

// Keep the embedded tracker at its content height so the dashboard has one scroll.
if (window.parent !== window && new URLSearchParams(location.search).has("embedded")) {
    new ResizeObserver(() => parent.postMessage({ type: "safeguard-tracker-height", height: document.documentElement.scrollHeight }, location.origin)).observe(document.body);
// Explain: Close the current block or callback. Connect error to its handler. Connect waiting to its handler.
}

// Report loading problems instead of claiming that a silent player is sounding.
$("#alarmSound").addEventListener("error", () => audioFailure($("#alarmSound").error));
$("#alarmSound").addEventListener("waiting", () => {
    // Explain: Set plain visible text on if (dropAlarmActive) $("#audioStatus"). Close the current block or callback. Connect playing to its handler.
    if (dropAlarmActive) $("#audioStatus").textContent = "Warning sound is buffering. The sound timer will resume with playback.";
});
$("#alarmSound").addEventListener("playing", () => {
    // Explain: Set plain visible text on if (dropAlarmActive) $("#audioStatus"). Close the current block or callback.
    if (dropAlarmActive) $("#audioStatus").textContent = "Warning sound is playing. Stop ends it early.";
});
