// var fs  = require("fs");
// var replace = require('replace-in-file');

import fs from 'fs'
import replace from 'replace-in-file'

var files = fs.readdirSync('./js/test/Exchange');

function isTs(file){
    return file.endsWith(".js")
}

var tsFiles = files.filter(isTs)
var path = './js/test/Exchange/'


function buildPath(file) {  
  return path + file;
}
tsFiles = tsFiles.map(buildPath)

var fromStrict = "'use strict'"
var toStrict = ''

var fromError = 'const {'
var toError = 'import {'


var toPrecise= "import assert from 'assert'"
var fromPrecise = "const assert = require ('assert')"

var fromModule = "module.exports ="
var toModule = "export default"

;

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
        from: [fromStrict,fromPrecise,fromModule],
        to:[toStrict,toPrecise,toModule]
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