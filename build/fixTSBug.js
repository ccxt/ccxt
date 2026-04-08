
// check this for context
// https://github.com/microsoft/TypeScript/issues/50647

// Only required for TS > 4.4.7
import fs from 'fs'
import { join } from 'path'
import { replaceInFile } from './fsLocal.js'

function getAllFilesRecursively(folder, jsFiles) {
    fs.readdirSync(folder).forEach(File => {
        const absolute = join(folder, File);
        if (fs.statSync(absolute).isDirectory()) return getAllFilesRecursively(absolute, jsFiles);
        else return jsFiles.push(absolute);
    });
}


function main() {
    const folder = "./js/src/static_dependencies/";
    const jsFiles = [];
    getAllFilesRecursively(folder, jsFiles);

    const replaceRegex = /export {};/
    jsFiles.forEach(file => {
        replaceInFile(file, replaceRegex, "")
    })
}

main()