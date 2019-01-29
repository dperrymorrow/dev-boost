"use strict";

const chalk = require("chalk");
const workingDir = process.cwd();

const emoj = {
  error: "💥",
  warn: "⚠️ ",
  log: "💬",
  success: "🙌",
};

const styles = {
  warn: {
    label: chalk.bgYellow.black.bold,
    msg: chalk.yellow,
  },
  error: {
    label: chalk.bgRed.black.bold,
    msg: chalk.red,
  },
  log: {
    label: chalk.bgBlack.bold.cyan,
    msg: chalk.cyan,
  },
  success: {
    label: chalk.bgGreen.bold.black,
    msg: chalk.green,
  },
};

const _truncate = str => (str.includes(workingDir) ? str.split(workingDir)[1] : str);

module.exports = function(label) {
  const _render = (msgType, strings) => {
    const args = [emoj[msgType], styles[msgType].label(` ${label} `)].concat(
      strings.map(str =>
        typeof str === "object"
          ? `\n${JSON.stringify(str, null, 2)}`
          : styles[msgType].msg(_truncate(str))
      )
    );
    console.log(...args);
  };

  return {
    warn() {
      const args = ["warn"];
      args.push(Array.from(arguments));
      return _render(...args);
    },
    error() {
      const args = ["error"];
      args.push(Array.from(arguments));
      return _render(...args);
    },
    log() {
      const args = ["log"];
      args.push(Array.from(arguments));
      return _render(...args);
    },
    success() {
      const args = ["success"];
      args.push(Array.from(arguments));
      return _render(...args);
    },
  };
};
