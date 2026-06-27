const fs = require('fs');
let content = fs.readFileSync('ts/src/mudrex.ts', 'utf8');

content = content.replace(/async fetchLeverage \(\s*symbol: string,\s*params = \{\}\s*\) \{/, 'async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {');
content = content.replace(/async setLeverage \(\s*leverage: Int,\s*symbol: string = undefined,\s*params = \{\}\s*\) \{/, 'async setLeverage (leverage: Int, symbol: string = undefined, params = {}): Promise<any> {'); // Wait, the error said `expected: number` for leverage.
content = content.replace(/async setLeverage \(\s*leverage: Int,\s*/, 'async setLeverage (leverage: Int, '); // wait, leverage should be number or Int? Let's check ccxt base.

fs.writeFileSync('ts/src/mudrex.ts', content);
