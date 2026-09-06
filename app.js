/* Lifeline — collapse warning prototype.
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
// Explain: Keep COUNTDOWN_S as 20. Keep DROP_ALARM_S as 10. Keep ARM_DELAY_S as 5.
const COUNTDOWN_S = 20;       /* seconds to answer before the alert is prepared */
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
let googleMapsPromise = null;
// Explain: Initialize alertPhase as "idle". Define $ with inputs selector. Find the HTML element that this code needs to read or update.
let alertPhase = "idle";

/* ---------- small helpers ---------- */

function $(selector) {
    return document.querySelector(selector);
// Explain: Close the current block or callback. Define signalCount with inputs none. Keep only items that satisfy the callback condition.
}

function signalCount() {
    return ["impact", "orientation", "stillness"].filter(key => fired[key]).length;
// Explain: Close the current block or callback. Define score with inputs none. Initialize total as 0.
}

function score() {
    let total = 0;
    // Explain: Run the callback for each item in the collection. Update total using SIGNALS[key].weight. Close the current block or callback.
    Object.keys(fired).forEach(key => {
        total += SIGNALS[key].weight;
    });
    // Explain: Return total. Close the current block or callback. Define fire with inputs key.
    return total;
}

/* ---------- the signal board ---------- */

function fire(key) {
    // Explain: Check fired[key]. Return from this function. Set fired[key] using true.
    if (fired[key])
        return;
    /* Each signal counts once per event, however many times it repeats. */

    fired[key] = true;
    // Explain: Check key === "impact". Call startDropAlarm with the values shown here. Call drawSignals with the values shown here.
    if (key === "impact")
        startDropAlarm();
    drawSignals();
    // Explain: Call check with the values shown here. Close the current block or callback. Define startDropAlarm with inputs none.
    check();
}

function startDropAlarm() {
    // Explain: Check dropAlarmActive. Return from this function. Set dropAlarmActive using true.
    if (dropAlarmActive)
        return;

    dropAlarmActive = true;
    // Explain: Keep panel as $("#dropAlarm"). Keep audio as $("#alarmSound"). Initialize left as DROP_ALARM_S.
    const panel = $("#dropAlarm");
    const audio = $("#alarmSound");
    let left = DROP_ALARM_S;
    // Explain: Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state. Set plain visible text on $("#alarmCountdown").
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    $("#alarmCountdown").textContent = left;
    // Explain: Set the playback position within the audio recording. Request audio playback and handle its asynchronous result. Set plain visible text on $("#audioStatus").
    audio.currentTime = 0;
    audio.play().then(() => {
        $("#audioStatus").textContent = "Warning audio is playing.";
    // Explain: Continue the surrounding expression with }).catch(() => {. Set plain visible text on $("#audioStatus"). Close the current block or callback.
    }).catch(() => {
        $("#audioStatus").textContent = "Audio was blocked. Press Play warning sound.";
    });
    // Explain: Call askPlace with the values shown here. Schedule repeated work at the interval specified by this call. Update left using 1.
    askPlace();

    dropAlarmTimer = setInterval(() => {
        left -= 1;
        // Explain: Set plain visible text on $("#alarmCountdown"). Check left <= 0. Call stopDropAlarm with the values shown here.
        $("#alarmCountdown").textContent = left;
        if (left <= 0)
            stopDropAlarm();
    // Explain: Continue the surrounding expression with }, 1000);. Close the current block or callback. Define stopDropAlarm with inputs none.
    }, 1000);
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
    // Explain: Set an element attribute, including its accessible or visible state. Open the dialog as a modal prompt. Close the current block or callback.
    $("#dropAlarm").setAttribute("aria-hidden", "true");
    if (!$("#careDialog").open) $("#careDialog").showModal();
}

// Explain: Define openNearbyCare with inputs none. Check !place || Date.now() - place.at > 60000. Set plain visible text on $("#careStatus").
function openNearbyCare() {
    if (!place || Date.now() - place.at > 60000) {
        $("#careStatus").textContent = "Refresh your location below before opening nearby care.";
        // Explain: Call askPlace with the values shown here. Return from this function. Close the current block or callback.
        askPlace();
        return;
    }
    // Explain: Encode text so it can be safely included in a URL component. Open the requested destination in a separate browsing context. Close the dialog.
    const query = encodeURIComponent("emergency medical services near " + place.lat + "," + place.lon);
    window.open("https://www.google.com/maps/search/?api=1&query=" + query, "_blank", "noopener");
    $("#careDialog").close();
// Explain: Close the current block or callback. Define clearSignals with inputs none. Run the callback for each item in the collection.
}

function metresBetween(a, b) {
    const rad = value => value * Math.PI / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function mapsSearchLink(term) {
    const query = encodeURIComponent(term + " near " + place.lat + "," + place.lon);
    return "https://www.google.com/maps/search/?api=1&query=" + query;
}

function renderPlacesFallback(message) {
    $("#placesStatus").textContent = message;
    $("#placesList").replaceChildren();
    [["AEDs", "AED"], ["Hospitals", "hospital emergency room"]].forEach(([label, term]) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = mapsSearchLink(term);
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "Search nearby " + label + " in Google Maps";
        item.append(link);
        $("#placesList").append(item);
    });
}

function loadGoogleMaps() {
    if (window.google?.maps?.places) return Promise.resolve();
    if (googleMapsPromise) return googleMapsPromise;
    const key = window.PULSEGUARD_GOOGLE_MAPS_KEY;
    if (!key || key === "YOUR_BROWSER_RESTRICTED_KEY") return Promise.reject(new Error("missing-key"));
    googleMapsPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) + "&libraries=places&v=weekly";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("load-failed"));
        document.head.append(script);
    });
    return googleMapsPromise;
}

function nearbySearch(service, request) {
    return new Promise(resolve => {
        service.nearbySearch(request, (results, status) => {
            resolve(status === google.maps.places.PlacesServiceStatus.OK ? results : []);
        });
    });
}

async function listNearestCare() {
    if (!place) {
        $("#placesStatus").textContent = "Share your location first.";
        askPlace();
        return;
    }
    $("#placesStatus").textContent = "Checking Google Maps…";
    try {
        await loadGoogleMaps();
        const origin = new google.maps.LatLng(place.lat, place.lon);
        const service = new google.maps.places.PlacesService($("#placesService"));
        const [hospitals, aeds] = await Promise.all([
            nearbySearch(service, { location: origin, radius: 10000, type: "hospital" }),
            nearbySearch(service, { location: origin, radius: 10000, keyword: "AED defibrillator" })
        ]);
        const unique = new Map();
        hospitals.forEach(result => unique.set(result.place_id, { ...result, kind: "Hospital" }));
        aeds.forEach(result => unique.set(result.place_id, { ...result, kind: "AED" }));
        const results = [...unique.values()].map(result => ({
            result,
            distance: metresBetween(place, { lat: result.geometry.location.lat(), lon: result.geometry.location.lng() })
        })).sort((a, b) => a.distance - b.distance).slice(0, 8);
        $("#placesList").replaceChildren();
        results.forEach(({ result, distance }) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(result.geometry.location.lat() + "," + result.geometry.location.lng()) + "&destination_place_id=" + encodeURIComponent(result.place_id);
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = result.name;
            const detail = document.createElement("small");
            detail.textContent = result.kind + " · " + (distance < 1000 ? Math.round(distance) + " m" : (distance / 1000).toFixed(1) + " km") + (result.vicinity ? " · " + result.vicinity : "");
            item.append(link, detail);
            $("#placesList").append(item);
        });
        $("#placesStatus").textContent = results.length ? "Nearest Google Maps results, closest first." : "No nearby results were returned.";
    } catch (error) {
        renderPlacesFallback("Google Places is not configured, so use these live Google Maps searches.");
    }
}

function clearSignals() {
    Object.keys(fired).forEach(key => delete fired[key]);
    // Explain: Set impactAt using null. Set stillSince using null. Set lastTilt using { beta: null, gamma: null }.
    impactAt = null;
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

    // Explain: Check signalCount() < MIN_SIGNALS. Return from this function. Call openAlert with the values shown here.
    if (signalCount() < MIN_SIGNALS)
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
    // Explain: Set plain visible text on $("#stateNote"). Call setMode with the values shown here. Take the square root to calculate a magnitude or distance term.
    $("#stateNote").textContent = "Receiving motion readings. Keep this page open.";
    setMode("Motion readings received. Drop detection is active.", false);

    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    /* At rest this reads about 9.81, because gravity is included. */

    // Explain: Check mag > IMPACT_MS2 && impactAt === null. Set impactAt using Date.now(). Set stillSince using null.
    if (mag > IMPACT_MS2 && impactAt === null) {
        impactAt = Date.now();
        stillSince = null;
        // Explain: Call fire with the values shown here. Close the current block or callback. Check impactAt === null.
        fire("impact");
    }

    if (impactAt === null)
        // Explain: Return from this function. Measure an absolute difference without a negative sign. Check stillSince === null.
        return;
    /* Stillness only means something after an impact. A phone on a table
       is still all day. */

    if (Math.abs(mag - 9.81) < STILL_MS2) {
        if (stillSince === null)
            // Explain: Set stillSince using Date.now(). Handle the alternative case when the earlier condition fails. Call fire with the values shown here.
            stillSince = Date.now();
        else if (Date.now() - stillSince > STILL_MS)
            fire("stillness");
    // Explain: Close the current block or callback. Handle the alternative case when the earlier condition fails. Set stillSince using null.
    }
    else
        stillSince = null;
    /* Movement resets the stillness timer; it cannot establish a person's condition. */
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
    // Explain: Set plain visible text on $("#stateNote"). Call $ with the values shown here. Set plain visible text on $("#armTrackerBtn").
    $("#stateNote").textContent = "Press Start tracker to begin.";
    $("#armTrackerBtn").disabled = false;
    $("#armTrackerBtn").textContent = "Start tracker";
// Explain: Close the current block or callback. Define armTracker with inputs none. Check sensorsOn || armingTimer) { stopSensors(); return; }.
}

async function armTracker() {
    if (sensorsOn || armingTimer) { stopSensors(); return; }
    // Explain: Check !window.isSecureContext. Call setMode with the values shown here. Return from this function.
    if (!window.isSecureContext) {
        setMode("Open this page over HTTPS or localhost to use motion and location.", true);
        return;
    // Explain: Close the current block or callback. Keep run as ++session. Keep button as $("#armTrackerBtn").
    }
    const run = ++session;
    const button = $("#armTrackerBtn");
    // Explain: Set button.disabled using true. Set plain visible text on button. Keep permissions as [].
    button.disabled = true;
    button.textContent = "Requesting access…";
    // Invoke permission APIs directly in the click gesture, before the arming timer.
    const permissions = [];
    // Explain: Run operations whose errors are handled below. Check typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.re. Request browser permission to receive sensor measurements.
    try {
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function")
            permissions.push(DeviceMotionEvent.requestPermission());
        // Explain: Check typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientati. Request browser permission to receive sensor measurements. Keep audio as $("#alarmSound").
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function")
            permissions.push(DeviceOrientationEvent.requestPermission());
        // A muted play during the tap prepares the selected MP3 without sounding the alarm.
        const audio = $("#alarmSound");
        // Explain: Set audio.muted using true. Request audio playback and handle its asynchronous result. Pause the audio playback.
        audio.muted = true;
        audio.play().then(() => {
            if (!dropAlarmActive) { audio.pause(); audio.currentTime = 0; }
            // Explain: Set audio.muted using false. Continue the surrounding expression with }).catch(() => { audio.muted = false; });. Keep answers as await Promise.all(permissions).
            audio.muted = false;
        }).catch(() => { audio.muted = false; });
        const answers = await Promise.all(permissions);
        // Explain: Check run !== session) return;. Check answers.some(answer => answer !== "granted")) throw new Error("Motion p. Call clearSignals with the values shown here.
        if (run !== session) return;
        if (answers.some(answer => answer !== "granted")) throw new Error("Motion permission was not granted.");
        clearSignals();
        // Explain: Set alertPhase using "idle". Call startSensors with the values shown here. Call startLocationWatch with the values shown here.
        alertPhase = "idle";
        startSensors();
        startLocationWatch();
        // Explain: Set armedAt using Date.now() + ARM_DELAY_S * 1000. Set button.disabled using false. Set plain visible text on button.
        armedAt = Date.now() + ARM_DELAY_S * 1000;
        button.disabled = false;
        button.textContent = "Cancel arming";
        // Explain: Set plain visible text on $("#stateTitle"). Keep update as () => {. Keep left as Math.max(0, Math.ceil((armedAt - Date.now()) / 1000)).
        $("#stateTitle").textContent = "Arming";
        const update = () => {
            const left = Math.max(0, Math.ceil((armedAt - Date.now()) / 1000));
            // Explain: Call setMode with the values shown here. Check left === 0. Cancel scheduled timer work.
            setMode("Tracker arming in " + left + "s. Place the device now.", false);
            if (left === 0) {
                clearInterval(armingTimer); armingTimer = null;
                // Explain: Set plain visible text on button. Set plain visible text on $("#stateTitle"). Set plain visible text on $("#stateNote").
                button.textContent = "Stop tracker";
                $("#stateTitle").textContent = "Waiting for motion readings";
                $("#stateNote").textContent = "Detection becomes active when valid sensor data arrives.";
                // Explain: Call setMode with the values shown here. Close the current block or callback.
                setMode("Armed. Waiting for a motion reading.", false);
            }
        };
        // Explain: Call update with the values shown here. Schedule repeated work at the interval specified by this call. Handle an error from the preceding operation.
        update();
        armingTimer = setInterval(update, 100);
    } catch (error) {
        // Explain: Check run !== session) return;. Call stopSensors with the values shown here. Call setMode with the values shown here.
        if (run !== session) return;
        stopSensors();
        setMode(error.message || "Motion access could not be started.", true);
    // Explain: Close the current block or callback. Define setMode with inputs text, bad.
    }
}

function setMode(text, bad) {
    // Explain: Keep box as $("#modeBanner"). Change the element classes that control its displayed state. Set plain visible text on box.
    const box = $("#modeBanner");
    box.className = bad ? "mode-banner bad" : "mode-banner";
    box.textContent = text;
// Explain: Close the current block or callback. Define showPosition with inputs p. Keep c as p.coords.
}

/* ---------- position ---------- */

function showPosition(p) {
    const c = p.coords;
    // Explain: Check ![c.latitude, c.longitude, c.accuracy].every(Number.isFinite) || c.accu. Measure an absolute difference without a negative sign. Check Date.now() - p.timestamp > 60000 || p.timestamp > Date.now() + 5000) re.
    if (![c.latitude, c.longitude, c.accuracy].every(Number.isFinite) || c.accuracy < 0 ||
        Math.abs(c.latitude) > 90 || Math.abs(c.longitude) > 180 || !Number.isFinite(p.timestamp)) return;
    if (Date.now() - p.timestamp > 60000 || p.timestamp > Date.now() + 5000) return;
    // Explain: Check place && p.timestamp < place.at) return;. Set place using { lat: c.latitude, lon: c.longitude, acc: Math.ceil(c.acc. Set fired.located using true.
    if (place && p.timestamp < place.at) return;
    place = { lat: c.latitude, lon: c.longitude, acc: Math.ceil(c.accuracy), at: p.timestamp };
    // Keep location visible as context without counting it as corroborating motion.
    fired.located = true;
    // Explain: Call drawSignals with the values shown here. Set plain visible text on $("#gpsStatus"). Set plain visible text on $("#locationText").
    drawSignals();
    $("#gpsStatus").textContent = "±" + place.acc + " m";
    $("#locationText").textContent = "Latitude " + place.lat.toFixed(6) + ", longitude " +
        // Explain: Call place.lon.toFixed with the values shown here. Set plain visible text on $("#lastCheck"). Set plain visible text on $("#mapStatus").
        place.lon.toFixed(6) + ". Reported accuracy ±" + place.acc + " m.";
    $("#lastCheck").textContent = new Date(place.at).toLocaleTimeString();
    $("#mapStatus").textContent = "Location updated " + new Date(place.at).toLocaleTimeString() +
        // Explain: Continue the text or argument value used by the surrounding expression. Call $ with the values shown here. Continue the surrounding expression with place.lat + "," + place.lon + "&zoom=17&basemap=satellite";.
        ". The circle shows the browser-reported accuracy radius. Satellite imagery is not live.";
    $("#satelliteLink").href = "https://www.google.com/maps/@?api=1&map_action=map&center=" +
        place.lat + "," + place.lon + "&zoom=17&basemap=satellite";
    // Explain: Call $ with the values shown here. Cancel scheduled timer work. Keep at as place.at.
    $("#satelliteLink").hidden = false;
    clearTimeout(locationExpiry);
    const at = place.at;
    // Explain: Schedule delayed work once the timeout expires. Check place && place.at === at. Set plain visible text on $("#gpsStatus").
    locationExpiry = setTimeout(() => {
        if (place && place.at === at) {
            $("#gpsStatus").textContent = "Last fix ±" + place.acc + " m";
            // Explain: Set plain visible text on $("#mapStatus"). Close the current block or callback. Continue the surrounding expression with }, Math.max(0, 60000 - (Date.now() - at)));.
            $("#mapStatus").textContent = "Last known position is over a minute old. Refresh location for a new fix.";
        }
    }, Math.max(0, 60000 - (Date.now() - at)));
    // Explain: Check typeof L !== "undefined". Check !satelliteMap. Initialize the map in the named HTML container.
    if (typeof L !== "undefined") {
        if (!satelliteMap) {
            satelliteMap = L.map("satelliteMap").setView([place.lat, place.lon], 15);
            // Explain: Create the map tile layer from the specified image service. Set the maxZoom field to 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics. Continue the surrounding expression with }).on("tileerror", () => {.
            L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community"
            }).on("tileerror", () => {
                // Explain: Set plain visible text on $("#mapStatus"). Continue the surrounding expression with }).addTo(satelliteMap);. Close the current block or callback.
                $("#mapStatus").textContent = "Satellite tiles could not load. Coordinates remain available; use Open satellite map.";
            }).addTo(satelliteMap);
        }
        // Explain: Keep point as [place.lat, place.lon]. Check locationMarker. Call locationMarker.setLatLng with the values shown here.
        const point = [place.lat, place.lon];
        if (locationMarker) {
            locationMarker.setLatLng(point);
            // Explain: Call accuracyCircle.setLatLng with the values shown here. Continue the surrounding expression with } else {. Create a map circle or marker for the given coordinates.
            accuracyCircle.setLatLng(point).setRadius(place.acc);
        } else {
            locationMarker = L.circleMarker(point, { radius: 7, color: "white", fillColor: "#3366cc", fillOpacity: 1 }).addTo(satelliteMap);
            // Explain: Create a map circle or marker for the given coordinates. Close the current block or callback. Call satelliteMap.invalidateSize with the values shown here.
            accuracyCircle = L.circle(point, { radius: place.acc, color: "#69b7ff", fillOpacity: 0.12 }).addTo(satelliteMap);
        }
        satelliteMap.invalidateSize();
        // Explain: Move and scale the map to the selected position or bounds. Continue the surrounding expression with } else {. Set plain visible text on $("#mapStatus").
        satelliteMap.fitBounds(accuracyCircle.getBounds(), { maxZoom: 17, padding: [25, 25] });
    } else {
        $("#mapStatus").textContent += " Embedded map is unavailable. Use Open satellite map.";
    // Explain: Close the current block or callback. Define locationError with inputs error.
    }
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
    // Explain: Watch device location and pass new fixes to the success callback. Check run === session && sensorsOn) showPosition(p);. Continue the surrounding expression with }, error => { if (run === session && sensorsOn) locationError(error.
    locationWatch = navigator.geolocation.watchPosition(p => {
        if (run === session && sensorsOn) showPosition(p);
    }, error => { if (run === session && sensorsOn) locationError(error); }, LOCATION_OPTIONS);
// Explain: Close the current block or callback. Define askPlace with inputs none. Check !navigator.geolocation) { locationError({ code: 2 }); return; }.
}

function askPlace() {
    if (!navigator.geolocation) { locationError({ code: 2 }); return; }
    // Explain: Keep request as ++locationRequest. Set plain visible text on $("#gpsStatus"). Request one device location fix with success and failure callbacks.
    const request = ++locationRequest;
    $("#gpsStatus").textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(p => {
        // Explain: Check request === locationRequest) showPosition(p);. Continue the surrounding expression with }, error => { if (request === locationRequest) locationError(error). Close the current block or callback.
        if (request === locationRequest) showPosition(p);
    }, error => { if (request === locationRequest) locationError(error); }, LOCATION_OPTIONS);
}

/* ---------- countdown ---------- */

// Explain: Define openAlert with inputs none. Set alertPhase using "countdown". Keep panel as $("#alertPanel").
function openAlert() {
    alertPhase = "countdown";
    const panel = $("#alertPanel");
    // Explain: Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state. Clear the previous rendered contents before rebuilding them.
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    $("#preparedBox").innerHTML = "";
    // Explain: Set plain visible text on $("#alertTitle"). Initialize left as COUNTDOWN_S. Set plain visible text on $("#countdown").
    $("#alertTitle").textContent = "Are you okay?";

    let left = COUNTDOWN_S;
    $("#countdown").textContent = left;

    // Explain: Cancel scheduled timer work. Schedule repeated work at the interval specified by this call. Update left using 1.
    clearInterval(timer);
    timer = setInterval(() => {
        left -= 1;
        // Explain: Set plain visible text on $("#countdown"). Check left <= 0. Cancel scheduled timer work.
        $("#countdown").textContent = left;
        if (left <= 0) {
            clearInterval(timer);
            // Explain: Set timer using null. Set fired.noReply using true. Call drawSignals with the values shown here.
            timer = null;
            fired.noReply = true;
            drawSignals();
            // Explain: Call prepareAlert with the values shown here. Close the current block or callback. Continue the surrounding expression with }, 1000);.
            prepareAlert();
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
    // Explain: Cancel scheduled timer work. Set timer using null. Keep person as contact().
    clearInterval(timer);
    timer = null;

    const person = contact();
    // Explain: Keep where as place && Date.now() - place.at <= 60000. Continue the conditional or combined expression from the previous line.
    const where = place && Date.now() - place.at <= 60000
        ? place.lat.toFixed(5) + ", " + place.lon.toFixed(5) + " (accuracy " + place.acc + " m)"
        : "no recent position available";
    // Explain: Transform each collection item into an output value. Keep message as "Lifeline: no answer from this phone after a possible collapse. Continue the text or argument value used by the surrounding expression.
    const reasons = Object.keys(fired).map(key => SIGNALS[key].text).join("; ");

    const message = "Lifeline: no answer from this phone after a possible collapse. " +
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

$("#saveContact").addEventListener("click", () => {
    // Explain: Keep name as $("#contactName").value.trim(). Keep phone as $("#contactPhone").value.trim(). Check !name || !phone.
    const name = $("#contactName").value.trim();
    const phone = $("#contactPhone").value.trim();

    if (!name || !phone) {
        // Explain: Set plain visible text on $("#contactNote"). Return from this function. Close the current block or callback.
        $("#contactNote").textContent = "Give a name and a number.";
        return;
    }

    // Explain: Save a serialized value in this browser for later visits. Set plain visible text on $("#contactNote"). Close the current block or callback.
    localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: name, phone: phone }));
    $("#contactNote").textContent = "Saved in this browser only: " + name + ".";
});

// Explain: Connect click to its handler.
$("#okayBtn").addEventListener("click", closeAlert);
$("#notifyBtn").addEventListener("click", prepareAlert);
$("#stopAlarmBtn").addEventListener("click", stopDropAlarm);
// Explain: Connect click to its handler. Connect close to its handler.
$("#openCareBtn").addEventListener("click", openNearbyCare);
$("#closeCareBtn").addEventListener("click", () => $("#careDialog").close());
$("#careDialog").addEventListener("close", () => {
    // Explain: Check signalCount() >= MIN_SIGNALS) check();. Handle the alternative case when the earlier condition fails. Close the current block or callback.
    if (signalCount() >= MIN_SIGNALS) check();
    else clearSignals();
});
// Explain: Connect click to its handler. Check !dropAlarmActive) return;. Request audio playback and handle its asynchronous result.
$("#retryAudioBtn").addEventListener("click", () => {
    if (!dropAlarmActive) return;
    $("#alarmSound").play().then(() => {
        // Explain: Set plain visible text on $("#audioStatus"). Set plain visible text on }).catch(() => { $("#audioStatus"). Close the current block or callback.
        $("#audioStatus").textContent = "Warning audio is playing.";
    }).catch(() => { $("#audioStatus").textContent = "Unable to play warning audio. Check device sound settings."; });
});
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
