# mobileApp (Expo)

Quick start for running the app on Expo Go (mobile only).

- Start the dev server (clears cache):

```powershell
npx expo start -c
# or
npm run start:mobile
```

Note: `npm run start:mobile` now preloads a small require-hook that forces PostCSS/Tailwind modules to resolve to mobile-safe stubs so Metro/Babel transforms won't attempt to run PostCSS plugins at bundle time.

- Open the Metro DevTools, set connection to "Tunnel" if needed, then scan the QR code with Expo Go.

Troubleshooting:
- If NativeWind styles don't appear, make sure the NativeWind Babel plugin is enabled (it auto-enables when `nativewind/preset` is installed). To explicitly disable the plugin for debugging, run (PowerShell):

```powershell
$env:DISABLE_NATIVEWIND_BABEL='1'; npx expo start -c
```

- If you ran into Metro/PostCSS errors previously, the project contains protective stubs and an empty `postcss.config.js` to prevent PostCSS from executing during bundling. You usually won't need to change them for mobile-only development.

Notes:
- Keep the `TestComponent` in `src/components/TestComponent.js` to validate NativeWind setup while developing.
- If you want, I can remove the stubs and extra guards once you're satisfied everything is stable.
