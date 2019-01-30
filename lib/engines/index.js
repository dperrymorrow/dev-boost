"use strict";

const config = require("../config");
const vue = require("./vue");
const pug = require("./pug");
const stylus = require("./stylus");
const path = require("path");
const fs = require("fs");
const logger = require("../logger")("Render Engine");

const engines = {
  js: { sources: { vue } },
  html: { sources: { pug } },
  css: { sources: { stylus, styl: stylus } },
};
// perhaps write some kind of find function later
const targets = {
  styl: "css",
  stylus: "css",
  pug: "html",
  vue: "js",
};

module.exports = function(filePath) {
  let ext = path.extname(filePath).replace(".", "");
  // for the build step
  if (ext in targets) {
    filePath = filePath.replace(ext, targets[ext]);
    ext = targets[ext];
  }

  let matchingExt;
  let matchingFile = false;
  let needsCompiled = false;

  if (ext in engines) {
    matchingExt = Object.keys(engines[ext].sources).find(engine =>
      fs.existsSync(filePath.replace(ext, engine))
    );
    if (matchingExt) {
      matchingFile = filePath.replace(ext, matchingExt);
      needsCompiled = true;
    }
  }

  return {
    hasFile: () => matchingFile,
    needsCompiled,
    sourceFile: () => matchingFile,

    ext,

    destFile() {
      return matchingFile ? path.join(config.buildDir, filePath.split(config.sourceDir)[1]) : null;
    },

    render() {
      if (!matchingFile) return false;
      const raw = fs.readFileSync(matchingFile).toString();
      return engines[ext].sources[matchingExt](raw, matchingFile);
    },
  };
};
