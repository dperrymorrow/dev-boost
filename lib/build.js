"use strict";
const config = require("./config");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const engines = require("./engines");
const del = require("del");
const logger = require("./logger")("Build");
const npm = require("./npm");

module.exports = {
  async generate() {
    const start = new Date();
    await del(config.buildDir);
    fs.mkdirSync(config.buildDir);
    _parseDir(config.sourceDir);
    _parseNpm();
    const secs = (new Date().getTime() - start.getTime()) / 1000;
    logger.success(`Build has completed in ${secs} seconds`);
  },
};

function _parseNpm() {
  fs.mkdirSync(path.join(config.buildDir, "npm"));
  Object.keys(config.npm).forEach(link => {
    const npmFiles = npm(link, "build");
    const dest = npmFiles.getBuildPath();
    const source = npmFiles.getPath();

    logger.log(chalk.green("- Copying:"), source, "->", dest);

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(source, dest);
  });
}

function _parseDir(dir) {
  const items = fs.readdirSync(dir);
  const destDir = path.join(config.buildDir, dir.split(config.sourceDir)[1]);

  if (dir !== config.sourceDir && !fs.existsSync(destDir)) {
    logger.log(chalk.white.bold("Creating dir:"), destDir);
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
  let dest = renderer.destFile();
  const source = renderer.sourceFile();

  if (renderer.hasFile()) {
    logger.log(chalk.yellow("- Rendering:"), source, "->", dest);
    fs.writeFileSync(dest, renderer.render());
  } else {
    dest = _sourceToDest(filePath);
    logger.log(chalk.green("- Copying:"), filePath, "->", dest);
    fs.copyFileSync(filePath, dest);
  }
}

const _sourceToDest = source => path.join(config.buildDir, source.split(config.sourceDir)[1]);
