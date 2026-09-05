const authTabs = document.querySelectorAll("[data-auth-tab]");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const authStatus = document.querySelector("#auth-status");
const authDialog = document.querySelector("#auth-dialog");
const authClose = document.querySelector(".auth-close");

function showAuthForm(name) {
    const showLogin = name === "login";
    loginForm.hidden = !showLogin;
    signupForm.hidden = showLogin;

    authTabs.forEach(tab => {
        const selected = tab.dataset.authTab === name;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
    });

    authStatus.textContent = "Nothing is sent or saved.";
}

function openAuth(name) {
    showAuthForm(name);
    if (!authDialog.open) authDialog.showModal();
}

authTabs.forEach(tab => {
    tab.addEventListener("click", () => showAuthForm(tab.dataset.authTab));
});

document.querySelectorAll('.nav-account a[href*="#"]').forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        openAuth(link.hash === "#signup" ? "signup" : "login");
    });
});

authClose.addEventListener("click", () => authDialog.close());
authDialog.addEventListener("click", event => {
    if (event.target === authDialog) authDialog.close();
});

if (location.hash === "#login" || location.hash === "#signup") {
    openAuth(location.hash.slice(1));
}

[loginForm, signupForm].forEach(form => {
    form.addEventListener("submit", event => {
        event.preventDefault();
        authStatus.textContent = "Accounts are not connected yet. Nothing was sent or saved.";
        form.querySelectorAll('input[type="password"]').forEach(input => {
            input.value = "";
        });
    });
});
