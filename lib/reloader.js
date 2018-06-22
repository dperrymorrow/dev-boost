"use strict";

const WebSocket = require("ws");
const portfinder = require("portfinder");
const config = require("./config");
const chokidar = require("chokidar");
const notifier = require("node-notifier");
const debounce = require("lodash.debounce");
const chalk = require("chalk");
const engines = require("./engines");
const path = require("path");

let socket;
let wsUrl;
let watching = false;

module.exports = {
  async start(httpServer) {
    const port = await await portfinder.getPortPromise();
    const server = new WebSocket.Server({
      port,
      host: "localhost",
    });

    wsUrl = `ws://localhost:${port}`;
    server.on("connection", ws => {
      socket = ws;
      if (!watching) _watch();
    });
  },

  addScript(html) {
    const script = `<script>
    const ws = new WebSocket("${wsUrl}");
    ws.onmessage = event => {
      if (event.data.endsWith(".css")) {
        Array.from(document.getElementsByTagName("link")).forEach(link => {
          if (link.href.includes("localhost")) link.href = link.href.split("?")[0] + "?bust=" + new Date().getTime();
        });
      } else {
        window.location.reload();
      }
    };
    </script>`;
    const searchTags = ["</body>", "</head>", "</ body>", "</ head>"];
    const targetTag = searchTags.find(tag => html.includes(tag));
    return html.replace(targetTag, `${targetTag}${script}`);
  },
};

function _pushChange(event, fileName) {
  const colors = {
    change: "yellow",
    unlink: "red",
    add: "green",
  };

  const color = colors[event] || "cyan";
  console.log(chalk[color](event), fileName.split(config.sourceDir)[1]);
  let shortFile = fileName.split(config.sourceDir)[1];

  const ext = path.extname(fileName);
  const destExt = engines(fileName).findExt();

  try {
    socket.send(shortFile.replace(ext, `.${destExt}`));
    notifier.notify({
      title: fileName.split(config.sourceDir)[1],
      message: event,
    });
  } catch (err) {
    console.log(
      "There was a problem connection to the WebSocket client. Perhaps the window has closed"
    );
  }
}

function _watch() {
  watching = true;
  const watcher = chokidar.watch(config.sourceDir, { ignored: /[\/\\]\./ });

  setTimeout(() => {
    watcher.on("all", debounce(_pushChange, config.reloadWait));
  }, 1000);
}
