"use strict";

const vue = require("./vue");
const pug = require("./pug");
const stylus = require("./stylus");
const path = require("path");
const fs = require("fs");
const reloader = require("../lib/reloader");

const engines = {
  js: { sources: { vue } },
  html: { sources: { pug }, afterCompile: reloader.addScript },
  css: { sources: { stylus, styl: stylus } },
};

module.exports = filePath => {
  const ext = path.extname(filePath).replace(".", "");
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
      needsCompiled = true;
    }
  }

  return {
    hasFile: () => matchingFile,
    render() {
      if (!matchingFile) return false;
      const raw = fs.readFileSync(matchingFile).toString();

      if (needsCompiled) {
        let output = engines[ext].sources[matchingExt](raw, matchingFile);
        if (engines[ext].afterCompile) output = engines[ext].afterCompile(output);
        return output;
      }

      return raw;
    },
  };
};
