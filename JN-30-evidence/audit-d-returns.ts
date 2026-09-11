// JN-30 (d) audit: unified method return types in ts/src/base/Exchange.ts that mention
// a DERIVATIVES-family type -> does a Java class exist? is it in KNOWN_TYPES (the gate
// for the typed wrapper overloads in build/generateJavaWrappers.ts)?
import fs from 'fs';

const FAMILIES = new Set([
    'Position', 'FundingRate', 'FundingRates', 'FundingHistory', 'FundingRateHistory',
    'OpenInterest', 'OpenInterests', 'Liquidation', 'Greeks', 'AllGreeks',
    'MarginMode', 'MarginModes', 'MarketMarginModes', 'Leverage', 'Leverages',
    'LeverageTier', 'LeverageTiers', 'BorrowInterest', 'CrossBorrowRate', 'CrossBorrowRates',
    'IsolatedBorrowRate', 'IsolatedBorrowRates', 'ADL', 'Conversion', 'TransferEntry',
    'MarginModification', 'MarginLoan', 'LongShortRatio', 'Option', 'OptionChain',
    'LastPrice', 'LastPrices', 'Transaction', 'DepositAddress', 'PositionModeInfo',
]);

const exchange = fs.readFileSync ('ts/src/base/Exchange.ts', 'utf8').split ('\n');
const wrappers = fs.readFileSync ('build/generateJavaWrappers.ts', 'utf8');
const knownBlock = wrappers.match (/const KNOWN_TYPES = new Set\(\[([\s\S]*?)\]\)/);
const KNOWN = new Set ((knownBlock === null ? '' : knownBlock[1]).match (/'([A-Za-z0-9_]+)'/g).map ((n: string) => n.slice (1, -1)));

const typesPresent = new Set (fs.readdirSync ('java/lib/src/main/java/io/github/ccxt/types').filter (f => f.endsWith ('.java')).map (f => f.slice (0, -5)));

const re = /async (\w+) \((.*?)\): Promise<([A-Za-z0-9_]+)(\[\])?>/;
const rows: string[] = [];
const seen = new Set<string>();
for (const line of exchange) {
    const m = line.match (re);
    if (m === null) continue;
    const name = m[1];
    const ret = m[3];
    if (!FAMILIES.has (ret)) continue;
    const key = name + ':' + ret;
    if (seen.has (key)) continue;
    seen.add (key);
    rows.push ([
        name.padEnd (28),
        (ret + (m[4] === undefined ? '' : '[]')).padEnd (24),
        ('class=' + (typesPresent.has (ret) ? 'YES' : 'NO')).padEnd (11),
        ('KNOWN_TYPES=' + (KNOWN.has (ret) ? 'yes' : 'NO')),
    ].join (' '));
}
rows.sort ();
console.log (rows.join ('\n'));
console.log ('\ntotal distinct (method, family-type) pairs: ' + rows.length);
