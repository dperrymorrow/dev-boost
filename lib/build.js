"use strict";
const config = require("./config");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const engines = require("./engines");
const del = require("del");
const logger = require("./logger")("Build");

module.exports = {
  async generate() {
    await del(config.buildDir);
    fs.mkdirSync(config.buildDir);
    _parseDir(config.sourceDir);
  },
};

function _parseDir(dir) {
  const items = fs.readdirSync(dir);
  const destDir = _getDest(dir);

  if (dir !== config.sourceDir && !fs.existsSync(destDir)) {
    logger.log("Creating dir:", destDir.split(process.cwd())[1]);
    fs.mkdirSync(destDir);
  }

  items.forEach(item => {
    if (item.startsWith(".")) return;
    const filePath = path.join(dir, item);
    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) _parseDir(filePath);
    if (stats.isFile()) _parseFile(filePath);
  });
}

function _parseFile(filePath) {
  const renderer = engines(filePath);
  const ext = renderer.findExt();
  const output = renderer.render();
  const dest = _getDest(filePath, ext);

  logger.log(
    chalk.cyan("Processing:"),
    filePath.split(process.cwd())[1],
    "->",
    dest.split(process.cwd())[1]
  );

  fs.writeFileSync(dest, output);
}

function _getDest(itemPath, targetExt = null) {
  if (targetExt) itemPath = itemPath.replace(path.extname(itemPath), `.${targetExt}`);
  return itemPath.replace(config.sourceDir, config.buildDir);
}
