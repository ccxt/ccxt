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
const partials = './wiki/partials/'
const partial = fs.readdirSync (partials).map (file => partials + file)
const outputFile = './wiki/spec.md'
const helper = './wiki/helpers.cjs'

console.log ('📰 loading js docs...')
let templateData = await Promise.all(inputFiles.map (file => jsdoc2md.getTemplateData({ files: file })));
templateData = templateData.filter (x => x.length > 0)
// TODO: handle alias exchanges

let proTemplateData = await Promise.all(proInputFiles.map (file => jsdoc2md.getTemplateData({ files: file })));
proTemplateData = proTemplateData.filter (x => x.length > 0)

// assign pro classes to REST template data
proTemplateData.forEach((proData) => {
  const classArray = templateData.find ((template) => template[0].id === proData[0].memberof);
  if (classArray) {
    const classArray = templateData.find ((template) => template[0].id === proData[0].memberof);
    classArray.push(...proData);
  }
})

console.log ('📰 rendering docs for each exchange...')
const template = fs.readFileSync ('./wiki/spec.hbs', 'utf8')

// Group docs by method
const groupedByMethod = templateData.reduce((acc, arr) => {
  arr.filter(obj => obj.kind === 'function' && !obj.ignore).forEach(obj => {
    const method = obj.name;
    if (!acc[method]) {
      acc[method] = [{
        id: method,
        longname: method,
        name: method,
        kind: "",
        scope: "instance",
        description: obj.description,
        params: obj.params,
        returns: obj.returns,
      }];
    }
    obj.exchange = obj.memberof
    obj.memberof = method
    acc[method].push(obj);
  });
  return acc;
}, {});

const templateDataGroupedByMethod = Object.values(groupedByMethod).sort((a, b) =>a[0].name < b[0].name ? -1 : 1)
console.log (templateDataGroupedByMethod)


const outputs = await Promise.all (templateDataGroupedByMethod.map (data => jsdoc2md.render ({ template, data, partial, helper})))

console.log ('📰 creating index of exchange functions')
const functions = Object.keys(groupedByMethod).sort ()
const alphabet = Array.from ( Array (26)).map((e, i) => String.fromCharCode(i + 97));

const index = {}
let i = -1
for (const char of alphabet) {
    do {
        index[char] = functions[++i]
    } while (char > functions[i])
}

fs.writeFileSync (outputFile, outputs.join ('\n---\n'))
console.log ('📰 finished rendering docs! 🙌 😶‍🌫')

})()
