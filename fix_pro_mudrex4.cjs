const fs = require('fs');
let content = fs.readFileSync('ts/src/pro/mudrex.ts', 'utf8');

content = content.replace(/await this\.watchMultiple \(url, messageHashes, request, messageHashes, undefined, headers\);/g, `await this.watchMultiple (url, messageHashes, request, messageHashes);`);

fs.writeFileSync('ts/src/pro/mudrex.ts', content);
