"user strict";
const config = require("./config");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const engines = require("./engines");

module.exports = {
  generate() {
    _parseDir(config.sourceDir);
  },
};

function _parseDir(dir) {
  const items = fs.readdirSync(dir);
  const destDir = _getDest(dir);

  if (dir !== config.sourceDir && !fs.existsSync(destDir)) {
    console.log(chalk.green("Creating dir:"), destDir.split(process.cwd())[1]);
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

  console.log(
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
