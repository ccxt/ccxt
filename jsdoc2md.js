'use strict'
import jsdoc2md from 'jsdoc-to-markdown'
import fs from 'fs'
import path from 'path'
import dmd from 'dmd'


/* input and output paths */
const inputFile = 'js/src/binance.js'
const templateFilePath = 'template.hbs'
const inputDir = './js/src/'
const outputDir = './wiki/exchanges/'

const directoryPath = '/path/to/directory';
const filePaths = [];

// fs.readdir(directoryPath, (err, files) => {
//   if (err) {
//     console.error('Error reading directory:', err);
//     return;
//   }

//   files.forEach((file) => {
//     const filePath = path.join(directoryPath, file);
//     filePaths.push(filePath);
//   });
// });

/* get template data */
const templateData = jsdoc2md.getTemplateDataSync({ 
  files: inputFile})

const className = templateData[0].memberof
const template = fs.readFileSync(templateFilePath, 'utf8');
let dmdOutput = dmd(templateData)
const output = jsdoc2md.renderSync({ data: templateData, template: template })
fs.writeFileSync(path.resolve(outputDir, `${className}.md`), output)


// /* reduce templateData to an array of class names */
// const classNames = templateData.reduce((classNames, identifier) => {
//   if (identifier.kind === 'class') classNames.push(identifier.name)
//   return classNames
// }, [])

// /* create a documentation file for each class */
// for (const className of classNames) {
//   console.log(`rendering ${className}, template: ${template}`)
// }
