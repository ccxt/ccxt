const fs = require('fs');
let content = fs.readFileSync('ts/src/pro/mudrex.ts', 'utf8');

content = content.replace(/let headers = undefined;\s*if \(brokerId !== undefined\) \{\s*headers = \{\s*'Partner-Id': brokerId,\s*\};\s*\}/g, `this.options['ws'] = this.options['ws'] || {};
        this.options['ws']['options'] = this.options['ws']['options'] || {};
        this.options['ws']['options']['headers'] = this.options['ws']['options']['headers'] || {};
        if (brokerId !== undefined) {
            this.options['ws']['options']['headers']['Partner-Id'] = brokerId;
        }`);

fs.writeFileSync('ts/src/pro/mudrex.ts', content);
