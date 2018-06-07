"use strict";

const vue = require("./vue");
const pug = require("./pug");
const stylus = require("./stylus");
const path = require("path");
const fs = require("fs");

const engines = {
  js: { vue },
  html: { pug },
  css: { stylus, styl: stylus },
};

module.exports = filePath => {
  const ext = path.extname(filePath).replace(".", "");
  let matchingExt;
  let matchingFile;

  if (ext in engines) {
    matchingExt = Object.keys(engines[ext]).find(engine =>
      fs.existsSync(filePath.replace(ext, engine))
    );
    matchingFile = filePath.replace(ext, matchingExt);
  }

  return {
    hasFile: () => matchingFile && matchingExt,
    render() {
      if (!matchingFile) return false;
      const raw = fs.readFileSync(matchingFile).toString();
      return engines[ext][matchingExt](raw);
    },
  };
};
