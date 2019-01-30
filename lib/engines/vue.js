"use strict";

const compiler = require("vue-template-compiler");
const get = require("lodash.get");

const engines = {
  pug: require("./pug"),
  stylus: require("./stylus"),
};

module.exports = (raw, filePath) => {
  const parsed = compiler.parseComponent(raw);

  let templateStr = get(parsed, "template.content", "");
  let scriptStr = get(parsed, "script.content", "");

  if (parsed.template.lang in engines)
    templateStr = engines[parsed.template.lang](templateStr, filePath);
  else templateStr = templateStr.trim().replace(/`/g, "\\`");

  const styles = parsed.styles.map(style => {
    let styleStr = style.content;
    return style.lang in engines ? (styleStr = engines[style.lang](styleStr, filePath)) : styleStr;
  });

  if (styles.length) {
    scriptStr += `!function () {
      var style = document.createElement('style');
      style.innerHTML = \`${styles.join("/n")}\`;
      document.getElementsByTagName('head')[0].appendChild(style);
    }();`;
  }
  return scriptStr.replace(/export default ?\{/, `$&\n\ttemplate: \`\n${templateStr}\`,`);
};
