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
// const proInputFiles = findByExtensionSync('js/src/pro', 'js');
// const files = [ ...inputFiles, ...proInputFiles ]
const partials = './wiki/partials/'
const partial = fs.readdirSync (partials).map (file => partials + file)
const outputFile = './wiki/spec.md'
const helper = './wiki/helpers.cjs'

console.log ('📰 loading js docs...')
let templateData = await Promise.all(inputFiles.map (file => jsdoc2md.getTemplateData({ files: file })));
templateData = templateData.filter (x => x.length > 0)

console.log ('📰 rendering docs for each exchange...')
const template = fs.readFileSync ('./wiki/spec.hbs', 'utf8')
const outputs = await Promise.all (templateData.map (data => jsdoc2md.render ({ template, data, partial, helper })))

console.log ('📰 creating index of exchange classes')
const classes = templateData.map (data => data[0].id)
const alphabet = Array.from ( Array (26)).map((e, i) => String.fromCharCode(i + 97));

const index = {}
let i = -1
for (const char of alphabet) {
    do {
        index[char] = classes[++i]
    } while (char > classes[i])
}
index.b = 'binance'
index.o = 'okx'
index.h = 'huobi'

const result = []
for (const char of alphabet) {
    result.push (`[${char}](#${index[char]})`)
}
const markdown = result.join (' ')

fs.writeFileSync (outputFile, markdown + '\n' + outputs.join ('\n---\n'))
console.log ('📰 finished rendering docs! 🙌')

})()
