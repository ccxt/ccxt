"use strict";

const fs = require ('fs')
    , path = require ('path')
    , log = require ('ololog')
    , ansi = require ('ansicolor').nice

function replaceInFile (filename, regex, replacement) {
    let contents = fs.readFileSync (filename, 'utf8')
    const newContents = contents.replace (regex, replacement)
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContents)
}

function logReplaceInFile (message, filename, regex, replacement) {
    log.bright.cyan (message, filename.yellow)
    replaceInFile (filename, regex, replacement)
}

function copyFile (oldName, newName) {
    let contents = fs.readFileSync (oldName, 'utf8')
    fs.truncateSync (newName)
    fs.writeFileSync (newName, contents)
}

function overwriteFile (filename, contents) {
    // log.cyan ('Overwriting → ' + filename.yellow)
    fs.closeSync (fs.openSync (filename, 'a'));
    fs.truncateSync (filename)
    fs.writeFileSync (filename, contents)
}

function createFolder (folder) {
    try {
        fs.mkdirSync (folder)
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err
        }
    }
}

function createFolderRecursively (folder) {
    const parts = folder.split (path.sep)
    for (let i = 1; i <= parts.length; i++) {
        createFolder (path.join.apply (null, parts.slice (0, i)))
    }
}

function regexAll (text, array) {
    for (let i in array) {
        let regex = array[i][0]
        regex = typeof regex === 'string' ? new RegExp (regex, 'g') : new RegExp (regex)
        text = text.replace (regex, array[i][1])
    }
    return text
}

module.exports = {
    replaceInFile,
    logReplaceInFile,
    copyFile,
    overwriteFile,
    createFolder,
    createFolderRecursively,
    regexAll
}
