# Connect PulseGuard accounts

The two account boxes use Firebase Authentication through `auth-provider.js`. Actual authentication remains unavailable until the owner supplies a Firebase web configuration in `auth-config.js`.

1. Register a web app in the Firebase project that will own these accounts.
2. In Authentication, enable Email/Password and Google. Set Google's support email.
3. Add `canopy10979.github.io` to Authentication's authorized domains. Add `localhost` only for local testing.
4. Replace null in `auth-config.js` with the public web configuration containing `apiKey`, `authDomain`, `projectId` and `appId`. Never publish passwords or Admin SDK private keys.
5. Deploy and test Google signup, returning Google sign-in, email signup, email sign-in, cancellation and sign-out with an account you control.

Both Google buttons open the account chooser. Firebase creates an account on the first successful Google authentication and signs in an existing user later. Email signup collects first name, last name, email and a password; the names become the Firebase display name. Passwords are never stored by the page. Firebase uses browser-session persistence. Authentication does not sync tracker contacts or enable background monitoring.

References: [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [email authentication](https://firebase.google.com/docs/auth/web/password-auth), [web setup](https://firebase.google.com/docs/web/alt-setup).
