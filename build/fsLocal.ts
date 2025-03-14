import fs from 'fs'
import path from 'path'

function replaceInFile (filename: string, regex: RegExp, replacement: string) {
    const contents = fs.readFileSync (filename, 'utf8')
    const newContents = contents.replace (regex, replacement)
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContents)
}

function copyFile (oldName: string, newName: string) {
    const contents = fs.readFileSync (oldName, 'utf8')
    if (fs.existsSync (newName)) {
        fs.truncateSync (newName)
    }
    fs.writeFileSync (newName, contents)
}

function overwriteFile (filename: string, contents: string) {
    // log.cyan ('Overwriting → ' + filename.yellow)
    fs.closeSync (fs.openSync (filename, 'a'));
    fs.truncateSync (filename)
    fs.writeFileSync (filename, contents)
}

function writeFile (filename: string, contents: string) {
    // log.cyan ('Writing → ' + filename.yellow)
    fs.writeFileSync (filename, contents)
}

function createFolder (folder: string) {
    try {
        fs.mkdirSync (folder)
    } catch (err: any) {
        if (err.code !== 'EEXIST') {
            throw err
        }
    }
}

function createFolderRecursively (folder: string) {
    const parts = folder.split (path.sep)
    for (let i = 1; i <= parts.length; i++) {
        createFolder (path.join.apply (null, parts.slice (0, i)))
    }
}

function checkCreateFolder (filePath: string) {
    const folder = path.dirname (filePath)
    if (!(fs.existsSync(folder) && fs.lstatSync(folder).isDirectory())) {
        fs.mkdirSync(folder, { recursive: true });
        console.log('Directory created successfully!');
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
