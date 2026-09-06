# PulseGuard

A collapse warning prototype for the King County area, with public health
context. Plain HTML, CSS and JavaScript. No build step, no packages, no
server.

## What it is

A phone watches for a sudden movement followed by stillness. If both
happen, it asks whether you are all right. If nobody answers in 20 s, it
writes a message with your position and your reasons, and opens your own
messaging app so a person can send it.

## What it is not

- Not a medical device, and not tested on patients.
- It does not detect an overdose. It detects movement, then stillness.
- It does not sense breathing, pulse or oxygen.
- It does not call 911 and it does not notify any responder network.
- It has no account system. Nothing is uploaded, because there is no
  server.
- The dashboard figures and the risk zones are illustrative data written
  for the demonstration. No number on this site is a measurement.

## Run it

    python3 -m http.server 8000

Then open `http://localhost:8000`.

A local server is needed, not a `file://` page, because the browser
blocks the position, the motion sensors and the sound file otherwise.
Motion sensors need a phone; a laptop shows the simulation instead.

## One site, five categories

Every page shares one dark theme (`site.css`) and one navigation
(`nav.js`). The site map lives in the `SITE` list at the top of `nav.js`,
so a page added there appears in the top bar and the footer of the whole
site at once. A page marks itself with `<body data-page="...">` and its
link is highlighted.

| Category | Page | What it does |
| --- | --- | --- |
| Overview | `index.html` | Dashboard, and a card for every other part |
| Detect | `fall-detection.html` | The detection demonstration. The core of the project |
| Context | `risk-zones.html` | Response calls added up by 500 m zone |
| Support tools | `safewalk.html` | A timed check-in for a walk home |
| Support tools | `shelters.html` | Shelters and defibrillators, sorted by distance |
| Support tools | `hazard.html` | Photo reports that merge when they describe the same fault |
| About | `about.html` | Method, sources and limits |

The three support tools carry an orange "experiment" label in the
category grid and a red banner at the top of the page, written by
`nav.js` from the `TRIAL` list. They are in the site to show earlier
work, and they are not part of the pitch. Say that on stage before a
judge asks.

### Supporting files

| File | What it does |
| --- | --- |
| `site.css` | The one theme: colours, cards, nav, footer, forms |
| `nav.js` | The site map, the top bar, the footer, the experiment banner |
| `styles.css` | Dashboard-only pieces, loaded after `site.css` |
| `script.js` | Fills the city table and the headline figures |
| `app.js` | Sensors, the two-signal rule, the countdown, the message |
| `sound.js` | Click sound, with a switch that is remembered |

## How the detection works

| Signal | Points | Test |
| --- | --- | --- |
| Sudden movement | 30 | acceleration above 25 m/s², about 2.5 g |
| Orientation change | 20 | more than 45 degrees of tilt after the impact |
| Stillness | 25 | within 1.5 m/s² of rest for 8 s |
| No answer | 15 | the 20 s countdown ends |
| Position obtained | 10 | the browser gives a position |

Two signals are needed before a countdown starts. One signal alone is a
dropped phone. This rule is the answer to the largest real problem with
fall detection, which is false alarms.

All thresholds are named constants at the top of `app.js`.

## Privacy

- The contact stays in browser storage under `pulseguard.contact.v1`.
- The position is read on request and never stored.
- Risk zones are 500 m across. A zone with fewer than five calls is
  removed from the map and the table, so no single household can be
  identified.

## Data sources

Not yet connected. Planned:

- King County overdose dashboard — city rates.
- Public Health, Seattle and King County — naloxone distribution.
- King County Medical Examiner and EMS records — response calls.

Write the retrieval date and the exact table name here before any figure
is presented as fact. Until then, every figure carries an "illustrative"
label on screen.

## Known limits and bugs

- Thresholds were set by hand and tested on [device names] only.
- iOS needs a tap before it gives motion data; the switch does that.
- A phone that sleeps stops the sensors. Keep the screen awake.
- The CSV reader handles quoted fields but not embedded line breaks.
- The support tools keep their data in the browser of one device, so a
  second laptop sees only the starter data.
- There is no login. A mock sign-in was left out on purpose, because a
  fake one that looks real is worse than none.

## Current Safeguard tracker

The homepage embeds fall-detection.html without replacing the dashboard design.
The tracker adapts the supplied mobile screen: possible impact, settling,
recovery, eight seconds of stillness, a five-second check-in, then ten seconds
of warning-alarm.mp3 playback. The marker popup and Test alarm button offer
the same check-in as an explicitly labeled demonstration. Stop cancels early.
The mobile config/settings file was not supplied; browser defaults are named
at the top of app.js. Accessible motion hardware is required for detection.

Location uses watchPosition and shows accuracy and freshness. The nearest five
mapped AEDs within 10 km come from OpenStreetMap via Overpass, ranked by
straight-line distance. Fewer results stay fewer; availability is not verified.
No Google API key is needed. Coordinates are sent to the map/AED providers.
Use HTTPS or localhost, allow location, and keep the page open. Stop location
and tracker ends the watch and motion session.

AED results now match each coordinate to a containing OpenStreetMap building outline to show its mapped name and address. Indoor directions remain separate. Nearby businesses are never assumed to host an AED. Unnamed or unsupported building geometry falls back to the AED record, address or coordinates. Building names are cached in memory for ten minutes; failed lookups preserve the AED results. Google Maps directions still target the exact AED coordinates. Building hours are not substituted for AED access hours.
