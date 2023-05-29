'use strict'
import jsdoc2md from 'jsdoc-to-markdown'
import fs from 'fs'
import path from 'path'


/* input and output paths */

// Function to get all files that match the glob pattern
const findByExtensionSync = (dir, ext) => {
  const matchedFiles = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fileExt = path.extname(file);

    if (fileExt === `.${ext}`) {
      matchedFiles.push(path.join(dir,file));
    }
  }

  return matchedFiles;
};

// main function
(async ()=> {

// Get all files to read js docs
const inputFiles = findByExtensionSync('js/src', 'js')
const proInputFiles = findByExtensionSync('js/src/pro', 'js');
const files = [...inputFiles, ...proInputFiles, 'js/src/base/Exchange.js']

const outputDir = './wiki/exchanges/'

console.log ('📰 loading js docs...')
let templateData = await Promise.all(files.map(file => jsdoc2md.getTemplateData({ files: file })));
templateData = templateData.flat()

// create sidebar
const sidebarTemplate = fs.readFileSync('./wiki/_sidebar.hbs', 'utf8');
const sidebar = jsdoc2md.renderSync({ data: templateData, template: sidebarTemplate})
fs.writeFileSync(path.resolve('./wiki/', `_sidebar.md`), sidebar)

/* reduce templateData to an array of class names */
const classNames = templateData.reduce((classNames, identifier) => {
  if (identifier.kind === 'class') classNames.push(identifier.name)
  return classNames
}, [])

console.log ('📰 rendering docs for each exchange...')
await Promise.all(classNames.map(async (className) => {
  const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`;
  const output = await jsdoc2md.render({ data: templateData, template: template });
  await fs.promises.writeFile(path.resolve(outputDir, `${className}.md`), output);
}));
console.log ('📰 finished rendering docs! 🙌')
  
})()
