/* Lifeline — collapse warning prototype.
 *
 * What this file does and does not do:
 *   It reads the accelerometer and orientation sensors of the device.
 *   It needs two or more independent signals before it raises an alarm.
 *   It prepares a message for a person to send.
 *   It never sends anything, and it never calls emergency services.
 *
 * Every number that drives a decision is a named constant at the top,
 * so any member of the team can change one and explain the effect.
 */

/* ---------- settings ---------- */

const IMPACT_MS2 = 25;        /* about 2.5 g. Walking peaks near 15. */
const STILL_MS2 = 1.5;        /* how far from rest still counts as "not moving" */
const STILL_MS = 8000;        /* how long that stillness must last */
const COUNTDOWN_S = 20;       /* seconds to answer before the alert is prepared */
const DROP_ALARM_S = 10;      /* alarm length after a hard phone drop */
const ARM_DELAY_S = 5;        /* time to put the phone down after pressing Start */
const MIN_SIGNALS = 2;        /* one signal alone never raises an alarm */
const CONTACT_KEY = "pulseguard.contact.v1";

/* Each signal, what it is worth, and the plain words shown on screen.
   The weights add up to 100, so the total reads as a percentage. */
const SIGNALS = {
    impact: { weight: 30, text: "Sudden movement above 2.5 g" },
    orientation: { weight: 20, text: "Orientation changed more than 45 degrees" },
    stillness: { weight: 25, text: "No movement for 8 s after the event" },
    noReply: { weight: 15, text: "No answer during the countdown" },
    located: { weight: 10, text: "Position obtained" }
};

/* ---------- state ---------- */

const fired = {};             /* which signals have fired in this event */
let simulated = false;        /* true when the run came from the button */
let sensorsOn = false;
let impactAt = null;
let stillSince = null;
let lastTilt = { beta: null, gamma: null };
let timer = null;
let place = null;
let dropAlarmTimer = null;
let dropAlarmActive = false;
let armingTimer = null;

/* ---------- small helpers ---------- */

function $(selector) {
    return document.querySelector(selector);
}

function signalCount() {
    return Object.keys(fired).length;
}

function score() {
    let total = 0;
    Object.keys(fired).forEach(key => {
        total += SIGNALS[key].weight;
    });
    return total;
}

/* ---------- the signal board ---------- */

function fire(key) {
    if (fired[key])
        return;
    /* Each signal counts once per event, however many times it repeats. */

    fired[key] = true;
    if (key === "impact")
        startDropAlarm();
    drawSignals();
    check();
}

function startDropAlarm() {
    if (dropAlarmActive)
        return;

    dropAlarmActive = true;
    const panel = $("#dropAlarm");
    const audio = $("#alarmSound");
    let left = DROP_ALARM_S;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    $("#alarmCountdown").textContent = left;
    audio.currentTime = 0;
    audio.play().catch(() => {});

    dropAlarmTimer = setInterval(() => {
        left -= 1;
        $("#alarmCountdown").textContent = left;
        if (left <= 0)
            stopDropAlarm();
    }, 1000);
}

function stopDropAlarm() {
    if (!dropAlarmActive)
        return;

    clearInterval(dropAlarmTimer);
    dropAlarmTimer = null;
    dropAlarmActive = false;
    const audio = $("#alarmSound");
    audio.pause();
    audio.currentTime = 0;
    $("#dropAlarm").classList.remove("open");
    $("#dropAlarm").setAttribute("aria-hidden", "true");
    $("#careDialog").showModal();
}

function openNearbyCare() {
    const status = $("#careStatus");
    if (!navigator.geolocation) {
        status.textContent = "Location is unavailable on this device.";
        return;
    }

    status.textContent = "Checking location...";
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const query = encodeURIComponent("emergency medical services near " + lat + "," + lon);
        window.open("https://www.google.com/maps/search/?api=1&query=" + query, "_blank", "noopener");
        $("#careDialog").close();
    }, () => {
        status.textContent = "Allow location access to open the nearby-care map.";
    });
}

function clearSignals() {
    Object.keys(fired).forEach(key => delete fired[key]);
    impactAt = null;
    stillSince = null;
    drawSignals();
}

function drawSignals() {
    const list = $("#signalList");
    if (!list)
        return;

    list.innerHTML = "";
    Object.keys(SIGNALS).forEach(key => {
        const li = document.createElement("li");
        li.className = fired[key] ? "signal on" : "signal";
        li.textContent = (fired[key] ? "Yes — " : "No — ") + SIGNALS[key].text +
            " (" + SIGNALS[key].weight + " points)";
        list.appendChild(li);
        /* textContent, never innerHTML. Nothing here can become markup. */
    });

    $("#confidence").textContent = score() + " %";
    $("#signalTally").textContent = signalCount() + " of " + MIN_SIGNALS + " needed";
}

/* ---------- the escalation rule ---------- */

function check() {
    if (timer)
        return;
    /* A countdown is already running. */

    if (dropAlarmActive)
        return;
    /* Nearby-care options appear only after the ten-second alarm ends or is stopped. */

    if (!sensorsOn)
        return;

    if (signalCount() < MIN_SIGNALS)
        return;
    /* This is the false-alarm rule, and it is the point of the project.
       A dropped phone gives one signal. A person on the floor gives a
       sudden movement AND stillness, or a movement AND a tilt. */

    openAlert();
}

/* ---------- sensors ---------- */

function onMotion(ev) {
    const a = ev.accelerationIncludingGravity;
    if (!a || a.x === null)
        return;

    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    /* At rest this reads about 9.81, because gravity is included. */

    if (mag > IMPACT_MS2 && impactAt === null) {
        impactAt = Date.now();
        stillSince = null;
        fire("impact");
    }

    if (impactAt === null)
        return;
    /* Stillness only means something after an impact. A phone on a table
       is still all day. */

    if (Math.abs(mag - 9.81) < STILL_MS2) {
        if (stillSince === null)
            stillSince = Date.now();
        else if (Date.now() - stillSince > STILL_MS)
            fire("stillness");
    }
    else
        stillSince = null;
    /* Any real movement resets the clock, so a person who gets up again
       is never reported. */
}

function onOrientation(ev) {
    if (ev.beta === null)
        return;

    if (lastTilt.beta === null) {
        lastTilt.beta = ev.beta;
        lastTilt.gamma = ev.gamma;
        return;
    }

    const change = Math.abs(ev.beta - lastTilt.beta) + Math.abs(ev.gamma - lastTilt.gamma);
    if (impactAt !== null && change > 45)
        fire("orientation");

    lastTilt.beta = ev.beta;
    lastTilt.gamma = ev.gamma;
}

async function startSensors() {
    /* iOS gives motion data only after a request inside a real tap.
       Android and desktop Chrome need no request. */
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
        const answer = await DeviceMotionEvent.requestPermission();
        if (answer !== "granted") {
            setMode("Motion access refused. The simulation button still works.", true);
            return;
        }
    }

    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("deviceorientation", onOrientation);
    sensorsOn = true;
    simulated = false;
    setMode("Live sensors. Real accelerometer and orientation data from this device.", false);
    $("#monitorState").className = "monitor-state ready";
    $("#stateTitle").textContent = "Sensors on";
    $("#stateNote").textContent = "Keep this page open and the screen awake.";
}

function stopSensors() {
    window.removeEventListener("devicemotion", onMotion);
    window.removeEventListener("deviceorientation", onOrientation);
    sensorsOn = false;
    setMode("Sensors off. Nothing is being measured.", false);
    $("#monitorState").className = "monitor-state off";
    $("#stateTitle").textContent = "Sensors off";
    $("#stateNote").textContent = "Turn them on before you rely on this.";
    $("#armTrackerBtn").disabled = false;
    $("#armTrackerBtn").textContent = "Start tracker";
}

function armTracker() {
    if (sensorsOn) {
        stopSensors();
        return;
    }

    let left = ARM_DELAY_S;
    const button = $("#armTrackerBtn");
    button.disabled = true;
    button.textContent = "Arming in " + left + "s";
    setMode("Tracker arming. Put the phone where you want it monitored.", false);

    clearInterval(armingTimer);
    armingTimer = setInterval(() => {
        left -= 1;
        button.textContent = "Arming in " + left + "s";
        if (left <= 0) {
            clearInterval(armingTimer);
            armingTimer = null;
            startSensors().then(() => {
                button.disabled = false;
                button.textContent = sensorsOn ? "Stop tracker" : "Start tracker";
            });
        }
    }, 1000);
}

function setMode(text, bad) {
    const box = $("#modeBanner");
    box.className = bad ? "mode-banner bad" : "mode-banner";
    box.textContent = text;
}

/* ---------- position ---------- */

function askPlace() {
    const status = $("#gpsStatus");

    if (!navigator.geolocation) {
        status.textContent = "Unavailable";
        return;
    }

    status.textContent = "Checking…";
    navigator.geolocation.getCurrentPosition(p => {
        place = {
            lat: p.coords.latitude,
            lon: p.coords.longitude,
            acc: Math.round(p.coords.accuracy)
        };
        /* The browser reports accuracy in metres. The earlier version
           printed "ft" next to a metre value, which was simply wrong. */

        status.textContent = "±" + place.acc + " m";
        $("#locationText").textContent = "Position ready: " +
            place.lat.toFixed(4) + ", " + place.lon.toFixed(4);
        $("#lastCheck").textContent = new Date().toLocaleTimeString([],
            { hour: "numeric", minute: "2-digit" });
        fire("located");
    }, () => {
        status.textContent = "Permission denied";
        $("#locationText").textContent = "Allow location access to include a position in the alert.";
    });
}

/* ---------- countdown ---------- */

function openAlert() {
    const panel = $("#alertPanel");
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    $("#preparedBox").innerHTML = "";
    $("#alertTitle").textContent = "Are you okay?";

    let left = COUNTDOWN_S;
    $("#countdown").textContent = left;

    clearInterval(timer);
    timer = setInterval(() => {
        left -= 1;
        $("#countdown").textContent = left;
        if (left <= 0) {
            clearInterval(timer);
            timer = null;
            fire("noReply");
            prepareAlert();
        }
    }, 1000);
}

function closeAlert() {
    clearInterval(timer);
    timer = null;
    const panel = $("#alertPanel");
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    clearSignals();
}

/* ---------- the prepared message ---------- */

function contact() {
    return JSON.parse(localStorage.getItem(CONTACT_KEY) || "null");
}

function prepareAlert() {
    clearInterval(timer);
    timer = null;

    const person = contact();
    const where = place
        ? place.lat.toFixed(5) + ", " + place.lon.toFixed(5) + " (accuracy " + place.acc + " m)"
        : "no position available";
    const reasons = Object.keys(fired).map(key => SIGNALS[key].text).join("; ");

    const message = "Lifeline: no answer from this phone after a possible collapse. " +
        "Position: " + where + ". Signals: " + reasons + ". Confidence: " + score() + " %." +
        (simulated ? " THIS IS A DEMONSTRATION, not a real emergency." : "");

    const box = $("#preparedBox");
    box.innerHTML = "";
    $("#alertTitle").textContent = "Alert ready to send";

    const note = document.createElement("p");
    note.className = "microcopy";
    note.textContent = "Nothing has been sent. This prototype writes the message and opens " +
        "your own messaging app. A person presses send.";
    box.appendChild(note);

    const text = document.createElement("div");
    text.className = "prepared-text";
    text.textContent = message;
    box.appendChild(text);

    if (person) {
        const link = document.createElement("a");
        link.className = "button danger";
        link.href = "sms:" + person.phone + "?body=" + encodeURIComponent(message);
        link.textContent = "Open a message to " + person.name;
        box.appendChild(link);
        /* The contact field now changes what the demo does. Before this,
           it was typed in and never read. */
    }
    else {
        const warn = document.createElement("p");
        warn.className = "microcopy";
        warn.textContent = "No contact saved, so there is nobody to message. Save one above.";
        box.appendChild(warn);
    }
}

/* ---------- wiring ---------- */

$("#locationBtn").addEventListener("click", askPlace);
$("#armTrackerBtn").addEventListener("click", armTracker);

$("#saveContact").addEventListener("click", () => {
    const name = $("#contactName").value.trim();
    const phone = $("#contactPhone").value.trim();

    if (!name || !phone) {
        $("#contactNote").textContent = "Give a name and a number.";
        return;
    }

    localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: name, phone: phone }));
    $("#contactNote").textContent = "Saved in this browser only: " + name + ".";
});

$("#okayBtn").addEventListener("click", closeAlert);
$("#notifyBtn").addEventListener("click", prepareAlert);
$("#stopAlarmBtn").addEventListener("click", stopDropAlarm);
$("#openCareBtn").addEventListener("click", openNearbyCare);
$("#closeCareBtn").addEventListener("click", () => $("#careDialog").close());

/* ---------- start ---------- */

const saved = contact();
if (saved) {
    $("#contactName").value = saved.name;
    $("#contactPhone").value = saved.phone;
    $("#contactNote").textContent = "Loaded from this browser: " + saved.name + ".";
}

drawSignals();
setMode("Sensors off. Press the switch to read real motion, or run the simulation.", false);
