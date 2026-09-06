// Explain: Find the HTML element that this code needs to read or update.
const authTabs = document.querySelectorAll("[data-auth-tab]");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
// Explain: Find the HTML element that this code needs to read or update.
const authStatus = document.querySelector("#auth-status");
const authDialog = document.querySelector("#auth-dialog");
const authClose = document.querySelector(".auth-close");

// Explain: Define showAuthForm with inputs name. Keep showLogin as name === "login". Set loginForm.hidden using !showLogin.
function showAuthForm(name) {
    const showLogin = name === "login";
    loginForm.hidden = !showLogin;
    // Explain: Set signupForm.hidden using showLogin. Run the callback for each item in the collection. Keep selected as tab.dataset.authTab === name.
    signupForm.hidden = showLogin;

    authTabs.forEach(tab => {
        const selected = tab.dataset.authTab === name;
        // Explain: Change the element classes that control its displayed state. Set an element attribute, including its accessible or visible state. Close the current block or callback.
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
    });

    // Explain: Set plain visible text on authStatus. Close the current block or callback. Define openAuth with inputs name.
    authStatus.textContent = "Nothing is sent or saved.";
}

function openAuth(name) {
    // Explain: Call showAuthForm with the values shown here. Open the dialog as a modal prompt. Close the current block or callback.
    showAuthForm(name);
    if (!authDialog.open) authDialog.showModal();
}

// Explain: Run the callback for each item in the collection. Connect click to its handler. Close the current block or callback.
authTabs.forEach(tab => {
    tab.addEventListener("click", () => showAuthForm(tab.dataset.authTab));
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
// Explain: Close the current block or callback. Check location.hash === "#login" || location.hash === "#signup". Select a portion of the value without changing the original.
});

if (location.hash === "#login" || location.hash === "#signup") {
    openAuth(location.hash.slice(1));
// Explain: Close the current block or callback. Run the callback for each item in the collection. Connect submit to its handler.
}

[loginForm, signupForm].forEach(form => {
    form.addEventListener("submit", event => {
        // Explain: Call event.preventDefault with the values shown here. Set plain visible text on authStatus. Find the HTML element that this code needs to read or update.
        event.preventDefault();
        authStatus.textContent = "Accounts are not connected yet. Nothing was sent or saved.";
        form.querySelectorAll('input[type="password"]').forEach(input => {
            // Explain: Set input.value using "". Close the current block or callback.
            input.value = "";
        });
    });
// Explain: Close the current block or callback.
});
