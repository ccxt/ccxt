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

fs.readFile ('ccxt.js', 'utf8', (error, data) => {

    if (error) {
        return console.log (error)
    }

    let contents = data.match (/\/\/====(?:[\s\S]+?)\/\/====/) [0]
    let markets
    let regex = /^var ([\S]+) =[^{]+{([\s\S]+?)^}/gm // market class
    let python = []
    let php = []

    while (markets = regex.exec (contents)) {

        let id = markets[1]

        if (id != 'bitso')
            continue;

        let all = markets[2].trim ().split (/\,\s*\n\s*\n/)
        let params = '    ' + all[0]
        let methods = all.slice (1)
    
        let py = []
        let ph = []

        params = params.split ("\n")
        
        py.push ('#------------------------------------------------------------------------------')
        py.push ('')
        py.push ('class ' + id + ' (Market):')
        py.push ('')
        py.push ('    def __init__ (self, config = {}):')
        py.push ('        params = {')
        py.push ('        ' + params.join ("\n        ").replace (/ \/\//g, ' #') + ',')
        py.push ('        }')
        py.push ('        params.update (config)')
        py.push ('        super (_1broker, self).__init__ (params)')

        ph.push ('//-----------------------------------------------------------------------------')
        ph.push ('')
        ph.push ('class ' + id + ' extends Market {')
        ph.push ('')
        ph.push ('    public function __construct ($options = array ()) {')
        ph.push ('        parent::__construct (array_merge (array (')
        ph.push ('        ' + params.join ("\n        ").replace (/': /g, "' => ").replace (/ {/g, ' array (').replace (/ \[/g, ' array ('))
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
            
            // console.log (variables)

            let phVarsRegex = variables.map (x => [ "([^$$a-zA-Z0-9\\.\\>'_])" + x + "([^a-zA-Z0-9'_])", '$1$$' + x + '$2' ])

            // if (i > 5)
            //     process.exit ()

            let pyRegex = [
                [ /undefined/g, 'None' ],
                [ /this\./g, 'self.' ],
                [ /([^a-zA-Z0-9_])let\s\[\s*([^\]]+)\s\]/g, '$1$2' ],
                [ /([^a-zA-Z0-9_])let\s/g, '$1' ],              
                [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
                [ /Object\.keys\s*\((.*)\)/g, '$1.keys ()' ],
                [ /\[([^\]]+)\]\.join\s*\(([^\)]+)\)/g, "$2.join ([$1])" ],
                [ /\'(sha[0-9]+)\'/g, 'hashlib.$1'],
                [ /throw new Error \((.*)\)/g, 'raise Exception ($1)'],
                [ /(\s)await(\s)/g, '$1'   ],
                [ /([\s\(])extend(\s)/g, '$1self.extend$2' ],
                [ /if\s+\((.*)\)\s+\{/g, 'if $1:' ],
                [ /if\s+\((.*)\)\s*[\n]/g, "if $1:\n" ],
                [ /\}\s*else\s*\{/g, 'else:' ],
                [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(?:\<=|\>=|<|>)\s*(.*)\.length\s*\;[^\)]+\)\s*{/g, 'for $1 in range ($2, len ($3)):'],
                [ /([^\s]+)\.length/g, 'len ($1)' ],
                [ /\.push\s*\(([\s\S]+)\)/g, '.append ($1)' ],
                [ /^\s*}\s*[\n]/gm, '' ],
                [ /;/g, '' ],
                [ /\squerystring\s/g, ' _urlencode.urlencode ' ],
                [ /\.toUpperCase/g, '.upper' ],
                [ /\.toLowerCase/g, '.lower' ],
                [ /JSON\.stringify/g, 'json.dumps' ],
                [ /\sparseFloat\s/g, ' float '],
                [ /\sparseInt\s/g, ' int '],
                [ /\s\|\|\s/g, ' or ' ],
                // [ /\(?.+?\)?/g, ''         ],
            ]

            let phRegex = [
                [ /undefined/g, 'null' ],
                [ /this\./g, '$this->'  ],
                [ /\{\}/g, 'array ()' ],
                [ /\[\]/g, 'array ()' ],
                [ /([^a-zA-Z0-9_])let\s\[\s*([^\]]+)\s\]/g, '$1list ($2)' ],
                [ /([^a-zA-Z0-9_])let\s/g, '$1' ],
                [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
                [ /Object\.keys\s*\((.*)\)/g, 'array_keys ($1)' ],
                [ /throw new Error \((.*)\)/g, 'throw new Exception ($1)'],
                [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\.length\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 count ($4);$5) {'],
                [ /\.push\s*\(([\s\S]+)\)\;/g, '[] = $1;' ],
                [ /(\s)await(\s)/g, '$1' ],
                [ /([\S])\: /g, '$1 => ' ],
                [ /\{([^\;]+?)\}([^\s])/g, 'array ($1)$2' ],
                [ /\[\s*([^\]]+?)\s*\]\.join\s*\((\s*[^\)]+?)\s*\)/g, "implode ($2, array ($1))" ],
                // [ /\[\s*([^\]]+?)\s*\]/g, 'array ($1)' ],
                [ /JSON\.stringify/g, 'json_encode' ],
                [ /\sparseFloat\s/g, ' floatval '],
                [ /\sparseFloat\s/g, ' intval '],
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

            // if (id == '_1broker'){
            //     console.log (variables)
            //     console.log (phBody)
            // }
        }

        py.push ('')

        python.push (py.join ("\n"))

        ph.push ('}')
        ph.push ('')

        php.push (ph.join ("\n"))
    }
    // console.log (python.join ("\n"))
    console.log (php.join ("\n"))
})