"use strict";
const stylus = require("stylus");
const config = require("../config");
const path = require("path");

module.exports = (raw, filePath) => {
  const styl = stylus(raw);
  styl.set("paths", [config.sourceDir, path.dirname(filePath)]);
  return styl.render();
};
