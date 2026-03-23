import ccxt from '../../js/ccxt.js';

async function main () {
    const exchange = new ccxt.matrixport ({
        'apiKey': '',
        'secret': '',
    });

    try {
        const balance = await exchange.fetchBalance ();
        const currencies = Object.keys (balance).filter (
            (k) => ![ 'info', 'free', 'used', 'total', 'timestamp', 'datetime' ].includes (k)
        );
        const nonZero = currencies.filter ((c) => Number (balance[c].total) > 0);

        if (nonZero.length > 0) {
            console.log ('Your MatrixPort balances:');
            console.log ('');
            for (const code of nonZero) {
                console.log (`  ${code}:`);
                console.log (`    free:  ${balance[code].free}`);
                console.log (`    used:  ${balance[code].used}`);
                console.log (`    total: ${balance[code].total}`);
            }
        } else {
            console.log ('All balances are zero.');
        }
    } catch (e) {
        console.error ('Error fetching balance:', e instanceof Error ? e.message : String (e));
    }
}

main ();
