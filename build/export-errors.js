const fs  = require ('fs')
const log = require ('ololog').unlimited
const ansi      = require ('ansicolor').nice

const errorHierarchy = fs.readFileSync ('./errors.json', 'utf8')
const formatted = JSON.stringify (JSON.parse (errorHierarchy), null, 4).replace (/"/g, "'").replace (/((?:{| +)})(?!,)/g, '$1,') + '\n'

let filename = './python/ccxt/base/errors.py'
let contents = fs.readFileSync (filename, 'utf8')
let regex = /}\n([\s\S]+)/
const pythonCode = regex.exec (contents)[1]
fs.writeFileSync (filename, 'error_hierarchy = ' + formatted + pythonCode)
log.bright.cyan ('Exporting error hierachy →', filename.yellow)

filename = './php/errors.php'
const phpRegex = /(\$error_hierarchy = )array\([\s\S]+?\);/
contents = fs.readFileSync (filename, 'utf8')
const phpArray = errorHierarchy.replace (/{/g, 'array(').replace (/}/g, ')').replace (/:/g, ' =>').trimRight () + ';'
const phpErrorCode = contents.replace (phpRegex, '$1' + phpArray)
fs.writeFileSync (filename, phpErrorCode)
log.bright.cyan ('Exporting error hierachy →', filename.yellow)
