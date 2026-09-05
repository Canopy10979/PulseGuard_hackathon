const authTabs = document.querySelectorAll("[data-auth-tab]");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const authStatus = document.querySelector("#auth-status");

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

authTabs.forEach(tab => {
    tab.addEventListener("click", () => showAuthForm(tab.dataset.authTab));
});

[loginForm, signupForm].forEach(form => {
    form.addEventListener("submit", event => {
        event.preventDefault();
        authStatus.textContent = "Accounts are not connected yet. Nothing was sent or saved.";
        form.querySelectorAll('input[type="password"]').forEach(input => {
            input.value = "";
        });
    });
});
