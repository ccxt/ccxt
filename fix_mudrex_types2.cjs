const fs = require('fs');
let content = fs.readFileSync('ts/src/mudrex.ts', 'utf8');

content = content.replace(/async fetchLeverage \(symbol: string, params = \{\}\)/, 'async fetchLeverage (symbol: string, params = {}): Promise<Leverage>');
content = content.replace(/async setLeverage \(leverage: Int, symbol: string = undefined, params = \{\}\)/, 'async setLeverage (leverage: Int, symbol: string = undefined, params = {})');

// Wait, the error is about `leverage: Int`, let's change it to `leverage: number`
content = content.replace(/async setLeverage \(leverage: Int,/g, 'async setLeverage (leverage: number,');
// and wait, there is `Int` imported? `number` is built-in.

fs.writeFileSync('ts/src/mudrex.ts', content);
