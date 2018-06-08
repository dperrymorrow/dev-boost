#!/usr/bin/env node
"use strict";

const devServer = require("../lib/dev-server");
const build = require("../lib/build");

const args = process.argv;
const commands = {
  serve: devServer.serve,
  build: build.generate,
};

let command = args.pop();
command = command in commands ? command : "serve";
commands[command]();
