"use strict";
const pug = require("pug");
const fs = require("fs");

module.exports = raw => {
  const options = {
    doctype: "html",
  };
  return pug.compile(raw, options)();
};
