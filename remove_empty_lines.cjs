const fs = require('fs');

function processFile(path) {
    let lines = fs.readFileSync(path, 'utf8').split('\n');
    let out = [];
    let insideMethod = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.match(/^    [a-zA-Z0-9_]+\s*\(/)) {
            insideMethod = true;
        } else if (line.match(/^    \}/)) {
            insideMethod = false;
        }
        
        if (insideMethod && line.trim() === '') {
            continue; // skip blank line inside method
        }
        out.push(line);
    }
    fs.writeFileSync(path, out.join('\n'));
}

processFile('ts/src/mudrex.ts');
processFile('ts/src/pro/mudrex.ts');
