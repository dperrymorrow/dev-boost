"use strict";
const pug = require("pug");
const fs = require("fs");

module.exports = function(filePath) {
  const raw = fs.readFileSync(filePath);
  const options = {
    doctype: "html",
  };
  return pug.compile(raw, options)();
};
