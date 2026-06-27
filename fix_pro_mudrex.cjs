const fs = require('fs');
let content = fs.readFileSync('ts/src/pro/mudrex.ts', 'utf8');

// Replace the watchTicker part
content = content.replace(/let headers = undefined;[\s\S]*?\}[\s\S]*?const subscribe: Dict = \{/, `this.options['ws'] = this.options['ws'] || {};
        this.options['ws']['options'] = this.options['ws']['options'] || {};
        this.options['ws']['options']['headers'] = this.options['ws']['options']['headers'] || {};
        if (brokerId !== undefined) {
            this.options['ws']['options']['headers']['Partner-Id'] = brokerId;
        }
        const subscribe: Dict = {`);
        
content = content.replace(/await this\.watch \(url, messageHash, request, messageHash, undefined, headers\);/g, `await this.watch (url, messageHash, request, messageHash);`);

fs.writeFileSync('ts/src/pro/mudrex.ts', content);
