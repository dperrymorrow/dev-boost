const fs = require("fs");
const jsdom = require("jsdom");

const { JSDOM } = jsdom;
const pug = require("pug");

module.exports = function(filePath) {
  const dom = new JSDOM(fs.readFileSync(filePath).toString());

  const template = dom.window.document.querySelector("template");
  const script = dom.window.document.querySelector("script").innerHTML.trim();

  let templateStr = template.innerHTML.trim();
  if (template.getAttribute("lang") === "pug") templateStr = _renderPug(templateStr);
  return script.replace("{", `{\n  template: \`\n  ${templateStr}\`,\n`);
};

function _renderPug(str) {
  const options = {
    doctype: "html",
  };
  return pug.compile(str, options)();
}
