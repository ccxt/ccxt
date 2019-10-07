// ---------------------------------------------------------------------------
// Usage:
//
//      npm run transpile
// ---------------------------------------------------------------------------

"use strict";

const fs   = require ('fs')
    , {
        replaceInFile,
        logReplaceInFile,
        overwriteFile,
        createFolderRecursively,
        regexAll
    } = require ('./common.js')
    , { basename } = require ('path')
    , log  = require ('ololog')
    , ansi = require ('ansicolor').nice
    , errors = require ('../js/base/errors.js')
    , { unCamelCase } = require ('../js/base/functions.js')
    , { precisionConstants } = require ('../js/base/functions/number.js')

// ---------------------------------------------------------------------------

const [ /* node */, /* script */, filename ] = process.argv

// ----------------------------------------------------------------------------
// TODO: rewrite commonRegexes from hardcoded logic to conversion methods

const commonRegexes = [

    [ /\.deepExtend\s/g, '.deep_extend'],
    [ /\.safeFloat2\s/g, '.safe_float_2'],
    [ /\.safeInteger2\s/g, '.safe_integer_2'],
    [ /\.safeIntegerProduct2\s/g, '.safe_integer_product_2'],
    [ /\.safeTimestamp2\s/g, '.safe_timestamp_2'],
    [ /\.safeString2\s/g, '.safe_string_2'],
    [ /\.safeStringLower2\s/g, '.safe_string_lower_2'],
    [ /\.safeStringUpper2\s/g, '.safe_string_upper_2'],
    [ /\.safeValue2\s/g, '.safe_value_2'],
    [ /\.safeFloat\s/g, '.safe_float'],
    [ /\.safeInteger\s/g, '.safe_integer'],
    [ /\.safeIntegerProduct\s/g, '.safe_integer_product'],
    [ /\.safeTimestamp\s/g, '.safe_timestamp'],
    [ /\.safeString\s/g, '.safe_string'],
    [ /\.safeStringLower\s/g, '.safe_string_lower'],
    [ /\.safeStringUpper\s/g, '.safe_string_upper'],
    [ /\.safeValue\s/g, '.safe_value'],
    [ /\.inArray\s/g, '.in_array'],
    [ /\.toArray\s/g, '.to_array'],
    [ /\.isEmpty\s/g, '.is_empty'],
    [ /\.arrayConcat\s/g, '.array_concat'],
    [ /\.binaryConcat\s/g, '.binary_concat'],
    [ /\.binaryToString\s/g, '.binary_to_string' ],
    [ /\.precisionFromString\s/g, '.precision_from_string'],
    [ /\.implodeParams\s/g, '.implode_params'],
    [ /\.extractParams\s/g, '.extract_params'],
    [ /\.parseBalance\s/g, '.parse_balance'],
    [ /\.parseOHLCVs\s/g, '.parse_ohlcvs'],
    [ /\.parseOHLCV\s/g, '.parse_ohlcv'],
    [ /\.parseDate\s/g, '.parse_date'],
    [ /\.parseLedgerEntry\s/g, '.parse_ledger_entry'],
    [ /\.parseLedger\s/g, '.parse_ledger'],
    [ /\.parseTicker\s/g, '.parse_ticker'],
    [ /\.parseTimeframe\s/g, '.parse_timeframe'],
    [ /\.parseTradesData\s/g, '.parse_trades_data'],
    [ /\.parseTrades\s/g, '.parse_trades'],
    [ /\.parseTrade\s/g, '.parse_trade'],
    [ /\.parseTradingViewOHLCV\s/g, '.parse_trading_view_ohlcv'],
    [ /\.parseTransaction\s/g, '.parse_transaction'],
    [ /\.parseTransactions\s/g, '.parse_transactions'],
    [ /\.parseOrderBook\s/g, '.parse_order_book'],
    [ /\.parseBidsAsks\s/g, '.parse_bids_asks'],
    [ /\.parseBidAsk\s/g, '.parse_bid_ask'],
    [ /\.parseOrders\s/g, '.parse_orders'],
    [ /\.parseOrderStatus\s/g, '.parse_order_status'],
    [ /\.parseOrder\s/g, '.parse_order'],
    [ /\.parseJson\s/g, '.parse_json'],
    [ /\.filterByArray\s/g, '.filter_by_array'],
    [ /\.filterBySymbolSinceLimit\s/g, '.filter_by_symbol_since_limit'],
    [ /\.filterBySinceLimit\s/g, '.filter_by_since_limit'],
    [ /\.filterBySymbol\s/g, '.filter_by_symbol'],
    [ /\.getVersionString\s/g, '.get_version_string'],
    [ /\.indexBy\s/g, '.index_by'],
    [ /\.sortBy\s/g, '.sort_by'],
    [ /\.filterBy\s/g, '.filter_by'],
    [ /\.groupBy\s/g, '.group_by'],
    [ /\.findMarket\s/g, '.find_market'],
    [ /\.findSymbol\s/g, '.find_symbol'],
    [ /\.marketIds\s/g, '.market_ids'],
    [ /\.marketId\s/g, '.market_id'],
    [ /\.fetchFundingFees\s/g, '.fetch_funding_fees'],
    [ /\.fetchTradingFees\s/g, '.fetch_trading_fees'],
    [ /\.fetchTradingFee\s/g, '.fetch_trading_fee'],
    [ /\.fetchFees\s/g, '.fetch_fees'],
    [ /\.fetchL2OrderBook\s/g, '.fetch_l2_order_book'],
    [ /\.fetchOrderBook\s/g, '.fetch_order_book'],
    [ /\.fetchMyTrades\s/g, '.fetch_my_trades'],
    [ /\.fetchOrderStatus\s/g, '.fetch_order_status'],
    [ /\.fetchOpenOrders\s/g, '.fetch_open_orders'],
    [ /\.fetchOpenOrder\s/g, '.fetch_open_order'],
    [ /\.fetchOrders\s/g, '.fetch_orders'],
    [ /\.fetchOrderTrades\s/g, '.fetch_order_trades'],
    [ /\.fetchOrder\s/g, '.fetch_order'],
    [ /\.fetchBidsAsks\s/g, '.fetch_bids_asks'],
    [ /\.fetchTickers\s/g, '.fetch_tickers'],
    [ /\.fetchTicker\s/g, '.fetch_ticker'],
    [ /\.fetchCurrencies\s/g, '.fetch_currencies'],
    [ /\.numberToString\s/g, '.number_to_string' ],
    [ /\.decimalToPrecision\s/g, '.decimal_to_precision'],
    [ /\.priceToPrecision\s/g, '.price_to_precision'],
    [ /\.amountToPrecision\s/g, '.amount_to_precision'],
    [ /\.amountToLots\s/g, '.amount_to_lots'],
    [ /\.feeToPrecision\s/g, '.fee_to_precision'],
    [ /\.currencyToPrecision\s/g, '.currency_to_precision'],
    [ /\.costToPrecision\s/g, '.cost_to_precision'],
    [ /\.commonCurrencyCode\s/g, '.common_currency_code'],
    [ /\.loadAccounts\s/g, '.load_accounts'],
    [ /\.loadFees\s/g, '.load_fees'],
    [ /\.loadMarkets\s/g, '.load_markets'],
    [ /\.fetchMarkets\s/g, '.fetch_markets'],
    [ /\.appendInactiveMarkets\s/g, '.append_inactive_markets'],
    [ /\.fetchCategories\s/g, '.fetch_categories'],
    [ /\.calculateFee\s/g, '.calculate_fee'],
    [ /\.editLimitBuyOrder\s/g, '.edit_limit_buy_order'],
    [ /\.editLimitSellOrder\s/g, '.edit_limit_sell_order'],
    [ /\.editLimitOrder\s/g, '.edit_limit_order'],
    [ /\.editOrder\s/g, '.edit_order'],
    [ /\.encodeURIComponent\s/g, '.encode_uri_component'],
    [ /\.throwExceptionOnError\s/g, '.throw_exception_on_error'],
    [ /\.handleErrors\s/g, '.handle_errors'],
    [ /\.checkRequiredCredentials\s/g, '.check_required_credentials'],
    [ /\.checkRequiredDependencies\s/g, '.check_required_dependencies'],
    [ /\.checkAddress\s/g, '.check_address'],
    [ /\.convertTradingViewToOHLCV\s/g, '.convert_trading_view_to_ohlcv'],
    [ /\.convertOHLCVToTradingView\s/g, '.convert_ohlcv_to_trading_view'],
    [ /\.signBodyWithSecret\s/g, '.sign_body_with_secret'],
    [ /\.isJsonEncodedObject\s/g, '.is_json_encoded_object'],
    [ /\.setSandboxMode\s/g, '.set_sandbox_mode'],
    [ /\.safeCurrencyCode\s/g, '.safe_currency_code'],
    [ /\.roundTimeframe/g, '.round_timeframe'],
    [ /errorHierarchy/g, 'error_hierarchy'],
    [ /\'use strict\';?\s+/g, '' ],
]

// ----------------------------------------------------------------------------

const pythonRegexes = [

    [ /Array\.isArray\s*\(([^\)]+)\)/g, 'isinstance($1, list)' ],
    [ /([^\(\s]+)\s+instanceof\s+([^\)\s]+)/g, 'isinstance($1, $2)' ],

    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'undefined\'/g, '$1[$2] is None' ],
    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'undefined\'/g, '$1[$2] is not None' ],
    [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'undefined\'/g, '$1 is None' ],
    [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'undefined\'/g, '$1 is not None' ],
    [ /typeof\s+(.+?)\s+\=\=\=?\s+\'undefined\'/g, '$1 is None' ],
    [ /typeof\s+(.+?)\s+\!\=\=?\s+\'undefined\'/g, '$1 is not None' ],

    [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+undefined/g, '$1[$2] is None' ],
    [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+undefined/g, '$1[$2] is not None' ],
    [ /([^\s]+)\s+\=\=\=?\s+undefined/g, '$1 is None' ],
    [ /([^\s]+)\s+\!\=\=?\s+undefined/g, '$1 is not None' ],
    [ /(.+?)\s+\=\=\=?\s+undefined/g, '$1 is None' ],
    [ /(.+?)\s+\!\=\=?\s+undefined/g, '$1 is not None' ],

    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'string\'/g, 'isinstance($1[$2], basestring)' ],
    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'string\'/g, 'not isinstance($1[$2], basestring)' ],
    [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'string\'/g, 'isinstance($1, basestring)' ],
    [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'string\'/g, 'not isinstance($1, basestring)' ],
    [ /undefined/g, 'None' ],
    [ /\=\=\=?/g, '==' ],
    [ /\!\=\=?/g, '!=' ],
    [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
    [ /this\.stringToBase64\s/g, 'base64.b64encode' ],
    [ /this\.base64ToBinary\s/g, 'base64.b64decode' ],
    [ /\.shift\s*\(\)/g, '.pop(0)' ],

// insert common regexes in the middle (critical)
].concat (commonRegexes).concat ([

    // [ /this\.urlencode\s/g, '_urlencode.urlencode ' ], // use self.urlencode instead
    [ /this\./g, 'self.' ],
    [ /([^a-zA-Z\'])this([^a-zA-Z])/g, '$1self$2' ],
    [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\[\s*([^\]]+)\s\]/g, '$1$2' ],
    [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\{\s*([^\}]+)\s\}\s\=\s([^\;]+)/g, '$1$2 = (lambda $2: ($2))(**$3)' ],
    [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s/g, '$1' ],
    [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
    [ /Object\.keys\s*\((.*)\)/g, 'list($1.keys())' ],
    [ /\[([^\]]+)\]\.join\s*\(([^\)]+)\)/g, "$2.join([$1])" ],
    [ /hash \(([^,]+)\, \'(sha[0-9])\'/g, "hash($1, '$2'" ],
    [ /hmac \(([^,]+)\, ([^,]+)\, \'(md5)\'/g, 'hmac($1, $2, hashlib.$3' ],
    [ /hmac \(([^,]+)\, ([^,]+)\, \'(sha[0-9]+)\'/g, 'hmac($1, $2, hashlib.$3' ],
    [ /throw new ([\S]+) \((.*)\)/g, 'raise $1($2)'],
    [ /throw ([\S]+)/g, 'raise $1'],
    [ /try {/g, 'try:'],
    [ /\}\s+catch \(([\S]+)\) {/g, 'except Exception as $1:'],
    [ /([\s\(])extend(\s)/g, '$1self.extend$2' ],
    [ /\} else if/g, 'elif' ],
    [ /else if/g, 'elif' ],
    [ /if\s+\((.*)\)\s+\{/g, 'if $1:' ],
    [ /if\s+\((.*)\)\s*[\n]/g, "if $1:\n" ],
    [ /\}\s*else\s*\{/g, 'else:' ],
    [ /else\s*[\n]/g, "else:\n" ],
    [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(?:\<=|\>=|<|>)\s*(.*)\.length\s*\;[^\)]+\)\s*{/g, 'for $1 in range($2, len($3)):'],
    [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(?:\<=|\>=|<|>)\s*(.*)\s*\;[^\)]+\)\s*{/g, 'for $1 in range($2, $3):'],
    [ /\s\|\|\s/g, ' or ' ],
    [ /\s\&\&\s/g, ' and ' ],
    [ /\!([^\=])/g, 'not $1'],
    [ /([^\s]+)\.length/g, 'len($1)' ],
    [ /\.push\s*\(([\s\S]+?)\);/g, '.append($1);' ],
    [ /^(\s*}\s*$)+/gm, '' ],
    [ /\;(\s+?\/\/.+?)/g, '$1' ],
    [ /\;$/gm, '' ],
    [ /\.toUpperCase\s*/g, '.upper' ],
    [ /\.toLowerCase\s*/g, '.lower' ],
    [ /JSON\.stringify\s*/g, 'json.dumps' ],
    [ /JSON\.parse\s*/g, "json.loads" ],
    // [ /([^\(\s]+)\.includes\s+\(([^\)]+)\)/g, '$2 in $1' ],
    // [ /\'%([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "'{:$1}'.format($2)" ],
    [ /([^\s]+)\.toFixed\s*\(([0-9]+)\)/g, "'{:.$2f}'.format($1)" ],
    [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "('{:.' + str($2) + 'f}').format($1)" ],
    [ /parseFloat\s*/g, 'float'],
    [ /parseInt\s*/g, 'int'],
    [ /self\[([^\]+]+)\]/g, 'getattr(self, $1)' ],
    [ /([^\s]+)\.slice \(([^\,\)]+)\,\s?([^\)]+)\)/g, '$1[$2:$3]' ],
    [ /([^\s]+)\.slice \(([^\)\:]+)\)/g, '$1[$2:]' ],
    [ /Math\.floor\s*\(([^\)]+)\)/g, 'int(math.floor($1))' ],
    [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs($1)' ],
    [ /Math\.pow\s*\(([^\)]+)\)/g, 'math.pow($1)' ],
    [ /Math\.round\s*\(([^\)]+)\)/g, 'int(round($1))' ],
    [ /Math\.ceil\s*\(([^\)]+)\)/g, 'int(math.ceil($1))' ],
    [ /Math\.log/g, 'math.log' ],
    [ /(\([^\)]+\)|[^\s]+)\s*\?\s*([^\:]+)\s+\:\s*([^\n]+)/g, '$2 if $1 else $3'],
    [ /(^|\s)\/\//g, '$1#' ],
    [ /([^\n\s]) #/g, '$1  #' ],   // PEP8 E261
    [ /\.indexOf/g, '.find'],
    [ /\strue/g, ' True'],
    [ /\sfalse/g, ' False'],
    [ /\(([^\s]+)\sin\s([^\)]+)\)/g, '($1 in list($2.keys()))' ],
    [ /([^\s]+\s*\(\))\.toString\s+\(\)/g, 'str($1)' ],
    [ /([^\s]+)\.toString \(\)/g, 'str($1)' ],
    [ /([^\s]+)\.join\s*\(\s*([^\)\[\]]+?)\s*\)/g, '$2.join($1)' ],
    [ /Math\.(max|min)\s/g, '$1' ],
    [ / = new /g, ' = ' ], // python does not have a 'new' keyword
    [ /console\.log\s/g, 'print' ],
    [ /process\.exit\s+/g, 'sys.exit' ],
    [ /([^:+=\/\*\s-]+) \(/g, '$1(' ], // PEP8 E225 remove whitespaces before left ( round bracket
    [ /\sand\(/g, ' and (' ],
    [ /\sor\(/g, ' or (' ],
    [ /\[ /g, '[' ],              // PEP8 E201 remove whitespaces after left [ square bracket
    [ /\{ /g, '{' ],              // PEP8 E201 remove whitespaces after left { bracket
    [ /([^\s]+) \]/g, '$1]' ],    // PEP8 E202 remove whitespaces before right ] square bracket
    [ /([^\s]+) \}/g, '$1}' ],    // PEP8 E202 remove whitespaces before right } bracket
    [ /([^a-z])(elif|if|or|else)\(/g, '$1$2 \(' ], // a correction for PEP8 E225 side-effect for compound and ternary conditionals
    [ /\=\=\sTrue/g, 'is True' ], // a correction for PEP8 E712, it likes "is True", not "== True"
])

// ----------------------------------------------------------------------------

const python2Regexes = [
    [ /(\s)await(\s)/g, '$1' ]
]

// ----------------------------------------------------------------------------

const phpRegexes = [
    [ /\{([a-zA-Z0-9_]+?)\}/g, '<$1>' ], // resolve the "arrays vs url params" conflict (both are in {}-brackets)
    [ /Array\.isArray\s*\(([^\)]+)\)/g, "gettype ($1) === 'array' && count (array_filter (array_keys ($1), 'is_string')) == 0" ],

    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'undefined\'/g, '$1[$2] === null' ],
    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'undefined\'/g, '$1[$2] !== null' ],
    [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'undefined\'/g, '$1 === null' ],
    [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'undefined\'/g, '$1 !== null' ],
    [ /typeof\s+(.+?)\s+\=\=\=?\s+\'undefined\'/g, '$1 === null' ],
    [ /typeof\s+(.+?)\s+\!\=\=?\s+\'undefined\'/g, '$1 !== null' ],

    [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+undefined/g, '$1[$2] === null' ],
    [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+undefined/g, '$1[$2] !== null' ],
    [ /([^\s]+)\s+\=\=\=?\s+undefined/g, '$1 === null' ],
    [ /([^\s]+)\s+\!\=\=?\s+undefined/g, '$1 !== null' ],
    [ /(.+?)\s+\=\=\=?\s+undefined/g, '$1 === null' ],
    [ /(.+?)\s+\!\=\=?\s+undefined/g, '$1 !== null' ],

    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'string\'/g, "gettype ($1[$2]) === 'string'" ],
    [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'string\'/g, "gettype ($1[$2]) !== 'string'" ],
    [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'string\'/g, "gettype ($1) === 'string'" ],
    [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'string\'/g, "gettype ($1) !== 'string'" ],

    [ /undefined/g, 'null' ],
    [ /this\.extend/g, 'array_merge' ],
    [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
    [ /this\.stringToBase64/g, 'base64_encode' ],
    [ /this\.base64ToBinary/g, 'base64_decode' ],
    [ /this\.deepExtend/g, 'array_replace_recursive'],
    [ /(\w+)\.shift\s*\(\)/g, 'array_shift($1)' ],
    [ /(\w+)\.pop\s*\(\)/g, 'array_pop($1)' ],

// insert common regexes in the middle (critical)
].concat (commonRegexes).concat ([

    [ /this\./g, '$this->' ],
    [ / this;/g, ' $this;' ],
    [ /([^'])this_\./g, '$1$this_->' ],
    [ /\{\}/g, 'array()' ],
    [ /\[\]/g, 'array()' ],

// add {}-array syntax conversions up to 20 levels deep in the same line
]).concat ([ ... Array (20) ].map (x => [ /\{([^\n\}]+)\}/g, 'array($1)' ] )).concat ([
    [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\[\s*([^\]]+)\s\]/g, '$1list($2)' ],
    [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\{\s*([^\}]+)\s\}/g, '$1array_values(list($2))' ],
    [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s/g, '$1' ],
    [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
    [ /Object\.keys\s*\((.*)\)/g, 'is_array($1) ? array_keys($1) : array()' ],
    [ /([^\s]+\s*\(\))\.toString \(\)/g, '(string) $1' ],
    [ /([^\s]+)\.toString \(\)/g, '(string) $1' ],
    [ /throw new Error \((.*)\)/g, 'throw new \\Exception($1)' ],
    [ /throw new ([\S]+) \((.*)\)/g, 'throw new $1($2)' ],
    [ /throw ([\S]+)\;/g, 'throw $$$1;' ],
    [ '([^a-z]+) (' + Object.keys (errors).join ('|') + ')([^\\s])', "$1 '\\\\ccxt\\\\$2'$3" ],
    [ /\}\s+catch \(([\S]+)\) {/g, '} catch (Exception $$$1) {' ],
    [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\.length\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 count ($4);$5) {' ],
    [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 $4;$5) {' ],
    [ /([^\s]+)\.length\;/g, 'is_array ($1) ? count ($1) : 0;' ],
    [ /([^\s\(]+)\.length/g, 'strlen ($1)' ],
    [ /\.push\s*\(([\s\S]+?)\)\;/g, '[] = $1;' ],
    [ /(\s)await(\s)/g, '$1' ],
    [ /([\S])\: /g, '$1 => ' ],

// add {}-array syntax conversions up to 20 levels deep
]).concat ([ ... Array (20) ].map (x => [ /\{([^\;\{]+?)\}([^\s])/g, 'array ($1)$2' ])).concat ([

    [ /\[\s*([^\]]+?)\s*\]\.join\s*\(\s*([^\)]+?)\s*\)/g, "implode($2, array($1))" ],

// add []-array syntax conversions up to 20 levels deep
]).concat ([ ... Array (20) ].map (x => [ /\[(\s[^\]]+?\s)\]/g, 'array ($1)' ])).concat ([

    [ /JSON\.stringify/g, 'json_encode' ],
    [ /JSON\.parse\s+\(([^\)]+)\)/g, 'json_decode($1, $$as_associative_array = true)' ],
    [ /([^\(\s]+)\.includes\s+\(([^\)]+)\)/g, 'mb_strpos($1, $2)' ],
    // [ /\'([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "sprintf ('$1', $2)" ],
    [ /([^\s]+)\.toFixed\s*\(([0-9]+)\)/g, "sprintf('%.$2f', $1)" ],
    [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "sprintf('%.' . $2 . 'f', $1)" ],
    [ /parseFloat\s/g, 'floatval '],
    [ /parseInt\s/g, 'intval '],
    [ / \+ /g, ' . ' ],
    [ / \+\= /g, ' .= ' ],
    [ /([^\s\(]+(?:\s*\(.+\))?)\.toUpperCase\s*\(\)/g, 'strtoupper($1)' ],
    [ /([^\s\(]+(?:\s*\(.+\))?)\.toLowerCase\s*\(\)/g, 'strtolower($1)' ],
    [ /([^\s\(]+(?:\s*\(.+\))?)\.replace\s*\(([^\)]+)\)/g, 'str_replace($2, $1)' ],
    [ /this\[([^\]+]+)\]/g, '$$this->$$$1' ],
    [ /([^\s\(]+).slice \(([^\)\:,]+)\)/g, 'mb_substr($1, $2)' ],
    [ /([^\s\(]+).slice \(([^\,\)]+)\,\s*([^\)]+)\)/g, 'mb_substr($1, $2, $3 - $2)' ],
    [ /([^\s\(]+).split \(('[^']*'|[^\,]+?)\)/g, 'explode($2, $1)' ],
    [ /Math\.floor\s*\(([^\)]+)\)/g, '(int) floor($1)' ],
    [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs ($1)' ],
    [ /Math\.round\s*\(([^\)]+)\)/g, '(int) round($1)' ],
    [ /Math\.ceil\s*\(([^\)]+)\)/g, '(int) ceil($1)' ],
    [ /Math\.pow\s*\(([^\)]+)\)/g, 'pow($1)' ],
    [ /Math\.log/g, 'log' ],
    [ /([^\(\s]+)\s+%\s+([^\s\)]+)/g, 'fmod($1, $2)' ],
    [ /\(([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0\)/g, '(mb_strpos($1, $2) !== false)' ],
    [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0/g, 'mb_strpos($1, $2) !== false' ],
    [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)/g, 'mb_strpos($1, $2)' ],
    [ /\(([^\s\(]+)\sin\s([^\)]+)\)/g, '(is_array($2) && array_key_exists($1, $2))' ],
    [ /([^\s]+)\.join\s*\(\s*([^\)]+?)\s*\)/g, 'implode($2, $1)' ],
    [ 'new ccxt\\.', 'new \\ccxt\\' ], // a special case for test_exchange_datetime_functions.php (and for other files, maybe)
    [ /Math\.(max|min)/g, '$1' ],
    [ /console\.log/g, 'var_dump'],
    [ /process\.exit/g, 'exit'],
    [ /super\./g, 'parent::'],
    [ /\<([a-zA-Z0-9_]+?)\>/g, '{$1}' ], // resolve the "arrays vs url params" conflict (both are in {}-brackets)
])

// ----------------------------------------------------------------------------
// one-time helpers

function createPythonClass (className, baseClass, body, methods, async = false) {

    const pythonStandardLibraries = {
        'base64': 'base64',
        'hashlib': 'hashlib',
        'math': 'math',
        'json.loads': 'json',
    }

    async = async ? 'async_support.' : ''

    const importFrom = (baseClass == 'Exchange') ?
        ('ccxt.' + async + 'base.exchange') :
        ('ccxt.' + async + baseClass)

    let bodyAsString = body.join ("\n")

    let header = [
        "# -*- coding: utf-8 -*-\n",
        "# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
        "# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n",
        'from ' + importFrom + ' import ' + baseClass,
        ... (bodyAsString.match (/basestring/) ? [
            "\n# -----------------------------------------------------------------------------\n",
            "try:",
            "    basestring  # Python 3",
            "except NameError:",
            "    basestring = str  # Python 2",
        ] : [])
    ]

    const libraries = []

    for (let library in pythonStandardLibraries) {
        const regex = new RegExp ("[^\\']" + library + "[^\\'a-zA-Z]")
        if (bodyAsString.match (regex))
            libraries.push ('import ' + pythonStandardLibraries[library])
    }

    const errorImports = []

    for (let error in errors) {
        const regex = new RegExp ("[^\\'\"]" + error + "[^\\'\"]")
        if (bodyAsString.match (regex))
            errorImports.push ('from ccxt.base.errors import ' + error)
    }

    const precisionImports = []

    for (let constant in precisionConstants) {
        if (bodyAsString.indexOf (constant) >= 0) {
            precisionImports.push ('from ccxt.base.decimal_to_precision import ' + constant)
        }
    }

    header = header.concat (libraries, errorImports, precisionImports)

    for (let method of methods) {
        const regex = new RegExp ('self\\.(' + method + ')\\s*\\(', 'g')
        bodyAsString = bodyAsString.replace (regex,
            (match, p1) => ('self.' + unCamelCase (p1) + '('))
    }

    header.push ("\n\nclass " + className + ' (' + baseClass + '):')

    const footer = [
        '', // footer (last empty line)
    ]

    const result = header.join ("\n") + "\n" + bodyAsString + "\n" + footer.join ('\n')
    return result
}

// ----------------------------------------------------------------------------

function createPHPClass (className, baseClass, body, methods) {

    const baseFolder = (baseClass == 'Exchange') ? 'base/' : ''
    const baseFile =  baseFolder + baseClass + '.php'

    const header = [
        "<?php\n",
        "namespace ccxt;\n",
        "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
        "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n",
        "use \Exception as Exception; // a common import\n",
        'class ' + className + ' extends ' + baseClass + ' {'    ,
    ]

    let bodyAsString = body.join ("\n")

    for (let method of methods) {
        const regex = new RegExp ('this->(' + method + ')\\s*\\(', 'g')
        bodyAsString = bodyAsString.replace (regex,
            (match, p1) => ('this->' + unCamelCase (p1) + ' ('))
    }

    const footer =[
        "}\n",
    ]

    const result = header.join ("\n") + "\n" + bodyAsString + "\n" + footer.join ('\n')
    return result
}

// ----------------------------------------------------------------------------

const python2Folder = './python/ccxt/'
const python3Folder = './python/ccxt/async_support/'
const phpFolder     = './php/'

// ----------------------------------------------------------------------------

function transpileJavaScriptToPython3 ({ js, className, removeEmptyLines }) {

    // transpile JS → Python 3
    let python3Body = regexAll (js, pythonRegexes)

    if (removeEmptyLines)
        python3Body = python3Body.replace (/$\s*$/gm, '')

    python3Body = python3Body.replace (/\'([абвгдеёжзийклмнопрстуфхцчшщъыьэюя服务端忙碌]+)\'/gm, "u'$1'")

    // special case for Python OrderedDicts
    let orderedDictRegex = /\.ordered\s+\(\{([^\}]+)\}\)/g
    let orderedDictMatches = undefined
    while (orderedDictMatches = orderedDictRegex.exec (python3Body)) {
        let replaced = orderedDictMatches[1].replace (/^(\s+)([^\:]+)\:\s*([^\,]+)\,$/gm, '$1($2, $3),')
        python3Body = python3Body.replace (orderedDictRegex, '\.ordered ([' + replaced + '])')
    }

    // special case for Python super
    if (className) {
        python3Body = python3Body.replace (/super\./g, 'super(' + className + ', self).')
    }

    return python3Body
}

// ----------------------------------------------------------------------------

function transpilePython3ToPython2 (py) {

    // remove await from Python 2 body (transpile Python 3 → Python 2)
    let python2Body = regexAll (py, python2Regexes)

    return python2Body
}

// ----------------------------------------------------------------------------

function transpileJavaScriptToPHP ({ js, variables }) {

    // match all local variables (let, const or var)
    let localVariablesRegex = /(?:^|[^a-zA-Z0-9_])(?:let|const|var)\s+(?:\[([^\]]+)\]|([a-zA-Z0-9_]+))/g // local variables

    let allVariables = (variables || []).map (x => x); // clone the array
    // process the variables created in destructuring assignments as well
    let localVariablesMatches
    while (localVariablesMatches = localVariablesRegex.exec (js)) {
        if (localVariablesMatches[1]) {
            // this is a destructuring assignment like
            // let [ a, b, c ] = 'a-b-c'.split ('-')
            let matches = localVariablesMatches[1].trim ().split (', ') // split the destructuring assignment by comma
            matches.forEach (x => allVariables.push (x.trim ())) // trim each variable name
        } else {
            // this is a single variable assignment
            allVariables.push (localVariablesMatches[2].trim ()) // add it to the list of local variables
        }
    }

    // match all variables instantiated in the catch()-block of a try-catch clause
    let catchClauseRegex = /catch \(([^)]+)\)/g
    let catchClauseMatches
    while (catchClauseMatches = catchClauseRegex.exec (js)) {
        allVariables.push (catchClauseMatches[1])
    }

    allVariables = allVariables.map (error => regexAll(error, commonRegexes))

    // append $ to all variables in the method (PHP syntax demands $ at the beginning of a variable name)
    let phpVariablesRegexes = allVariables.map (x => [ "(^|[^$$a-zA-Z0-9\\.\\>'_/])" + x + "([^a-zA-Z0-9'_/])", '$1$$' + x + '$2' ])

    // support for php syntax for object-pointer dereference
    // convert all $variable.property to $variable->property
    let variablePropertiesRegexes = allVariables.map (x => [ "(^|[^a-zA-Z0-9\\.\\>'_])" + x + '\\.', '$1' + x + '->' ])

    // transpile JS → PHP
    let phpBody = regexAll (js, phpRegexes.concat (phpVariablesRegexes).concat (variablePropertiesRegexes))

    return phpBody
}

// ----------------------------------------------------------------------------

function transpileJavaScriptToPythonAndPHP (args) {

    //-------------------------------------------------------------------------

    // transpile JS → Python 3
    let python3Body = transpileJavaScriptToPython3 (args)

    //-------------------------------------------------------------------------

    // remove await from Python 2 body (transpile Python 3 → Python 2)
    let python2Body = transpilePython3ToPython2 (python3Body)

    //-------------------------------------------------------------------------

    // transpile JS → PHP
    let phpBody = transpileJavaScriptToPHP (args)

    return { python3Body, python2Body, phpBody }
}

// ----------------------------------------------------------------------------

function transpileDerivedExchangeClass (contents) {

    let exchangeClassDeclarationMatches = contents.match (/^module\.exports\s*=\s*class\s+([\S]+)\s+extends\s+([\S]+)\s+{([\s\S]+?)^};*/m)

    // log.green (file, exchangeClassDeclarationMatches[3])

    let className = exchangeClassDeclarationMatches[1]
    let baseClass = exchangeClassDeclarationMatches[2]

    let methods = exchangeClassDeclarationMatches[3].trim ().split (/\n\s*\n/)

    let python2 = []
    let python3 = []
    let php = []

    let methodNames = []

    // run through all methods
    for (let i = 0; i < methods.length; i++) {
        // parse the method signature
        let part = methods[i].trim ()
        let lines = part.split ("\n")
        let signature = lines[0].trim ()
        let methodSignatureRegex = /(async |)([\S]+)\s\(([^)]*)\)\s*{/ // signature line
        let matches = methodSignatureRegex.exec (signature)

        if (!matches) {
            log.red (methods[i])
            log.yellow.bright ("\nMake sure your methods don't have empty lines!\n")
        }

        // async or not
        let keyword = matches[1]
        // try {
        //     keyword = matches[1]
        // } catch (e) {
        //     log.red (e)
        //     log.green (methods[i])
        //     log.yellow (exchangeClassDeclarationMatches[3].trim ().split (/\n\s*\n/))
        //     process.exit ()
        // }

        // method name
        let method = matches[2]

        methodNames.push (method)

        method = unCamelCase (method)

        // method arguments
        let args = matches[3].trim ()

        // extract argument names and local variables
        args = args.length ? args.split (',').map (x => x.trim ()) : []

        // get names of all method arguments for later substitutions
        let variables = args.map (arg => arg.split ('=').map (x => x.trim ()) [0])

        // add $ to each argument name in PHP method signature
        let phpArgs = args.join (', $').trim ().replace (/undefined/g, 'null').replace ('{}', 'array ()')
        phpArgs = phpArgs.length ? ('$' + phpArgs) : ''

        // remove excessive spacing from argument defaults in Python method signature
        let pythonArgs = args.map (x => x.replace (' = ', '='))
                                .join (', ')
                                .replace (/undefined/g, 'None')
                                .replace (/false/g, 'False')
                                .replace (/true/g, 'True')

        // method body without the signature (first line)
        // and without the closing bracket (last line)
        let js = lines.slice (1, -1).join ("\n")

        // transpile everything
        let { python3Body, python2Body, phpBody } = transpileJavaScriptToPythonAndPHP ({ js, className, variables, removeEmptyLines: true })

        // compile the final Python code for the method signature
        let pythonString = 'def ' + method + '(self' + (pythonArgs.length ? ', ' + pythonArgs : '') + '):'

        // compile signature + body for Python 2
        python2.push ('');
        python2.push ('    ' + pythonString);
        python2.push (python2Body);

        // compile signature + body for Python 3
        python3.push ('');
        python3.push ('    ' + keyword + pythonString);
        python3.push (python3Body);

        // compile signature + body for PHP
        php.push ('');
        php.push ('    public function ' + method + ' (' + phpArgs + ') {');
        php.push (phpBody);
        php.push ('    }')

    }

    return {

        // altogether in PHP, Python 2 and 3
        python2: createPythonClass (className, baseClass, python2, methodNames),
        python3: createPythonClass (className, baseClass, python3, methodNames, true),
        php:     createPHPClass    (className, baseClass, php,     methodNames),

        className,
        baseClass,
    }
}

// ----------------------------------------------------------------------------

function transpileDerivedExchangeFile (folder, filename) {

    try {

        let contents = fs.readFileSync (folder + filename, 'utf8')

        let { python2, python3, php, className, baseClass } = transpileDerivedExchangeClass (contents)

        const python2Filename = python2Folder + filename.replace ('.js', '.py')
        const python3Filename = python3Folder + filename.replace ('.js', '.py')
        const phpFilename     = phpFolder     + filename.replace ('.js', '.php')

        log.cyan ('Transpiling from', filename.yellow)

        overwriteFile (python2Filename, python2)
        overwriteFile (python3Filename, python3)
        overwriteFile (phpFilename,     php)

        return { className, baseClass }

    } catch (e) {

        log.red ('\nFailed to transpile source code from', filename.yellow)
        log.red ('See https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md on how to build this library properly\n')
        throw e // rethrow it
    }
}

//-----------------------------------------------------------------------------

function transpileDerivedExchangeFiles (folder, pattern = '.js') {

    // exchanges.json accounts for ids included in exchanges.cfg
    const ids = require ('../exchanges.json').ids;

    const classNames = fs.readdirSync (folder)
        .filter (file => file.includes (pattern) && ids.includes (basename (file, pattern)))
        .map (file => transpileDerivedExchangeFile (folder, file))

    if (classNames.length === 0)
        return null

    let classes = {}
    classNames.forEach (({ className, baseClass }) => {
        classes[className] = baseClass
    })

    function deleteOldTranspiledFiles (folder, pattern) {
        fs.readdirSync (folder)
            .filter (file =>
                !fs.lstatSync (folder + file).isDirectory () &&
                file.match (pattern) &&
                !(file.replace (/\.[a-z]+$/, '') in classes) &&
                !file.match (/^Exchange|errors|__init__|\\./))
            .map (file => folder + file)
            .forEach (file => log.red ('Deleting ' + file.yellow) && fs.unlinkSync (file))
    }

    deleteOldTranspiledFiles (python2Folder, /\.pyc?$/)
    deleteOldTranspiledFiles (python3Folder, /\.pyc?$/)
    deleteOldTranspiledFiles (phpFolder, /\.php$/)

    return classes
}

//-----------------------------------------------------------------------------

function transpilePythonAsyncToSync (oldName, newName) {

    log.magenta ('Transpiling ' + oldName.yellow + ' → ' + newName.yellow)
    const fileContents = fs.readFileSync (oldName, 'utf8')
    let lines = fileContents.split ("\n")

    lines = lines.filter (line => ![ 'import asyncio' ].includes (line))
                .map (line => {
                    return (
                        line.replace ('asyncio.get_event_loop().run_until_complete(main())', 'main()')
                            .replace ('import ccxt.async_support as ccxt', 'import ccxt')
                            .replace (/.*token\_bucket.*/g, '')
                            .replace ('await asyncio.sleep', 'time.sleep')
                            .replace ('async ', '')
                            .replace ('await ', ''))
                })

    // lines.forEach (line => log (line))

    function deleteFunction (f, from) {
        const re1 = new RegExp ('def ' + f + '[^\#]+', 'g')
        const re2 = new RegExp ('[\\s]+' + f + '\\(exchange\\)', 'g')
        return from.replace (re1, '').replace (re2, '')
    }

    let newContents = lines.join ('\n')

    newContents = deleteFunction ('test_tickers_async', newContents)
    newContents = deleteFunction ('test_l2_order_books_async', newContents)

    fs.truncateSync (newName)
    fs.writeFileSync (newName, newContents)
}

//-----------------------------------------------------------------------------

function exportTypeScriptDeclarations (classes) {

    const file = './ccxt.d.ts'
    const regex = /(?:    export class [^\s]+ extends [^\s]+ \{\}[\r]?[\n])+/
    const replacement = Object.keys (classes).map (className => {
        const baseClass = classes[className]
        return '    export class ' + className + ' extends ' + baseClass + " {}"
    }).join ("\n") + "\n"

    replaceInFile (file, regex, replacement)
}

//-----------------------------------------------------------------------------

const pyPreamble = "\
import os\n\
import sys\n\
\n\
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))\n\
sys.path.append(root)\n\
\n\
# ----------------------------------------------------------------------------\n\
\n\
# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\
\n\
# ----------------------------------------------------------------------------\n"

const phpPreamble = "\
<?php\n\
namespace ccxt;\n\
include_once (__DIR__.'/../../ccxt.php');\n\
// ----------------------------------------------------------------------------\n\
\n\
// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\
\n\
// -----------------------------------------------------------------------------\n"

//-----------------------------------------------------------------------------

function transpileDateTimeTests () {
    const jsFile = './js/test/base/functions/test.datetime.js'
    const pyFile = './python/test/test_exchange_datetime_functions.py'
    const phpFile = './php/test/test_exchange_datetime_functions.php'

    log.magenta ('Transpiling from', jsFile.yellow)

    let js = fs.readFileSync (jsFile).toString ()

    js = regexAll (js, [
        [ /[^\n]+require[^\n]+\n/g, '' ],
        [/^\/\*.*\s+/mg, ''],
    ])

    let { python3Body, python2Body, phpBody } = transpileJavaScriptToPythonAndPHP ({ js, removeEmptyLines: false })

    // phpBody = phpBody.replace (/exchange\./g, 'Exchange::')

    const pythonHeader =
"\n\
import ccxt  # noqa: F402\n\
from ccxt.base.decimal_to_precision import ROUND_UP, ROUND_DOWN  # noqa F401\n\
\n\
# ----------------------------------------------------------------------------\n\
\n"

    const python = pyPreamble + pythonHeader + python2Body
    const php = phpPreamble + phpBody

    log.magenta ('→', pyFile.yellow)
    log.magenta ('→', phpFile.yellow)

    overwriteFile (pyFile, python)
    overwriteFile (phpFile, php)
}

//-----------------------------------------------------------------------------

function transpilePrecisionTests () {

    const jsFile = './js/test/base/functions/test.number.js'
    const pyFile = './python/test/test_decimal_to_precision.py'
    const phpFile = './php/test/decimal_to_precision.php'

    log.magenta ('Transpiling from', jsFile.yellow)

    let js = fs.readFileSync (jsFile).toString ()

    js = regexAll (js, [
        [ /\'use strict\';?\s+/g, '' ],
        [ /[^\n]+require[^\n]+\n/g, '' ],
        [ /decimalToPrecision/g, 'decimal_to_precision' ],
        [ /numberToString/g, 'number_to_string' ],
    ])

    let { python3Body, python2Body, phpBody } = transpileJavaScriptToPythonAndPHP ({ js, removeEmptyLines: false })

    const pythonHeader =
"\n\
from ccxt.base.decimal_to_precision import decimal_to_precision  # noqa F401\n\
from ccxt.base.decimal_to_precision import TRUNCATE              # noqa F401\n\
from ccxt.base.decimal_to_precision import ROUND                 # noqa F401\n\
from ccxt.base.decimal_to_precision import DECIMAL_PLACES        # noqa F401\n\
from ccxt.base.decimal_to_precision import SIGNIFICANT_DIGITS    # noqa F401\n\
from ccxt.base.decimal_to_precision import TICK_SIZE             # noqa F401\n\
from ccxt.base.decimal_to_precision import PAD_WITH_ZERO         # noqa F401\n\
from ccxt.base.decimal_to_precision import NO_PADDING            # noqa F401\n\
from ccxt.base.decimal_to_precision import number_to_string      # noqa F401\n\
\n\
# ----------------------------------------------------------------------------\n\
\n\
"

    const phpHeader =
"\
// testDecimalToPrecisionErrorHandling\n\
//\n\
// $this->expectException ('ccxt\\\\BaseError');\n\
// $this->expectExceptionMessageRegExp ('/Negative precision is not yet supported/');\n\
// Exchange::decimalToPrecision ('123456.789', TRUNCATE, -2, DECIMAL_PLACES);\n\
//\n\
// $this->expectException ('ccxt\\\\BaseError');\n\
// $this->expectExceptionMessageRegExp ('/Invalid number/');\n\
// Exchange::decimalToPrecision ('foo');\n\
\n\
// ----------------------------------------------------------------------------\n\
\n\
function decimal_to_precision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {\n\
    return Exchange::decimal_to_precision ($x, $roundingMode, $numPrecisionDigits, $countingMode, $paddingMode);\n\
}\n\
function number_to_string ($x) {\n\
    return Exchange::number_to_string ($x);\n\
}\n\
"

    const python = pyPreamble + pythonHeader + python2Body
    const php = phpPreamble + phpHeader + phpBody

    log.magenta ('→', pyFile.yellow)
    log.magenta ('→', phpFile.yellow)

    overwriteFile (pyFile, python)
    overwriteFile (phpFile, php)
}

//-----------------------------------------------------------------------------

function transpileCryptoTests () {
    const jsFile = './js/test/base/functions/test.crypto.js'
    const pyFile = './python/test/test_crypto.py'
    const phpFile = './php/test/test_crypto.php'

    log.magenta ('Transpiling from', jsFile.yellow)
    let js = fs.readFileSync (jsFile).toString ()

    js = regexAll (js, [
        [ /\'use strict\';?\s+/g, '' ],
        [ /[^\n]+require[^\n]+\n/g, '' ],
        [ /function equals \([\S\s]+?return true\n}\n/g, '' ],
    ])

    let { python3Body, python2Body, phpBody } = transpileJavaScriptToPythonAndPHP ({ js, removeEmptyLines: false })

    const pythonHeader = `
import ccxt  # noqa: F402

Exchange = ccxt.Exchange
hash = Exchange.hash
ecdsa = Exchange.ecdsa
jwt = Exchange.jwt
encode = Exchange.encode


def equals(a, b):
    return a == b
`
    const phpHeader = `
function hash(...$args) {
    return Exchange::hash(...$args);
}

function encode(...$args) {
    return Exchange::encode(...$args);
}

function ecdsa(...$args) {
    return Exchange::ecdsa(...$args);
}

function jwt(...$args) {
    return Exchange::jwt(...$args);
}

function equals($a, $b) {
    return $a === $b;
}`

    const python = pyPreamble + pythonHeader + python2Body
    const php = phpPreamble + phpHeader + phpBody

    log.magenta ('→', pyFile.yellow)
    log.magenta ('→', phpFile.yellow)

    overwriteFile (pyFile, python)
    overwriteFile (phpFile, php)
}

//-----------------------------------------------------------------------------

function transpileErrorHierarchy () {

    const errorHierarchyFilename = './js/base/errorHierarchy.js'

    let js = fs.readFileSync (errorHierarchyFilename, 'utf8')

    js = regexAll (js, [
        [ /module\.exports = [^\;]+\;\n/s, '' ],
    ]).trim ()

    const { python3Body, phpBody } = transpileJavaScriptToPythonAndPHP ({ js })

    const message = 'Transpiling error hierachy →'
    logReplaceInFile (message, './python/ccxt/base/errors.py', /error_hierarchy = .+?\n\}/s, python3Body)
    logReplaceInFile (message, './php/errors.php',             /\$error_hierarchy = .+?\n\)\;/s, phpBody)
}

//-----------------------------------------------------------------------------

createFolderRecursively (python2Folder)
createFolderRecursively (python3Folder)
createFolderRecursively (phpFolder)


const classes = transpileDerivedExchangeFiles ('./js/', filename)

if (classes === null) {
    log.bright.yellow ('0 files transpiled.')
    return;
}

// HINT: if we're going to support specific class definitions this process won't work anymore as it will override the definitions.
exportTypeScriptDeclarations (classes)  // we use typescript?

transpileErrorHierarchy ()
transpilePrecisionTests ()
transpileDateTimeTests ()
transpileCryptoTests ()
transpilePythonAsyncToSync ('./python/test/test_async.py', './python/test/test.py')

//-----------------------------------------------------------------------------

log.bright.green ('Transpiled successfully.')
