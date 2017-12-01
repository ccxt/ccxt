"use strict";

const fs   = require ('fs')
const path = require ('path')
const log  = require ('ololog')
const ansi = require ('ansicolor').nice

// ----------------------------------------------------------------------------

const { capitalize } = require ('./js/base/functions.js')

// ----------------------------------------------------------------------------

const errors = require ('./js/base/errors.js')

// ---------------------------------------------------------------------------

function replaceInFile (filename, regex, replacement) {
    let contents = fs.readFileSync (filename, 'utf8')
    const parts = contents.split (regex)
    const newContents = parts[0] + replacement + parts[1]
    fs.truncateSync (filename)
    fs.writeFileSync (filename, newContents)
}

// ----------------------------------------------------------------------------

function regexAll (text, array) {
    for (let i in array) {
        let regex = array[i][0]
        regex = typeof regex == 'string' ? new RegExp (regex, 'g') : new RegExp (regex)
        text = text.replace (regex, array[i][1])
    }
    return text
}

// ----------------------------------------------------------------------------

const commonRegexes = [

    [ /\.deepExtend\s/g, '.deep_extend'],
    [ /\.safeFloat\s/g, '.safe_float'],
    [ /\.safeInteger\s/g, '.safe_integer'],
    [ /\.safeString\s/g, '.safe_string'],
    [ /\.safeValue\s/g, '.safe_value'],
    [ /\.binaryConcat\s/g, '.binary_concat'],
    [ /\.binaryToString\s/g, '.binary_to_string' ],
    [ /\.precisionFromString\s/g, '.precision_from_string'],
    [ /\.implodeParams\s/g, '.implode_params'],
    [ /\.extractParams\s/g, '.extract_params'],
    [ /\.parseBalance\s/g, '.parse_balance'],
    [ /\.parseOHLCVs\s/g, '.parse_ohlcvs'],
    [ /\.parseOHLCV\s/g, '.parse_ohlcv'],
    [ /\.parseTicker\s/g, '.parse_ticker'],
    [ /\.parseTradesData\s/g, '.parse_trades_data'],
    [ /\.parseTrades\s/g, '.parse_trades'],
    [ /\.parseTrade\s/g, '.parse_trade'],
    [ /\.parseOrderBook\s/g, '.parse_order_book'],
    [ /\.parseBidsAsks\s/g, '.parse_bids_asks'],
    [ /\.parseBidAsk\s/g, '.parse_bid_ask'],
    [ /\.parseOrders\s/g, '.parse_orders'],
    [ /\.parseOrderStatus\s/g, '.parse_order_status'],
    [ /\.parseOrder\s/g, '.parse_order'],
    [ /\.filterOrdersBySymbol\s/g, '.filter_orders_by_symbol'],
    [ /\.getVersionString\s/g, '.get_version_string'],
    [ /\.indexBy\s/g, '.index_by'],
    [ /\.sortBy\s/g, '.sort_by'],
    [ /\.filterBy\s/g, '.filter_by'],
    [ /\.groupBy\s/g, '.group_by'],
    [ /\.marketIds\s/g, '.market_ids'],
    [ /\.marketId\s/g, '.market_id'],
    [ /\.fetchL2OrderBook\s/g, '.fetch_l2_order_book'],
    [ /\.fetchOrderBook\s/g, '.fetch_order_book'],
    [ /\.fetchMyTrades\s/g, '.fetch_my_trades'],
    [ /\.fetchOrderStatus\s/g, '.fetch_order_status'],
    [ /\.fetchOpenOrders\s/g, '.fetch_open_orders'],
    [ /\.fetchOrders\s/g, '.fetch_orders'],
    [ /\.fetchOrder\s/g, '.fetch_order'],
    [ /\.fetchTickers\s/g, '.fetch_tickers'],
    [ /\.fetchTicker\s/g, '.fetch_ticker'],
    [ /\.fetchCurrencies\s/g, '.fetch_currencies'],
    [ /\.priceToPrecision\s/g, '.price_to_precision'],
    [ /\.amountToPrecision\s/g, '.amount_to_precision'],
    [ /\.amountToLots\s/g, '.amount_to_lots'],
    [ /\.feeToPrecision\s/g, '.fee_to_precision'],
    [ /\.costToPrecision\s/g, '.cost_to_precision'],
    [ /\.commonCurrencyCode\s/g, '.common_currency_code'],
    [ /\.loadMarkets\s/g, '.load_markets'],
    [ /\.fetchMarkets\s/g, '.fetch_markets'],
    [ /\.appendInactiveMarkets\s/g, '.append_inactive_markets'],
    [ /\.fetchCategories\s/g, '.fetch_categories'],
    [ /\.calculateFeeRate\s/g, '.calculate_fee_rate'],
    [ /\.calculateFee\s/g, '.calculate_fee'],
    [ /\.editLimitBuyOrder\s/g, '.edit_limit_buy_order'],
    [ /\.editLimitSellOrder\s/g, '.edit_limit_sell_order'],
    [ /\.editLimitOrder\s/g, '.edit_limit_order'],
    [ /\.editOrder\s/g, '.edit_order'],
    [ /\.encodeURIComponent\s/g, '.encode_uri_component'],
    [ /\.handleErrors\s/g, '.handle_errors'],
    [ /\.checkRequiredCredentials\s/g, '.check_required_credentials'],
]

// ----------------------------------------------------------------------------

const pythonRegexes = [

        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\s+\'undefined\'/g, '$1[$2] is None' ],
        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\s+\'undefined\'/g, '$1[$2] is not None' ],
        [ /typeof\s+([^\s]+)\s+\=\=\s+\'undefined\'/g, '$1 is None' ],
        [ /typeof\s+([^\s]+)\s+\!\=\s+\'undefined\'/g, '$1 is not None' ],
        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\s+\'string\'/g, 'isinstance($1[$2], basestring)' ],
        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\s+\'string\'/g, 'not isinstance($1[$2], basestring)' ],
        [ /typeof\s+([^\s]+)\s+\=\=\s+\'string\'/g, 'isinstance($1, basestring)' ],
        [ /typeof\s+([^\s]+)\s+\!\=\s+\'string\'/g, 'not isinstance($1, basestring)' ],
        [ /undefined/g, 'None' ],
        [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
        [ /this\.stringToBase64\s/g, 'base64.b64encode' ],
        [ /this\.base64ToBinary\s/g, 'base64.b64decode' ],

    // insert common regexes in the middle (critical)
    ].concat (commonRegexes).concat ([

        // [ /this\.urlencode\s/g, '_urlencode.urlencode ' ], // use self.urlencode instead
        [ /this\./g, 'self.' ],
        [ /([^a-zA-Z\'])this([^a-zA-Z])/g, '$1self$2' ],
        [ /([^a-zA-Z0-9_])let\s\[\s*([^\]]+)\s\]/g, '$1$2' ],
        [ /([^a-zA-Z0-9_])let\s\{\s*([^\}]+)\s\}\s\=\s([^\;]+)/g, '$1$2 = (lambda $2: ($2))(**$3)' ],
        [ /([^a-zA-Z0-9_])let\s/g, '$1' ],
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
        [ /if\s+\((.*)\)\s+\{/g, 'if $1:' ],
        [ /if\s+\((.*)\)\s*[\n]/g, "if $1:\n" ],
        [ /\}\s*else\s*\{/g, 'else:' ],
        [ /else\s*[\n]/g, "else:\n" ],
        [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(?:\<=|\>=|<|>)\s*(.*)\.length\s*\;[^\)]+\)\s*{/g, 'for $1 in range($2, len($3)):'],
        [ /\s\|\|\s/g, ' or ' ],
        [ /\s\&\&\s/g, ' and ' ],
        [ /\!([^\=])/g, 'not $1'],
        [ /([^\s]+)\.length/g, 'len($1)' ],
        [ /\.push\s*\(([\s\S]+?)\);/g, '.append($1);' ],
        [ /^\s*}\s*$/gm, '' ],
        [ /;/g, '' ],
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
        [ /Math\.ceil\s*\(([^\)]+)\)/g, 'int(ceil($1))' ],
        [ /Math\.log/g, 'math.log' ],
        [ /(\([^\)]+\)|[^\s]+)\s*\?\s*(\([^\)]+\)|[^\s]+)\s*\:\s*(\([^\)]+\)|[^\s]+)/g, '$2 if $1 else $3'],
        [ / \/\//g, ' #' ],
        [ /([^\n\s]) #/g, '$1  #' ],   // PEP8 E261
        [ /\.indexOf/g, '.find'],
        [ /\strue/g, ' True'],
        [ /\sfalse/g, ' False'],
        [ /\(([^\s]+)\sin\s([^\)]+)\)/g, '($1 in list($2.keys()))' ],
        [ /([^\s]+\s*\(\))\.toString\s+\(\)/g, 'str($1)' ],
        [ /([^\s]+)\.toString \(\)/g, 'str($1)' ],
        [ /([^\s]+)\.join\s*\(\s*([^\)\[\]]+?)\s*\)/g, '$2.join($1)' ],
        [ /Math\.(max|min)\s/g, '$1' ],
        [ /console\.log\s/g, 'print'],
        [ /process\.exit\s+/g, 'sys.exit'],
        [ /([^:+=\s]+) \(/g, '$1(' ], // PEP8 E225 remove whitespaces before left ( round bracket
        [ /\[ /g, '[' ],              // PEP8 E201 remove whitespaces after left [ square bracket
        [ /\{ /g, '{' ],              // PEP8 E201 remove whitespaces after left { bracket
        [ /([^\s]+) \]/g, '$1]' ],    // PEP8 E202 remove whitespaces before right ] square bracket
        [ /([^\s]+) \}/g, '$1}' ],    // PEP8 E202 remove whitespaces before right } bracket
        [ /([^a-z])(elif|if|or)\(/g, '$1$2 \(' ], // a correction for PEP8 E225 side-effect for compound and ternary conditionals
        [ /\=\=\sTrue/g, 'is True' ], // a correction for PEP8 E712, it likes "is True", not "== True"
    ])

    // ----------------------------------------------------------------------------

    const python2Regexes = [
        [ /(\s)await(\s)/g, '$1' ]
    ]

    // ----------------------------------------------------------------------------

    const phpRegexes = [
        [ /\{([a-zA-Z0-9_]+?)\}/g, '<$1>' ], // resolve the "arrays vs url params" conflict (both are in {}-brackets)
        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\s+\'undefined\'/g, '$1[$2] == null' ],
        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\s+\'undefined\'/g, '$1[$2] != null' ],
        [ /typeof\s+([^\s]+)\s+\=\=\s+\'undefined\'/g, '$1 === null' ],
        [ /typeof\s+([^\s]+)\s+\!\=\s+\'undefined\'/g, '$1 !== null' ],
        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\s+\'string\'/g, "gettype ($1[$2]) == 'string'" ],
        [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\s+\'string\'/g, "gettype ($1[$2]) != 'string'" ],
        [ /typeof\s+([^\s]+)\s+\=\=\s+\'string\'/g, "gettype ($1) == 'string'" ],
        [ /typeof\s+([^\s]+)\s+\!\=\s+\'string\'/g, "gettype ($1) != 'string'" ],
        [ /undefined/g, 'null' ],
        [ /this\.extend/g, 'array_merge' ],
        [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
        [ /this\.stringToBase64/g, 'base64_encode' ],
        [ /this\.base64ToBinary/g, 'base64_decode' ],
        [ /this\.deepExtend/g, 'array_replace_recursive'],

    // insert common regexes in the middle (critical)
    ].concat (commonRegexes).concat ([

        [ /this\./g, '$this->' ],
        [ / this;/g, ' $this;' ],
        [ /([^'])this_\./g, '$1$this_->' ],
        [ /\{\}/g, 'array ()' ],
        [ /\[\]/g, 'array ()' ],
        [ /\{([^\n\}]+)\}/g, 'array ($1)' ],
        [ /([^a-zA-Z0-9_])let\s\[\s*([^\]]+)\s\]/g, '$1list ($2)' ],
        [ /([^a-zA-Z0-9_])let\s\{\s*([^\}]+)\s\}/g, '$1array_values (list ($2))' ],
        [ /([^a-zA-Z0-9_])let\s/g, '$1' ],
        [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
        [ /Object\.keys\s*\((.*)\)/g, 'array_keys ($1)' ],
        [ /([^\s]+\s*\(\))\.toString \(\)/g, '(string) $1' ],
        [ /([^\s]+)\.toString \(\)/g, '(string) $1' ],
        [ /throw new Error \((.*)\)/g, 'throw new \\Exception ($1)'],
        [ /throw new ([\S]+) \((.*)\)/g, 'throw new $1 ($2)'],
        [ /throw ([\S]+)\;/g, 'throw $$$1;'],
        [ /\}\s+catch \(([\S]+)\) {/g, '} catch (Exception $$$1) {'],
        [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\.length\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 count ($4);$5) {'],
        [ /([^\s]+)\.length\;/g, 'count ($1);' ],
        [ /([^\s]+)\.length/g, 'strlen ($1)' ],
        [ /\.push\s*\(([\s\S]+?)\)\;/g, '[] = $1;' ],
        [ /(\s)await(\s)/g, '$1' ],
        [ /([\S])\: /g, '$1 => ' ],

    // add {}-array syntax conversions up to 20 levels deep
    ]).concat ([ ... Array (20) ].map (x => [ /\{([^\;\{]+?)\}([^\s])/g, 'array ($1)$2' ])).concat ([

        [ /\[\s*([^\]]+?)\s*\]\.join\s*\(\s*([^\)]+?)\s*\)/g, "implode ($2, array ($1))" ],

    // add []-array syntax conversions up to 20 levels deep
    ]).concat ([ ... Array (20) ].map (x => [ /\[(\s[^\]]+?\s)\]/g, 'array ($1)' ])).concat ([

        [ /JSON\.stringify/g, 'json_encode' ],
        [ /JSON\.parse\s+\(([^\)]+)\)/g, 'json_decode ($1, $$as_associative_array = true)' ],
        [ /([^\(\s]+)\.includes\s+\(([^\)]+)\)/g, 'mb_strpos ($1, $2)' ],
        // [ /\'([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "sprintf ('$1', $2)" ],
        [ /([^\s]+)\.toFixed\s*\(([0-9]+)\)/g, "sprintf ('%$2f', $1)" ],
        [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "sprintf ('%' . $2 . 'f', $1)" ],
        [ /parseFloat\s/g, 'floatval '],
        [ /parseInt\s/g, 'intval '],
        [ / \+ /g, ' . ' ],
        [ / \+\= /g, ' .= ' ],
        [ /([^\s]+(?:\s*\(.+\))?)\.toUpperCase\s*\(\)/g, 'strtoupper ($1)' ],
        [ /([^\s]+(?:\s*\(.+\))?)\.toLowerCase\s*\(\)/g, 'strtolower ($1)' ],
        [ /([^\s]+(?:\s*\(.+\))?)\.replace\s*\(([^\)]+)\)/g, 'str_replace ($2, $1)' ],
        [ /this\[([^\]+]+)\]/g, '$$this->$$$1' ],
        [ /([^\s]+).slice \(([^\)\:]+)\)/g, 'mb_substr ($1, $2)' ],
        [ /([^\s]+).slice \(([^\,\)]+)\,\s*([^\)]+)\)/g, 'mb_substr ($1, $2, $3)' ],
        [ /([^\s]+).split \(([^\,]+?)\)/g, 'explode ($2, $1)' ],
        [ /Math\.floor\s*\(([^\)]+)\)/g, '(int) floor ($1)' ],
        [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs ($1)' ],
        [ /Math\.round\s*\(([^\)]+)\)/g, '(int) round ($1)' ],
        [ /Math\.ceil\s*\(([^\)]+)\)/g, '(int) ceil ($1)' ],
        [ /Math\.pow\s*\(([^\)]+)\)/g, 'pow ($1)' ],
        [ /Math\.log/g, 'log' ],
        [ /([^\(\s]+)\s+%\s+([^\s\)]+)/g, 'fmod ($1, $2)' ],
        [ /\(([^\s]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0\)/g, '(mb_strpos ($1, $2) !== false)' ],
        [ /([^\s]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0/g, 'mb_strpos ($1, $2) !== false' ],
        [ /([^\s]+)\.indexOf\s*\(([^\)]+)\)/g, 'mb_strpos ($1, $2)' ],
        [ /\(([^\s]+)\sin\s([^\)]+)\)/g, '(array_key_exists ($1, $2))' ],
        [ /([^\s]+)\.join\s*\(\s*([^\)]+?)\s*\)/g, 'implode ($2, $1)' ],
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

        async = async ? 'async.' : ''

        const importFrom = (baseClass == 'Exchange') ?
            ('ccxt.' + async + 'base.exchange') :
            ('ccxt.' + async + baseClass)

        const header = [
            "# -*- coding: utf-8 -*-\n",
            'from ' + importFrom + ' import ' + baseClass,
        ]

        let bodyAsString = body.join ("\n")

        for (let library in pythonStandardLibraries) {
            const regex = new RegExp ("[^\\']" + library + "[^\\'a-zA-Z]")
            if (bodyAsString.match (regex))
                header.push ('import ' + pythonStandardLibraries[library])
        }

        for (let error in errors) {
            const regex = new RegExp ("[^\\']" + error + "[^\\']")
            if (bodyAsString.match (regex))
                header.push ('from ccxt.base.errors import ' + error)
        }

        for (let method of methods) {
            const regex = new RegExp ('self\\.(' + method + ')\\s*\\(', 'g')
            bodyAsString = bodyAsString.replace (regex,
                (match, p1) => ('self.' + convertMethodNameToUnderscoreNotation (p1) + '('))
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
            "include_once ('" + baseFile + "');\n",
            'class ' + className + ' extends ' + baseClass + ' {'    ,
        ]

        let bodyAsString = body.join ("\n")

        for (let method of methods) {
            const regex = new RegExp ('this->(' + method + ')\\s*\\(', 'g')
            bodyAsString = bodyAsString.replace (regex,
                (match, p1) => ('this->' + convertMethodNameToUnderscoreNotation (p1) + ' ('))
        }

        const footer =[
            "}\n",
            '?>',
        ]

        const result = header.join ("\n") + "\n" + bodyAsString + "\n" + footer.join ('\n')
        return result
    }

    // ----------------------------------------------------------------------------

    const python2Folder = './python/ccxt/'
    const python3Folder = './python/ccxt/async/'
    const phpFolder     = './php/'

    // ----------------------------------------------------------------------------

    function convertMethodNameToUnderscoreNotation (method) {
        return (method
            .replace (/[A-Z]+/g, match => capitalize (match.toLowerCase ()))
            .replace (/[A-Z]/g, match => '_' + match.toLowerCase ()))
    }

    // ----------------------------------------------------------------------------

    function transpileDerivedExchangeClass (contents) {

        // match all required imports
        let requireRegex = /^const\s+[^\=]+\=\s*require\s*\(\'[^\']+\'\)$/gm
        let requireMatches = contents.match (requireRegex)

        // log.yellow (requireMatches)
        // process.exit (1)

        let exchangeClassDeclarationMatches = contents.match (/^module\.exports\s*=\s*class\s+([\S]+)\s+extends\s+([\S]+)\s+{([\s\S]+?)^}/m)

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

            let keyword = ''
            try {
                // async or not
                keyword = matches[1]

            } catch (e) {
                log.red (e)
                log.green (methods[i])
                log.yellow (exchangeClassDeclarationMatches[3].trim ().split (/\n\s*\n/))
                process.exit ()
            }

            // method name
            let method = matches[2]

            methodNames.push (method)

            method = convertMethodNameToUnderscoreNotation (method)

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
            let body = lines.slice (1, -1).join ("\n")

            // match all local variables (let, const or var)
            let localVariablesRegex = /[^a-zA-Z0-9_](?:let|const|var)\s+(?:\[([^\]]+)\]|([a-zA-Z0-9_]+))/g // local variables

            // process the variables created in destructuring assignments as well
            let localVariablesMatches
            while (localVariablesMatches = localVariablesRegex.exec (body)) {
                let match = localVariablesMatches[1] ? localVariablesMatches[1] : localVariablesMatches[2]
                match = match.trim ().split (', ')              // split the destructuring assignment by comma
                match.forEach (x => variables.push (x.trim ())) // trim each variable name
                variables.push (localVariablesMatches[1])       // add them to the list of local variables
            }

            // append $ to all variables in the method (PHP syntax demands $ at the beginning of a variable name)
            let phpVariablesRegexes = variables.map (x => [ "([^$$a-zA-Z0-9\\.\\>'_])" + x + "([^a-zA-Z0-9'_])", '$1$$' + x + '$2' ])

            // transpile JS → Python 3
            let python3Body = regexAll (body, pythonRegexes)
                .replace (/$\s*$/gm, '')
                .replace (/\'([абвгдеёжзийклмнопрстуфхцчшщъыьэюя]+)\'/gm, "u'$1'")

            // special case for Python OrderedDicts
            let orderedDictRegex = /\.ordered\s+\(\{([^\}]+)\}\)/g
            let orderedDictMatches = undefined
            while (orderedDictMatches = orderedDictRegex.exec (python3Body)) {
                let replaced = orderedDictMatches[1].replace (/^(\s+)([^\:]+)\:\s*([^\,]+)\,$/gm, '$1($2, $3),')
                python3Body = python3Body.replace (orderedDictRegex, '\.ordered ([' + replaced + '])')
            }

            // special case for Python super
            python3Body = python3Body.replace (/super\./g, 'super(' + className + ', self).')

            // remove await from Python 2 body
            let python2Body = regexAll (python3Body, python2Regexes)

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

            // transpile JS → PHP
            let phpBody = regexAll (body, phpRegexes.concat (phpVariablesRegexes))

            // compile signature + body for PHP
            php.push ('');
            php.push ('    public function ' + method + ' (' + phpArgs + ') {');
            php.push (phpBody);
            php.push ('    }')

        }

        return {

            // alltogether in PHP, Python 2 and 3
            python2: createPythonClass (className, baseClass, python2, methodNames),
            python3: createPythonClass (className, baseClass, python3, methodNames, true),
            php:     createPHPClass    (className, baseClass, php,     methodNames),

            className,
            baseClass,
        }
    }

    // ----------------------------------------------------------------------------

    function transpileDerivedExchangeFile (folder, filename) {

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
    }

    //-----------------------------------------------------------------------------

    function transpileDerivedExchangeFiles (folder) {

        const classNames = fs.readdirSync (folder)
            .filter (file => file.includes ('.js'))
            .map (file => transpileDerivedExchangeFile (folder, file))

        let classes = {}
        classNames.forEach (({ className, baseClass }) => {
            classes[className] = baseClass
        })

        return classes
    }

    //-----------------------------------------------------------------------------

    function copyFile (oldName, newName) {
        let contents = fs.readFileSync (oldName, 'utf8')
        fs.truncateSync (newName)
        fs.writeFileSync (newName, contents)
    }

    //-----------------------------------------------------------------------------

    function overwriteFile (filename, contents) {
        // log.cyan ('Overwriting → ' + filename.yellow)
        fs.closeSync (fs.openSync (filename, 'a'));
        fs.truncateSync (filename)
        fs.writeFileSync (filename, contents)
    }

    //----------------------------------------------------------------------------

    function createFolder (folder) {
        try {
            fs.mkdirSync (folder)
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err
            }
        }
    }

    //-----------------------------------------------------------------------------

    function createFolderRecursively (folder) {

        const parts = folder.split (path.sep)

        for (let i = 1; i <= parts.length; i++) {
            createFolder (path.join.apply (null, parts.slice (0, i)))
        }
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
                                .replace ('import ccxt.async as ccxt', 'import ccxt')
                                .replace (/.*token\_bucket.*/g, '')
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

    createFolderRecursively (python2Folder)
    createFolderRecursively (python3Folder)
    createFolderRecursively (phpFolder)

    const classes = transpileDerivedExchangeFiles ('./js/')

    exportTypeScriptDeclarations (classes)

    transpilePythonAsyncToSync ('./python/test/test_async.py', './python/test/test.py')

    //-----------------------------------------------------------------------------

    log.bright.green ('Transpiled successfully.')
