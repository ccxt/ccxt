import fs from 'fs'
import path from 'path'

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

function writeFile (filename, contents) {
    // log.cyan ('Writing → ' + filename.yellow)
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

function checkCreateFolder (filePath) {
    const folder = path.dirname (filePath)
    if (!(fs.existsSync(folder) && fs.lstatSync(folder).isDirectory())) {
        fs.mkdirSync(folder, { recursive: true }, (err) => {
            if (err) throw err;
            console.log('Directory created successfully!');
        });
    }
}

export {
    replaceInFile,
    copyFile,
    overwriteFile,
    writeFile,
    createFolder,
    createFolderRecursively,
    checkCreateFolder,
}
