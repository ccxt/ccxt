// var fs  = require("fs");
// var replace = require('replace-in-file');

import fs from 'fs'
import replace from 'replace-in-file'

var files = fs.readdirSync('./examples/js');
files.filter

function isTs(file){
    return file.endsWith(".js")
}

var tsFiles = files.filter(isTs)
var path = './examples/js/'


function buildPath(file) {  
  return path + file;
}
tsFiles = tsFiles.map(buildPath)

// console.log(tsFiles)


// var strict = "'use strict';";
// var strictReplacement = ''

var exchange = "const Exchange = require ('./base/Exchange');"
var replaceExchange = "import { Exchange } from './base/Exchange';";


// var regexApi = /(?<=.)(this\.)(?=(v1|v2|public|private|spot|contract|v3|v4|v5|v6|v7|future|futures|options|derivatives|swap|get|post|delete|update|trading|history|sapi|marketGet|profilePost|profileGet|nodeGet|matcherPost|matcherGet|forwardGet|forwardPost|nodePost))/g
// var replaceApi = "(this as any).";

// var parseInt = /parseInt \(/g;
// var replaceParseInt = "this.parseInt (";

var fromStrict1 = '"use strict";'
var fromStrict2 = '"use strict"'
var fromStrict3 = "'use strict'"
var fromStrict4 = "'use strict';"

var toStrict1 = ''


var fromError = 'const {'
var toError = 'import {'

var fromError2 = "= require ('./base/errors');"
var toError2 = "from './base/errors';"

var toPrecise= "import { Precise } from './base/Precise';"
var fromPrecise = "const Precise = require ('./base/Precise');"

var fromModule = "module.exports ="
var toModule = "export default"

var f1="import { Exchange } from './base/Exchange';"
var t1="import { Exchange } from './base/Exchange.js';"

var f2="'./base/errors';"
var t2="'./base/errors.js';"

var f3="'./base/Precise';"
var t3="'./base/Precise.js';"

var f4="from './base/functions/number';"
var t4="from './base/functions/number.js';"

// for (var file in tsFiles) {
//     file = tsFiles[file]
//     // console.log(file)
//     var path = './ts/' + file
//     // fs.appendFileSync("./output.txt", line.toString() + "\n");
//     transformFile(file)
// };

function transformFile(file) {
    var options = {
        //Single file
        files: file,
        //Replacement to make (string or regex) 
        // from: [strict, exchange, regexApi],
        // to: [strictReplacement, replaceExchange, replaceApi],
        // from: [fromError, fromError2, fromPrecise, fromModule, exchange, fromStrict],
        // to: [toError, toError2, toPrecise, toModule, replaceExchange, toStrict]
        // from: [f1,f2,f3,f4],
        // to:[t1,t2,t3,t4]
        from: [fromStrict1, fromStrict2, fromStrict3, fromStrict4],
        to: [toStrict1,toStrict1,toStrict1,toStrict1]
      };

      try {
        var changedFiles = replace.sync(options);
        console.log('Modified files:');
        console.log(changedFiles);
      }
      catch (error) {
        console.error('Error occurred:', error);
      }
}


// var file = './ts/aax.ts';
transformFile(tsFiles)
// transformFile('./ts/wavesexchange.ts')

export {}