"use strict";
const stylus = require("stylus");

module.exports = raw => {
  const styl = stylus(raw);
  return styl.render();
};
