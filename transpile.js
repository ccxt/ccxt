"use strict";

const fs   = require ('fs');
const log  = require ('ololog');

// ---------------------------------------------------------------------------

const [ filename ] = process.argv;

function replaceInFile (filename, regex, replacement) {
    const contents = fs.readFileSync(filename, 'utf8');
    const parts = contents.split(regex);
    const newContents = parts[0] + replacement + parts[1];
    fs.truncateSync (filename);
    fs.writeFileSync (filename, newContents);
}

// one-time helpers

function transpileDerivedExchangeClass (contents) {
    const exchangeClassDeclarationMatches = contents.match(/^module\.exports\s*=\s*class\s+([\S]+)\s+extends\s+([\S]+)\s+{([\s\S]+?)^};*/m)
    const className = exchangeClassDeclarationMatches[1];
    const baseClass = exchangeClassDeclarationMatches[2];
    return { className, baseClass}
}

// ----------------------------------------------------------------------------

function transpileDerivedExchangeFile (folder, filename) {
    const contents = fs.readFileSync (folder + filename, 'utf8');
    return transpileDerivedExchangeClass (contents);
}

//-----------------------------------------------------------------------------

function transpileDerivedExchangeFiles (folder, pattern = '.js') {
    const classNames = fs.readdirSync (folder)
        .filter ((file) => file.includes(pattern))
        .map (file => transpileDerivedExchangeFile (folder, file));

    if (classNames.length === 0) return null;

    const classes = {};
    classNames.forEach(({ className, baseClass }) => classes[className] = baseClass);
    return classes
}

//-----------------------------------------------------------------------------

function exportTypeScriptDeclarations (classes) {
    const file = './ccxt.d.ts';
    const regex = /(?:    export class [^\s]+ extends [^\s]+ \{\}[\r]?[\n])+/;
    const replacement = Object.keys (classes).map (className => {
        const baseClass = classes[className];
        return '    export class ' + className + ' extends ' + baseClass + " {}"
    }).join ("\n") + "\n";
    replaceInFile (file, regex, replacement);
}

//-----------------------------------------------------------------------------

const classes = transpileDerivedExchangeFiles ('./js/', filename);

if (classes === null) {
    log.bright.yellow ('0 files transpiled.');
    return;
}

// HINT: if we're going to support specific class definitions this process won't work anymore as it will override the definitions.
exportTypeScriptDeclarations (classes);

//-----------------------------------------------------------------------------

log.bright.green ('Transpiled successfully.');
