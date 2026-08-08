import fs from 'fs';

// const allExchanges: {ids: string[], ws: string[]} = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const allExchanges = JSON.parse(fs.readFileSync('./exchanges.json', 'utf8'));

const SELECT_TAG = 'ccxt_select';
const TAG_PREFIX = 'ccxt_';

let extendedExchanges: { [key: string]: string } | null = null;

// Dynamic alias detection based on TypeScript inheritance analysis
function getExtendedExchanges (): { [key: string]: string } {
    if (!extendedExchanges) {
        const result: { [key: string]: string } = {};
        const tsFolder = './ts/src';

        allExchanges.ids.forEach((exchangeName: string) => {
            const filePath = `${tsFolder}/${exchangeName}.ts`;
            const content = fs.readFileSync(filePath, 'utf8');

            const inheritancePattern = /class (\w+) extends ([a-z0-9]+)/;
            const match = content.match(inheritancePattern);

            if (match) {
                const baseExchange = match[2];

                if (baseExchange.toLowerCase() !== exchangeName.toLowerCase()) {
                    result[exchangeName] = baseExchange;
                }
            }
        })
        extendedExchanges = result;
    }
    return extendedExchanges;
}

// The exchanges that inherit from exchangeName.
// A parents build flag constraint has to name them, since each childs
// Core struct embeds the parents and does not compile without it.
function getChildExchanges (exchangeName: string): string[] {
    const map = getExtendedExchanges();
    return Object.keys(map).filter((id) => map[id].toLowerCase() === exchangeName.toLowerCase()).sort();
}

function tagTerms (exchangeName: string): string[] {
    const ids = [ exchangeName.toLowerCase() ].concat(getChildExchanges(exchangeName));
    return ids.map((id: string) => TAG_PREFIX + id);
}

// Generates `//go:build !ccxt_select || ccxt_<id> [|| ccxt_<child>...]`.
function buildTagFor (exchangeName: string): string {
    return `//go:build !${SELECT_TAG} || ${tagTerms(exchangeName).join(' || ')}`;
}

// The exact negation of buildTagFor. For any tag set exactly
// one of the two files compiles: never both, never neither.
function stubTagFor (exchangeName: string): string {
    const negated = tagTerms(exchangeName).map((term: string) => '!' + term);
    return `//go:build ${SELECT_TAG} && ${negated.join(' && ')}`;
}

export {
    allExchanges,
    SELECT_TAG,
    getExtendedExchanges,
    getChildExchanges,
    buildTagFor,
    stubTagFor
}