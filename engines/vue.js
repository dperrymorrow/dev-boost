"use strict";

const DomParser = require("dom-parser");

const stylus = require("./stylus");
const pug = require("./pug");
const compilers = {
  pug,
  stylus,
};

module.exports = raw => {
  const parser = new DomParser();
  const dom = parser.parseFromString(raw);

  const style = dom.getElementsByTagName("style")[0];
  let script = dom.getElementsByTagName("script")[0].innerHTML.trim();

  let templateStr = _getNodeContents(dom.getElementsByTagName("template")[0]);
  script = script.replace("{", `{\n  template: \`\n  ${templateStr}\`,\n`);

  if (style) {
    script += `\ndocument.getElementsByTagName('head')[0].innerHTML += \`<style>${_getNodeContents(
      style
    )}</style>\`;`;
  }
  return script;
};

function _getNodeContents(node) {
  const contents = node.innerHTML.trim();

  const lang = node.getAttribute("lang");
  if (lang) return compilers[lang](contents);
  return contents;
}
