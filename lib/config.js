"use strict";

const path = require("path");
let config;

try {
  config = require(path.join(process.cwd(), ".dev-boost.json"));
} catch (err) {
  config = {};
}

const defaults = {
  sourceDir: "source",
  buildDir: "build",
  reloadWait: 500,
  basePort: 8000,
  npm: {},
  mimeTypes: {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    png: "image/png",
    js: "text/javascript",
    html: "text/html",
    css: "text/css",
  },
};

config = Object.assign(defaults, config);
config.sourceDir = path.join(process.cwd(), config.sourceDir);
config.buildDir = path.join(process.cwd(), config.buildDir);
module.exports = config;
