"use strict";

const fs = require ('fs')

function regexAll (text, array) {
    for (let i in array) {
        let regex = array[i][0]
        regex = typeof regex == 'string' ? new RegExp (regex, 'g') : new RegExp (regex)
        text = text.replace (regex, array[i][1])
    }
    return text
}

let ccxtjs = fs.readFileSync ('ccxt.js', 'utf8')
let contents = ccxtjs.match (/\/\/====(?:[\s\S]+?)\/\/====/) [0]
let markets
let regex = /^var ([\S]+) =\s*(?:extend\s*\(([^\,]+)\,\s*)?{([\s\S]+?)^}/gm // market class
let python = []
let php = []

while (markets = regex.exec (contents)) {

    let id = markets[1]

    let parent = markets[2]

    let all = markets[3].trim ().split (/\,\s*\n\s*\n/)
    let params = '    ' + all[0]
    let methods = all.slice (1)

    let py = []
    let ph = []

    params = params.split ("\n")
    
    py.push ('')
    py.push ('class ' + id + ' (' + (parent ? parent : 'Market') + '):')
    py.push ('')
    py.push ('    def __init__ (self, config = {}):')
    py.push ('        params = {')
    py.push ('        ' + params.join ("\n        ").replace (/ \/\//g, ' #') + ((all.length > 1) ? ',' : ''))
    py.push ('        }')
    py.push ('        params.update (config)')
    py.push ('        super (' + id + ', self).__init__ (params)')

    ph.push ('')
    ph.push ('class ' + id + ' extends ' + (parent ? parent : 'Market') + ' {')
    ph.push ('')
    ph.push ('    public function __construct ($options = array ()) {')
    ph.push ('        parent::__construct (array_merge (array (')
    ph.push ('        ' + params.join ("\n        ").replace (/': /g, "' => ").replace (/ {/g, ' array (').replace (/ \[/g, ' array (').replace (/\}([\,\n]|$)/g, ')$1').replace (/\]/g, ')') + ((all.length > 1) ? ',' : ''))
    ph.push ('        ), $options));')
    ph.push ('    }')

    for (let i = 0; i < methods.length; i++) {
        let part = methods[i].trim ()       
        let lines = part.split ("\n")
        let header = lines[0].trim ()
        let regex2 = /(async |)([\S]+)\s\(([^)]*)\)\s*{/g // market method
        let matches = regex2.exec (header)
        let keyword = matches[1]
        let method = matches[2]
        let args = matches[3].trim ()

        method = method.replace ('fetchBalance', 'fetch_balance')
                        // .replace ('fetchCategories', 'fetch_categories')
                        .replace ('fetchProducts', 'fetch_products')
                        .replace ('fetchOrderBook', 'fetch_order_book')
                        .replace ('fetchTicker', 'fetch_ticker')
                        .replace ('fetchTrades', 'fetch_trades')
                        .replace ('createOrder', 'create_order')
                        .replace ('cancelOrder', 'cancel_order')
                        .replace ('signIn', 'sign_in')

        args = args.length ? args.split (',').map (x => x.trim ()) : []
        let phArgs = args.join (', $').trim ()
        phArgs = phArgs.length ? ('$' + phArgs) : ''
        let pyArgs = args.join (', ')

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
            [ /this\.stringToBase64/g, 'base64.b64encode' ],
            [ /this\.base64ToBinary/g, 'base64.b64decode' ],
            [ /\.implodeParams/g, '.implode_params'],
            [ /\.extractParams/g, '.extract_params'],
            [ /\.indexBy/g, '.index_by'],
            [ /\.sortBy/g, '.sort_by'],
            [ /\.productId/g, '.product_id'],
            [ /this\.urlencode\s/g, '_urlencode.urlencode ' ],
            [ /this\./g, 'self.' ],
            [ /([^a-zA-Z])this([^a-zA-Z])/g, '$1self$2' ],
            [ /([^a-zA-Z0-9_])let\s\[\s*([^\]]+)\s\]/g, '$1$2' ],
            [ /([^a-zA-Z0-9_])let\s/g, '$1' ],              
            [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)/g, 'list ($1.keys ())' ],
            [ /\[([^\]]+)\]\.join\s*\(([^\)]+)\)/g, "$2.join ([$1])" ],
            [ /hash \(([^,]+)\, \'(sha[0-9])\'/g, "hash ($1, '$2'" ],
            [ /hmac \(([^,]+)\, ([^,]+)\, \'(md5)\'/g, 'hmac ($1, $2, hashlib.$3' ],
            [ /hmac \(([^,]+)\, ([^,]+)\, \'(sha[0-9]+)\'/g, 'hmac ($1, $2, hashlib.$3' ],
            [ /throw new ([\S]+) \((.*)\)/g, 'raise $1 ($2)'],
            [ /(\s)await(\s)/g, '$1' ],
            [ /([\s\(])extend(\s)/g, '$1self.extend$2' ],
            [ /\} else if/g, 'elif' ],
            [ /if\s+\((.*)\)\s+\{/g, 'if $1:' ],
            [ /if\s+\((.*)\)\s*[\n]/g, "if $1:\n" ],
            [ /\}\s*else\s*\{/g, 'else:' ],
            [ /else\s*[\n]/g, "else:\n" ],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(?:\<=|\>=|<|>)\s*(.*)\.length\s*\;[^\)]+\)\s*{/g, 'for $1 in range ($2, len ($3)):'],
            [ /\s\|\|\s/g, ' or ' ],
            [ /\s\&\&\s/g, ' and ' ],
            [ /\!([^\=])/g, 'not $1'],
            [ /([^\s]+)\.length/g, 'len ($1)' ],
            [ /\.push\s*\(([\s\S]+?)\);/g, '.append ($1);' ],
            [ /^\s*}\s*[\n]/gm, '' ],
            [ /;/g, '' ],
            [ /\.toUpperCase/g, '.upper' ],
            [ /\.toLowerCase/g, '.lower' ],
            [ /JSON\.stringify/g, 'json.dumps' ],
            [ /parseFloat\s/g, 'float '],
            [ /parseInt\s/g, 'int '],
            [ /self\[([^\]+]+)\]/g, 'getattr (self, $1)' ],
            [ /([^\s]+).slice \(([^\,\)]+)\,\s?([^\)]+)\)/g, '$1[$2:$3]' ],
            [ /([^\s]+).slice \(([^\)\:]+)\)/g, '$1[$2:]' ],
            [ /Math\.floor\s*\(([^\)]+)\)/g, 'int (math.floor ($1))' ],
            [ /(\([^\)]+\)|[^\s]+)\s*\?\s*(\([^\)]+\)|[^\s]+)\s*\:\s*(\([^\)]+\)|[^\s]+)/g, '$2 if $1 else $3'],
            [/ \/\//g, ' #' ],
            [ /\.indexOf/g, '.find'],
            [ /\strue/g, ' True'],
            [ /\sfalse/g, ' False'],
            [ /\(([^\s]+)\sin\s([^\)]+)\)/g, '($1 in list ($2.keys ()))' ],
            [ /([^\s]+\s*\(\))\.toString \(\)/g, 'str ($1)' ],
            [ /([^\s]+)\.toString \(\)/g, 'str ($1)' ],                
            [ /([^\s]+)\.join\s*\(\s*([^\)\[\]]+?)\s*\)/g, '$2.join ($1)' ],
            [ /Math\.(max|min)/g, '$1' ],
        ]

        let phRegex = [
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\s+\'undefined\'/g, '$1[$2] == null' ],
            [ /undefined/g, 'null' ],
            [ /this\.extend/g, 'array_merge' ],
            [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
            [ /this\.stringToBase64/g, 'base64_encode' ],
            [ /this\.base64ToBinary/g, 'base64_decode' ],
            [ /\.implodeParams/g, '.implode_params'],
            [ /\.extractParams/g, '.extract_params'],
            [ /\.indexBy/g, '.index_by'],
            [ /\.sortBy/g, '.sort_by'],
            [ /\.productId/g, '.product_id'],
            [ /this\./g, '$this->' ],
            [ / this;/g, ' $this;' ],
            [ /this_\./g, '$this_->' ],
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
            [ /([^\s]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0/g, 'mb_strpos ($1, $2) !== false' ],
            [ /\(([^\s]+)\sin\s([^\)]+)\)/g, '(array_key_exists ($1, $2))' ],
            [ /([^\s]+)\.join\s*\(\s*([^\)]+?)\s*\)/g, 'implode ($2, $1)' ],
            [ /Math\.(max|min)/g, '$1' ],
        ]

        let pyBody = regexAll (body, pyRegex)

        py.push ('');
        py.push ('    def ' + method + ' (self' + (pyArgs.length ? ', ' + pyArgs.replace (/undefined/g, 'None') : '') + '):');
        py.push (pyBody);
      
        let phBody = regexAll (body, phRegex.concat (phVarsRegex))

        ph.push ('');
        ph.push ('    public function ' + method + ' (' + phArgs.replace (/undefined/g, 'null').replace ('{}', 'array ()') + ') {');
        ph.push (phBody);
        ph.push ('    }')
    }

    py.push ('')

    python.push (py.join ("\n"))

    ph.push ('}')
    ph.push ('')

    php.push (ph.join ("\n"))
}

let date = new Date ()
let yyyy = date.getUTCFullYear ()
let MM = date.getUTCMonth ()
let dd = date.getUTCDay ()
let hh = date.getUTCHours ()
let mm = date.getUTCMinutes ()
let ss = date.getUTCSeconds ()
MM = MM < 10 ? ('0' + MM) : MM
dd = dd < 10 ? ('0' + dd) : dd
hh = hh < 10 ? ('0' + hh) : hh
mm = mm < 10 ? ('0' + mm) : mm
ss = ss < 10 ? ('0' + ss) : ss
let dateString = [ yyyy, MM, dd, hh, mm, ss ].join ('.')

let oldNamePy = 'ccxt/__init__.py'
let oldNamePHP = 'ccxt.php'
let newNamePy = 'tmp/ccxt.' + dateString + '.py'
let newNamePHP = 'tmp/ccxt.' + dateString + '.php'

let ccxtpy = fs.readFileSync (oldNamePy, 'utf8')
let ccxtphp = fs.readFileSync (oldNamePHP, 'utf8')

ccxtpy = ccxtpy.split ("\n#====") [0]
ccxtphp = ccxtphp.split ("\n//====") [0]

ccxtpy +=
    "\n#==============================================================================\n" +
    python.join ("\n#------------------------------------------------------------------------------\n")


ccxtphp +=
    "\n//=============================================================================\n" +
    php.join ("\n//-----------------------------------------------------------------------------\n") + 
    "\n?>"

// fs.createReadStream (oldNamePy).pipe (fs.createWriteStream (newNamePy))
// fs.createReadStream (oldNamePHP).pipe (fs.createWriteStream (newNamePHP))
fs.truncateSync (oldNamePy)
fs.truncateSync (oldNamePHP)
fs.writeFileSync (oldNamePy, ccxtpy)
fs.writeFileSync (oldNamePHP, ccxtphp)

console.log ('Transpiled successfully.')