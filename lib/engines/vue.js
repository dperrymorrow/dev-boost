"use strict";

const DomParser = require("dom-parser");

const stylus = require("./stylus");
const pug = require("./pug");
const compilers = {
  pug,
  stylus,
};

module.exports = (raw, filePath) => {
  const parser = new DomParser();
  const dom = parser.parseFromString(raw);

  const style = dom.getElementsByTagName("style")[0];
  let script = dom.getElementsByTagName("script")[0].innerHTML.trim();

  let templateStr = _getNodeContents(dom.getElementsByTagName("template")[0], filePath);

  if (script.includes("template,"))
    script = script.replace("template,", `template: \`${templateStr}\`,\n`);
  else script = script.replace("{", `{\n  template: \`\n  ${templateStr}\`,\n`);

  if (style) {
    script += `\ndocument.getElementsByTagName('head')[0].innerHTML += \`<style>\n${_getNodeContents(
      style,
      filePath
    )}</style>\`;`;
  }
  return script;
};

function _getNodeContents(node, filePath) {
  const contents = node.innerHTML.trim();

  const lang = node.getAttribute("lang");
  if (lang) return compilers[lang](contents, filePath);
  return contents;
}
