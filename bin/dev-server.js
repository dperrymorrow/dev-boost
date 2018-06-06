#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const source = "/source";
const chalk = require("chalk");
const engines = require("../engines");
const portfinder = require("portfinder");

const mimeTypes = {
  js: "text/javascript",
  html: "text/html",
};

function _findFile(fileName) {
  if (fileName === "/") fileName = "/index.html";
  fileName = process.cwd() + source + fileName;

  if (fs.existsSync(fileName)) return fs.readFileSync(fileName).toString();

  const renderer = engines(fileName);
  return renderer.hasFile() ? renderer.render(fileName) : false;
}

async function _serve() {
  const port = await portfinder.getPortPromise();

  http
    .createServer((req, res) => {
      const ext = path.extname(req.url).replace(".", "");
      const mime = mimeTypes[ext] || "text/html";

      try {
        const data = _findFile(req.url);

        if (data) {
          res.writeHead(200, { "Content-Type": mime });
          res.write(data);
          res.end();
        } else {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.write(`<h1>${req.url} was not found<h1>`);
          res.end();
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text" });
        console.log("error rendering:", chalk.bold.yellow(req.url));
        console.log(chalk.red(err.stack));
        res.write(`${req.url}\n${err.message}`);
        res.end();
      }
    })
    .listen(port);

  console.log(chalk.cyan(`listening at http://localhost:${port}`));
}

_serve();
