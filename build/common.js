"use strict";

const fs = require ('fs')

function replaceInFile (filename, regex, replacement) {
    let contents = fs.readFileSync (filename, 'utf8')
    const newContents = contents.replace (regex, replacement)
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContents)
}
