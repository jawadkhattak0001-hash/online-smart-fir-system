This repository contains two apps:

- `mobileApp` — the Expo React Native mobile application. Start it with:

  npm run start --prefix mobileApp

  or from the repo root:

  npm start

- `smartfir` — a web app (Vite + Tailwind) in the `smartfir` folder.

Notes:
- Do not run `npx expo start` from the repository root; use the `mobileApp` folder instead. The root `start` script now forwards to the mobile app.
- The root `postcss.config.js` is intentionally empty to avoid PostCSS async plugin issues if tooling is run from the repo root.
