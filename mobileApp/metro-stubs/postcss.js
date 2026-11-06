// Minimal PostCSS stub for Metro bundling.
module.exports = function() {
  return {
    process(css /*, opts */) {
      return { css: css || '', root: null, map: null, warnings: [] };
    }
  };
};
