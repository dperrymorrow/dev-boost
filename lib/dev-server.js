"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const engines = require("./engines");
const portfinder = require("portfinder");
const notifier = require("node-notifier");
const config = require("./config");
const reloader = require("./reloader");

function _findFile(fileName) {
  if (fileName === "/") fileName = "/index.html";
  fileName = config.sourceDir + fileName;
  const renderer = engines(fileName);
  return renderer.hasFile() ? renderer.render(fileName) : false;
}

module.exports = {
  async serve() {
    portfinder.basePort = config.basePort;
    const port = await portfinder.getPortPromise();

    const server = http
      .createServer((req, res) => {
        req.url = req.url.split("?")[0];
        const ext = path.extname(req.url).replace(".", "");
        const mime = config.mimeTypes[ext] || "text/html";

        try {
          let data = _findFile(req.url);

          if (data) {
            if (mime === "text/html") data = reloader.addScript(data);
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

          notifier.notify({
            title: path.basename(req.url),
            message: err.message,
            sound: true,
          });

          console.log("error rendering:", chalk.bold.yellow(req.url));
          console.log(chalk.red(err.stack));
          res.write(`${req.url}\n${err.stack}`);
          res.end();
        }
      })
      .listen(port);

    await reloader.start(server);
    console.log(chalk.cyan(`listening at http://localhost:${port}`));
  },
};
