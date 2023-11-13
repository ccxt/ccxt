

import ccxt from '../../js/ccxt.js';
import ololog from 'ololog';
import ansicolor from 'ansicolor';
import asTable from 'as-table';

const { noLocate } = ololog;
const log = noLocate;

ansicolor.nice



const csv = process.argv.includes ('--csv'), delimiter = csv ? ',' : '|', asTableConfig = { delimiter: ' ' + delimiter + ' ', /* print: require ('string.ify').noPretty  */ }

asTable.configure (asTableConfig);

const sortCertified = process.argv.includes('--sort-certified')// || process.argv.includes('--certified')
const onlyCertified = process.argv.includes ('--certified')
const onlyRequired = process.argv.includes('--required')
const exchangesArgument = process.argv.find (arg => arg.startsWith ('--exchanges='))
const exchangesArgumentParts = exchangesArgument ? exchangesArgument.split ('=') : []
const selectedExchanges = (exchangesArgumentParts.length > 1) ? exchangesArgumentParts[1].split (',') : []

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)

async function main () {

    let total = 0
    let notImplemented = 0
	let notImplReq = 0
	let inexistentApi = 0
    let implemented = 0
    let emulated = 0
	let numErrors = 0

	// from https://docs.ccxt.com/#/README?id=exchanges
    const certified = [
        //'ascendex',
        'binance',
        'binancecoinm',
        'binanceusdm',
		'bitget',
        'bitmart',
		'bitmex',
        'bitvavo',
		'bybit',
		'cryptocom',
        // 'currencycom',
        //'ftx',
        'gateio',
        'huobi',
		'kucoin',
        // 'idex',
        'mexc',
        'okx',
        'wavesexchange',
		'woo',
        //'zb',
    ]

    let exchangeNames = onlyCertified ? certified : ccxt.unique (sortCertified ? certified.concat (ccxt.exchanges) : ccxt.exchanges)
	if (selectedExchanges.length > 0) {
		exchangeNames = exchangeNames.filter((name) => (selectedExchanges.includes(name) && ccxt.exchanges.includes(name)))
	}
	else{
		exchangeNames = exchangeNames.filter((name) => ccxt.exchanges.includes(name))
	}
	if (exchangeNames.length == 0){
		console.log('No exchanges meet all criteria, check input.')
		return;
	}
	let exchanges = exchangeNames.map(id => (Object.keys(ccxt.pro).includes(id) ? new ccxt.pro[id] () : new ccxt[id] ()))
    const metainfo = ccxt.flatten (exchanges.map (exchange => Object.keys (exchange.has)))
    const reduced = metainfo.reduce ((previous, current) => {
        previous[current] = (previous[current] || 0) + 1
        return previous
    }, {})
    const unified = Object.entries (reduced).filter (([ _, count ]) => count >= 1)
    const methods = unified.map (([ method, _ ]) => method).sort ()

    const table = asTable (exchanges.map (exchange => {
        let result = {};
        const basics = [
           // 'CORS',
            'spot',
            'margin',
            'swap',
            'future',
            'option',
        ];

		// from https://github.com/ccxt/ccxt/wiki/Requirements
		const required = [
			'fetchMarkets',
			'fetchCurrencies',
			'fetchTradingLimits',
			'fetchTradingFees',
			'fetchFundingLimits',
			'fetchTicker',
			'fetchOrderBook',
			'fetchTrades',
			'fetchOHLCV',
			'fetchBalance',
			'fetchAccounts',		//required if the exchange has multiple accounts or sub - accounts
			'createOrder',
			'cancelOrder',
			'editOrder',
			'fetchOrder',
			'fetchOpenOrders',
			'fetchOrders',
			'fetchMyTrades',
			'fetchDepositAddress',
			'fetchDeposits',
			'fetchWithdrawals',
			'fetchTransactions',
			'fetchLedger',
			'withdraw',
			'transfer', 			//required if exchange has multiple accounts or sub - accounts
		];

		const ignore = [
			'privateAPI',
			'publicAPI',
		];

		const methodList = onlyRequired ? ccxt.unique(basics.concat(required)) : ccxt.unique(basics.concat(methods))
		methodList.forEach (key => {

            total += 1

            let coloredString = '';

            const feature = exchange.has[key]
            const isFunction = (typeof exchange[key] === 'function')
            const isBasic = basics.includes (key)
			const isRequired = required.includes(key)

            if (feature === false) {
                // if explicitly set to 'false' in exchange.has (to exclude mistake, we check if it's undefined too)
				coloredString = isRequired ? exchange.id.underline.red.dim : exchange.id.red.dim
                inexistentApi += 1
            } else if (feature === 'emulated') {
                // if explicitly set to 'emulated' in exchange.has
                coloredString = exchange.id.yellow
                emulated += 1
            } else if (feature) {
                if (isBasic) {
                    // if neither 'false' nor 'emulated', and if  method exists
                    coloredString = exchange.id.green
                    implemented += 1
                } else {
                    if (isFunction) {
                        coloredString = exchange.id.green
                        implemented += 1
                    } else {
                        // the feature is available in exchange.has and not implemented
                        // this is an error
						if (!ignore.includes(key)){
							coloredString = exchange.id.lightMagenta.bgLightGray
							numErrors += 1
						}
                    }
                }
            } else {
				coloredString = isRequired ? exchange.id.lightRed.bgYellow : exchange.id.lightRed
                notImplemented += 1
				notImplReq += isRequired ? 1 : 0
            }

            result[key] = coloredString
        })

        return result
    }))

    if (csv) {
        let lines = table.split ("\n")
        lines = lines.slice (0, 1).concat (lines.slice (2))
        log (lines.join ("\n"))
    } else {
        log (table)
    }

    log ('Summary: ',
        exchangeNames.length.toString() + '/', ccxt.exchanges.length.toString () + ' exchanges; ',
        'Methods [' + total.toString () + ' total]: ',
        implemented.toString ().green, 'implemented,',
        emulated.toString ().yellow, 'emulated,',
        (inexistentApi.toString ().red.dim), 'does not exist in API,',
		(notImplemented.toString().lightRed), 'notImplemented with ' + (notImplReq.toString().lightRed.bgYellow) + ' Required',
		(numErrors.toString().lightMagenta.bgLightGray), 'inconsistent/Errors,',
    )

	if (total > 2500){log("\nToo much data? Try with --certified, --required, or --exchanges=name1,name2,name3".lightBlue);}
	log("\nMessy? Try piping to less (e.g. node script.js --certified | less -S -R)\n".blue)

}

main ()
