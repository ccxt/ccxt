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
const basePartials = './wiki/basePartials/'
const basePartial = fs.readdirSync (basePartials).map (file => basePartials + file)
const exchangePartials = './wiki/exchangePartials/'
const exchangePartial = fs.readdirSync (exchangePartials).map (file => exchangePartials + file)
const outputFolder = './wiki/'
const outputFile = './wiki/baseSpec.md'
const helper = './wiki/helpers.cjs'

console.log ('📰 loading js docs...')
let templateData = await Promise.all(inputFiles.map (async (file) => {
  const data = await jsdoc2md.getTemplateData({ files: file })
  // remember the source exchange id so the output filename never depends on jsdoc's
  // doclet order (arrays are objects, so this survives the filter/find/push below)
  data.exchangeId = path.basename (file, '.js')
  return data
}));
// alias exchanges (binanceus, bequant, …) document no methods of their own, so jsdoc
// returns no doclets for them — drop those, they have no exchange page to render
templateData = templateData.filter (x => x.length > 0)
// every remaining exchange MUST expose its class-level doclet as the first entry, emitted
// from the /** @class <id> @augments <Parent> */ comment above the class. Without it jsdoc
// falls through to the first method doclet, whose name then leaks into the output as a
// phantom exchanges/<method>.md (e.g. fetchStatus.md / fetchBidsAsks.md), and the real page
// renders empty. Detect by name mismatch (the class doclet is named after the exchange;
// a leaked method is not) — kind is unreliable (jsdoc reports it as 'class' or 'constructor').
for (const data of templateData) {
  if (!data[0] || data[0].name !== data.exchangeId) {
    throw new Error (`🚨 ${data.exchangeId}.js exposes no class-level doclet (first doclet is '${data[0] && data[0].name}', kind '${data[0] && data[0].kind}'). Add a "/** @class ${data.exchangeId} @augments <Parent> */" comment above the class declaration in ts/src/${data.exchangeId}.ts.`)
  }
}

let proTemplateData = await Promise.all(proInputFiles.map (file => jsdoc2md.getTemplateData({ files: file })));
proTemplateData = proTemplateData.filter (x => x.length > 0)

// assign pro classes to REST template data
proTemplateData.forEach((proData) => {
  const classArray = templateData.find ((template) => template[0].id === proData[0].memberof);
  if (classArray) {
    classArray.push(...proData);
  }
})

// the pro-merge can append a method that the REST class already documents (e.g. the
// post-#27661 kucoinfutures pro class re-declares kucoinfutures#transfer / #fetchBidsAsks
// with identical @name). Drop duplicate doclets per exchange so each method renders once on
// the exchange page (the base-spec grouping already de-dups, but the per-exchange render did not).
templateData = templateData.map ((data) => {
  const seen = new Set ()
  const deduped = data.filter ((doclet) => {
    const key = doclet.id || doclet.longname
    if (seen.has (key)) {
      return false
    }
    seen.add (key)
    return true
  })
  deduped.exchangeId = data.exchangeId
  return deduped
})

console.log ('📰 rendering docs for each exchange...')
const template = fs.readFileSync ('./wiki/spec.hbs', 'utf8')

const outputByExchange = await Promise.all (templateData.map (data => jsdoc2md.render ({ template, data, partial: exchangePartial, helper })))
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

let duplicateIds = []
const templateDataGroupedByMethod = Object.values(groupedByMethod)
    .map(group => {
        // Filter out duplicate IDs within each group's data array. This is done to avoid Jsdoc2md error: Maximum call stack size exceeded
        return group.filter((item, index, self) => {
            if (index === self.findIndex(el => el.id === item.id)) {
                return true
            } else {
                console.error ('🚨 duplicate id found: ', item.id)
                duplicateIds.push (item.id)
                return false
            }
          }
        );
    })
    .sort((a, b) => a[0].name < b[0].name ? -1 : 1);

if (duplicateIds.length > 0) {
  throw new Error ('🚨 duplicate ids found: ' + duplicateIds.join (', '))
}

const baseOutput = await Promise.all(templateDataGroupedByMethod.map(data => 
    jsdoc2md.render({ template, data, partial: basePartial, helper})
));

console.log ('📰 creating index of exchange functions')
// remove stale per-exchange pages first, so renamed/removed exchanges (and any legacy
// phantom files) don't linger in wiki/exchanges/ and get pushed to the wiki
const exchangesDir = outputFolder + 'exchanges/'
if (fs.existsSync (exchangesDir)) {
  for (const f of fs.readdirSync (exchangesDir)) {
    if (f.endsWith ('.md')) {
      fs.unlinkSync (exchangesDir + f)
    }
  }
}
const exchangeLinks = []
outputByExchange.forEach ((output, i) => {
  const name = templateData[i].exchangeId
  const fileName = 'exchanges/' + name + '.md'
  try {
    fs.writeFileSync(outputFolder + fileName, output)
  } catch (e) {
    const error = `Error writing file ${fileName}: ${e.message}`
    console.error(error)
    throw error
  }
  exchangeLinks.push (`\t- [${name}](${fileName})`)
})


fs.writeFileSync (outputFile, baseOutput.join ('\n---\n'))

const sidebar =
`
- [Install](Install.md)
- [Examples](Examples.md)
- [Manual](Manual.md)
- [CCXT Pro](ccxt.pro.manual.md)
- [Contributing](CONTRIBUTING.md)
- [Supported Exchanges](Exchange-Markets.md)
- [Exchanges By Country](Exchange-Markets-By-Country.md)
- [API Spec By Method](baseSpec.md)
- [FAQ](FAQ.md)
- [Changelog](CHANGELOG.md)
- [Awesome](Awesome.md)
- API Spec by Exchange
${exchangeLinks.join('\n')}
`
fs.writeFileSync('./wiki/_sidebar.md', sidebar);

console.log ('📰 finished rendering docs! 🙌 😶‍🌫')

})()

