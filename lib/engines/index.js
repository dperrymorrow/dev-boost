"use strict";

const config = require("../config");
const vue = require("./vue");
const pug = require("./pug");
const stylus = require("./stylus");
const path = require("path");
const fs = require("fs");
const logger = require("../logger")("Render Engine");
// const reloader = require("../reloader");

const engines = {
  js: { sources: { vue } },
  html: { sources: { pug } },
  css: { sources: { stylus, styl: stylus } },
};

module.exports = filePath => {
  let ext = path.extname(filePath).replace(".", "");

  let matchingExt;
  let matchingFile = false;
  let needsCompiled = false;

  if (fs.existsSync(filePath)) {
    matchingFile = filePath;
  } else if (ext in engines) {
    matchingExt = Object.keys(engines[ext].sources).find(engine =>
      fs.existsSync(filePath.replace(ext, engine))
    );
    if (matchingExt) {
      matchingFile = filePath.replace(ext, matchingExt);
      logger.log(matchingFile, "->", filePath);
      needsCompiled = true;
    }
  }

  return {
    hasFile: () => matchingFile,
    findExt() {
      matchingExt = path.extname(matchingFile).replace(".", "");
      if (matchingExt) needsCompiled = matchingExt in engines ? false : true;
      ext = needsCompiled
        ? Object.keys(engines).find(engine => matchingExt in engines[engine].sources)
        : matchingExt;
      return ext;
    },

    render() {
      if (!matchingFile) return false;
      const raw = fs.readFileSync(matchingFile).toString();

      if (needsCompiled) return engines[ext].sources[matchingExt](raw, matchingFile);
      return raw;
    },
  };
};
