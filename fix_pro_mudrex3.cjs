const fs = require('fs');
let content = fs.readFileSync('ts/src/pro/mudrex.ts', 'utf8');

content = content.replace(/await this\.watch \(url, messageHash, request, messageHash, undefined, headers\);/g, `await this.watch (url, messageHash, request, messageHash);`);

fs.writeFileSync('ts/src/pro/mudrex.ts', content);
