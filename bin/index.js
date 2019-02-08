#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const logger = require("../lib/logger")("Dev Boost CLI");
const devServer = require("../lib/dev-server");
const build = require("../lib/build");
const defaultConfig = Object.assign(require("../lib/config"), {
  sourceDir: "src/",
  buildDir: "docs/",
});
const configPath = path.join(process.cwd(), ".dev-boost.json");

const args = process.argv;
const commands = {
  serve: devServer.serve,
  build: build.generate,
  init() {
    if (fs.existsSync(configPath))
      logger.warn("there is already a .dev-boost.json file presen)t, skipping");
    else fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  },
};

let command = args.pop();
command = command in commands ? command : "serve";
commands[command]();
