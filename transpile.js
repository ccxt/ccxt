"use strict";

const fs   = require ('fs')
const log  = require ('ololog')
const ansi = require ('ansicolor').nice

//-----------------------------------------------------------------------------

function regexAll (text, array) {
    for (let i in array) {
        let regex = array[i][0]
        regex = typeof regex == 'string' ? new RegExp (regex, 'g') : new RegExp (regex)
        text = text.replace (regex, array[i][1])
    }
    return text
}

//-----------------------------------------------------------------------------

let ccxtjs = fs.readFileSync ('ccxt.js', 'utf8')
let contents = ccxtjs.match (/\/\/====(?:[\s\S]+?)\/\/====/) [0]
let exchanges
let regex = /^var ([\S]+) =\s*(?:extend\s*\(([^\,]+)\,\s*)?{([\s\S]+?)^}/gm // exchange class

let python      = []
let pythonAsync = []
let php         = []

//-----------------------------------------------------------------------------

while (exchanges = regex.exec (contents)) {

    let id = exchanges[1]

    let parent = exchanges[2]

    let all = exchanges[3].trim ().split (/\,\s*\n\s*\n/)
    let params = '    ' + all[0]
    let methods = all.slice (1)

    let py = []
    let pyAsync = []
    let ph = []

    params = params.split ("\n")

    let pyParams = params
        .join ("\n        ")
        .replace (/ true/g, ' True')
        .replace (/ false/g, ' False')
        .replace (/ \/\//g, ' #')
        .replace (/\{ /g, '{')              // PEP8 E201
        .replace (/\[ /g, '[')              // PEP8 E201
        .replace (/([^\s]+) \]/g, '$1]')    // PEP8 E202
        .replace (/([^\s]+) \}\,/g, '$1},') // PEP8 E202

    function pyAddClass (py) {
        py.push ('')
        py.push ('class ' + id + ' (' + (parent ? parent : 'Exchange') + '):')
        py.push ('')
        py.push ('    def __init__(self, config={}):')
        py.push ('        params = {')
        py.push ('        ' + pyParams + ((all.length > 1) ? ',' : ''))
        py.push ('        }')
        py.push ('        params.update(config)')
        py.push ('        super(' + id + ', self).__init__(params)')        
    }

    pyAddClass (py);
    pyAddClass (pyAsync);

    ph.push ('')
    ph.push ('class ' + id + ' extends ' + (parent ? parent : 'Exchange') + ' {')
    ph.push ('')
    ph.push ('    public function __construct ($options = array ()) {')
    ph.push ('        parent::__construct (array_merge(array (')
    ph.push ('        ' + params.join ("\n        ").replace (/': /g, "' => ").replace (/ {/g, ' array (').replace (/ \[/g, ' array (').replace (/\}([\,\n]|$)/g, ')$1').replace (/\]/g, ')') + ((all.length > 1) ? ',' : ''))
    ph.push ('        ), $options));')
    ph.push ('    }')

    for (let i = 0; i < methods.length; i++) {
        let part = methods[i].trim ()
        let lines = part.split ("\n")
        let header = lines[0].trim ()
        let regex2 = /(async |)([\S]+)\s\(([^)]*)\)\s*{/g // exchange method
        let matches = regex2.exec (header)
        let keyword = matches[1]
        let method = matches[2]
        let args = matches[3].trim ()

        method = method.replace ('fetchBalance',       'fetch_balance')
                        // .replace ('fetchCategories', 'fetch_categories')
                        .replace ('loadMarkets',       'load_markets')
                        .replace ('fetchMarkets',      'fetch_markets')
                        .replace ('fetchOrderBook',    'fetch_order_book')
                        .replace ('fetchOHLCV',        'fetch_ohlcv')
                        .replace ('parseOHLCVs',       'parse_ohlcvs')
                        .replace ('parseOHLCV',        'parse_ohlcv')
                        .replace ('fetchTickers',      'fetch_tickers')
                        .replace ('fetchTicker',       'fetch_ticker')
                        .replace ('parseTicker',       'parse_ticker')
                        .replace ('parseTrades',       'parse_trades')
                        .replace ('parseTrade',        'parse_trade')
                        .replace ('parseOrderBook',    'parse_order_book')
                        .replace ('parseBidAsks',      'parse_bidasks')
                        .replace ('parseBidAsk',       'parse_bidask')
                        .replace ('parseOrders',       'parse_orders')
                        .replace ('parseOrder',        'parse_order')
                        .replace ('fetchTrades',       'fetch_trades')
                        .replace ('fetchOrderStatus',  'fetch_order_status')
                        .replace ('fetchOrderTrades',  'fetch_order_trades')
                        .replace ('fetchOrder',        'fetch_order')
                        .replace ('fetchOpenOrders',   'fetch_open_orders')
                        .replace ('fetchMyTrades',     'fetch_my_trades')
                        .replace ('fetchAllMyTrades',  'fetch_all_my_trades')
                        .replace ('createOrder',       'create_order')
                        .replace ('cancelOrder',       'cancel_order')
                        .replace ('signIn',            'sign_in')

        args = args.length ? args.split (',').map (x => x.trim ()) : []

        let phArgs = args.join (', $').trim ()
        phArgs = phArgs.length ? ('$' + phArgs) : ''

        let pyArgs = args.map (x => x.replace (' = ', '=')).join (', ')

        let variables = args.map (arg => arg.split ('=').map (x => x.trim ()) [0])

        let body = lines.slice (1, -1).join ("\n")

        let regex3 = /[^a-zA-Z0-9_]let\s+(?:\[([^\]]+)\]|([a-zA-Z0-9_]+))/g // local variables

        let localVariablesMatches
        while (localVariablesMatches = regex3.exec (body)) {
            let m = localVariablesMatches[1] ? localVariablesMatches[1] : localVariablesMatches[2]
            m = m.trim ().split (', ')
            m.forEach (x => variables.push (x.trim ()))
            variables.push (localVariablesMatches[1])
        }

        let phVarsRegex = variables.map (x => [ "([^$$a-zA-Z0-9\\.\\>'_])" + x + "([^a-zA-Z0-9'_])", '$1$$' + x + '$2' ])

        let pyRegex = [
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\s+\'undefined\'/g, '$1[$2] is None' ],
            [ /undefined/g, 'None' ],
            [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
            [ /this\.stringToBase64\s/g, 'base64.b64encode' ],
            [ /this\.base64ToBinary\s/g, 'base64.b64decode' ],
            [ /\.binaryConcat\s/g, '.binary_concat'],
            [ /\.binaryToString\s/g, '.binary_to_string' ],
            [ /\.implodeParams\s/g, '.implode_params'],
            [ /\.extractParams\s/g, '.extract_params'],
            [ /\.parseOHLCVs/g, '.parse_ohlcvs'],
            [ /\.parseOHLCV/g, '.parse_ohlcv'],
            [ /\.parseTicker\s/g, '.parse_ticker'],
            [ /\.parseTrades\s/g, '.parse_trades'],
            [ /\.parseTrade\s/g, '.parse_trade'],
            [ /\.parseOrderBook\s/g, '.parse_order_book'],
            [ /\.parseBidAsks\s/g, '.parse_bidasks'],
            [ /\.parseBidAsk\s/g, '.parse_bidask'],
            [ /\.indexBy\s/g, '.index_by'],
            [ /\.sortBy\s/g, '.sort_by'],
            [ /\.marketIds\s/g, '.market_ids'],
            [ /\.marketId\s/g, '.market_id'],
            [ /\.fetchOrderStatus\s/g, '.fetch_order_status'],
            [ /\.fetchOpenOrders\s/g, '.fetch_open_orders'],
            [ /\.parseOrders\s/g, '.parse_orders'],
            [ /\.parseOrder\s/g, '.parse_order'],
            [ /\.loadMarkets\s/g, '.load_markets'],
            [ /\.encodeURIComponent\s/g, '.encode_uri_component'],
            // [ /this\.urlencode\s/g, '_urlencode.urlencode ' ], // use self.urlencode instead
            [ /this\./g, 'self.' ],
            [ /([^a-zA-Z\'])this([^a-zA-Z])/g, '$1self$2' ],
            [ /([^a-zA-Z0-9_])let\s\[\s*([^\]]+)\s\]/g, '$1$2' ],
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
            [ /^\s*}\s*[\n]/gm, '' ],
            [ /;/g, '' ],
            [ /\.toUpperCase\s*/g, '.upper' ],
            [ /\.toLowerCase\s*/g, '.lower' ],
            [ /JSON\.stringify\s*/g, 'json.dumps' ],
            // [ /\'%([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "'{:$1}'.format($2)" ],
            [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "'{:.$2f}'.format($1)" ],
            [ /parseFloat\s*/g, 'float'],
            [ /parseInt\s*/g, 'int'],
            [ /self\[([^\]+]+)\]/g, 'getattr(self, $1)' ],
            [ /([^\s]+)\.slice \(([^\,\)]+)\,\s?([^\)]+)\)/g, '$1[$2:$3]' ],
            [ /([^\s]+)\.slice \(([^\)\:]+)\)/g, '$1[$2:]' ],
            [ /Math\.floor\s*\(([^\)]+)\)/g, 'int(math.floor($1))' ],
            [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs($1)' ],
            [ /Math\.round\s*\(([^\)]+)\)/g, 'int(round($1))' ],
            [ /(\([^\)]+\)|[^\s]+)\s*\?\s*(\([^\)]+\)|[^\s]+)\s*\:\s*(\([^\)]+\)|[^\s]+)/g, '$2 if $1 else $3'],
            [/ \/\//g, ' #' ],
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
            [ /([^+=\s]+) \(/g, '$1(' ], // PEP8 E225 remove whitespaces before left ( round bracket
            [ /\[ /g, '[' ],             // PEP8 E201 remove whitespaces after left [ square bracket
            [ /\{ /g, '{' ],             // PEP8 E201 remove whitespaces after left { bracket
            [ /([^\s]+) \]/g, '$1]' ],   // PEP8 E202 remove whitespaces before right ] square bracket
            [ /([^\s]+) \}/g, '$1}' ],   // PEP8 E202 remove whitespaces before right } bracket
        ]

        let phRegex = [
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\s+\'undefined\'/g, '$1[$2] == null' ],
            [ /undefined/g, 'null' ],
            [ /this\.extend/g, 'array_merge' ],
            [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
            [ /this\.stringToBase64/g, 'base64_encode' ],
            [ /this\.base64ToBinary/g, 'base64_decode' ],
            [ /\.parseOHLCVs/g, '.parse_ohlcvs'],
            [ /\.parseOHLCV/g, '.parse_ohlcv'],
            [ /\.parseTicker/g, '.parse_ticker'],
            [ /\.parseTrades/g, '.parse_trades'],
            [ /\.parseTrade/g, '.parse_trade'],
            [ /\.parseOrderBook/g, '.parse_order_book'],
            [ /\.parseBidAsks/g, '.parse_bidasks'],
            [ /\.parseBidAsk/g, '.parse_bidask'],
            [ /\.binaryConcat/g, '.binary_concat'],
            [ /\.binaryToString/g, '.binary_to_string' ],
            [ /\.implodeParams/g, '.implode_params'],
            [ /\.extractParams/g, '.extract_params'],
            [ /\.indexBy/g, '.index_by'],
            [ /\.sortBy/g, '.sort_by'],
            [ /\.marketIds/g, '.market_ids'],
            [ /\.marketId/g, '.market_id'],
            [ /\.fetchOrderStatus/g, '.fetch_order_status'],
            [ /\.fetchOpenOrders/g, '.fetch_open_orders'],
            [ /\.parseOrders/g, '.parse_orders'],
            [ /\.parseOrder/g, '.parse_order'],
            [ /\.loadMarkets/g, '.load_markets'],
            [ /\.encodeURIComponent/g, '.encode_uri_component'],
            [ /this\./g, '$this->' ],
            [ / this;/g, ' $this;' ],
            [ /([^'])this_\./g, '$1$this_->' ],
            [ /\{\}/g, 'array ()' ],
            [ /\[\]/g, 'array ()' ],
            [ /\{([^\n\}]+)\}/g, 'array ($1)' ],
            [ /([^a-zA-Z0-9_])let\s\[\s*([^\]]+)\s\]/g, '$1list ($2)' ],
            [ /([^a-zA-Z0-9_])let\s/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)/g, 'array_keys ($1)' ],
            [ /([^\s]+\s*\(\))\.toString \(\)/g, '(string) $1' ],
            [ /([^\s]+)\.toString \(\)/g, '(string) $1' ],
            [ /throw new Error \((.*)\)/g, 'throw new \\Exception ($1)'],
            [ /throw new ([\S]+) \((.*)\)/g, 'throw new $1 ($2)'],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\.length\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 count ($4);$5) {'],
            [ /([^\s]+)\.length\;/g, 'count ($1);' ],
            [ /([^\s]+)\.length/g, 'strlen ($1)' ],
            [ /\.push\s*\(([\s\S]+?)\)\;/g, '[] = $1;' ],
            [ /(\s)await(\s)/g, '$1' ],
            [ /([\S])\: /g, '$1 => ' ],
            [ /\{([^\;\{]+?)\}([^\s])/g, 'array ($1)$2' ],
            [ /\[\s*([^\]]+?)\s*\]\.join\s*\(\s*([^\)]+?)\s*\)/g, "implode ($2, array ($1))" ],
            [ /\[\s([^\]]+?)\s\]/g, 'array ($1)' ],
            [ /JSON\.stringify/g, 'json_encode' ],
            // [ /\'([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "sprintf ('$1', $2)" ],
            [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "sprintf ('%$2f', $1)" ],
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
            [ /([^\(\s]+)\s+%\s+([^\s\)]+)/g, 'fmod ($1, $2)' ],
            [ /\(([^\s]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0\)/g, '(mb_strpos ($1, $2) !== false)' ],
            [ /([^\s]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0/g, 'mb_strpos ($1, $2) !== false' ],
            [ /([^\s]+)\.indexOf\s*\(([^\)]+)\)/g, 'mb_strpos ($1, $2)' ],
            [ /\(([^\s]+)\sin\s([^\)]+)\)/g, '(array_key_exists ($1, $2))' ],
            [ /([^\s]+)\.join\s*\(\s*([^\)]+?)\s*\)/g, 'implode ($2, $1)' ],
            [ /Math\.(max|min)/g, '$1' ],
            [ /console\.log/g, 'var_dump'],
            [ /process\.exit/g, 'exit'],
        ]

        let pyRegexSync = pyRegex.concat ([
            [ /(\s)await(\s)/g, '$1' ]
        ])

        let pyBody      = regexAll (body, pyRegexSync)
        let pyBodyAsync = regexAll (body, pyRegex)

        // special case for Python OrderedDicts

        let orderedRegex = /\.ordered\s+\(\{([^\}]+)\}\)/g
        let orderedMatches = undefined
        while (orderedMatches = orderedRegex.exec (pyBody)) {
            let replaced = orderedMatches[1].replace (/^(\s+)([^\:]+)\:\s*([^\,]+)\,$/gm, '$1($2, $3),')
            pyBody = pyBody.replace (orderedRegex, '\.ordered ([' + replaced + '])')
        }

        py.push ('');
        py.push ('    def ' + method + '(self' + (pyArgs.length ? ', ' + pyArgs.replace (/undefined/g, 'None') : '') + '):');
        py.push (pyBody);

        pyAsync.push ('');
        pyAsync.push ('    ' + keyword + 'def ' + method + '(self' + (pyArgs.length ? ', ' + pyArgs.replace (/undefined/g, 'None') : '') + '):');
        pyAsync.push (pyBodyAsync);

        let phBody = regexAll (body, phRegex.concat (phVarsRegex))

        ph.push ('');
        ph.push ('    public function ' + method + ' (' + phArgs.replace (/undefined/g, 'null').replace ('{}', 'array ()') + ') {');
        ph.push (phBody);
        ph.push ('    }')
    }

    py.push ('')
    pyAsync.push ('')

    python.push (py.join ("\n"))
    pythonAsync.push (pyAsync.join ("\n"))

    ph.push ('}')
    ph.push ('')

    php.push (ph.join ("\n"))
}

//-----------------------------------------------------------------------------

function transpile (oldName, newName, content, comment = '//') {
    log.bright.cyan ('Transpiling ' + oldName.yellow + ' → ' + newName.yellow)
    let fileContents = fs.readFileSync (oldName, 'utf8')
    fileContents = fileContents.split ("\n" + comment + "====") [0]
    fileContents +=
        "\n" + comment + "==============================================================================\n" +
        content.join ("\n" + comment + "------------------------------------------------------------------------------\n")
    fs.truncateSync (newName)
    fs.writeFileSync (newName, fileContents)
}

//-----------------------------------------------------------------------------

function copyFile (oldName, newName) {
    let contents = fs.readFileSync (oldName, 'utf8')
    fs.truncateSync (newName)
    fs.writeFileSync (newName, contents)
}

//-----------------------------------------------------------------------------

transpile ('./ccxt/exchanges.py',       './ccxt/exchanges.py',       python,      '#')
transpile ('./ccxt/async/exchanges.py', './ccxt/async/exchanges.py', pythonAsync, '#')
transpile ('./ccxt.php',                './build/ccxt.php',          php,         '//')

//-----------------------------------------------------------------------------

log.bright.green ('Transpiled successfully.')
