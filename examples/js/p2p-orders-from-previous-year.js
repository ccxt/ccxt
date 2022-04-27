const ccxt = require ('../../ccxt');
const keys = require ('../../keys.local.json');
const asTable  = require ('as-table').configure ({ delimiter: ' | ' });


async function main () {
    const binance = new ccxt.binance (keys.binance);

    const year = new Date ().getFullYear () - 1;
    const dateStrings = [ 
        `${year}-01-01T00:00:00`,
        `${year}-01-15T00:00:00`,
        `${year}-02-01T00:00:00`,
        `${year}-02-15T00:00:00`,
        `${year}-03-01T00:00:00`,
        `${year}-03-15T00:00:00`,
        `${year}-04-01T00:00:00`,
        `${year}-04-15T00:00:00`,
        `${year}-05-01T00:00:00`,
        `${year}-05-15T00:00:00`,
        `${year}-06-01T00:00:00`,
        `${year}-06-15T00:00:00`,
        `${year}-07-01T00:00:00`,
        `${year}-07-15T00:00:00`,
        `${year}-08-01T00:00:00`,
        `${year}-08-15T00:00:00`,
        `${year}-09-01T00:00:00`,
        `${year}-09-15T00:00:00`,
        `${year}-10-01T00:00:00`,
        `${year}-10-15T00:00:00`,
        `${year}-11-01T00:00:00`,
        `${year}-11-15T00:00:00`,
        `${year}-12-01T00:00:00`,
        `${year}-12-15T00:00:00`,
        `${year}-12-31T23:59:59`,
    ]
    const timestamps = dateStrings.map (dt => new Date (dt).getTime());

    let history = [];

    for (let i = 0; i < timestamps.length - 1; i++) {
        const startTime = timestamps[i];
        const endTime = timestamps[i+1] - 1;
        const oneMonthHistory = await binance.sapiGetC2cOrderMatchListUserOrderHistory ({
            'startTimestamp': startTime,
            'endTimestamp': endTime,
        });
        const result = oneMonthHistory['data'];
        history = history.concat (result);
    }
    console.log (asTable (history));
}

main ()
