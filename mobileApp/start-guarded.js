#!/usr/bin/env node
// Wrapper to start Expo with the require-hook preloaded
const { execSync } = require('child_process');
const path = require('path');

// Preload the require hook
require('./metro-stubs/require-hook.js');

// Now require and run Expo CLI
const cliPath = require.resolve('expo/bin/cli.js');
require(cliPath);
