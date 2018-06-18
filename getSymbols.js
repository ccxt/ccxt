'use strict';

const fs = require('fs');
const tokens = require('./tokens.json');

const out = {};
const l = tokens.length;
for (let i = 0; i < l; i++) {
    const token = tokens[i];
    out[token['Address']] = token['Symbol'];
}

const toWrite = JSON.stringify(out);
fs.writeFileSync('./addressMapping.json', toWrite, 'utf8');
