"use strict";
const pug = require("pug");
const fs = require("fs");
const path = require("path");
const MultipleBasedirsPlugin = require("pug-multiple-basedirs-plugin");

module.exports = (raw, filePath) => {
  const options = {
    doctype: "html",
    filename: filePath,
    basedir: path.dirname(filePath),
    plugins: [MultipleBasedirsPlugin({ paths: [process.cwd(), path.dirname(filePath)] })],
  };
  return pug.compile(raw, options)();
};
