"use strict";

module.exports = {
  sourceDir: `${process.cwd()}/source/`,
  buildDir: `${process.cwd()}/build/`,
  reloadWait: 500,
  mimeTypes: {
    js: "text/javascript",
    html: "text/html",
    css: "text/css",
  },
  reloadOnChange: ["css", "html", "js"],
};
