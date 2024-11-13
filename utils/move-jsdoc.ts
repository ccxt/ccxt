import fs from 'fs';


const path = './ts/src/hollaex.ts';

const fileContent = fs.readFileSync(path, 'utf8');



function processFile(fileContent) {
    let fileSplit = fileContent.split('\n');

    const newFile: string[] = [];
    for (let i = 0; i < fileSplit.length; i++) {

        const currentLine = fileSplit[i];

        const isSignatureRegex = /\s*async\s\w+/;
        if (isSignatureRegex.test(currentLine)) {
            const nextLine = fileSplit[i + 1];
            const isJSDocRegex = /\s*\/\*\*/;
            if (isJSDocRegex.test(nextLine)) {
                let jsDocLines = [nextLine];
                let j = i + 2;
                while (fileSplit[j] && !/\s*\*\//.test(fileSplit[j])) {
                    jsDocLines.push(fileSplit[j]);
                    j++;
                }
                jsDocLines.push(fileSplit[j]);
                // remove 1 level of identation from jsdoc
                jsDocLines = jsDocLines.map((line) => '     ' + line.trim());
                newFile.push(jsDocLines.join('\n'));
                newFile.push(currentLine);
                i = j;
            } else {
                newFile.push(currentLine);
            }
        } else {
            newFile.push(currentLine);
        }
    }

    const updatedContent = newFile.join('\n');
    return updatedContent;
}

// Process the file content
const updatedContent = processFile(fileContent);

// Write the updated content back to the file
fs.writeFileSync(path, updatedContent, 'utf8');

console.log(`File has been updated: ${path}`);