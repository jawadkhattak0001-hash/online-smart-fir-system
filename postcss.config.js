// Root-level PostCSS config intentionally empty to prevent accidental async PostCSS runs
// when starting tools from the repo root. The mobile app uses NativeWind at runtime
// and does not require PostCSS during Metro bundling.
module.exports = {
  plugins: []
};
