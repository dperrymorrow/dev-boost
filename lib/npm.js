"use strict";

const config = require("./config");
const fs = require("fs");
const path = require("path");
const npmPath = `${process.cwd()}/node_modules/`;
const logger = require("./logger")("NPM Files");

module.exports = function(filePath, mode = "dev") {
  const target = path.parse(filePath).name;

  return {
    hasFile: () => target in config.npm,
    render() {
      const file =
        typeof config.npm[target] === "object" ? config.npm[target][mode] : config.npm[target];;
      const npmDest = path.join(npmPath, target, file);
      try {
        logger.log(npmDest);
        return fs.readFileSync(npmDest);
      } catch (err) {
        logger.error("Problem finding", npmDest);
        throw err;
      }
    },
  };
};
