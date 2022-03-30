'use strict'
const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs')
const path = require('path')

function splitArray (array) {
  const arrays = []
  const chunkSize = 20;
  for (let i = 0; i < array.length; i += chunkSize) {
    arrays.push (array.slice (i, i + chunkSize));
  }
  return arrays;
}

/* input and output paths */
const outputDir = './wiki/exchange-specific-docs'

/* get template data */
const files = fs.readdirSync("./js").filter(file => path.extname(file) == '.js').map(file => `./js/${file}`)

const exchanges = splitArray(files);
exchanges.forEach(exchangeList =>  {
  const templateData = jsdoc2md.getTemplateDataSync({ files: exchangeList })
  
  /* reduce templateData to an array of class names */
  const classNames = templateData.reduce((classNames, identifier) => {
    if (identifier.kind === 'class') classNames.push(identifier.name)
    return classNames
  }, [])
  
  /* create a documentation file for each class */
  for (const className of classNames) {
    const template = (
    `{{#class name="${className}"}}` +
    `!!! These are auto-generated documentation created for details about specific exchanges. If you would like to read human created in depth documentation, please visit [docs.ccxt.com][https://docs.ccxt.com/en/latest/]` +
    `\n\n` +
    `{{>docs}}` +
    `\n\n` +
    `{{/class}}`)
  
    console.log(`rendering ${className}`)
    const output = jsdoc2md.renderSync({ data: templateData, template: template })
    fs.writeFileSync(path.resolve(outputDir, `${className}.md`), output)
  }
});