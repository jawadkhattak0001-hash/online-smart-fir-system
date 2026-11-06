const Module = require('module');
const path = require('path');

const stubs = {
  postcss: path.resolve(__dirname, 'postcss.js'),
  'postcss-load-config': path.resolve(__dirname, 'postcss-load-config.js'),
  tailwindcss: path.resolve(__dirname, 'tailwindcss.js'),
};

// Pre-populate the require cache so any require() call gets the stubs
Object.entries(stubs).forEach(([name, filePath]) => {
  const mod = new Module();
  mod._compile(require('fs').readFileSync(filePath, 'utf8'), filePath);
  require.cache[name] = mod;
  require.cache[filePath] = mod;
});

// Also patch _resolveFilename to catch edge cases
const origResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (Object.prototype.hasOwnProperty.call(stubs, request)) {
    return stubs[request];
  }
  return origResolve.call(this, request, parent, isMain, options);
};
