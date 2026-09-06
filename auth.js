// Explain: Find the HTML element that this code needs to read or update.
const authTabs = document.querySelectorAll("[data-auth-tab]");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
// Explain: Find the HTML element that this code needs to read or update.
const authStatus = document.querySelector("#auth-status");
const authDialog = document.querySelector("#auth-dialog");
const authClose = document.querySelector(".auth-close");
// Explain: Initialize identity as null, busy = false, signedInUser = null. Define showAuthForm with inputs name. Keep showLogin as name === "login".
let identity = null, busy = false, signedInUser = null;

function showAuthForm(name) {
    const showLogin = name === "login";
    // Explain: Set loginForm.hidden using !showLogin. Set signupForm.hidden using showLogin. Set plain visible text on document.querySelector("#account-title").
    loginForm.hidden = !showLogin;
    signupForm.hidden = showLogin;
    document.querySelector("#account-title").textContent = showLogin ? "Welcome back" : "Join Safeguard";
    // Explain: Run the callback for each item in the collection. Keep selected as tab.dataset.authTab === name. Change the element classes that control its displayed state.
    authTabs.forEach(tab => {
        const selected = tab.dataset.authTab === name;
        tab.classList.toggle("active", selected);
        // Explain: Set an element attribute, including its accessible or visible state. Set tab.tabIndex using selected ? 0 : -1. Close the current block or callback.
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
    });
// Explain: Close the current block or callback. Define openAuth with inputs name. Call showAuthForm with the values shown here.
}
function openAuth(name) {
    showAuthForm(name);
    // Explain: Open the dialog as a modal prompt. Close the current block or callback. Run the callback for each item in the collection.
    if (!authDialog.open) authDialog.showModal();
}
authTabs.forEach((tab, index) => {
    // Explain: Connect click to its handler. Connect keydown to its handler. Check !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;.
    tab.addEventListener("click", () => showAuthForm(tab.dataset.authTab));
    tab.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        // Explain: Call event.preventDefault with the values shown here. Keep next as event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index. Continue the surrounding expression with authTabs[next].focus();.
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
        authTabs[next].focus();
        // Explain: Call showAuthForm with the values shown here. Close the current block or callback.
        showAuthForm(authTabs[next].dataset.authTab);
    });
});
// Explain: Find the HTML element that this code needs to read or update. Connect click to its handler. Call event.preventDefault with the values shown here.
document.querySelectorAll('.nav-account a[href*="#"]').forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        // Explain: Call openAuth with the values shown here. Close the current block or callback.
        openAuth(link.hash === "#signup" ? "signup" : "login");
    });
});
// Explain: Connect click to its handler. Close the dialog.
authClose.addEventListener("click", () => authDialog.close());
authDialog.addEventListener("click", event => {
    if (event.target === authDialog) authDialog.close();
// Explain: Close the current block or callback. Connect close to its handler. Find the HTML element that this code needs to read or update.
});
authDialog.addEventListener("close", () => {
    document.querySelectorAll('.auth-form input[type="password"]').forEach(input => input.value = "");
// Explain: Close the current block or callback. Check ["#login", "#signin", "#signup"].includes(location.hash)) openAuth(loca. Define showAccount with inputs user.
});
if (["#login", "#signin", "#signup"].includes(location.hash)) openAuth(location.hash === "#signup" ? "signup" : "login");

function showAccount(user) {
    // Explain: Set signedInUser using user. Find the HTML element that this code needs to read or update. Set plain visible text on document.querySelector("#account-user").
    signedInUser = user;
    document.querySelector("#account-session").hidden = !user;
    document.querySelector("#account-user").textContent = user ? "Signed in as " + (user.displayName || user.email || "your Google account") : "";
    // Explain: Set plain visible text on if (identity) authStatus. Close the current block or callback. Define setAuthBusy with inputs value.
    if (identity) authStatus.textContent = user ? "You are signed in on this browser tab." : "";
}
function setAuthBusy(value) {
    // Explain: Set busy using value. Find the HTML element that this code needs to read or update. Set an element attribute, including its accessible or visible state.
    busy = value;
    document.querySelectorAll('.auth-form button, #signout-button').forEach(button => button.disabled = value);
    authDialog.setAttribute("aria-busy", String(value));
// Explain: Close the current block or callback. Define authError with inputs error. Keep messages as {.
}
function authError(error) {
    const messages = {
        // Explain: Continue the text or argument value used by the surrounding expression.
        "auth/popup-closed-by-user": "Google sign-in was cancelled. You can try again.",
        "auth/popup-blocked": "Allow pop-ups for this site, then try Google again.",
        "auth/network-request-failed": "Check your connection and try again.",
        // Explain: Continue the text or argument value used by the surrounding expression.
        "auth/invalid-credential": "We could not sign you in. Check your email and password.",
        "auth/email-already-in-use": "Try signing in instead, or use another email.",
        "auth/weak-password": "Choose a stronger password with at least eight characters.",
        // Explain: Continue the text or argument value used by the surrounding expression.
        "auth/password-does-not-meet-requirements": "Choose a stronger password to meet the account requirements.",
        "auth/too-many-requests": "Too many attempts. Please wait before trying again.",
        "auth/unauthorized-domain": "Account sign-in is not available on this website yet.",
        // Explain: Continue the text or argument value used by the surrounding expression. Close the current block or callback. Return messages[error?.code] || "We could not complete this request. P.
        "auth/operation-not-allowed": "This sign-in option is not available yet."
    };
    return messages[error?.code] || "We could not complete this request. Please try again.";
// Explain: Close the current block or callback. Define submitAccount with inputs kind, google = false. Check busy) return;.
}
async function submitAccount(kind, google = false) {
    if (busy) return;
    // Explain: Keep form as kind === "login" ? loginForm : signupForm. Find the HTML element that this code needs to read or update. Check !identity.
    const form = kind === "login" ? loginForm : signupForm;
    const status = document.querySelector("#" + kind + "-status");
    if (!identity) {
        // Explain: Set plain visible text on status. Find the HTML element that this code needs to read or update. Return from this function.
        status.textContent = "Account sign-in is not available yet. Please try again later.";
        form.querySelector('input[type="password"]').value = "";
        return;
    // Explain: Close the current block or callback. Check !google && !form.reportValidity()) return;. Find the HTML element that this code needs to read or update.
    }
    // Google's own form is independent of the email and password fields.
    if (!google && !form.reportValidity()) return;
    const first = document.querySelector("#signup-first-name").value.trim();
    // Explain: Find the HTML element that this code needs to read or update. Check !google && kind === "signup" && (!first || !last. Set plain visible text on status.
    const last = document.querySelector("#signup-last-name").value.trim();
    if (!google && kind === "signup" && (!first || !last)) {
        status.textContent = "Enter your first and last name.";
        // Explain: Return from this function. Close the current block or callback. Call setAuthBusy with the values shown here.
        return;
    }
    setAuthBusy(true);
    // Explain: Set plain visible text on status. Run operations whose errors are handled below. Keep result as google ? await identity.google() : await identity[kind](form.e.
    status.textContent = google ? "Continue in the Google window…" : "Please wait…";
    try {
        // The popup starts in the button gesture before any asynchronous wait.
        const result = google ? await identity.google() : await identity[kind](form.elements.email.value.trim(), form.elements.password.value);
        // Explain: Initialize profileSaved as true. Check !google && kind === "signup". Run operations whose errors are handled below.
        let profileSaved = true;
        if (!google && kind === "signup") {
            try { await identity.name(result.user, first + " " + last); }
            // Explain: Handle an error from the preceding operation. Close the current block or callback. Call showAccount with the values shown here.
            catch (_) { profileSaved = false; }
        }
        showAccount(result.user);
        // Explain: Set plain visible text on status. Call form.reset with the values shown here. Set plain visible text on } catch (error) { status.
        status.textContent = profileSaved ? "You are signed in. Welcome to Safeguard." : "Your account was created and you are signed in, but your name could not be saved.";
        form.reset();
    } catch (error) { status.textContent = authError(error); }
    // Explain: Continue the surrounding expression with finally {. Find the HTML element that this code needs to read or update. Call setAuthBusy with the values shown here.
    finally {
        form.querySelector('input[type="password"]').value = "";
        setAuthBusy(false);
    // Explain: Close the current block or callback. Connect submit to its handler.
    }
}
loginForm.addEventListener("submit", event => {
    // Explain: Call event.preventDefault with the values shown here. Call submitAccount with the values shown here. Close the current block or callback.
    event.preventDefault();
    submitAccount("login");
});
// Explain: Connect submit to its handler. Call event.preventDefault with the values shown here. Call submitAccount with the values shown here.
signupForm.addEventListener("submit", event => {
    event.preventDefault();
    submitAccount("signup");
// Explain: Close the current block or callback. Find the HTML element that this code needs to read or update. Connect click to its handler.
});
document.querySelectorAll("[data-google]").forEach(button => {
    button.addEventListener("click", () => submitAccount(button.dataset.google, true));
// Explain: Close the current block or callback. Connect click to its handler. Check !identity || busy) return;.
});
document.querySelector("#signout-button").addEventListener("click", async () => {
    if (!identity || busy) return;
    // Explain: Call setAuthBusy with the values shown here. Run operations whose errors are handled below. Continue the surrounding expression with await identity.signout();.
    setAuthBusy(true);
    try {
        await identity.signout();
        // Explain: Call showAccount with the values shown here. Set plain visible text on document.querySelectorAll('.auth-form .auth-sta. Set plain visible text on authStatus.
        showAccount(null);
        document.querySelectorAll('.auth-form .auth-status').forEach(status => status.textContent = "");
        authStatus.textContent = "You are signed out.";
    // Explain: Set plain visible text on } catch (error) { authStatus. Continue the surrounding expression with finally { setAuthBusy(false); }. Close the current block or callback.
    } catch (error) { authStatus.textContent = authError(error); }
    finally { setAuthBusy(false); }
});
// Explain: Define prepareIdentity with inputs none. Keep config as window.SAFEGUARD_FIREBASE_CONFIG. Check !config || !["apiKey", "authDomain", "projectId", "appId"].every(key =>.
async function prepareIdentity() {
    const config = window.SAFEGUARD_FIREBASE_CONFIG;
    if (!config || !["apiKey", "authDomain", "projectId", "appId"].every(key => typeof config[key] === "string" && config[key].trim())) {
        // Explain: Set plain visible text on authStatus. Return from this function. Close the current block or callback.
        authStatus.textContent = "Account sign-in is not available yet. You can still use the tracker.";
        return;
    }
    // Explain: Call setAuthBusy with the values shown here. Set plain visible text on authStatus. Run operations whose errors are handled below.
    setAuthBusy(true);
    authStatus.textContent = "Connecting account sign-in…";
    try {
        // Explain: Continue the surrounding expression with const { connectIdentity } = await import("./auth-provider.js");. Set identity using await connectIdentity(config, showAccount). Call showAccount with the values shown here.
        const { connectIdentity } = await import("./auth-provider.js");
        identity = await connectIdentity(config, showAccount);
        showAccount(signedInUser);
    // Explain: Set plain visible text on } catch (_) { authStatus. Continue the surrounding expression with finally { setAuthBusy(false); }. Close the current block or callback.
    } catch (_) { authStatus.textContent = "Account sign-in could not connect. Check your connection and reload to try again."; }
    finally { setAuthBusy(false); }
}
// Explain: Call prepareIdentity with the values shown here.
prepareIdentity();
