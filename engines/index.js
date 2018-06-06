"use strict";

const vue = require("./vue");
const pug = require("./pug");
const path = require("path");
const fs = require("fs");

const engines = {
  js: { vue },
  html: { pug },
};

module.exports = filePath => {
  const ext = path.extname(filePath).replace(".", "");
  let matchingExt;
  let matchingFile = false;

  if (ext in engines) {
    matchingExt = Object.keys(engines[ext]).find(engine =>
      fs.existsSync(filePath.replace(ext, engine))
    );
    matchingFile = filePath.replace(ext, matchingExt);
  }

  return {
    hasFile: () => matchingFile,
    render() {
      if (!matchingFile) return false;
      const raw = fs.readFileSync(matchingFile).toString();
      return engines[ext][matchingExt](raw);
    },
  };
};
