"use strict";

const open = require("open");
const http = require("http");
const path = require("path");
const engines = require("./engines");
const portfinder = require("portfinder");
const notifier = require("node-notifier");
const config = require("./config");
const reloader = require("./reloader");
const logger = require("./logger")("Dev Server");
const npm = require("./npm");
const fs = require("fs");

function _findFile(fileName) {
  if (fileName === "/") fileName = "/index.html";
  fileName = config.sourceDir + fileName;

  if (fs.existsSync(fileName)) return fs.readFileSync(fileName, "utf-8");

  const npmFiles = npm(fileName);
  const renderer = engines(fileName);

  if (npmFiles.hasFile()) return npmFiles.render();
  return renderer.hasFile() ? renderer.render() : false;
}

module.exports = {
  async serve() {
    portfinder.basePort = config.basePort;
    const port = await portfinder.getPortPromise();

    logger.log("config", config);

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

          logger.error("error rendering", req.url, err.stack);
          res.write(`${req.url}\n${err.stack}`);
          res.end();
        }
      })
      .listen(port);

    await reloader.start(server);
    logger.log(`listening at http://localhost:${port}`);
    open(`http://localhost:${port}`);
  },
};
