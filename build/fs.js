"use strict";

const fs = require ('fs')
    , path = require ('path')

function replaceInFile (filename, regex, replacement) {
    const contents = fs.readFileSync (filename, 'utf8')
    const newContents = contents.replace (regex, replacement)
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContents)
}

function copyFile (oldName, newName) {
    const contents = fs.readFileSync (oldName, 'utf8')
    if (fs.existsSync (newName)) {
        fs.truncateSync (newName)
    }
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

module.exports = {
    replaceInFile,
    copyFile,
    overwriteFile,
    createFolder,
    createFolderRecursively,
}
