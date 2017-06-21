"use strict";

const fs = require ('fs')

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
		py.push ('        ' + params.join ("\n        ").replace (/ \/\//g, ' #'))
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

			args = args.length ? args.split (',').map (x => x.trim ()) : [ '' ]
			let phArgs = args.join (', $').trim ()
			phArgs = phArgs.length ? ('$' + phArgs) : ''
			let pyArgs = args.join (', ')

			// if (i > 5)
			// 	process.exit ()

			py.push ('');
			py.push ('    def ' + method + ' (self, ' + pyArgs.replace (/undefined/g, 'None') + '):');
			py.push (lines.slice (1, -1).join ("\n").replace (/this\./g, 'self.'));
			
			ph.push ('');
			ph.push ('    public function ' + method + ' (' + phArgs.replace (/undefined/g, 'null').replace ('{}', 'array ()') + ') {');
			ph.push (lines.slice (1).join ("\n").replace (/this\./g, '$this->'));
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