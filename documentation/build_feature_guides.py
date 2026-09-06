# Explain: Record a presentation value or source-reference entry. Import pathlib import Path for document generation. Import hashlib, json, re, shutil, subprocess for document generation.
"""Build both feature guides with exact source lines and a 100 second talk."""
from pathlib import Path
import hashlib, json, re, shutil, subprocess
# Explain: Import collections import OrderedDict for document generation. Import docx import Document for document generation. Import docx.shared import Inches, Pt, RGBColor for document generation.
from collections import OrderedDict
from docx import Document
from docx.shared import Inches, Pt, RGBColor
# Explain: Import docx.oxml import OxmlElement for document generation. Import docx.oxml.ns import qn for document generation. Import docx.opc.constants import RELATIONSHIP_TYPE as RT for document generation.
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT

# Explain: Assign SRC from the value shown here. Assign ROOT from the value shown here. Assign REV from the value shown here.
SRC = Path(__file__).resolve().parents[1]
ROOT = SRC.parent
REV = subprocess.check_output(['git', '-C', str(SRC), 'rev-parse', 'HEAD'], text=True).strip()
# Explain: Assign FEATURES from the value shown here. Assign SECTION from the value shown here. Define the helper section.
FEATURES = []
SECTION = ''
def section(name):
    # Explain: Apply global SECTION in the document-building sequence. Assign SECTION from the value shown here. Define the helper feature.
    global SECTION
    SECTION = name
def feature(title, refs, meaning, mission):
    # Explain: Assign FEATURES.append(dict(section from the value shown here. Define the helper ref. Assign lines from the value shown here.
    FEATURES.append(dict(section=SECTION, title=title, refs=refs, meaning=meaning, mission=mission))
def ref(path, needle, occurrence=0):
    lines=(SRC/path).read_text(encoding='utf-8').splitlines()
    # Explain: Assign hits from the value shown here. Run the following block when occurrence == 0. Run the following block when len(hits)!=1: raise ValueError((path,needle,hits)).
    hits=[(i,s) for i,s in enumerate(lines,1) if needle in s and 'Explain:' not in s]
    if occurrence == 0:
        if len(hits)!=1: raise ValueError((path,needle,hits))
        # Explain: Assign number,code from the value shown here. Apply else: in the document-building sequence.
        number,code=hits[0]
    else:
        number,code=hits[occurrence-1]
    # Explain: Return dict(file=path,line=number,code=code,sha256=hashlib.sha256((SRC/path).re... to the caller. Apply section('Shared appearance and accessibility') in the document-building sequence. Apply feature('Teal navy and charcoal page background', [('site.css','--page-background:... in the document-building sequence.
    return dict(file=path,line=number,code=code,sha256=hashlib.sha256((SRC/path).read_bytes()).hexdigest())

section('Shared appearance and accessibility')
feature('Teal navy and charcoal page background', [('site.css','--page-background: radial-gradient'),('site.css','body { background: var(--page-background);'),('styles.css','  background: var(--page-background);')], 'The gradient variable defines the colors. The body rules apply it across pages and the homepage. The older black variable in styles.css is not the current body background.', 'A consistent dark background supports reading the controls; it does not detect danger.')
# Explain: Apply feature('Dark cards and borders', [('site.css','.card, body.tool .panel, body.tool... in the document-building sequence. Apply feature('Body text and serif headings', [('styles.css','body { font-family: -apple... in the document-building sequence. Apply feature('Readable shared page width', [('site.css','.container, .shell, .site-nav ... in the document-building sequence.
feature('Dark cards and borders', [('site.css','.card, body.tool .panel, body.tool ul.rows li, .cat-card {'),('styles.css','.choice-card { background:')], 'The shared selector targets tool cards. The homepage rule supplies charcoal fill, a thin gray border and padding around each choice.', 'Separates actions visually so a person can find the next step.')
feature('Body text and serif headings', [('styles.css','body { font-family: -apple-system'),('styles.css','h1, h2, h3 { font-family: Georgia')], 'System fonts display body text; Georgia displays headings. The heading rule uses medium weight and tighter spacing.', 'Readable hierarchy supports quick scanning during a check-in.')
feature('Readable shared page width', [('site.css','.container, .shell, .site-nav .inner, .site-footer .inner { width:')], 'The shared rule caps these containers at 960 pixels and leaves 40 pixels of viewport space. Homepage styles.css later sets its container width separately.', 'Keeps the interface within the screen and avoids overly long reading lines.')
# Explain: Apply feature('Homepage content width', [('styles.css','width: min(1180px, calc(100% - 3... in the document-building sequence. Apply feature('Main and secondary buttons', [('site.css','.button.primary, button.primar... in the document-building sequence. Apply feature('Emergency choice accent', [('styles.css','--emergency: #ff3b30;'),('style... in the document-building sequence.
feature('Homepage content width', [('styles.css','width: min(1180px, calc(100% - 32px));')], 'The homepage container can grow to 1180 pixels while retaining 16-pixel side margins on a narrow screen.', 'Uses the available screen while keeping content away from its edges.')
feature('Main and secondary buttons', [('site.css','.button.primary, button.primary {',2),('styles.css','.primary-btn { background: #3366cc;'),('styles.css','.secondary-btn { background: #27292d;')], 'Primary actions use blue with white text; secondary actions use charcoal and a gray border. Later rules override the old white primary-button fill.', 'Makes the principal action easier to distinguish.')
feature('Emergency choice accent', [('styles.css','--emergency: #ff3b30;'),('styles.css','.danger-choice { border-top:')], 'The emergency color variable supplies the red upper border on the immediate-danger card.', 'Visually distinguishes the manual emergency choice from general support.')
# Explain: Apply feature('Mobile cards and sequence layout', [('styles.css','@media (max-width: 800... in the document-building sequence. Apply feature('Mobile navigation and map size', [('site.css','.site-nav .groups { overfl... in the document-building sequence. Assign feature('Keyboard focus and skip link', [('site.css','outline:... from the value shown here.
feature('Mobile cards and sequence layout', [('styles.css','@media (max-width: 800px)'),('styles.css','.choice-grid, .sequence-list, .local-facts { grid-template-columns: 1fr; }')], 'At 800 pixels or narrower, the three listed grids become single columns. This rule does not change the separate hero grid.', 'Keeps important choices readable on a phone.')
feature('Mobile navigation and map size', [('site.css','.site-nav .groups { overflow-x: auto;'),('site.css','@media (max-width: 600px) { #satelliteMap')], 'Navigation can scroll horizontally on narrow screens. The satellite map becomes 280 pixels tall below 600 pixels.', 'Preserves navigation and location context on smaller displays.')
feature('Keyboard focus and skip link', [('site.css','outline: 3px solid var(--blue);'),('nav.js','skip.href = "#main-content";'),('site.css','.skip-link:focus {')], 'The focus rule draws an outline. The skip link jumps to main content and becomes visible when focused.', 'Lets keyboard users reach and operate the safety controls.')
# Explain: Assign feature('Responsive browser viewport', [('index.html','<meta name from the value shown here. Apply feature('Dialog overlay and readable controls', [('site.css','.care-dialog { width... in the document-building sequence. Apply feature('AED row typography and spacing', [('site.css','.places-list a {'),('site.... in the document-building sequence.
feature('Responsive browser viewport', [('index.html','<meta name="viewport"')], 'The viewport meta tag tells the browser to use the device width and an initial scale of one.', 'Allows responsive CSS to use the actual phone viewport.')
feature('Dialog overlay and readable controls', [('site.css','.care-dialog { width:'),('styles.css','.auth-dialog::backdrop {')], 'The care dialog has a bounded width and internal padding. The account backdrop dims the page behind its modal.', 'Keeps a prompt distinct from the surrounding page.')
feature('AED row typography and spacing', [('site.css','.places-list a {'),('site.css','.places-list small {')], 'Venue links are bold; addresses, indoor hints and metadata appear on separate muted lines.', 'Helps someone identify the destination before reading the final directions.')

# Explain: Apply section('Navigation and ordinary interface sound') in the document-building sequence. Assign feature('Home tracker and About navigation', [('nav.js','const... from the value shown here. Assign feature('Safeguard brand and active page', [('nav.js','name.te... from the value shown here.
section('Navigation and ordinary interface sound')
feature('Home tracker and About navigation', [('nav.js','const SITE = ['),('nav.js','{ id: "detect",')], 'The shared navigation records define Home, Drop tracker and Method and limits. buildNav and buildFooter read the same records.', 'Provides consistent routes to the core monitoring flow.')
feature('Safeguard brand and active page', [('nav.js','name.textContent = "Safeguard";'),('nav.js','a.setAttribute("aria-current", "page");')], 'The brand is inserted as text. The matching navigation link is marked as the current page for assistive technology.', 'Makes the service and the current location within it identifiable.')
# Explain: Apply feature('Shared footer', [('nav.js','function buildFooter()')], 'This function con... in the document-building sequence. Assign feature('Labels for supporting experiments', [('nav.js','const... from the value shown here. Assign feature('Click and hover feedback', [('sound.js','const SOUND_... from the value shown here.
feature('Shared footer', [('nav.js','function buildFooter()')], 'This function constructs the footer from the shared site map and adds its explanatory text.', 'Keeps navigation available after a person reaches the end of a page.')
feature('Labels for supporting experiments', [('nav.js','const TRIAL = ['),('nav.js','function buildTrialBanner()')], 'Safewalk, shelters and hazard are listed as earlier experiments. Their banner is generated separately from the main tracker.', 'Helps distinguish supporting demonstrations from the core detection sequence.')
feature('Click and hover feedback', [('sound.js','const SOUND_FILE = "click.mp3";'),('sound.js','playClick(0.5);'),('sound.js','playClick(0.18);')], 'The ordinary interface uses click.mp3, with louder click playback and quieter mouse-hover playback. This is separate from the warning MP3.', 'Provides interaction feedback without representing an emergency signal.')
# Explain: Assign feature('Hover throttling and touch behavior', [('sound.js','c... from the value shown here. Apply feature('Remembered sound preference', [('sound.js','localStorage.setItem(MUTE_KEY... in the document-building sequence. Apply section('Homepage and account access') in the document-building sequence.
feature('Hover throttling and touch behavior', [('sound.js','const HOVER_GAP_MS = 120;'),('sound.js','if (ev.pointerType !== "mouse")')], 'Hover sounds are limited to mouse events and spaced by at least 120 milliseconds. Touch does not get an extra hover sound.', 'Reduces distracting repeated feedback.')
feature('Remembered sound preference', [('sound.js','localStorage.setItem(MUTE_KEY, muted ? "1" : "0");')], 'The toggle saves the ordinary click-sound preference in the browser. It does not mute the separate warning media element.', 'Gives users control over routine feedback while preserving the warning flow.')

section('Homepage and account access')
# Explain: Assign feature('Page title and sharing description', [('index.html','... from the value shown here. Assign feature('Headline and purpose', [('index.html','<h1>Help for t... from the value shown here. Assign feature('Protection status and tracker jump', [('index.html','... from the value shown here.
feature('Page title and sharing description', [('index.html','<title>Safeguard'),('index.html','<meta property="og:description"')], 'The title identifies the tab and the Open Graph description supplies sharing metadata.', 'Explains the purpose before someone opens the tracker.')
feature('Headline and purpose', [('index.html','<h1>Help for the moment'),('index.html','<p class="lede">Safeguard looks')], 'The heading introduces the problem; the paragraph describes multiple signals, a response check and preparation of human help.', 'States the notice, verify and help sequence in plain language.')
feature('Protection status and tracker jump', [('index.html','<h2 id="status-title">'),('index.html','href="#live-tracker"')], 'The homepage status card initially says protection is off. Its link scrolls to the tracker; this heading is static and does not mirror the iframe state.', 'Encourages deliberate activation rather than implying protection starts automatically.')
# Explain: Assign feature('Immediate danger and bystander choices', [('index.htm... from the value shown here. Assign feature('Treatment support link', [('index.html','<article class from the value shown here. Assign feature('Four step explanation and future modes', [('index.htm... from the value shown here.
feature('Immediate danger and bystander choices', [('index.html','<article class="choice-card danger-choice">'),('index.html','<article class="choice-card"><p class="card-kicker">Bystander')], 'Each card includes a real tel:911 link for the user to open. The page does not automatically dial.', 'Provides a direct manual route when help is already needed.')
feature('Treatment support link', [('index.html','<article class="choice-card"><p class="card-kicker">Drug or alcohol support')], 'The support card links to the displayed national helpline using a telephone URI.', 'Offers a separate human support path alongside urgent choices.')
feature('Four step explanation and future modes', [('index.html','<ol class="sequence-list">'),('index.html','Future breathing, smartwatch, scheduled, and always-on modes')], 'The ordered list presents Notice, Verify, Ask and Prepare. The following note identifies future modes as unimplemented.', 'Communicates the intended sequence while bounding current capabilities.')
# Explain: Assign feature('Driving prevention and official source links', [('ind... from the value shown here. Assign feature('Embedded live tracker', [('index.html','<iframe title from the value shown here. Assign feature('Login and signup forms', [('index.html','<form class from the value shown here.
feature('Driving prevention and official source links', [('index.html','<h2 id="drive-title">'),('index.html','<div class="source-links"')], 'This section presents prevention text, local contextual figures and links to the named external sources. It is content, not a live collision-data feed.', 'Supports prevention and points readers to source material.')
feature('Embedded live tracker', [('index.html','<iframe title="Safeguard'),('index.html','if (event.origin !== location.origin')], 'The homepage embeds fall-detection.html and permits its location, motion and audio capabilities. The message guard accepts size changes only from that same-origin frame.', 'Keeps the working tracker available from the homepage without trusting arbitrary window messages.')
feature('Separate sign in and sign up boxes', [('index.html','<form class="auth-form auth-box" id="login-form"'),('auth.js','loginForm.hidden = !showLogin;'),('auth.js','signupForm.hidden = showLogin;')], 'Each flow has its own bordered form and Google button. Switching tabs hides the other form, including its fields and status.', 'Keeps the chosen account action clear without combining sign-in and registration fields.')
feature('Account opening and closing', [('auth.js','if (!authDialog.open) authDialog.showModal();'),('auth.js','authClose.addEventListener')], 'showModal opens the selected account form; the close button dismisses it. Hash links also select the form.', 'Keeps account access separate from monitoring.')
feature('Email authentication and password handling', [('auth.js','const result = google ? await identity.google()'),('auth-provider.js','login: (email, password)'),('auth-provider.js','signup: (email, password)')], 'When configured, the provider signs in existing users or creates email accounts with Firebase. Password fields are cleared after each completed attempt and are never saved by the UI. The public Firebase configuration is currently missing, so real authentication is unavailable.', 'Supports authenticated account access without claiming that an unconfigured form has signed anyone in.')

feature('Requested sign in fields', [('index.html','<input id="login-email"'),('index.html','<input id="login-password"')], 'The sign-in box contains only Email and Password inputs, plus its separate Google and submit buttons.', 'Avoids asking returning users to repeat registration details.')
feature('Requested sign up fields', [('index.html','<input id="signup-first-name"'),('index.html','<input id="signup-last-name"'),('index.html','<label for="signup-password">Create a password')], 'Registration contains First name, Last name, Email and Create a password. The provider saves the joined names as the Firebase display name after successful email account creation.', 'Collects a readable account identity without changing the saved emergency contact.')
feature('Google sign in and Google sign up', [('index.html','data-google="login"'),('index.html','data-google="signup"'),('auth-provider.js','google: () => signInWithPopup')], 'Each box has its own Google option. Both use the Google account chooser; Firebase creates an account on first authentication and signs in a returning user afterward. The Google flow does not require the email form fields. It awaits the owner’s Firebase setup.', 'Provides an alternative account path without collecting the Google password on this page.')
feature('Authentication configuration and session', [('auth-config.js','window.SAFEGUARD_FIREBASE_CONFIG = null;'),('auth-provider.js','await setPersistence(auth, browserSessionPersistence);'),('auth.js','await identity.signout();')], 'The null configuration keeps authentication unavailable until the owner supplies public web identifiers and enables providers. Once configured, Firebase verifies credentials, keeps the browser session and supports sign-out. Tracker contacts are not synced.', 'Makes account state explicit and keeps it separate from active monitoring.')

section('Motion tracker and response sequence')
# Explain: Assign feature('Start and stop control', [('fall-detection.html','<bu... from the value shown here. Assign feature('Motion permission and arming delay', [('app.js','cons... from the value shown here. Apply feature('Real sensor event listeners', [('app.js','window.addEventListener("device... in the document-building sequence.
feature('Start and stop control', [('fall-detection.html','<button id="armTrackerBtn"'),('app.js','$("#armTrackerBtn").addEventListener')], 'The button is connected to armTracker, which starts a session or stops an existing one.', 'Makes monitoring a deliberate user action.')
feature('Motion permission and arming delay', [('app.js','const ARM_DELAY_S = 5;'),('app.js','if (answers.some(answer => answer !== "granted"))')], 'The tracker waits five seconds before accepting measurements and refuses a denied permission result.', 'Gives the user time to position the device before looking for warning signs.')
feature('Real sensor event listeners', [('app.js','window.addEventListener("devicemotion", onMotion);'),('app.js','window.addEventListener("deviceorientation", onOrientation);')], 'The two listeners connect browser sensor events to the measurement handlers while tracking is active.', 'Supplies actual movement observations when supported by the device.')
# Explain: Apply feature('Invalid measurement rejection', [('app.js','if (!sensorsOn || !a || ![a.x... in the document-building sequence. Assign feature('Impact magnitude and threshold', [('app.js','const mag from the value shown here. Assign feature('Settling and recovery cancellation', [('app.js','cons... from the value shown here.
feature('Invalid measurement rejection', [('app.js','if (!sensorsOn || !a || ![a.x, a.y, a.z].every(Number.isFinite))')], 'The handler rejects missing or non-finite axes and ignores measurements when the tracker is off.', 'Avoids interpreting absent sensor data as evidence.')
feature('Impact magnitude and threshold', [('app.js','const mag = Math.sqrt'),('app.js','const IMPACT_MS2 = 25;')], 'Squaring and summing the three axes produces acceleration magnitude including gravity. The threshold is 25 metres per second squared.', 'Recognizes a possible drop, without determining whether a person collapsed.')
feature('Settling and recovery cancellation', [('app.js','const SETTLE_MS = 1500;'),('app.js','if (Math.abs(mag - 9.81) > RECOVERY_MS2)')], 'After 1.5 seconds of settling, movement beyond the recovery threshold cancels the pending drop event.', 'Reduces premature prompts when movement resumes.')
# Explain: Assign feature('Recovery interval and stillness', [('app.js','const R... from the value shown here. Assign feature('Orientation as a supporting signal', [('app.js','cons... from the value shown here. Apply feature('Two motion signals with required stillness', [('app.js','return ["impact"... in the document-building sequence.
feature('Recovery interval and stillness', [('app.js','const RECOVERY_MS = 2000;'),('app.js','const STILL_MS = 8000;')], 'A two-second recovery observation precedes eight seconds of stillness in the browser flow.', 'Adds observation before asking the person to respond.')
feature('Orientation as a supporting signal', [('app.js','const change = Math.abs(ev.beta')], 'The handler adds absolute beta and gamma changes; its following condition requires a recent impact and a large change.', 'Adds movement context without claiming to measure body posture.')
feature('Two motion signals with required stillness', [('app.js','return ["impact", "orientation", "stillness"].filter'),('app.js','if (!fired.stillness || signalCount() < MIN_SIGNALS)')], 'Only motion-related keys enter the signal count. The check also requires stillness; location alone cannot trigger the check-in.', 'Implements corroboration before the responsiveness question.')
# Explain: Assign feature('Signal points and visible status', [('app.js','li.cla... from the value shown here. Assign feature('Sensor watchdog and fallback', [('app.js','const SENS... from the value shown here. Assign feature('Five second response prompt', [('app.js','const COUNT... from the value shown here.
feature('Signal points and visible status', [('app.js','li.className = fired[key] ? "signal on"'),('app.js','$("#confidence").textContent = score()')], 'The list marks observed signals and displays their weighted points. These points are not a calibrated medical probability.', 'Makes the recorded observations visible for review.')
feature('Sensor watchdog and fallback', [('app.js','const SENSOR_TIMEOUT_MS = 4000;'),('app.js','accelerometer = new window.Accelerometer')], 'The watchdog notices missing readings and attempts the Generic Sensor accelerometer when available. Unsupported hardware still cannot supply motion data.', 'Makes a missing measurement source visible instead of implying active protection.')
feature('Five second response prompt', [('app.js','const COUNTDOWN_S = 5;'),('app.js','function openAlert()')], 'openAlert starts the cancelable question using the five-second constant and updates its visible countdown.', 'Directly implements the verify-responsiveness stage.')
# Explain: Apply feature('I am okay cancellation', [('app.js','$("#okayBtn").addEventListener'),('a... in the document-building sequence. Assign feature('Unanswered prompt', [('app.js','fired.noReply from the value shown here. Assign feature('Supplied warning MP3 and duration', [('fall-detection... from the value shown here.
feature('I am okay cancellation', [('app.js','$("#okayBtn").addEventListener'),('app.js','function closeAlert()')], 'The I am okay button calls closeAlert, which clears the countdown and resets the pending observations.', 'Lets a responsive person stop escalation.')
feature('Unanswered prompt', [('app.js','fired.noReply = true;')], 'Expiry records no reply; the following statements prepare the message and start the warning sequence.', 'Connects an unanswered check-in to a visible next step.')
feature('Supplied warning MP3 and duration', [('fall-detection.html','<audio id="alarmSound"'),('app.js','const DROP_ALARM_S = 10;')], 'The media element loads warning-alarm.mp3 with looping enabled. The JavaScript constant limits warning playback to ten seconds unless stopped.', 'Draws local attention after the five-second question goes unanswered.')
# Explain: Assign feature('Playback time rather than elapsed wall time', [('app.... from the value shown here. Apply feature('Audio failure and explicit retry', [('app.js','function audioFailure(erro... in the document-building sequence. Apply feature('Marker and button alarm test', [('app.js','function testFromMarker()'),('... in the document-building sequence.
feature('Playback time rather than elapsed wall time', [('app.js','if (now >= alarmLastTime)'),('app.js','audio.volume = 1;')], 'The timer accumulates media progress; buffering does not consume the allowance. Playback clears element mute and uses full application volume.', 'Avoids reporting a full warning when the recording was blocked or stalled.')
feature('Audio failure and explicit retry', [('app.js','function audioFailure(error)'),('app.js','if (audio.error)'),('app.js','$("#retryAudioBtn").addEventListener')], 'The failure handler shows permission or media errors. Retry requests playback again and reloads media after a media error.', 'Makes unsuccessful sound playback actionable.')
feature('Marker and button alarm test', [('app.js','function testFromMarker()'),('app.js','markerAction.addEventListener("click", testFromMarker);')], 'Both test controls use the five-second countdown followed by the warning. The prepared text identifies the sequence as a demonstration.', 'Allows a repeatable demonstration without physically dropping a device.')
# Explain: Apply feature('Stop warning and nearby care prompt', [('app.js','$("#stopAlarmBtn").addE... in the document-building sequence. Apply feature('Complete tracker shutdown', [('app.js','function stopSensors()'),('app.js... in the document-building sequence. Apply section('Live location satellite map and AEDs') in the document-building sequence.
feature('Stop warning and nearby care prompt', [('app.js','$("#stopAlarmBtn").addEventListener'),('app.js','$("#careDialog").showModal();')], 'The stop control pauses the warning. Ending or stopping it displays the nearby-care dialog.', 'Returns control to the user and offers a route to nearby resources.')
feature('Complete tracker shutdown', [('app.js','function stopSensors()'),('app.js','window.addEventListener("pagehide", stopSensors);')], 'Shutdown cancels timers and sensor listeners, aborts outstanding AED work and clears the location watch. Leaving the page invokes it too.', 'Limits monitoring to the session the person is using.')

section('Live location satellite map and AEDs')
# Explain: Assign feature('Fresh high accuracy location requests', [('app.js','c... from the value shown here. Assign feature('Continuously updated device location', [('app.js','lo... from the value shown here. Assign feature('Location timestamp and accuracy', [('app.js','place from the value shown here.
feature('Fresh high accuracy location requests', [('app.js','const LOCATION_OPTIONS ='),('app.js','navigator.geolocation.getCurrentPosition(p => {')], 'The options request high accuracy, disallow a cached fix and set a fifteen-second timeout. The browser still controls permission and available accuracy.', 'Supplies recent location context for human help.')
feature('Continuously updated device location', [('app.js','locationWatch = navigator.geolocation.watchPosition'),('app.js','if (run === session) showPosition(p);')], 'watchPosition listens for updates. The session check ignores callbacks belonging to a stopped session.', 'Keeps the marker relevant while preventing an old session from updating it.')
feature('Location timestamp and accuracy', [('app.js','place = { lat: c.latitude'),('app.js','locationExpiry = setTimeout')], 'The position record retains coordinates, reported accuracy and time. A timer marks the fix stale rather than leaving it looking current.', 'Makes uncertainty and freshness visible.')
# Explain: Apply feature('Satellite imagery', [('app.js','L.tileLayer("https://services.arcgisonlin... in the document-building sequence. Assign feature('User marker and accuracy circle', [('app.js','locatio... from the value shown here. Assign feature('Location and map error messages', [('app.js','functio... from the value shown here.
feature('Satellite imagery', [('app.js','L.tileLayer("https://services.arcgisonline.com')], 'Leaflet requests Esri satellite tiles for the map view. These images are a background, not live satellite video.', 'Provides recognizable surroundings for the location marker.')
feature('User marker and accuracy circle', [('app.js','locationMarker = L.circleMarker'),('app.js','accuracyCircle = L.circle')], 'A marker shows the reported coordinates and a circle shows the device-reported accuracy radius.', 'Avoids presenting an estimated position as an exact location.')
feature('Location and map error messages', [('app.js','function locationError(error)'),('app.js','}).on("tileerror", () => {')], 'Separate handlers report geolocation errors and unavailable imagery. The coordinate text can still be useful when tiles fail.', 'Keeps failure visible and preserves available location context.')
# Explain: Assign feature('Five nearest real mapped AED records', [('app.js','co... from the value shown here. Apply feature('Distance calculation', [('app.js','function metresBetween(a, b)'),('app.j... in the document-building sequence. Assign feature('Actual venue name and street address', [('app.js','co... from the value shown here.
feature('Five nearest real mapped AED records', [('app.js','const query = \'[out:json]'),('app.js','.sort((a, b) => a.distance')], 'Overpass finds defibrillator records within ten kilometres. The sort and slice retain up to five, closest first by straight-line distance.', 'Reduces the search for nearby equipment without substituting example entries.')
feature('Distance calculation', [('app.js','function metresBetween(a, b)'),('app.js','return 6371000 * 2 * Math.atan2')], 'The haversine calculation converts coordinate separation into metres using an Earth-radius estimate.', 'Ranks proximity; it does not calculate walking time or an accessible route.')
feature('Actual venue name and street address', [('app.js','const host = buildings.filter'),('app.js','const name = host?.tags?.name')], 'Only a mapped building containing the AED coordinate can supply its building name. Address, recorded name or coordinates provide fallbacks.', 'Makes the destination recognizable without assigning an unrelated nearby business.')
# Explain: Assign feature('Indoor directions kept beneath the venue', [('app.js'... from the value shown here. Assign feature('Batched building lookup and temporary cache', [('app.... from the value shown here. Assign feature('AED access hours and source limitations', [('app.js',... from the value shown here.
feature('Indoor directions kept beneath the venue', [('app.js','const notes = [tags["defibrillator:location"]'),('app.js','locationDetail.textContent =')], 'Recorded room, floor or restroom directions remain separate from the venue title and are inserted as plain text.', 'Helps someone navigate the final part of the search.')
feature('Batched building lookup and temporary cache', [('app.js','const venueQuery ='),('app.js','if (complete) aedVenueCache.set')], 'One additional request fetches building outlines. Successful results remain in memory for ten minutes; failed lookups can be retried.', 'Reduces repeated waiting without discarding AED coordinates when names fail.')
feature('AED access hours and source limitations', [('app.js','detail.textContent = Math.round(item.distance)')], 'Each row shows distance, recorded AED access and AED hours. Missing values stay not recorded; building hours are not substituted.', 'Avoids claiming equipment is accessible merely because a venue is named.')
# Explain: Assign feature('Directions to the precise AED pin', [('app.js','link.... from the value shown here. Assign feature('Refresh after movement and ignore old results', [('ap... from the value shown here. Apply section('Trusted contact and prepared message') in the document-building sequence.
feature('Directions to the precise AED pin', [('app.js','link.href = "https://www.google.com/maps/dir/'),('app.js','aedMarkers.push(L.marker')], 'The Google Maps link uses the AED coordinates, while the satellite marker uses those same coordinates and the resolved place label.', 'Keeps directions tied to the equipment instead of moving the destination to a building centre.')
feature('Refresh after movement and ignore old results', [('app.js','if ((!aedOrigin && Date.now() - aedAttemptAt'),('app.js','if (request !== aedRequest) return;',1)], 'The first fix or movement beyond 100 metres triggers a lookup. A request counter prevents older responses from replacing a newer search.', 'Keeps nearby resources aligned with the current location.')

section('Trusted contact and prepared message')
# Explain: Apply feature('Save contact locally', [('app.js','localStorage.setItem(CONTACT_KEY, JSON... in the document-building sequence. Assign feature('Load contact with a safe empty fallback', [('app.js',... from the value shown here. Assign feature('Message includes position and signals', [('app.js','c... from the value shown here.
feature('Save contact locally', [('app.js','localStorage.setItem(CONTACT_KEY, JSON.stringify')], 'The saved name and phone number are serialized under the contact key in this browser.', 'Prepares a chosen human contact without uploading that contact to map services.')
feature('Load contact with a safe empty fallback', [('app.js','const saved = JSON.parse(localStorage.getItem(CONTACT_KEY)')], 'The contact reader parses the saved record; surrounding error handling returns null if it cannot be used.', 'Allows the interface to explain a missing contact instead of inventing a recipient.')
feature('Message includes position and signals', [('app.js','const message = "Safeguard:'),('app.js','const where = place && Date.now() - place.at <= 60000')], 'The prepared text describes the event and includes only a recent position; otherwise it says a recent position is unavailable.', 'Gives a responder context while making missing location explicit.')
# Explain: Assign feature('Human reviewed SMS and missing contact notice', [('ap... from the value shown here. Apply section('About page') in the document-building sequence. Apply feature('Current capabilities and limits', [('about.html','<h1>What Safeguard can'... in the document-building sequence.
feature('Human reviewed SMS and missing contact notice', [('app.js','link.href = "sms:"'),('app.js','warn.textContent = "No contact saved')], 'A saved recipient gets an encoded SMS link. Without one, the panel asks for a contact. Nothing is sent automatically.', 'Shortens the steps to ask for help while preserving human review.')

section('About page')
feature('Current capabilities and limits', [('about.html','<h1>What Safeguard can'),('about.html','No automatic call to 911 and no responder network.')], 'The About page describes what the browser demonstrates and the capabilities it does not provide.', 'Supports informed use of the project rather than an unsupported guarantee.')
# Explain: Apply feature('Detection explanation', [('about.html','A sudden movement above 2.5 g beg... in the document-building sequence. Apply feature('Map sources and illustrative data status', [('about.html','The tracker us... in the document-building sequence. Apply feature('Privacy and third party services', [('about.html','Direction links open G... in the document-building sequence.
feature('Detection explanation', [('about.html','A sudden movement above 2.5 g begins'),('about.html','The displayed points describe recorded signals;')], 'The prose describes settling, recovery, stillness and the response sequence, and distinguishes signal points from medical probability.', 'Explains how warning observations lead to verification.')
feature('Map sources and illustrative data status', [('about.html','The tracker uses your browser’s current location and OpenStreetMap AED records.'),('about.html','<thead><tr><th>Page</th>')], 'The source section identifies live map records and imagery. Its table also labels older dashboard sources as not yet retrieved.', 'Keeps map support separate from unverified legacy figures.')
feature('Privacy and third party services', [('about.html','Direction links open Google Maps.')], 'The privacy text states that direction links use Google Maps and the saved contact is not uploaded to those services.', 'Explains where location support connects to external providers.')

# Explain: Apply section('Safewalk supporting page') in the document-building sequence. Assign feature('Walk details and expected arrival', [('safewalk.html'... from the value shown here. Assign feature('Walk persistence and position updates', [('safewalk.h... from the value shown here.
section('Safewalk supporting page')
feature('Walk details and expected arrival', [('safewalk.html','<input type="number" id="mins"'),('safewalk.html','eta: Date.now() + mins * 60000,')], 'Name, destination and duration fields define a walk. The script stores an absolute arrival timestamp, so reloads do not restart the clock.', 'Demonstrates a timed safety session rather than motion detection.')
feature('Walk persistence and position updates', [('safewalk.html','localStorage.setItem(KEY, JSON.stringify(walk));'),('safewalk.html','pinger = setInterval(ping, 30000);',1)], 'The session is stored locally and position checks run every thirty seconds while the walking-state guard allows them.', 'Maintains the demonstration session and its latest reported position.')
# Explain: Assign feature('Arrival cancellation', [('safewalk.html','walk.state from the value shown here. Assign feature('Late state and remaining time', [('safewalk.html','co... from the value shown here. Assign feature('ZIP or GPS based Maps search', [('safewalk.html','con... from the value shown here.
feature('Arrival cancellation', [('safewalk.html','walk.state = "arrived";')], 'The arrival button changes the state, saves it and refreshes the display. The position handler returns for a non-walking state.', 'Provides an explicit completion check-in.')
feature('Late state and remaining time', [('safewalk.html','const GRACE_S = 300;'),('safewalk.html','if (lateBy > GRACE_S)')], 'The display compares the current time with arrival time and marks the walk late after a five-minute grace period.', 'Prompts a human follow-up; it does not contact a responder.')
feature('ZIP or GPS based Maps search', [('safewalk.html','const EMT_QUERY ='),('safewalk.html','encodeURIComponent(EMT_QUERY + where);')], 'The page opens a Google Maps text search based on a five-digit ZIP or a saved position. The search wording does not enforce a one-mile radius or verify an available EMT.', 'Offers a manual search aid with limits distinct from the tracker AED list.')
# Explain: Assign feature('Help state and manual emergency link', [('safewalk.ht... from the value shown here. Apply section('Shelters and equipment supporting page') in the document-building sequence. Assign feature('Illustrative resource data and category filter', [('s... from the value shown here.
feature('Help state and manual emergency link', [('safewalk.html','walk.state = "help";'),('safewalk.html','call.href = "tel:911";')], 'The help control records the state when a walk exists, opens Washington 911 information and creates a telephone link.', 'Gives the user an immediate manual action without claiming automatic dispatch.')

section('Shelters and equipment supporting page')
feature('Illustrative resource data and category filter', [('shelters.html','const SEED = ['),('shelters.html','rows = rows.filter(r => r.kind === kind);')], 'The page starts with example AED, shelter and hydrant entries. The selected category filters that local collection.', 'Demonstrates resource browsing; it is separate from live Overpass AED results.')
# Explain: Assign feature('Five closest example resources', [('shelters.html','r... from the value shown here. Apply feature('Location request and refusal fallback', [('shelters.html','useLocation(fa... in the document-building sequence. Assign feature('Walking directions and map selection', [('shelters.ht... from the value shown here.
feature('Five closest example resources', [('shelters.html','rows.sort((a, b) => metres(me, a) - metres(me, b));'),('shelters.html','rows = rows.slice(0, NEAREST);',1)], 'When position is available, example records are sorted by straight-line distance and limited to five.', 'Illustrates proximity sorting without verifying those sample resources.')
feature('Location request and refusal fallback', [('shelters.html','useLocation(false);'),('shelters.html','say("Location refused, so these are not the nearest')], 'This older page requests location on opening as well as from its button. Refusal leaves a clearly unsorted example list.', 'Avoids describing unknown proximity as nearest.')
feature('Walking directions and map selection', [('shelters.html','route.href = routeUrl(row);'),('shelters.html','map.setView([row.lat, row.lon], 16);')], 'The route link opens directions and a row click centres the map. Clicking the route avoids triggering the row handler.', 'Demonstrates a connection between a listed place and a map action.')
# Explain: Assign feature('Shelter occupancy and editable status', [('shelters.h... from the value shown here. Apply section('Hazard reporting supporting page') in the document-building sequence. Assign feature('Category description and photo selection', [('hazard.... from the value shown here.
feature('Shelter occupancy and editable status', [('shelters.html','text += ", " + (row.cap - row.occ)'),('shelters.html','row.status = next(row.status);')], 'The display calculates example spare capacity and cycles a shelter status when clicked. Changes are saved locally, not shared.', 'Illustrates resource status handling without presenting it as live capacity.')

section('Hazard reporting supporting page')
feature('Category description and photo selection', [('hazard.html','<select id="cat">'),('hazard.html','photo: document.getElementById("photo").files.length > 0,')], 'The form collects a category and note. The stored photo value is only a boolean saying a file was selected; the image is not uploaded.', 'Demonstrates a report structure with a limited local attachment indicator.')
# Explain: Assign feature('Choose a place on the map or through GPS', [('hazard.... from the value shown here. Assign feature('Merge nearby reports of the same category', [('hazard... from the value shown here. Assign feature('Local ticket storage', [('hazard.html','ticket from the value shown here.
feature('Choose a place on the map or through GPS', [('hazard.html','map.on("click", e => setPlace'),('hazard.html','setPlace(p.coords.latitude, p.coords.longitude, "phone GPS");')], 'Both map taps and a successful browser position call the same place setter.', 'Ensures a report has a location that a person can review.')
feature('Merge nearby reports of the same category', [('hazard.html','const MERGE_M = 60;'),('hazard.html','if (r.cat !== cat)')], 'The matching search is limited to sixty metres and skips reports of another category.', 'Reduces duplicate local tickets without treating different hazards as one.')
feature('Local ticket storage', [('hazard.html','ticket = Date.now();'),('hazard.html','localStorage.setItem(KEY, JSON.stringify(reports));')], 'A new ticket uses the current timestamp; the reports array is saved in this browser. No city submission occurs.', 'Demonstrates report organization rather than a working municipal network.')
# Explain: Assign feature('Ranked tickets and proportional map markers', [('haza... from the value shown here. Apply section('Risk zones supporting page') in the document-building sequence. Assign feature('Illustrative events and CSV import', [('risk-zones.ht... from the value shown here.
feature('Ranked tickets and proportional map markers', [('hazard.html','const rows = Object.values(groups).sort'),('hazard.html','{ radius: 6 + Math.min(g.n, 8) * 2,')], 'Tickets with more reports appear first and get larger circles, with the size increase capped at eight reports.', 'Makes repeated local reports easier to notice without proving severity.')

section('Risk zones supporting page')
feature('Illustrative events and CSV import', [('risk-zones.html','events = demoData();',2),('risk-zones.html','reader.readAsText(file);')], 'The initial map uses generated events. Selecting a CSV reads it locally as text and replaces the event collection after parsing.', 'Demonstrates area planning while identifying the source of its input.')
# Explain: Apply feature('CSV column and row checks', [('risk-zones.html','if (iLat < 0 || iLon < 0... in the document-building sequence. Assign feature('Group events into geographic bins', [('risk-zones.htm... from the value shown here. Assign feature('Weighted outcomes and top fifteen zones', [('risk-zon... from the value shown here.
feature('CSV column and row checks', [('risk-zones.html','if (iLat < 0 || iLon < 0)'),('risk-zones.html','if (isNaN(lat) || isNaN(lon))')], 'The importer requires recognized latitude and longitude headers and skips values that are not numbers. It is a basic parser, not a complete data validation system.', 'Prevents a missing-column file from being treated as usable evidence.')
feature('Group events into geographic bins', [('risk-zones.html','const key = Math.round(e.lat / CELL)')], 'Rounding divided coordinates creates angular bins. The bins are approximate geography, not exact equal-sized ground squares.', 'Supports broad planning rather than identifying a specific person.')
feature('Weighted outcomes and top fifteen zones', [('risk-zones.html','const WEIGHT ='),('risk-zones.html','return kept.slice(0, TOP_N);')], 'Calls, naloxone, transport and death receive different demonstration weights. Sorted results are limited to fifteen.', 'Shows one possible resource-prioritization rule, not a validated risk model.')
# Explain: Assign feature('Suppress low counts', [('risk-zones.html','const kept from the value shown here. Assign feature('Zone table and fixed radius map circles', [('risk-zon... from the value shown here. Apply feature('Return to generated example data', [('risk-zones.html','document.getEleme... in the document-building sequence.
feature('Suppress low counts', [('risk-zones.html','const kept = all.filter(z => z.calls >= MIN_CALLS);')], 'The filter excludes bins with fewer than five calls and the interface reports the number suppressed.', 'Adds a privacy precaution without guaranteeing anonymity.')
feature('Zone table and fixed radius map circles', [('risk-zones.html','tr.onclick = () => map.setView'),('risk-zones.html','radius: 250,')], 'Selecting a table row centres the map; each circle uses a fixed 250-metre radius, while opacity reflects the score.', 'Links the ranking to broad map context without implying precise case locations.')
feature('Return to generated example data', [('risk-zones.html','document.getElementById("demo").onclick')], 'The reset handler creates illustrative events again and updates the mode banner before redrawing.', 'Keeps imported data and generated examples distinguishable.')

# Explain: Apply section('Retained code and repository support') in the document-building sequence. Assign feature('Older dashboard renderer', [('script.js','const CITIES from the value shown here. Apply feature('Crawler access', [('robots.txt','User-agent: *'),('robots.txt','Allow: /'... in the document-building sequence.
section('Retained code and repository support')
feature('Older dashboard renderer', [('script.js','const CITIES = ['),('script.js','tag.textContent = "Illustrative";')], 'This retained file contains hand-entered city figures and an illustrative label. The current index.html does not load script.js.', 'Documents existing code without presenting dormant figures as a live homepage feature.')
feature('Crawler access', [('robots.txt','User-agent: *'),('robots.txt','Allow: /')], 'These directives permit compliant crawlers to read the published site; they do not guarantee indexing.', 'Supports public discoverability rather than emergency response.')
# Explain: Assign feature('Optional Google key example', [('config.example.js','... from the value shown here. Apply feature('Code explanation comments', [('app.js','// Venue information is cached in... in the document-building sequence. Assign TALK from the value shown here.
feature('Optional Google key example', [('config.example.js','window.PULSEGUARD_GOOGLE_MAPS_KEY =')], 'The file is an example key setting for an earlier integration. The current tracker obtains AEDs through Overpass and does not require this key.', 'Separates old setup material from the active map implementation.')
feature('Code explanation comments', [('app.js','// Venue information is cached in memory only;')], 'This comment explains the nearby cache lifetime. Comments help a reader understand code but do not run; the statements establish actual behavior.', 'Supports inspection and maintenance without changing detection.')

TALK = [
# Explain: Record a presentation value or source-reference entry.
('0 to 15 seconds', 'Safeguard helps people notice possible danger, check responsiveness, and reach human help. The homepage presents emergency choices, support links, and the tracker. About explains the method, sources, and privacy.', [('index.html','<h1>Help for the moment'),('about.html','<h1>What Safeguard can')]),
('15 to 30 seconds', 'In site dot CSS, line twelve defines the teal and navy gradient. Shared styles organize cards, buttons, and keyboard focus. Mobile rules stack choices. Navigation connects the pages, while account setup awaits configuration.', [('site.css','--page-background: radial-gradient'),('styles.css','.choice-grid, .sequence-list, .local-facts { grid-template-columns: 1fr; }')]),
('30 to 47 seconds', 'In app dot JavaScript, motion readings identify a possible drop. Settling, recovery, and stillness checks reduce premature prompts. Two motion signals are required. A five-second question lets the person cancel before the warning begins.', [('app.js','const IMPACT_MS2 = 25;'),('app.js','if (!fired.stillness || signalCount() < MIN_SIGNALS)'),('app.js','const COUNTDOWN_S = 5;')]),
# Explain: Record a presentation value or source-reference entry.
('47 to 62 seconds', 'The attached MP3 then plays for ten seconds of actual playback. The marker offers the same test. A saved contact receives a prepared message through the messaging app; a person still presses send.', [('app.js','const DROP_ALARM_S = 10;'),('app.js','link.href = "sms:"')]),
('62 to 82 seconds', 'Location updates move the satellite-map marker and accuracy circle. The five closest mapped AEDs show venue names, addresses, and indoor directions. Google Maps opens each exact AED pin. Missing names or access details remain explicit.', [('app.js','locationWatch = navigator.geolocation.watchPosition'),('app.js','.sort((a, b) => a.distance'),('app.js','const name = host?.tags?.name')]),
('82 to 100 seconds', 'Supporting pages demonstrate walk check-ins, resource filtering, grouped hazard reports, and risk-zone imports. Their example data stay distinct from live AED records. Together, these features support faster human action while keeping uncertainty visible.', [('safewalk.html','const GRACE_S = 300;'),('hazard.html','const MERGE_M = 60;'),('risk-zones.html','reader.readAsText(file);')])
# Explain: End this collection of values. Define the helper add_link. Create a Word XML element for detailed formatting.
]

def add_link(paragraph, label, target):
    hyperlink=OxmlElement('w:hyperlink')
    # Explain: Set a Word XML attribute controlling document formatting. Create a Word XML element for detailed formatting.
    hyperlink.set(qn('r:id'),paragraph.part.relate_to(target,RT.HYPERLINK,is_external=True))
    run=OxmlElement('w:r'); properties=OxmlElement('w:rPr')
    color=OxmlElement('w:color'); color.set(qn('w:val'),'245A81'); properties.append(color)
    # Explain: Create a Word XML element for detailed formatting. Apply hyperlink.append(run); paragraph._p.append(hyperlink) in the document-building sequence. Define the helper new_document.
    run.append(properties); text=OxmlElement('w:t'); text.text=label; run.append(text)
    hyperlink.append(run); paragraph._p.append(hyperlink)

def new_document(mission=False):
    # Preserve the existing guides' plain black headings and readable Letter layout.
    # Explain: Assign existing from the value shown here. Assign doc from the value shown here. Repeat the following work for child in list(doc._element.body).
    existing=SRC/'documentation'/('PulseGuard_Code_Mission_References.docx' if mission else 'PulseGuard_Code_Presentation.docx')
    doc=Document(existing)
    for child in list(doc._element.body):
        # Explain: Run the following block when child.tag!=qn('w:sectPr'):doc._element.body.remove(child). Repeat the following work for rel_id, relationship in list(doc.part.rels.items()). Run the following block when relationship.reltype == RT.HYPERLINK: doc.part.drop_rel(rel_id).
        if child.tag!=qn('w:sectPr'):doc._element.body.remove(child)
    # Remove obsolete links left behind by the previous guide's cleared body.
    for rel_id, relationship in list(doc.part.rels.items()):
        if relationship.reltype == RT.HYPERLINK: doc.part.drop_rel(rel_id)
    # Explain: Assign page from the value shown here. Assign page.page_width from the value shown here. Assign page.top_margin from the value shown here.
    page=doc.sections[0]
    page.page_width=Inches(8.5);page.page_height=Inches(11)
    page.top_margin=page.bottom_margin=Inches(.65)
    # Explain: Assign page.left_margin from the value shown here. Repeat the following work for name,size,font in [('Normal',11,'Aptos'),('Title',23,'Georgia'),('Heading 1',. Set the font appearance for this text or style.
    page.left_margin=page.right_margin=Inches(.75)
    for name,size,font in [('Normal',11,'Aptos'),('Title',23,'Georgia'),('Heading 1',16,'Georgia'),('Heading 2',12,'Aptos')]:
        style=doc.styles[name];style.font.name=font;style.font.size=Pt(size);style.font.color.rgb=RGBColor(0,0,0)
        # Explain: Set paragraph spacing or pagination behavior. Assign footer from the value shown here. Set a Word XML attribute controlling document formatting.
        style.paragraph_format.space_after=Pt(5);style.paragraph_format.line_spacing=1.05
    footer=page.footer.paragraphs[0];footer.clear();footer.alignment=2
    field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)
    # Explain: Return doc to the caller. Define the helper cite. Apply add_link(paragraph,f"({record['file']}, line {record['line']})",f"https://github.c... in the document-building sequence.
    return doc

def cite(paragraph, record):
    add_link(paragraph,f"({record['file']}, line {record['line']})",f"https://github.com/Canopy10979/PulseGuard_hackathon/blob/{REV}/{record['file']}#L{record['line']}")

# Explain: Define the helper add_talk. Assign words from the value shown here. Add the specified content or structure to the Word document.
def add_talk(doc):
    words=len(re.findall(r"\S+",' '.join(t[1] for t in TALK)))
    doc.add_heading('Presentation for one minute forty seconds',1)
    # Explain: Add the specified content or structure to the Word document. Repeat the following work for timing,text,refs in TALK.
    doc.add_paragraph(f'Read only the six spoken paragraphs. The {words}-word script takes about 100 seconds at {round(words*60/100)} words per minute. Timing marks and source cues are not spoken; rehearse once to adjust pauses.')
    for timing,text,refs in TALK:
        p=doc.add_paragraph();p.paragraph_format.keep_with_next=True
        # Explain: Assign p.add_run(timing+' ').bold from the value shown here. Add the specified content or structure to the Word document. Assign p.add_run('Source cues ').italic from the value shown here.
        p.add_run(timing+'  ').bold=True;p.add_run(text)
        p=doc.add_paragraph();p.paragraph_format.space_after=Pt(9)
        p.add_run('Source cues  ').italic=True
        # Explain: Repeat the following work for i,args in enumerate(refs). Run the following block when i:p.add_run(' '). Apply cite(p,ref(*args)) in the document-building sequence.
        for i,args in enumerate(refs):
            if i:p.add_run('  ')
            cite(p,ref(*args))
    # Explain: Add the specified content or structure to the Word document. Define the helper build. Assign records from the value shown here.
    doc.add_page_break()

def build():
    records=[]
    # Explain: Repeat the following work for item in FEATURES. Assign item['records'] from the value shown here. Apply records.extend(item['records']) in the document-building sequence.
    for item in FEATURES:
        item['records']=[ref(*args) for args in item['refs']]
        records.extend(item['records'])
    # Explain: Repeat the following work for mission,filename in [(False,'PulseGuard_Code_Presentation'),(True,'PulseGuard. Assign doc from the value shown here. Assign title from the value shown here.
    for mission,filename in [(False,'PulseGuard_Code_Presentation'),(True,'PulseGuard_Code_Mission_References')]:
        doc=new_document(mission)
        title='Safeguard Website Features and Mission' if mission else 'Safeguard Website Feature Code Guide'
        # Explain: Add the specified content or structure to the Word document.
        doc.add_paragraph(title,'Title')
        doc.add_paragraph('A short presentation followed by a feature reference for all seven website pages, shared styles and scripts, and retained supporting code. Each feature names its file, quotes exact physical source lines, and explains what those lines do.'+(' The reference also connects each feature to the mission.' if mission else ''))
        doc.add_paragraph('Source snapshot '+REV[:12]+'. Line counts include comments and blank lines. Linked references open the exact GitHub revision. The full reference is for questions and review; reading every code line aloud would exceed one minute forty seconds.')
        # Explain: Apply add_talk(doc) in the document-building sequence. Run the following block when mission. Add the specified content or structure to the Word document.
        add_talk(doc)
        if mission:
            doc.add_heading('Mission statement',1)
            # Explain: Add the specified content or structure to the Word document. Assign groups from the value shown here.
            doc.add_paragraph('Goal: recognize danger, verify responsiveness, and shorten the time before help is requested.')
            doc.add_paragraph('Source: the supplied message.txt. Direct monitoring, interface support and older experiments contribute differently; the explanations below distinguish them.')
        groups=OrderedDict()
        # Explain: Repeat the following work for item in FEATURES:groups.setdefault(item['section'],[]).append(item). Repeat the following work for name,items in groups.items(). Add the specified content or structure to the Word document.
        for item in FEATURES:groups.setdefault(item['section'],[]).append(item)
        for name,items in groups.items():
            doc.add_heading(name,1)
            # Explain: Repeat the following work for item in items. Add the specified content or structure to the Word document. Repeat the following work for record in item['records'].
            for item in items:
                doc.add_heading(item['title'],2)
                for record in item['records']:
                    # Explain: Add the specified content or structure to the Word document. Set the font appearance for this text or style.
                    p=doc.add_paragraph();p.paragraph_format.keep_with_next=True;cite(p,record)
                    p=doc.add_paragraph();p.paragraph_format.keep_with_next=True
                    r=p.add_run(record['code'].strip());r.font.name='Consolas';r.font.size=Pt(9)
                # Explain: Add the specified content or structure to the Word document. Run the following block when mission. Set paragraph spacing or pagination behavior.
                p=doc.add_paragraph();p.add_run('What this does  ').bold=True;p.add_run(item['meaning'])
                if mission:
                    p.paragraph_format.keep_with_next=True
                    # Explain: Add the specified content or structure to the Word document. Assign doc.core_properties.title from the value shown here. Write the completed Word document to its output path.
                    p=doc.add_paragraph();p.add_run('Mission relevance  ').bold=True;p.add_run(item['mission'])
        doc.core_properties.title=title
        output=ROOT/(filename+'_Updated.docx');doc.save(output)
        # Explain: Apply shutil.copy2(output,SRC/'documentation'/(filename+'.docx')) in the document-building sequence. Assign manifest from the value shown here. Record a presentation value or source-reference entry.
        shutil.copy2(output,SRC/'documentation'/(filename+'.docx'))
    manifest={'revision':REV,'feature_count':len(FEATURES),'spoken_words':len(re.findall(r'\S+',' '.join(t[1] for t in TALK))), 'features':[{k:v for k,v in f.items() if k!='refs'} for f in FEATURES]}
    (SRC/'documentation/feature_reference_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    # Explain: Assign print(json.dumps({'features':len(FEATURES),'exact_line_referen... from the value shown here. Run the following block when __name__=='__main__':build().
    print(json.dumps({'features':len(FEATURES),'exact_line_references':len(records),'spoken_words':manifest['spoken_words'],'revision':REV},indent=2))

if __name__=='__main__':build()
