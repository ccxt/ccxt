// ---------------------------------------------------------------------------
// Usage: npm run transpile
// ---------------------------------------------------------------------------

import fs from 'fs'
import path from 'path'
import log from 'ololog'
import ansi from 'ansicolor'
import { promisify } from 'util'
import errors from "../ts/src/base/errors.js"
import {unCamelCase, precisionConstants, safeString, unique} from "../ts/src/base/functions.js"
import Exchange from '../ts/src/base/Exchange.js'
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile, writeFile, checkCreateFolder } from './fsLocal.js'
import errorHierarchy from '../ts/src/base/errorHierarchy.js'
import { platform } from 'process'
import os from 'os'
import { fork } from 'child_process'
import * as url from 'node:url';
import Piscina from 'piscina';
ansi.nice

// types:
type dict = { [key: string]: string }
declare global {
    interface String {
        yellow(): string;
        cyan(): string;
    }
}


import { Transpiler as astTranspiler } from 'ast-transpiler';

const pythonCodingUtf8 = '# -*- coding: utf-8 -*-'
const baseExchangeJsFile = './ts/src/base/Exchange.ts'

const exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds = exchanges.ids;
const exchangesWsIds = exchanges.ws;

let shouldTranspileTests = true

// let buildPython = true;
// let buildPHP = true;

const metaFileUrl = import.meta.url;
let __dirname = new URL('.', metaFileUrl).pathname;

function overwriteSafe (path: string, content: string) {
    try {
        overwriteFile (path, content);
    } catch {
        checkCreateFolder (path);
        writeFile (path, content);
    }
}

// this is necessary because for some reason
// pathname keeps the first '/' for windows paths
// making them invalid
// example: /C:Users/user/Desktop/
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1)
    }
}
class Transpiler {

    buildPython = true;
    buildPHP = true;

    baseMethodsList!: any[];

    defineImplicitMethodsList () {
        const exchange: any = new Exchange();
        let all = Object.getOwnPropertyNames(Object.getPrototypeOf(exchange));
        all = all.concat (Object.getOwnPropertyNames(exchange));
        this.baseMethodsList = [ ... all.filter(m => 'function' === typeof exchange[m])];
    }

    trimmedUnCamelCase(word: string) {
        if (!this.baseMethodsList) {
            this.defineImplicitMethodsList ();
        }
        // we only need base methods
        let found = false;
        for (const methodName of this.baseMethodsList) {
            if (word.toLowerCase ().replace(' ','') === 'this.' + methodName.toLowerCase () + '(') {
                found = true;
                break;
            }
        }
        if (!found) {
            return word;
        }
        // remove JS space between method name and (
        word = word.replace ('(', '').replace (' ', '');
        // unCamelCase needs to have an input of plain word, so, remove and re-add the parentheses
        const uncameled = unCamelCase (word) + '(';
        return uncameled;
    }

    getPreTranspilationRegexes () {
        // here are regexes for common language functions, which might have uniform behavior across all other langs, except JS. so, we apply JS-specific modification, during pre-transpilation process
        // by this way (to edit JS only behavior), we avoid the necessity of language-specific placeholder methods across different langs' base classes
        return [
            [ /exchange.jsonStringifyWithNull/g, 'JSON.stringify' ],
        ];
    }

    getCommonRegexes (): any[] {

        return [
            [ /(?<!assert|equals|verify)(\s\(?)(rsa|ecdsa|eddsa|jwt|totp|inflate)\s/g, '$1this.$2' ],
            [ /errorHierarchy/g, 'error_hierarchy'],
            [ /\.featuresGenerator/g, '.features_generator'],
            [ /\.featuresMapper/g, '.features_mapper'],
            [ /\.safeValue2/g, '.safe_value_2'],
            [ /\.safeInteger2/g, '.safe_integer_2'],
            [ /\.safeString2/g, '.safe_string_2'],
            [ /safeString \(/g, 'safe_string('],
            [ /safeInteger \(/g, 'safe_integer('],
            [ /inArray \(/g, 'in_array('],
            [ /\.safeFloat2/g, '.safe_float_2'],
            [ /\.safeDict2/g, '.safe_dict_2'],
            [ /\.safeList2/g, '.safe_list_2'],
            [ /\.safeIntegerProduct2/g, '.safe_integer_product_2'],
            [ /\.safeNumberOmitZero/g, '.safe_number_omit_zero'],
            [ /\.exceptionMessage/g, '.exception_message'],
            [ /\.fetchOHLCVS/g, '.fetch_ohlcvs'],
            [ /\.fetchOHLCVWs/g, '.fetch_ohlcvws'],
            [ /\.parseOHLCVS/g, '.parse_ohlcvs'],
            [ /\.buildOHLCVC/g, '.build_ohlcv'],
            [ /\.intToBase16/g, '.int_to_base16'],
            [ /\.parseDate/g, '.parse_date'],
            [ /\.binaryToBase16/g, '.binary_to_base16'],
            [ /\.binaryToBase64/g, '.binary_to_base64'],
            [ /\.stringToBase64/g, '.string_to_base64'],
            [ /\.urlencodeBase64/g, '.urlencode_base64'],
            [ /\.parseOrderStatusByType /g, '.parse_order_status_by_type'],
            [ /\.parseOrderStatus /g, '.parse_order_status'],
            [ /\.handleTriggerPrices /g, '.handle_trigger_prices'],
            [ /\.customParseBidAsk /g, '.custom_parse_bid_ask'],
            [ /\.customParseOrderBook /g, '.custom_parse_order_book'],
            [ /\.createOrderRequest /g, '.create_order_request'],
            [ /\.editOrderRequest /g, '.edit_order_request'],
            [ /\.cancelOrderRequest /g, '.cancel_order_request'],
            [ /\.createAuthToken /g, '.create_auth_token'],
            [ /\.parsePositionRisk /g, '.parse_position_risk'],
            [ /\.parseTimeInForce /g, '.parse_time_in_force'],
            [ /\.parseTradingFees /g, '.parse_trading_fees'],
            [ /\.describeData /g, '.describe_data'],
            [ /\.removeRepeatedElementsFromArray/g, '.remove_repeated_elements_from_array'],
            [ /\.initThrottler /g, '.init_throttler'],
            [ /\.randNumber /g, '.rand_number'],
            [ /\'use strict\';?\s+/g, '' ],
            [ /\.call\s*\(this, /g, '(' ],
            [ /this\.[a-zA-Z0-9_]+ \(/g, this.trimmedUnCamelCase.bind(this) ],
            [ /super\.[a-zA-Z0-9_]+ \(/g, this.trimmedUnCamelCase.bind(this) ],
            [ /\ssha(1|256|384|512)([,)])/g, ' \'sha$1\'$2'], // from js imports to this
            [ /\s(md5|secp256k1|ed25519|keccak)([,)])/g, ' \'$1\'$2'], // from js imports to this

        ].concat(this.getTypescriptRemovalRegexes())
    }

    getPythonRegexes () {

        return [
            // dict transpilation should be done at first
            [ /[\(]typeof ([^\s\)]+) === 'object'[\)] && !Array\.isArray \(\1\)/g, 'isinstance($1, dict)' ],
            [ /Array\.isArray\s*\(([^\)]+)\)/g, 'isinstance($1, list)' ],
            [ /Number\.isInteger\s*\(([^\)]+)\)/g, 'isinstance($1, int)' ],
            [ /([^\(\s]+)\s+instanceof\s+String/g, 'isinstance($1, str)' ],
            [ /([^\(\s]+)\s+instanceof\s+([^\)\s]+)/g, 'isinstance($1, $2)' ],

            // convert javascript primitive types to python ones
            [ /(^\s+(?:let|const|var)\s+\w+:\s+)string/mg, '$1str' ],
            [ /(^\s+(?:let|const|var)\s+\w+:\s+)Dict/mg, '$1dict' ], // remove from now
            // [ /(^\s+(?:let|const|var)\s+\w+:\s+)Int/mg, '$1int' ], // remove from now
            // [ /(^\s+(?:let|const|var)\s+\w+:\s+)Number/mg, '$1float' ], // remove from now
            [ /(^\s+(?:let|const|var)\s+\w+:\s+)any/mg, '$1Any' ], // remove from now

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'undefined\'/g, '$1[$2] is None' ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'undefined\'/g, '$1[$2] is not None' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'undefined\'/g, '$1 is None' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'undefined\'/g, '$1 is not None' ],
            [ /typeof\s+(.+?)\s+\=\=\=?\s+\'undefined\'/g, '$1 is None' ],
            [ /typeof\s+(.+?)\s+\!\=\=?\s+\'undefined\'/g, '$1 is not None' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'number\'/g, "isinstance($1[$2], numbers.Real)" ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'number\'/g, "(not isinstance($1[$2], numbers.Real))" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'number\'/g, "isinstance($1, numbers.Real)" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'boolean\'/g, "isinstance($1, bool)" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'number\'/g, "(not isinstance($1, numbers.Real))" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'boolean\'/g, "(not isinstance($1, bool))" ],

            [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+undefined/g, '$1[$2] is None' ],
            [ /([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+undefined/g, '$1[$2] is not None' ],
            [ /([^\s]+)\s+\=\=\=?\s+undefined/g, '$1 is None' ],
            [ /([^\s]+)\s+\!\=\=?\s+undefined/g, '$1 is not None' ],
            [ /(.+?)\s+\=\=\=?\s+undefined/g, '$1 is None' ],
            [ /(.+?)\s+\!\=\=?\s+undefined/g, '$1 is not None' ],
            //
            // too broad, have to rewrite these cause they don't work
            //
            // [ /([^\s]+)\s+\=\=\=?\s+true/g, 'isinstance($1, bool) and ($1 is True)' ],
            // [ /([^\s]+)\s+\!\=\=?\s+true/g, 'isinstance($1, bool) and ($1 is not True)' ],
            // [ /([^\s]+)\s+\=\=\=?\s+false/g, 'isinstance($1, bool) and ($1 is False)' ],
            // [ /([^\s]+)\s+\!\=\=?\s+false/g, 'isinstance($1, bool) and ($1 is not False)' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'string\'/g, 'isinstance($1[$2], str)' ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'string\'/g, 'not isinstance($1[$2], str)' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'string\'/g, 'isinstance($1, str)' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'string\'/g, 'not isinstance($1, str)' ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'object\'/g, 'isinstance($1[$2], dict)' ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'object\'/g, 'not isinstance($1[$2], dict)' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'object\'/g, 'isinstance($1, dict)' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'object\'/g, 'not isinstance($1, dict)' ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'function\'/g, 'callable($1)' ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'function\'/g, 'not callable($1)' ],

            [ /undefined/g, 'None' ],
            [ /\=\=\=?/g, '==' ],
            [ /\!\=\=?/g, '!=' ],
            [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
            [ /\.shift\s*\(\)/g, '.pop(0)' ],
            // beware of .reverse() in python, because opposed to JS, python does in-place, so 
            // only cases like `x = x.reverse ()` should be transpiled, which will resul as 
            // `x.reverse()` in python. otherwise, if transpiling `x = y.reverse()`, then the
            // left side `x = `will be removed and only `y.reverse()` will end up in python
            [ /\s+(\w+)\s\=\s(.*?)\.reverse\s\(/g, '$2.reverse(' ], 
            [ /Number\.MAX_SAFE_INTEGER/g, 'float(\'inf\')'],
            [ /function\s*(\w+\s*\([^)]+\))\s*{/g, 'def $1:'],
            // [ /\.replaceAll\s*\(([^)]+)\)/g, '.replace($1)' ], // still not a part of the standard
            [ /replaceAll\s*/g, 'replace'],
            [ /assert\s*\((.+)\);/g, 'assert $1'],
            [ /Promise\.all\s*\(([^\)]+)\)/g, 'asyncio.gather(*$1)' ],
            [ /Precise\.stringAdd\s/g, 'Precise.string_add' ],
            [ /Precise\.stringMul\s/g, 'Precise.string_mul' ],
            [ /Precise\.stringDiv\s/g, 'Precise.string_div' ],
            [ /Precise\.stringSub\s/g, 'Precise.string_sub' ],
            [ /Precise\.stringAbs\s/g, 'Precise.string_abs' ],
            [ /Precise\.stringNeg\s/g, 'Precise.string_neg' ],
            [ /Precise\.stringMod\s/g, 'Precise.string_mod' ],
            [ /Precise\.stringEquals\s/g, 'Precise.string_equals' ],
            [ /Precise\.stringEq\s/g, 'Precise.string_eq' ],
            [ /Precise\.stringMin\s/g, 'Precise.string_min' ],
            [ /Precise\.stringMax\s/g, 'Precise.string_max' ],
            [ /Precise\.stringGt\s/g, 'Precise.string_gt' ],
            [ /Precise\.stringGe\s/g, 'Precise.string_ge' ],
            [ /Precise\.stringLt\s/g, 'Precise.string_lt' ],
            [ /Precise\.stringLe\s/g, 'Precise.string_le' ],
            [ /Precise\.stringOr\s/g, 'Precise.string_or' ],
            [ /\.padEnd\s/g, '.ljust'],
            [ /\.padStart\s/g, '.rjust' ],

        // insert common regexes in the middle (critical)
        ].concat (this.getCommonRegexes ()).concat ([

            // [ /this\.urlencode\s/g, '_urlencode.urlencode ' ], // use self.urlencode instead
            [ /([a-zA-Z0-9_]+) in this(:?[^.])/g, 'hasattr(self, $1)$2' ],
            // [ /this\[[a-zA-Z0-9_]+\]/g, 'getattr(self, $1)' ],
            [ /this\[([a-zA-Z0-9_]+)\] = (.*?);/g, 'setattr(self, $1, $2)' ],
            [ /this\./g, 'self.' ],
            [ /([^a-zA-Z\'])this([^a-zA-Z])/g, '$1self$2' ],
            [ /\[\s*([^\]]+)\s\]\s=/g, '$1 =' ],
            [ /((?:let|const|var) \w+\: )([0-9a-zA-Z]+)\[\]/, '$1List[$2]' ],  // typed variable with list type
            [ /((?:let|const|var) \w+\: )([0-9a-zA-Z]+)\[\]\[\]/, '$1List[List[$2]]' ],  // typed variables with double list type
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\[\s*([^\]]+)\s\]/g, '$1$2' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\{\s*([^\}]+)\s\}\s\=\s([^\;]+)/g, '$1$2 = (lambda $2: ($2))(**$3)' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)/g, 'list($1.keys())' ],
            [ /Object\.values\s*\((.*)\)/g, 'list($1.values())' ],
            [ /\[([^\]]+)\]\.join\s*\(([^\)]+)\)/g, "$2.join([$1])" ],
            [ /hash\s*\(([^,]+)\, \'(sha[0-9])\'/g, "hash($1, '$2'" ],
            [ /hmac\s*\(([^,]+)\, ([^,]+)\, \'(md5)\'/g, 'hmac($1, $2, hashlib.$3' ],
            [ /hmac\s*\(([^,]+)\, ([^,]+)\, \'(sha[0-9]+)\'/g, 'hmac($1, $2, hashlib.$3' ],
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
            [ /\!([^\s\='"])/g, 'not $1'],
            [ /\.push\s*\(([\s\S]+?)\);/g, '.append($1);' ],
            [ /^(\s*}\s*$)+/gm, '' ],
            [ /\;(\s+?\/\/.+?)/g, '$1' ],
            [ /\;$/gm, '' ],
            [ /\.toUpperCase\s*/g, '.upper' ],
            [ /\.toLowerCase\s*/g, '.lower' ],
            [ /\.startsWith\s*/g, '.startswith' ],
            [ /\.endsWith\s*/g, '.endswith' ],
            [ /\.trim\s*/g, '.strip' ],
            [ /(\b)String(\b)/g, '$1str$2'],
            [ /JSON\.stringify\s*/g, 'json.dumps' ],
            [ /JSON\.parse\s*/g, "json.loads" ],
            // [ /([^\(\s]+)\.includes\s+\(([^\)]+)\)/g, '$2 in $1' ],
            // [ /\'%([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "'{:$1}'.format($2)" ],
            [ /([^\s]+)\.toFixed\s*\(([0-9]+)\)/g, "format($1, '.$2f')" ],
            [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "format($1, '.' + str($2) + 'f')" ],
            [ /parseFloat\s*/g, 'float'],
            [ /parseInt\s*/g, 'int'],
            [ /self\[([^\]+]+)\]/g, 'getattr(self, $1)' ],
            [ /Math\.floor\s*\(([^\)]+)\)/g, 'int(math.floor($1))' ],
            [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs($1)' ],
            [ /Math\.pow\s*\(([^\)]+)\)/g, 'math.pow($1)' ],
            [ /Math\.round\s*\(([^\)]+)\)/g, 'int(round($1))' ],
            [ /Math\.ceil\s*\(([^\)]+)\)/g, 'int(math.ceil($1))' ],
            [ /Math\.log/g, 'math.log' ],
            [ /([a-zA-Z0-9_\.]*\([^\)]+\)|[^\s]+)\s+\?\s*([^\:]+)\s+\:\s*([^\n]+)/g, '$2 if $1 else $3'],
            [ /([^\s]+)\.slice \(([^\,\)]+)\,\s?([^\)]+)\)/g, '$1[$2:$3]' ],
            [ /([^\s]+)\.slice \(([^\)\:]+)\)/g, '$1[$2:]' ],
            [ /([^\s(:]+)\.length/g, 'len($1)' ],
            [ /(^|\s)\/\//g, '$1#' ],
            [ /([^\n\s]) #/g, '$1  #' ],   // PEP8 E261
            [ /\.indexOf/g, '.find'],
            [ /(\s|\()true/g, '$1True'],
            [ /(\s|\()false/g, '$1False'],
            [ /([^\s]+\s*\(\))\.toString\s+\(\)/g, 'str($1)' ],
            [ /([^\s]+)\.toString \(\)/g, 'str($1)' ],
            [ /([^\s]+)\.join\s*\(\s*([^\)\[\]]+?)\s*\)/g, '$2.join($1)' ],
            [ /Math\.(max|min)\s/g, '$1' ],
            [ / = new /g, ' = ' ], // python does not have a 'new' keyword
            [ /console\.log\s/g, 'print' ],
            [ /process\.exit\s+/g, 'sys.exit' ],
            [ /(while \(.*\)) {/, '$1\:' ], // While loops replace bracket with :
            [ /([^:+=\/\*\s-]+) \(/g, '$1(' ], // PEP8 E225 remove whitespaces before left ( round bracket
            [ /\sand\(/g, ' and (' ],
            [ /\sor\(/g, ' or (' ],
            [ /\snot\(/g, ' not (' ],
            [ /\[ /g, '[' ],              // PEP8 E201 remove whitespaces after left [ square bracket
            [ /\{ /g, '{' ],              // PEP8 E201 remove whitespaces after left { bracket
            [ /(?<=[^\s#]) \]/g, ']' ],    // PEP8 E202 remove whitespaces before right ] square bracket
            [ /(?<=[^\s#]) \}/g, '}' ],    // PEP8 E202 remove whitespaces before right } bracket
            [ /([^a-z\_])(elif|if|or|else)\(/g, '$1$2 \(' ], // a correction for PEP8 E225 side-effect for compound and ternary conditionals
            [ /\!\=\sTrue/g, 'is not True' ], // a correction for PEP8 E712, it likes "is not True", not "!= True"
            [ /\=\=\sTrue/g, 'is True' ], // a correction for PEP8 E712, it likes "is True", not "== True"
            [ /\sdelete\s/g, ' del ' ],
            [ /(?<!#.+)null/, 'None' ],
            [ /.market_or_None/g, '.market_or_null'],
            [ /\/\*\*/, '\"\"\"' ], // Doc strings
            [ / \*\//, '\"\"\"' ], // Doc strings
            [ /\[([^\[\]]*)\]\{@link (.*)\}/g, '`$1 <$2>`' ], // docstring item with link
            [ /\s+\* @method/g, '' ], // docstring @method
            [ /(\s+) \* @description (.*)/g, '$1$2' ], // docstring description
            [ /\s+\* @name .*/g, '' ], // docstring @name
            [ /(\s+)  \* @see( .*)/g, '$1$2' ], // docstring @see
            [ /(\s+ \* @(param|returns) {[^}]*)string(\[\])?([^}]*}.*)/g, '$1str$3$4' ], // docstring type conversion
            [ /(\s+ \* @(param|returns) {[^}]*)object(\[\])?([^}]*}.*)/g, '$1dict$3$4' ], // docstring type conversion
            [ /(\s+) \* @returns ([^\{])/g, '$1:returns: $2' ], // docstring return
            [ /(\s+) \* @returns \{(.+)\}/g, '$1:returns $2:' ], // docstring return
            [ /(\s+ \* @param \{[\]\[\|a-zA-Z]+\} )([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+) (.*)/g, '$1$2[\'$3\'] $4' ], // docstring params.anything
            [ /(\s+) \* @([a-z]+) \{([\]\[a-zA-Z\|]+)\} ([a-zA-Z0-9_\-\.\[\]\']+)/g, '$1:$2 $3 $4:' ], // docstring param
        ])
    }

    getPython2Regexes () {
        return [
            [ /await\s+asyncio\.gather\(\*(.+)\)/g, '$1' ], // remove line entirely
            [ /(\s)await(\s)/g, '$1' ]
        ]
    }

    getPHPSyncRegexes () {
        return [
            [ /Async\\await\(Promise\\all\((.+)\)\)/g, '$1' ], // remove line entirely
            // delete await, the following regex does not pick up multiline await calls
            [ /\bAsync\\await\((.+)\);/g, '$1;' ],
            // hence the following regex is added with a dotAll modifier 's'
            // and a non greedy match for the calls not picked up by the previous regex
            [ /\bAsync\\await\((.+?)\);/gs, '$1;' ],
            [ /\byield(?: from)?\s+/g, '' ], // delete yield from
        ]
    }

    getPHPRegexes () {
        return [
            //
            // Curly-braces are used for both dictionaries in the code as well as for the url-imploded params.
            // For example: https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods
            //
            // There's a conflict between the curly braces that have to be converted from dictionaries to PHP-arrays and
            // the curly braces used for url-imploded params that should not be touched.
            //
            // The transpiler takes all non-spaced strings in curly braces {likeThis} and converts them to ~likeThis~.
            // That is done to avoid changing the curly braces into the array() in PHP.
            // This way we protect the url-imploded params from being touched by the regexes that will follow.
            // That conversion is done first-thing, at the very early stage of transpilation.
            // The regexes are applied in the order they're listed, top-down.
            //
            // A dictionary in curly braces will never have those curly braces attached to the contents of the dictionary.
            // There will always be a space like { 'a': b, 'c': d }.
            // Hence, the remaining non-converted curly-brace dictionaries will have to be converted to arrays in PHP.
            // That is done in the middle of the transpilation process.
            //
            // The last step is to convert those "saved embedded/imploded url-params substitutions" from ~likeThis~ back to {likeThis}.
            // That is done at the very last regex steps.
            // All of that is a workaround for PHP-arrays vs dictionaries vs url-imploded params in other langs.
            //
            [ /\{([\]\[\|a-zA-Z0-9_-]+?)\}/g, '~$1~' ], // resolve the "arrays vs url params" conflict (both are in {}-brackets)
            [ /\[([^\]\[]*)\]\{(@link .*)\}/g, '~$2 $1~' ], // docstring item with link
            [ /\s+\* @method/g, '' ], // docstring @method
            [ /(\s+)\* @description (.*)/g, '$1\* $2' ], // docstring description
            [ /\s+\* @name .*/g, '' ], // docstring @name
            [ /(\s+)\* @returns/g, '$1\* @return' ], // docstring return
            [ /\!Array\.isArray\s*\(([^\)]+)\)/g, "(gettype($1) !== 'array' || array_keys($1) !== array_keys(array_keys($1)))" ],
            [ /Array\.isArray\s*\(([^\)]+)\)/g, "(gettype($1) === 'array' && array_keys($1) === array_keys(array_keys($1)))" ],
            [ /Number\.isInteger\s*\(([^\)]+)\)/g, "is_int($1)" ],
            [ /([^\(\s]+)\s+instanceof\s+String/g, 'is_string($1)' ],
            // we want to remove type hinting variable lines
            [ /^\s+(?:let|const|var)\s+\w+:\s+(?:Str|Int|Num|SubType|MarketType|string|number|Dict|any(?:\[\])*);\n/mg, '' ],
            [ /(^|[^a-zA-Z0-9_])(let|const|var)(\s+\w+):\s+(?:Str|Int|Num|Bool|Market|Currency|string|number|Dict|any(?:\[\])*)(\s+=\s+[\w+\{}])/g, '$1$2$3$4' ],

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

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'string\'/g, "gettype($1[$2]) === 'string'" ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'string\'/g, "gettype($1[$2]) !== 'string'" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'string\'/g, "gettype($1) === 'string'" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'string\'/g, "gettype($1) !== 'string'" ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'object\'/g, "gettype($1[$2]) === 'array'" ],
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'object\'/g, "gettype($1[$2]) !== 'array'" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'object\'/g, "gettype($1) === 'array'" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'object\'/g, "gettype($1) !== 'array'" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'function\'/g, "is_callable($1)" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'boolean\'/g, "is_bool($1)" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'function\'/g, "!is_callable($1)" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'boolean\'/g, "!is_bool($1)" ],

            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\=\=\=?\s+\'number\'/g, "(is_float($1[$2]) || is_int($1[$2]))" ], // same as above but for number
            [ /typeof\s+([^\s\[]+)(?:\s|\[(.+?)\])\s+\!\=\=?\s+\'number\'/g, "!(is_float($1[$2]) || is_int($1[$2]))" ],
            [ /typeof\s+([^\s]+)\s+\=\=\=?\s+\'number\'/g, "(is_float($1) || is_int($1))" ],
            [ /typeof\s+([^\s]+)\s+\!\=\=?\s+\'number\'/g, "!(is_float($1) || is_int($1))" ],

            [ /undefined/g, 'null' ],
            [ /\} else if/g, '} elseif' ],
            [ /this\.stringToBinary\s*\((.*)\)/g, '$1' ],
            [ /this\.stringToBase64\s/g, 'base64_encode' ],
            [ /this\.binaryToBase16\s/g, 'bin2hex' ],
            [ /this\.base64ToBinary\s/g, 'base64_decode' ],
            [ /this\.base64ToString\s/g, 'base64_decode' ],
            [ /Promise\.all\s*\(([^\)]+)\)/g, 'Promise\\all($1)' ],
            // deepExtend is commented for PHP because it does not overwrite linear arrays
            // a proper \ccxt\Exchange::deep_extend() base method is implemented instead
            // [ /this\.deepExtend\s/g, 'array_replace_recursive'],
            [ /(\w+)\.shift\s*\(\)/g, 'array_shift($1)' ],
            [ /(\w+)\.reverse\s*\(\)/g, 'array_reverse($1)' ], // see comment in python .reverse()
            [ /(\w+)\.pop\s*\(\)/g, 'array_pop($1)' ],
            [ /Number\.MAX_SAFE_INTEGER/g, 'PHP_INT_MAX' ],
            [ /Precise\.stringAdd\s/g, 'Precise::string_add' ],
            [ /Precise\.stringDiv\s/g, 'Precise::string_div' ],
            [ /Precise\.stringMul\s/g, 'Precise::string_mul' ],
            [ /Precise\.stringSub\s/g, 'Precise::string_sub' ],
            [ /Precise\.stringAbs\s/g, 'Precise::string_abs' ],
            [ /Precise\.stringNeg\s/g, 'Precise::string_neg' ],
            [ /Precise\.stringMod\s/g, 'Precise::string_mod' ],
            [ /Precise\.stringEquals\s/g, 'Precise::string_equals' ],
            [ /Precise\.stringEq\s/g, 'Precise::string_eq' ],
            [ /Precise\.stringMin\s/g, 'Precise::string_min' ],
            [ /Precise\.stringMax\s/g, 'Precise::string_max' ],
            [ /Precise\.stringGt\s/g, 'Precise::string_gt' ],
            [ /Precise\.stringGe\s/g, 'Precise::string_ge' ],
            [ /Precise\.stringLt\s/g, 'Precise::string_lt' ],
            [ /Precise\.stringLe\s/g, 'Precise::string_le' ],
            [ /Precise\.stringOr\s/g, 'Precise::string_or' ],
            [ /(\w+)\.padEnd\s*\(([^,]+),\s*([^)]+)\)/g, 'str_pad($1, $2, $3, STR_PAD_RIGHT)' ],
            [ /(\w+)\.padStart\s*\(([^,]+),\s*([^)]+)\)/g, 'str_pad($1, $2, $3, STR_PAD_LEFT)' ],

        // insert common regexes in the middle (critical)
        ].concat (this.getCommonRegexes ()).concat ([

            [ /([a-zA-Z0-9_]+) in this(:?[^.])/g, 'property_exists($this, $1)$2' ],
            [ /\(this,/g, '($this,' ],
            [ /this\./g, '$this->' ],
            [ / this;/g, ' $this;' ],
            [ /([^'])this_\./g, '$1$this_->' ],
            [ /([^'])\{\}/g, '$1array()' ],
            [ /([^'])\[\](?!')/g, '$1array()' ],

        // add {}-array syntax conversions up to 20 levels deep on the same line
        ]).concat ([ ... Array (20) ].map (x => [ /\{([^\n\}]+)\}/g, 'array($1)' ] )).concat ([
            [ /\[\s*([^\]]+)\s\]\s=/g, 'list($1) =' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\[\s*([^\]]+)\s\]/g, '$1list($2)' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s\{\s*([^\}]+)\s\}/g, '$1array_values(list($2))' ],
            [ /(^|[^a-zA-Z0-9_])(?:let|const|var)\s/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)\.length/g, '$1' ],
            [ /Object\.keys\s*\((.*)\)/g, 'is_array($1) ? array_keys($1) : array()' ],
            [ /Object\.values\s*\((.*)\)/g, 'is_array($1) ? array_values($1) : array()' ],
            [ /([^\s]+\s*\(\))\.toString \(\)/g, '(string) $1' ],
            [ /([^\s]+)\.toString \(\)/g, '(string) $1' ],
            [ /throw new Error \((.*)\)/g, 'throw new \\Exception($1)' ],
            [ /throw new ([\S]+) \((.*)\)/g, 'throw new $1($2)' ],
            [ /throw ([\S]+)\;/g, 'throw $$$1;' ],
            [ '([^a-z]+) (' + Object.keys (errors).join ('|') + ')([^\\s])', "$1 '\\\\ccxt\\\\$2'$3" ],
            [ /\}\s+catch \(([\S]+)\) {/g, '} catch (Exception $$$1) {' ],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\.length\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 count($4);$5) {' ],
            [ /for\s+\(([a-zA-Z0-9_]+)\s*=\s*([^\;\s]+\s*)\;[^\<\>\=]+(\<=|\>=|<|>)\s*(.*)\s*\;([^\)]+)\)\s*{/g, 'for ($1 = $2; $1 $3 $4;$5) {' ],
            [ /([^\s]+)\.length\;/g, 'count($1);' ],
            [ /\.push\s*\(([\s\S]+?)\)\;/g, '[] = $1;' ],
            [ /\sawait\s+([^;]+);/g, ' Async\\await($1);' ],
            [ /([\S])\: /g, '$1 => ' ],
            [/\$this->ws\./g, '$this->ws->'], // ws method fix


        // add {}-array syntax conversions up to 20 levels deep
        ]).concat ([ ... Array (20) ].map (x => [ /\{([^\{]+?)\}([^\s])/g, 'array($1)$2' ])).concat ([

            [ /\[\s*([^\]]+?)\s*\]\.join\s*\(\s*([^\)]+?)\s*\)/g, "implode($2, array($1))" ],

        // add []-array syntax conversions up to 20 levels deep
        ]).concat ([ ... Array (20) ].map (x => [ /\[(\s[^\]]+?\s)\]/g, 'array($1)' ])).concat ([

            [ /(\b)String(\b)/g, "$1'strval'$2"],
            [ /JSON\.stringify/g, 'json_encode' ],
            [ /JSON\.parse\s+\(([^\)]+)\)/g, 'json_decode($1, $$as_associative_array = true)' ],
            // [ /\'([^\']+)\'\.sprintf\s*\(([^\)]+)\)/g, "sprintf ('$1', $2)" ],
            [ /([^\s]+)\.toFixed\s*\(([0-9]+)\)/g, "sprintf('%.$2f', $1)" ],
            [ /([^\s]+)\.toFixed\s*\(([^\)]+)\)/g, "sprintf('%.' . $2 . 'f', $1)" ],
            [ /parseFloat\s/g, 'floatval'],
            [ /parseInt\s/g, 'intval'],
            [ / \+ (?!\d)/g, ' . ' ],
            [ / \+\= (?!\d)/g, ' .= ' ],
            [ /([^\s\(]+(?:\s*\(.+\))?)\.toUpperCase\s*\(\)/g, 'strtoupper($1)' ],
            [ /([^\s\(]+(?:\s*\(.+\))?)\.toLowerCase\s*\(\)/g, 'strtolower($1)' ],
            [ /([^\s\(]+(?:\s*\(.+\))?)\.trim\s*\(\)/g, 'trim($1)' ],
            [ /([^\s\(]+(?:\s*\(.+\))?)\.replaceAll\s*\(([^)]+)\)/g, 'str_replace($2, $1)' ],
            [ /([^\s\(]+(?:\s*\(.+\))?)\.replace\s*\(([^)]+)\)/g, 'str_replace($2, $1)' ],
            [ /this\[([^\]+]+)\]/g, '$$this->$$$1' ],
            [ /([^\s\(]+).slice \(([^\)\:,]+)\)/g, 'mb_substr($1, $2)' ],
            [ /([^\s\(]+).slice \(([^\,\)]+)\,\s*([^\)]+)\)/g, 'mb_substr($1, $2, $3 - $2)' ],
            [ /([^\s\(]+).split \(('[^']*'|[^\,]+?)\)/g, 'explode($2, $1)' ],
            [ /([^\s\(]+).startsWith \(('[^']*'|[^\,]+?)\)/g, 'str_starts_with($1, $2)' ],
            [ /([^\s\(]+).endsWith \(('[^']*'|[^\,]+?)\)/g, 'str_ends_with($1, $2)' ],
            [ /([^\s\(]+)\.length/g, 'strlen($1)' ],
            [ /Math\.floor\s*\(([^\)]+)\)/g, '(int) floor($1)' ],
            [ /Math\.abs\s*\(([^\)]+)\)/g, 'abs($1)' ],
            [ /Math\.round\s*\(([^\)]+)\)/g, '(int) round($1)' ],
            [ /Math\.ceil\s*\(([^\)]+)\)/g, '(int) ceil($1)' ],
            [ /Math\.pow\s*\(([^\)]+)\)/g, 'pow($1)' ],
            [ /Math\.log/g, 'log' ],
            [ /([^\(\s]+)\s+%\s+([^\s\,\;\)]+)/g, 'fmod($1, $2)' ],
            [ /\(([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0\)/g, '(mb_strpos($1, $2) !== false)' ],
            [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\>\=\s*0/g, 'mb_strpos($1, $2) !== false' ],
            [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)\s*\<\s*0/g, 'mb_strpos($1, $2) === false' ],
            [ /([^\s\(]+)\.indexOf\s*\(([^\)]+)\)/g, 'mb_strpos($1, $2)' ],
            [ /\(([^\s\(]+)\sin\s([^\)]+)\)/g, '(is_array($2) && array_key_exists($1, $2))' ],
            [ /([^\s]+)\.join\s*\(\s*([^\)]+?)\s*\)/g, 'implode($2, $1)' ],
            [ 'new ccxt\\.', 'new \\ccxt\\' ], // a special case for test_exchange_datetime_functions.php (and for other files, maybe)
            [ /Math\.(max|min)/g, '$1' ],
            [ /console\.log/g, 'var_dump'],
            [ /process\.exit/g, 'exit'],
            [ /super\./g, 'parent::'],
            [ /\sdelete\s([^\n]+)\;/g, ' unset($1);' ],
            [ /\~([\]\[\|@\.\s+\:\/#()\-a-zA-Z0-9_-]+?)\~/g, '{$1}' ], // resolve the "arrays vs url params" conflict (both are in {}-brackets)
            [ /(\s+ \* @(param|return) {[^}]*)array\(\)([^}]*}.*)/g, '$1[]$3' ], // docstring type conversion
            [ /(\s+ \* @(param|return) {[^}]*)object([^}]*}.*)/g, '$1array$3' ], // docstring type conversion
        ])
    }

    getTypescriptRemovalRegexes() {
        return [
            [ /\((\w+)\sas\s\w+\)/g, '$1'], // remove (this as any) or (x as number) paren included
            [ /\sas (Dictionary<)?\w+(\[])?(>)?/g, ''], // remove any "as any" or "as number" or "as trade[]"
            [ /([let|const][^:]+):([^=]+)(\s+=.*$)/g, '$1$3'], // remove variable type
        ]
    }

    getTypescripSignaturetRemovalRegexes() {
        // currently they can't be mixin with the ones above
        return [
            [ /(\s*(?:async\s)?\w+\s\([^)]+\)):[^{]+({)/, "$1 $2" ], // remove return type
            // remove param types
            // Currently supported: single name (object, number, mytype, etc)
            // optional params (string | number)
            // [ /:\s\w+(\s*\|\s*\w+)?(?=\s|,|\))/g, ""], // remove parameters type
            // array types: string[] or (string|number)[]
            // [ /:\s\(?\w+(\s*\|\s*\w+)?\)?\[]/g, ""], // remove parameters type
        ]
    }

    getBaseClass () {
        return new Exchange ()
    }

    getBaseMethods () {
        const baseExchange: any = this.getBaseClass ()
        let object = baseExchange
        let properties: any[] = []
        while (object !== Object.prototype) {
            properties = properties.concat (Object.getOwnPropertyNames (object))
            object = Object.getPrototypeOf (object)
        }
        return properties.filter (x => typeof baseExchange[x] === 'function')
    }

    getPythonBaseMethods () {
        return this.getBaseMethods ()
    }

    getPHPBaseMethods () {
        return this.getBaseMethods ()
    }

    //-------------------------------------------------------------------------
    // the following common headers are used for transpiled tests

    getJsPreamble () {
        return [
            "// ----------------------------------------------------------------------------",
            "",
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "// EDIT THE CORRESPONDENT .ts FILE INSTEAD",
            "",
        ].join ("\n")
    }

    getPythonPreamble (level = 3) {
        return [
            "import os",
            "import sys",
            "",
            `root = ${'os.path.dirname('.repeat(level)}os.path.abspath(__file__)${')'.repeat(level)}`,
            "sys.path.append(root)",
            "",
            "# ----------------------------------------------------------------------------",
            "",
            "# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
            "# ----------------------------------------------------------------------------",
            "",
        ].join ("\n")
    }

    getPHPPreamble (include = true, level = 2, isWs = false) {
        return [
            "<?php",
            (isWs ? "namespace ccxt\\pro;" : "namespace ccxt;"),
            include ? `include_once (__DIR__.'/${'../'.repeat(level)}ccxt.php');` : "",
            "// ----------------------------------------------------------------------------",
            "",
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
            "// -----------------------------------------------------------------------------",
            "",
        ].join ("\n")
    }

    getPythonGenerated() {
        return [
            "# ----------------------------------------------------------------------------",
            "# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "# -----------------------------------------------------------------------------",
            "",
        ].join ("\n");
    }

    // ------------------------------------------------------------------------
    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll (text: string, array: any[]) {
        for (const i in array) {
            let regex = array[i][0]
            let replaceStringOrCallback = array[i][1]
            const flags = (typeof regex === 'string') ? 'g' : undefined
            regex = new RegExp (regex, flags)
            if (typeof array[i][1] !== 'function') {
                text = text.replace (regex, replaceStringOrCallback)
            } else {
                text = text.replace (regex, function (matched: any) {
                    return replaceStringOrCallback (matched)
                })
            }
        }
        return text
    }

    // ========================================================================
    // one-time helpers

    createPythonClassDeclaration (className: string, baseClass: string) {
        const mixin = (className === 'testMainClass') ? '' : ', ImplicitAPI'
        return 'class ' + className + '(' + baseClass + mixin + '):'
    }

    createPythonHeader () {
        return [
            pythonCodingUtf8,
            "",
            "# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
        ]
    }

    createPythonClassHeader (imports: any[], bodyAsString: string) {
        const header = this.createPythonHeader ()
        return header.concat (imports);
    }

    createPythonClassImports (baseClass: string, className: string, async = false) {
        const baseClasses = {
            'Exchange': 'base.exchange',
        }
        const asyncString = (async ? '.async_support' : '')

        const imports = [
            (baseClass.indexOf ('ccxt.') === 0) ?
                ('import ccxt' + asyncString + ' as ccxt') :
                ('from ccxt' + asyncString + '.' + safeString (baseClasses, baseClass, baseClass) + ' import ' + baseClass),
        ]
        if (className !== 'testMainClass') {
            imports.push ('from ccxt.abstract.' + className + ' import ImplicitAPI')
        }
        return imports
    }

    createPythonClass (className: string, baseClass: string, body: any, methods: any[], async = false) {

        let bodyAsString = body.join ("\n")

        const {
            imports,
            asyncioImports,
            libraries,
            errorImports,
            precisionImports
        } = this.createPythonImports(baseClass, bodyAsString, className, async)

        let header = this.createPythonClassHeader (imports, bodyAsString)

        header = header.concat (asyncioImports, libraries, errorImports, precisionImports)

        // transpile camelCase base method names to underscore base method names
        const baseMethods = this.getPythonBaseMethods ()
        methods = methods.concat (baseMethods)
        for (let method of methods) {
            const regex = new RegExp ('(self|super\\([^)]+\\))\\.(' + method + ')([^a-zA-Z0-9_])', 'g')
            bodyAsString = bodyAsString.replace (regex, (match: any, p1: string, p2: string, p3: string) => (p1 + '.' + unCamelCase (p2) + p3))
        }

        header.push ("\n\n" + this.createPythonClassDeclaration (className, baseClass))

        const footer = [
            '', // footer (last empty line)
        ]

        const result = header.join ("\n") + "\n" + bodyAsString + "\n" + footer.join ('\n')
        return result
    }

    createPythonImports (baseClass: string, bodyAsString: string, className: string, async = false) {

        const pythonStandardLibraries: dict = {
            'hashlib': 'hashlib',
            'math': 'math',
            'json.loads': 'json',
            'json.dumps': 'json',
            'sys.': 'sys',
        }

        const imports = this.createPythonClassImports (baseClass, className, async)

        const libraries: string[] = []

        for (let library in pythonStandardLibraries) {
            const regex = new RegExp ("[^\\'\\\"a-zA-Z]" + library + "[^\\'\\\"a-zA-Z]")
            if (bodyAsString.match (regex)){
                const importStatement = 'import ' + pythonStandardLibraries[library];
                if (!libraries.includes(importStatement)) {
                    libraries.push (importStatement)
                }
            }
        }

        if (bodyAsString.match (/numbers\.(Real|Integral)/)) {
            libraries.push ('import numbers')
        }
        const matchObject = {
            'Account': /-> (?:List\[)?Account/,
            'Any': /(?:->|:) (?:List\[)?Any/,
            'BalanceAccount': /-> BalanceAccount:/,
            'Balances': /-> Balances:/,
            'BorrowInterest': /-> BorrowInterest:/,
            'Bool': /(: (?:List\[)?Bool =)|(-> Bool:)/,
            'Conversion': /-> Conversion:/,
            'CrossBorrowRate': /-> CrossBorrowRate:/,
            'CrossBorrowRates': /-> CrossBorrowRates:/,
            'Currencies': /-> Currencies:/,
            'Currency': /(-> Currency:|: Currency)/,
            'DepositAddress': /-> (?:List\[)?DepositAddress/,
            'FundingHistory': /\[FundingHistory/,
            'Greeks': /-> Greeks:/,
            'IndexType': /: IndexType/,
            'Int': /: (?:List\[)?Int =/,
            'IsolatedBorrowRate': /-> IsolatedBorrowRate:/,
            'IsolatedBorrowRates': /-> IsolatedBorrowRates:/,
            'LastPrice': /-> LastPrice:/,
            'LastPrices': /-> LastPrices:/,
            'LedgerEntry': /-> LedgerEntry:/,
            'Leverage': /-> Leverage:/,
            'Leverages': /-> Leverages:/,
            'LeverageTier': /-> (?:List\[)?LeverageTier/,
            'LeverageTiers': /-> LeverageTiers:/,
            'Liquidation': /-> (?:List\[)?Liquidation/,
            'LongShortRatio': /-> (?:List\[)?LongShortRatio/,
            'MarginMode': /-> MarginMode:/,
            'MarginModes': /-> MarginModes:/,
            'MarginModification': /-> MarginModification:/,
            'Market': /(-> Market:|: Market)/,
            // 'MarketInterface': /-> MarketInterface:/,
            'MarketMarginModes': /-> MarketMarginModes:/,
            'MarketType': /: MarketType/,
            'Num': /: (?:List\[)?Num =/,
            'Option': /-> Option:/,
            'OptionChain': /-> OptionChain:/,
            'Order': /-> (?:List\[)?Order\]?:/,
            'OrderBook': /-> OrderBook:/,
            'OrderRequest': /: (?:List\[)?OrderRequest/,
            'CancellationRequest': /: (?:List\[)?CancellationRequest/,
            'OrderSide': /: OrderSide/,
            'OrderType': /: OrderType/,
            'Position': /-> (?:List\[)?Position/,
            'Str': /: (?:List\[)?Str =/,
            'Strings': /: (?:List\[)?Strings =/,
            'SubType': /: SubType/,
            'Ticker': /-> Ticker:/,
            'Tickers': /-> Tickers:/,
            'FundingRate': /-> FundingRate:/,
            'OpenInterest': /-> OpenInterest:/,
            'FundingRates': /-> FundingRates:/,
            'OrderBooks': /-> OrderBooks:/,
            'OpenInterests': /-> OpenInterests:/,
            'Trade': /-> (?:List\[)?Trade/,
            'TradingFeeInterface': /-> TradingFeeInterface:/,
            'TradingFees': /-> TradingFees:/,
            'Transaction': /-> (?:List\[)?Transaction/,
            'FundingRateHistory': /-> (?:List\[)?FundingRateHistory/,
            'MarketInterface': /-> (?:List\[)?MarketInterface/,
            'TransferEntry': /-> TransferEntry:/,
        }
        const matches: string[] = []
        let match
        for (const [ object, regex ] of Object.entries (matchObject)) {
            if (bodyAsString.match (regex)) {
                matches.push (object)
            }
        }
        if (matches.length) {
            libraries.push ('from ccxt.base.types import ' + matches.join (', '))
        }
        if (bodyAsString.match (/: Client/)) {
            libraries.push ('from ccxt.async_support.base.ws.client import Client')
        }
        if (bodyAsString.match (/[\s(]Optional\[/)) {
            libraries.push ('from typing import Optional')
        }
        if (bodyAsString.match (/[\s\[(]List\[/)) {
            libraries.push ('from typing import List')
        }

        const errorImports: string[] = []

        for (let error in errors) {
            const regex = new RegExp ("[^\\'\"]" + error + "[^\\'\"]")
            if (bodyAsString.match (regex)) {
                errorImports.push ('from ccxt.base.errors import ' + error)
            }
        }

        const precisionImports: string[] = []

        for (let constant in precisionConstants) {
            if (bodyAsString.indexOf (constant) >= 0) {
                precisionImports.push ('from ccxt.base.decimal_to_precision import ' + constant)
            }
        }
        if (bodyAsString.match (/[\s(]Precise/)) {
            precisionImports.push ('from ccxt.base.precise import Precise')
        }
        const asyncioImports: string[] = []
        if (bodyAsString.match (/asyncio/)) {
            asyncioImports.push ('import asyncio')
        }

        return {
            imports,
            asyncioImports,
            libraries,
            errorImports,
            precisionImports
        }
    }

    // ========================================================================
    // exchange capabilities ordering

    sortExchangeCapabilities (code: string) {
        const lineBreak = '\n';
        const capabilitiesObjectRegex = /(?<='has': {[\n])([^|})]*)(?=\n(\s+}))/;
        const found = capabilitiesObjectRegex.exec (code);
        if (found === null) {
            return false // capabilities not found
        }
        let capabilities = found[0].split (lineBreak);
        const sortingOrder: dict = {
            'CORS': 'undefined,',
            'spot': 'true,',
            'margin': 'undefined,',
            'swap': 'undefined,',
            'future': 'undefined,',
            'option': 'undefined,',
            // then everything else
        }
        const features: dict = {}
        let indentation = '                ' // 16 spaces
        for (let i = 0; i < capabilities.length; i++) {
            const capability = capabilities[i]
            const match = capability.match (/(\s+)\'(.+)\': (.+)$/)
            if (match) {
                indentation = match[1]
                const feature = match[2]
                const value = match[3]
                features[feature] = value
            }
        }
        let keys = Object.keys (features)
        keys.sort ((a, b) => a.localeCompare (b))
        const allKeys = Object.keys (sortingOrder).concat (keys)
        for (let i = 0; i < allKeys.length; i++) {
            const key = allKeys[i]
            sortingOrder[key] = (key in features) ? features[key] : sortingOrder[key]
        }
        const result = Object.entries (sortingOrder).map (([ key, value ]) => indentation + "'" + key + "': " + value).join (lineBreak)
        if (result === found[0]) {
            return false
        }
        return code.replace (capabilitiesObjectRegex, result)
    }

    // ------------------------------------------------------------------------

    createPHPClassDeclaration (className: string, baseClass: string) {
        return 'class ' + className + ' extends ' + baseClass + ' {'
    }

    createPHPClassHeader (className: string, baseClass: string, bodyAsString: string, namespace: string) {
        return [
            "<?php",
            "",
            "namespace " + namespace + ";",
            "",
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            "",
            "use Exception; // a common import",
            "use " + namespace + "\\abstract\\" + className + " as " + baseClass + ';',
        ]
    }

    createPHPClass (className: string, baseClass: string, body: any, methods: any[], async = false) {

        let bodyAsString = body.join ("\n")

        let header = this.createPHPClassHeader (className, baseClass, bodyAsString, async ? 'ccxt\\async' : 'ccxt')

        const errorImports: string[] = []

        if (async) {
            for (let error in errors) {
                const regex = new RegExp ("[^'\"]" + error + "[^'\"]")
                if (bodyAsString.match (regex)) {
                    errorImports.push ('use ccxt\\' + error + ';')
                }
            }
        }

        const precisionImports: string[] = []
        const libraryImports: string[] = []

        if (async) {
            if (bodyAsString.match (/[\s(]Precise/)) {
                precisionImports.push ('use ccxt\\Precise;')
            }
            if (bodyAsString.match (/Async\\await/)) {
                libraryImports.push ('use \\React\\Async;')
            }
            if (bodyAsString.match (/Promise\\all/)) {
                libraryImports.push ('use \\React\\Promise;')
            }
            if (bodyAsString.match (/: PromiseInterface/)) {
                libraryImports.push ('use \\React\\Promise\\PromiseInterface;')
            }
        }

        header = header.concat (errorImports).concat (precisionImports).concat (libraryImports)

        // transpile camelCase base method names to underscore base method names
        const baseMethods = this.getPHPBaseMethods ()
        methods = methods.concat (baseMethods)

        for (let method of methods) {
            let regex = new RegExp ('\\$this->(' + method + ')\\s?(\\(|[^a-zA-Z0-9_])', 'g')
            bodyAsString = bodyAsString.replace (regex,
                (match: any, p1: string, p2: string) => {
                    return ((p2 === '(') ?
                        ('$this->' + unCamelCase (p1) + p2) : // support direct php calls
                        ("array($this, '" + unCamelCase (p1) + "')" + p2)) // as well as passing instance methods as callables
                })

            regex = new RegExp ('parent::(' + method + ')\\s?(\\(|[^a-zA-Z0-9_])', 'g')
            bodyAsString = bodyAsString.replace (regex,
                (match: any, p1: string, p2: string) => {
                    return ((p2 === '(') ?
                        ('parent::' + unCamelCase (p1) + p2) : // support direct php calls
                        ("array($this, '" + unCamelCase (p1) + "')" + p2)) // as well as passing instance methods as callables
                })
        }

        header.push ("\n" + this.createPHPClassDeclaration (className, baseClass))

        const footer = [
            "}\n",
        ]

        const result = header.join ("\n") + "\n" + bodyAsString + "\n" + footer.join ('\n')
        return result
    }

    // ========================================================================

    transpileJavaScriptToPython3 ({ js, className, removeEmptyLines }: any) {

        // transpile JS → Python 3
        let python3Body = this.regexAll (js, this.getPythonRegexes ())

        if (removeEmptyLines) {
            python3Body = python3Body.replace (/$\s*$/gm, '')
        }

        // handle empty lines inside pydocs
        python3Body = python3Body.replace(/         \*/g, '')

        const strippedPython3BodyWithoutComments = python3Body.replace (/^[\s]+#.+$/gm, '')

        if (!strippedPython3BodyWithoutComments.match(/[^\s]/)) {
            python3Body += '\n        pass'
        }

        python3Body = python3Body.replace (/\'([абвгдеёжзийклмнопрстуфхцчшщъыьэюя服务端忙碌]+)\'/gm, "u'$1'")

        // special case for Python OrderedDicts
        let orderedDictRegex = /\.ordered\s+\(\{([^\}]+)\}\)/g
        let orderedDictMatches: RegExpExecArray | null | undefined = undefined
        while (orderedDictMatches = orderedDictRegex.exec (python3Body)) {
            let replaced = orderedDictMatches[1].replace (/^(\s+)([^\:]+)\:\s*([^\,]+)\,$/gm, '$1($2, $3),')
            python3Body = python3Body.replace (orderedDictRegex, '\.ordered([' + replaced + '])')
        }

        // snake case function names
        python3Body = python3Body.replace (/def (\w+)/g, (match, group1) => 'def ' + unCamelCase (group1))

        // special case for Python super
        if (className) {
            python3Body = python3Body.replace (/super\./g, 'super(' + className + ', self).')
        }

        return python3Body
    }

    // ------------------------------------------------------------------------

    transpilePython3ToPython2 (py: string) {

        // remove await from Python sync body (transpile Python async → Python sync)
        let python2Body = this.regexAll (py, this.getPython2Regexes ())

        return python2Body
    }

    // ------------------------------------------------------------------------

    transpileAsyncPHPToSyncPHP (php: string) {

        // remove yield from php body
        return this.regexAll (php, this.getPHPSyncRegexes ())
    }

    // ------------------------------------------------------------------------

    transpileJavaScriptToPHP ({ js, variables }: any, async = false) {

        // match all local variables (let, const or var)
        let localVariablesRegex = /(?:^|[^a-zA-Z0-9_])(?:let|const|var)\s+(?:\[([^\]]+)\]|([a-zA-Z0-9_]+))/g // local variables

        let allVariables = (variables || []).map ((x:any) => x); // clone the array
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

        // match all variables instantiated as function parameters
        let functionParamRegex = /function\s*(\w+)\s*\(([^)]+)\)/g
        js = js.replace (functionParamRegex, (match: any, group1: any, group2: any) => 'function ' + unCamelCase (group1) + '(' + group2 + ')')
        let functionParamVariables
        while (functionParamVariables = functionParamRegex.exec (js)) {
            const match = functionParamVariables[2]
            const tokens = match.split (', ')
            allVariables = allVariables.concat (tokens)
        }

        allVariables = allVariables.map ((error:any) => this.regexAll (error, this.getCommonRegexes ()))

        // append $ to all variables in the method (PHP syntax demands $ at the beginning of a variable name)
        let phpVariablesRegexes = allVariables.map ((x:any) => [ "(^|[^$$a-zA-Z0-9\\.\\>'\"_/])" + x + "([^a-zA-Z0-9'_/])", '$1$$' + x + '$2' ])

        // support for php syntax for object-pointer dereference
        // convert all $variable.property to $variable->property
        let variablePropertiesRegexes = allVariables.map ((x:any) => [ "(^|[^a-zA-Z0-9\\.\\>'\"_])" + x + '\\.', '$1' + x + '->' ])

        // transpile JS → PHP
        const phpRegexes = this.getPHPRegexes ()
        let phpBody = this.regexAll (js, phpRegexes.concat (phpVariablesRegexes).concat (variablePropertiesRegexes))
        // indent async php
        if (async && js.indexOf (' await ') > -1) {
            const closure = variables && variables.length ? 'use (' + variables.map ((x: any) => '$' + x).join (', ') + ')': '';
            phpBody = '        return Async\\async(function () ' + closure + ' {\n    ' +  phpBody.replace (/\n/g, '\n    ') + '\n        }) ();'
        }
        phpBody = phpBody.replaceAll(/parent::\$market/g, 'parent::market')
        return phpBody
    }

    // ------------------------------------------------------------------------

    transpileJavaScriptToPythonAndPHP (args:any) {

        // transpile JS → Python 3
        let python3Body = ''
        let python2Body = ''

        if (this.buildPython) {
            python3Body = this.transpileJavaScriptToPython3 (args)
            // remove await from Python sync body (transpile Python async → Python sync)
            python2Body = this.transpilePython3ToPython2 (python3Body)
        }

        let phpAsyncBody  = ''
        let phpBody = ''

        if (this.buildPHP) {
            // transpile JS → Async PHP
            phpAsyncBody = this.transpileJavaScriptToPHP (args, true)
            // transpile JS -> Sync PHP
            phpBody = this.transpileAsyncPHPToSyncPHP (this.transpileJavaScriptToPHP (args, false))
        }

        return { python3Body, python2Body, phpBody, phpAsyncBody }
    }

    //-----------------------------------------------------------------------------

    transpilePythonAsyncToSync (asyncFilePath: string, syncFilePath: string) {

        const async = asyncFilePath
        const sync = syncFilePath
        log.magenta ('Transpiling ' + async.yellow + ' → ' + sync.yellow)
        const fileContents = fs.readFileSync (async, 'utf8')
        let lines = fileContents.split ("\n")

        lines = lines.filter (line => ![ 'import asyncio' ].includes (line))
            .map (line => {
                return (
                    line.replace ('asyncio.get_event_loop().run_until_complete(main())', 'main()')
                        .replace ('asyncio.run(main())', 'main()')
                        .replace ('import ccxt.async_support as ccxt', 'import ccxt')
                        .replace ('await asyncio.sleep', 'time.sleep')
                        .replace ('async ', '')
                        .replace ('await ', ''))
                        .replace ('asyncio.gather\(\*', '(') // needed for async -> sync
                        .replace ('asyncio.run', '') // needed for async -> sync
            })

        // lines.forEach (line => log (line))

        function deleteFunction (f: string, from: string) {
            // the following regexes make a technical error
            // since it won't cut away a single function
            // it will delete everything up to the beginning of the next comment
            const re1 = new RegExp ('def ' + f + '[^\#]+', 'g')
            const re2 = new RegExp ('[\\s]+' + f + '\\(exchange\\)', 'g')
            return from.replace (re1, '').replace (re2, '')
        }

        let newContents = lines.join ('\n')

        newContents = deleteFunction ('test_tickers_async', newContents)
        newContents = deleteFunction ('test_l2_order_books_async', newContents)
        if (fs.existsSync (sync)) {
            fs.truncateSync (sync)
        }
        fs.writeFileSync (sync, newContents)
    }

    //-----------------------------------------------------------------------------

    transpilePhpAsyncToSync (asyncFilePath: string, syncFilePath: string) {

        const async = asyncFilePath
        const sync = syncFilePath
        log.magenta ('Transpiling ' + async .yellow + ' → ' + sync.yellow)
        const fileContents = fs.readFileSync (async, 'utf8')
        const syncBody = this.transpileAsyncPHPToSyncPHP (fileContents)

        const phpTestRegexes = [
            [ /Async\\coroutine\(\$main\)/, '\$main()' ],
            [ /ccxt\\\\async/, 'ccxt' ],
        ]

        const newContents = this.regexAll (syncBody, this.getPHPSyncRegexes ().concat (phpTestRegexes));
        if (fs.existsSync (sync)) {
            fs.truncateSync (sync)
        }
        fs.writeFileSync (sync, newContents)
    }

    // ------------------------------------------------------------------------

    getExchangeClassDeclarationMatches (contents: string) {
        return contents.match (/^export default\s*class\s+([\S]+)\s+extends\s+([\S]+)\s+{([\s\S]+?)^};*/m)
    }

    getClassDeclarationMatches (contents: string) {
        return contents.match (/^export \s*(?:default)?\s*class\s+([\S]+)(?:\s+extends\s+([\S]+))?\s+{([\s\S]+?)^};*/m)
    }

    // ------------------------------------------------------------------------

    transpileClass (contents: string) {
        const [ _, className, baseClass, classBody ] = this.getClassDeclarationMatches (contents) as any
        const methods = classBody.trim ().split (/\n\s*\n/)
        const {
            python2,
            python3,
            php,
            phpAsync,
            methodNames
        } = this.transpileMethodsToAllLanguages (className, methods)
        // altogether in PHP, async PHP, Python sync and async
        const sync = false
        const async = true
        const result = {
            python2:      this.buildPython ? this.createPythonClass (className, baseClass, python2,  methodNames, sync) : '',
            python3:      this.buildPython ? this.createPythonClass (className, baseClass, python3,  methodNames, async) : '',
            php:          this.buildPHP ? this.createPHPClass    (className, baseClass, php,      methodNames, sync) : '',
            phpAsync:     this.buildPHP ? this.createPHPClass    (className, baseClass, phpAsync, methodNames, async) : '',
            className,
            baseClass,
        }
        return this.afterTranspileClass (result, contents);
    }

    // for override
    afterTranspileClass (result: any, contents: any) {
        return result
    }
    // ========================================================================

    transpileDerivedExchangeFile (tsFolder: string, filename: string, options: any, force = false) {

        // todo normalize jsFolder and other arguments

        try {

            const { python2Folder, python3Folder, phpFolder, phpAsyncFolder } = options
            const pythonFilename = filename.replace ('.ts', '.py')
            const phpFilename = filename.replace ('.ts', '.php')

            const tsPath = path.join (tsFolder, filename)

            let contents = fs.readFileSync (tsPath, 'utf8')
            const sortedExchangeCapabilities = this.sortExchangeCapabilities (contents)
            if (sortedExchangeCapabilities) {
                contents = sortedExchangeCapabilities
                overwriteSafe (tsPath, contents)
            }

            let tsMtime = fs.statSync (tsPath).mtime.getTime ();
            tsMtime = tsMtime - tsMtime % 1000;

            const python2Path  = python2Folder  ? path.join (python2Folder, pythonFilename) : ''
            const python3Path  = python3Folder  ? path.join (python3Folder, pythonFilename) : ''
            const phpPath      = phpFolder      ? path.join(phpFolder, phpFilename)    : ''
            const phpAsyncPath = phpAsyncFolder ? path.join (phpAsyncFolder, phpFilename)    : ''

            const python2Mtime: number  = python2Folder  ? (fs.existsSync (python2Path)  ? fs.statSync (python2Path).mtime.getTime ()  : 0) : 0
            const python3Mtime: number  = python3Path    ? (fs.existsSync (python3Path)  ? fs.statSync (python3Path).mtime.getTime ()  : 0) : 0
            const phpAsyncMtime: number = phpAsyncFolder ? (fs.existsSync (phpAsyncPath) ? fs.statSync (phpAsyncPath).mtime.getTime () : 0) : 0
            const phpMtime: number      = phpPath        ? (fs.existsSync (phpPath)      ? fs.statSync (phpPath).mtime.getTime ()      : 0) : 0

            if (force ||
                (python3Folder  && (tsMtime > python3Mtime))  ||
                (phpFolder      && (tsMtime > phpMtime))      ||
                (phpAsyncFolder && (tsMtime > phpAsyncMtime)) ||
                (python2Folder  && (tsMtime > python2Mtime))) {
                const { python2, python3, php, phpAsync, className, baseClass } = this.transpileClass (contents)
                if (this.buildPHP && this.buildPython) {
                    log.cyan ('Transpiling from', filename.yellow)
                } else {
                    const lang = (this.buildPHP) ? '[PHP]' : '[Python]'
                    log.cyan ('Transpiling from', filename.yellow, "to".cyan, lang.yellow )
                }

                let languagesFolders: any[] = [];

                if (this.buildPython) {
                    languagesFolders = languagesFolders.concat([ [python2Folder, pythonFilename, python2] ])
                    languagesFolders = languagesFolders.concat([ [python3Folder, pythonFilename, python3] ])
                }

                if (this.buildPHP) {
                    languagesFolders = languagesFolders.concat([ [phpFolder, phpFilename, php] ])
                    languagesFolders = languagesFolders.concat([ [phpAsyncFolder, phpFilename, phpAsync] ])
                }

                // ;[
                //     // [ python2Folder, pythonFilename, python2 ],
                //     // [ python3Folder, pythonFilename, python3 ],
                //     [ phpFolder, phpFilename, php ],
                //     [ phpAsyncFolder, phpFilename, phpAsync ],
                // ].
                languagesFolders.forEach (([ folder, filename, code ]) => {
                    if (folder) {
                        const qualifiedPath = path.join (folder, filename)
                        overwriteSafe (qualifiedPath, code)
                        // fs.utimesSync (qualifiedPath, new Date (), new Date (tsMtime))
                        // this line makes it impossible to detect if the files were properly transpiled or not (to avoid stale files)
                    }
                })

                return { className, baseClass }

            } else {

                const [ _, className, baseClass ] = this.getClassDeclarationMatches (contents) as any
                log.green ('Already transpiled', filename.yellow)
                return { className, baseClass }
            }

        } catch (e) {
            log.red ('\nFailed to transpile source code from', filename.yellow)
            log.red ('See https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md on how to build this library properly\n')
            throw e // rethrow it
        }
    }

    //-------------------------------------------------------------------------

    transpileDerivedExchangeFiles (tsFolder: string, options: any, pattern = '.ts', force = false, child = false) {

        // todo normalize jsFolder and other arguments

        const { python2Folder, python3Folder, phpFolder, phpAsyncFolder, jsFolder } = options

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = [];
        if (tsFolder.indexOf('pro/') > -1) {
            ids = exchangesWsIds;
        } else {
            ids = exchangeIds;
        }

        const regex = new RegExp (pattern.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'))

        let exchangesToTranspile;
        if (options.exchanges && options.exchanges.length) {
            exchangesToTranspile = options.exchanges.map ((x:any) => x + pattern)
        } else if (ids.length) {
            exchangesToTranspile = ids.map(id => id + '.ts');
        } else {
            exchangesToTranspile = fs.readdirSync (tsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.js'))))
        }

        const classNames = exchangesToTranspile.map ((file:any) => this.transpileDerivedExchangeFile (tsFolder, file, options, force))

        const classes: any = {}

        if (classNames.length === 0) {
            return null
        }

        classNames.forEach (({ className, baseClass }: { className: string; baseClass: any }) => {
            classes[className] = baseClass
        })

        if (!child && classNames.length > 1) {

            function deleteOldTranspiledFiles (folder: string, pattern: any) {
                fs.readdirSync (folder)
                    .filter (file =>
                        !fs.lstatSync (path.join (folder, file)).isDirectory () &&
                        !(file.replace (pattern, '') in classes) &&
                        !file.match (/^[A-Z_]/))
                    .map (file => path.join (folder, file))
                    .forEach (file => log.red ('Deleting ' + file.yellow) && fs.unlinkSync (file))
            }

            [
                [ jsFolder, /\.(?:js|d\.ts)$/],
                [ python2Folder, /\.pyc?$/ ],
                [ python3Folder, /\.pyc?$/ ],
                [ phpFolder, /\.php$/ ],
                [ phpAsyncFolder, /\.php$/ ],
            ].forEach (([ folder, pattern ]) => {
                if (folder) {
                    deleteOldTranspiledFiles (folder, pattern)
                }
            })

        }

        return classes
    }

    // ========================================================================

    addPythonSpacesToDocs(docs: any[]) {
        const fixedDocs: string[] = [];
        for (let i = 0; i < docs.length; i++) {
            // const previousLine = (i === 0) ? '' : docs[i - 1];
            const currentLine = docs[i];
            const nextLine = (i+1 === docs.length) ? '' : docs[i + 1];

            const emptyCommentLine = '         *';

            // const previousLineIsSee = previousLine.indexOf('@see') > -1;
            const currentLineIsSee = currentLine.indexOf('@see') > -1;
            const nextLineIsSee = nextLine.indexOf('@see') > -1;

            if (nextLineIsSee && !currentLineIsSee) {
                // add empty line
                fixedDocs.push(docs[i]);
                fixedDocs.push(emptyCommentLine);
            } else if (currentLineIsSee && !nextLineIsSee) {
                // add empty line
                fixedDocs.push(docs[i]);
                fixedDocs.push(emptyCommentLine)
            } else {
                fixedDocs.push(docs[i]);
            }
        }
        return fixedDocs;
    }
    // ========================================================================

    moveJsDocInside(method: string) {

        const isOutsideJSDoc = /^\s*\/\*\*/;

        if (!method.match(isOutsideJSDoc)) {
            return method;
        }

        const newLines: string[] = [];
        const methodSplit = method.split('\n');

        // move jsdoc inside the method
        // below the signature to simplify the docs in python/php
        for (let i = 0; i < methodSplit.length; i++) {
            const line = methodSplit[i];
            if (line.match(isOutsideJSDoc)) {
                const jsDocIden = '         ';
                let jsdoc = '        ' + line.trim();
                let jsDocLines = [jsdoc];
                while (!jsdoc.match(/\*\//)) {
                    i++;
                    const lineTrimmed = methodSplit[i].trim();

                    jsdoc += '\n' + jsDocIden + lineTrimmed;
                    jsDocLines.push(jsDocIden + lineTrimmed);
                }
                newLines.push(methodSplit[i+1]);
                i++;
                jsDocLines = this.addPythonSpacesToDocs(jsDocLines);
                // newLines.push(jsdoc);
                for (let j = 0; j < jsDocLines.length; j++) {
                    newLines.push(jsDocLines[j]);
                }
            } else {
                newLines.push(line);
            }
        }
        const res = newLines.join('\n');
    return res;
    }

    // ========================================================================

    transpileMethodsToAllLanguages (className: string, methods: any) {

        let python2: string[] = []
        let python3: string[] = []
        let php: string[] = []
        let phpAsync: string[] = []
        let methodNames: string[] = []

        for (let i = 0; i < methods.length; i++) {
            // parse the method signature
            let part = this.moveJsDocInside(methods[i].trim());
            // let part = methods[i].trim ()
            let lines = part.split ("\n")
            let signature = lines[0].trim ()
            signature = signature.replace('function ', '')

            // Typescript types trim from signature
            // will be improved in the future
            // Here we will be removing return type:
            // example: async fetchTickers(): Promise<any> { ---> async fetchTickers() {
            // and remove parameters types
            // example: myFunc (name: string | number = undefined) ---> myFunc(name = undefined)
            if (className === 'Exchange') {
                signature = this.regexAll(signature, this.getTypescripSignaturetRemovalRegexes())
            }

            let methodSignatureRegex = /(async |)(\S+)\s\(([^)]*)\)\s*(?::\s+(\S+))?\s*{/ // signature line
            let matches = methodSignatureRegex.exec (signature)

            if (!matches) {
                log.red (methods[i])
                log.yellow.bright ("\nMake sure your methods don't have empty lines!\n")
            }

            // async or not
            let keyword = matches?.[1] as string

            // method name
            let method = matches?.[2] as string

            if (process.argv.includes ('--check-parsers')) {
                this.checkIfMethodLacksParser (className, method, part)
            }

            methodNames.push (method)

            method = unCamelCase (method)

            // method arguments
            const args = (matches?.[3] as string).trim ()

            // return type
            let returnType = matches?.[4] as string

            // extract argument names and local variables
            const argsArray = args.length ? args.split (',').map (x => x.trim ()) : []

            // get names of all method arguments for later substitutions
            let variables = argsArray.map (arg => arg.split ('=').map (x => x.split (':')[0].trim ().replace (/\?$/, '')) [0])

            let phpArgs = ''
            let syncPhpSignature = ''
            let asyncPhpSignature = ''
            let promiseReturnTypeMatch: RegExpMatchArray | null = null
            let syncReturnType = ''

            if (returnType) {
                promiseReturnTypeMatch = returnType.match (/^Promise<([^>]+)>$/)
                syncReturnType = promiseReturnTypeMatch ? promiseReturnTypeMatch[1] : returnType
            }

            // python helpers
            const pythonTypes: dict = {
                'string': 'str',
                'number': 'float',
                'any': 'Any',
                'boolean': 'bool',
                'Int': 'Int',
                'OHLCV': 'list',
                'Dictionary<any>': 'dict',
                'Dict': 'dict'
            }
            const unwrapLists = (type: string) => {
                let count = 0
                while (type.slice (-2) == '[]') {
                    type = type.slice (0, -2)
                    count++
                }
                return 'List['.repeat (count) + (pythonTypes[type] ?? type) + ']'.repeat (count)
            }

            if (this.buildPHP) {
                // add $ to each argument name in PHP method signature
                const phpTypes: dict = {
                    'any': 'mixed',
                    'string': 'string',
                    'MarketType': 'string',
                    'SubType': 'string',
                    'Str': '?string',
                    'Num': '?float',
                    'Strings': '?array',
                    'number': 'float',
                    'boolean': 'bool',
                    'IndexType': 'int|string',
                    'Int': '?int',
                    'OrderType': 'string',
                    'OrderSide': 'string',
                    'Dictionary<any>': 'array',
                    'Dict': 'array',
                }
                const phpArrayRegex = /^(?:Market|Currency|Account|AccountStructure|BalanceAccount|object|OHLCV|Order|OrderBook|Tickers?|Trade|Transaction|Balances?|MarketInterface|TransferEntry|TransferEntries|Leverages|Leverage|Greeks|MarginModes|MarginMode|MarketMarginModes|MarginModification|LastPrice|LastPrices|TradingFeeInterface|Currencies|TradingFees|CrossBorrowRate|IsolatedBorrowRate|FundingRates|FundingRate|LedgerEntry|LeverageTier|LeverageTiers|Conversion|DepositAddress|LongShortRatio|Position|BorrowInterest)( \| undefined)?$|\w+\[\]/

                phpArgs = argsArray.map (x => {
                    const parts = x.split (':')
                    if (parts.length === 1) {
                        return '$' + x
                    } else {
                        let variable = parts[0]
                        const secondPart = parts[1].split ('=')
                        let nullable = false
                        let endpart = ''
                        if (secondPart.length === 2) {
                            const trimmed = secondPart[1].trim ()
                            nullable = trimmed === 'undefined'
                            endpart = ' = ' + trimmed
                        }
                        nullable = nullable || variable.slice (-1) === '?'
                        variable = variable.replace (/\?$/, '')
                        const type = secondPart[0].trim ()
                        const phpType = phpTypes[type] ?? type
                        let resolveType = (phpType.match (phpArrayRegex)  && phpType !== 'object[]')? 'array' : phpType // in PHP arrays are not compatible with ArrayCache, so removing this type for now;
                        if (resolveType === 'object[]') {
                            resolveType = 'mixed'; // in PHP objects are not compatible with ArrayCache, so removing this type for now;
                        }
                        // const resolveType = phpType.match (phpArrayRegex) ? 'array' : phpType
                        const ignore = (resolveType === 'mixed' || resolveType[0] === '?' )
                        return (nullable && !ignore ? '?' : '') + resolveType + ' $' + variable + endpart
                    }
                }).join (', ').trim ()
                    .replace (/undefined/g, 'null')
                    .replace (/\{\}/g, 'array ()')
                phpArgs = phpArgs.length ? (phpArgs) : ''
                let syncPhpReturnType = ''
                let asyncPhpReturnType = ''
                if (returnType) {
                    // promiseReturnTypeMatch = returnType.match (/^Promise<([^>]+)>$/)
                    // syncReturnType = promiseReturnTypeMatch ? promiseReturnTypeMatch[1] : returnType
                    if (syncReturnType === 'Currencies') {
                        syncPhpReturnType = ': ?array'; // since for now `fetchCurrencies` returns null or Currencies
                    } else if (syncReturnType.match (phpArrayRegex)) {
                        syncPhpReturnType = ': array'
                    } else {
                        syncPhpReturnType = ': ' + (phpTypes[syncReturnType] ?? syncReturnType)
                    }
                    if (promiseReturnTypeMatch) {
                        asyncPhpReturnType = ': PromiseInterface'
                    } else {
                        asyncPhpReturnType = syncPhpReturnType
                    }
                }
                syncPhpSignature = '    ' + 'public function ' + method + '(' + phpArgs + ')' + syncPhpReturnType + ' {'
                asyncPhpSignature = '    ' + 'public function ' + method + '(' + phpArgs + ')' + asyncPhpReturnType + ' {'
            }

            let pythonArgs = ''

            if (this.buildPython) {
                // remove excessive spacing from argument defaults in Python method signature
                pythonArgs = argsArray.map (x => {
                    if (x.includes (':')) {
                        const parts = x.split(':')
                        let typeParts = parts[1].trim ().split (' ')
                        const type = typeParts[0]
                        typeParts[0] = ''
                        let variable = parts[0]
                        // const nullable = typeParts[typeParts.length - 1] === 'undefined' || variable.slice (-1) === '?'
                        variable = variable.replace (/\?$/, '')
                        const rawType = unwrapLists (type)
                        return variable + ': ' + rawType + typeParts.join (' ')
                    } else {
                        return x.replace (' = ', '=')
                    }
                })
                .join (', ')
                .replace (/undefined/g, 'None')
                .replace (/false/g, 'False')
                .replace (/true/g, 'True')
            }

            // method body without the signature (first line)
            // and without the closing bracket (last line)
            let js = lines.slice (1, -1).join ("\n")

            // transpile everything
            let { python3Body, python2Body, phpBody, phpAsyncBody } = this.transpileJavaScriptToPythonAndPHP ({ js, className, variables, removeEmptyLines: true })

            if (this.buildPython) {
                // compile the final Python code for the method signature
                let pythonReturnType = ''
                if (syncReturnType) {
                    pythonReturnType = ' -> ' + unwrapLists (syncReturnType)
                }
                let pythonString = 'def ' + method + '(self' + (pythonArgs.length ? ', ' + pythonArgs : '') + ')' + pythonReturnType + ':'

                // compile signature + body for Python sync
                python2.push ('');
                python2.push ('    ' + pythonString);
                python2.push (python2Body);

                // compile signature + body for Python async
                python3.push ('');
                python3.push ('    ' + keyword + pythonString);
                python3.push (python3Body);
            }

            if (this.buildPHP) {
                // compile signature + body for PHP
                php.push ('');
                php.push (syncPhpSignature);
                php.push (phpBody);
                php.push ('    ' + '}')

                phpAsync.push ('');
                phpAsync.push (asyncPhpSignature);
                phpAsync.push (phpAsyncBody);
                phpAsync.push ('    ' + '}')
            }
        }

        if (process.argv.includes ('--check-parsers') && this.missingParsers.length) {
            log.magenta (this.missingParsers.join ('\n'));
            process.exit (1);
        }

        return {
            // altogether in PHP, async PHP, Python sync and async
            python2,
            python3,
            php,
            phpAsync,
            methodNames
        }
    }

    // ========================================================================

    transpileBaseMethods () {
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'
        const contents = fs.readFileSync (baseExchangeJsFile, 'utf8')
        const [ _, className, baseClass, classBody ] = this.getClassDeclarationMatches (contents) as any
        const jsDelimiter = '// ' + delimiter
        const parts = classBody.split (jsDelimiter)
        if (parts.length > 1) {
            log.magenta ('Transpiling from', baseExchangeJsFile.yellow)
            const secondPart = parts[1]
            const methods = secondPart.trim ().split (/\n\s*\n/)
            const {
                python2,
                python3,
                php,
                phpAsync,
            } = this.transpileMethodsToAllLanguages (className, methods)
            // trim away sync methods from python async
            // since it already inherits those methods
            const python3Async: string[] = []
            if (this.buildPython) {
                python3.forEach ((line, i, arr) => {
                    if (line.match (/^\s+async def/)) {
                        python3Async.push ('')
                        python3Async.push (line)
                        python3Async.push (arr[i+1])
                    }
                })
            }

            const pythonDelimiter = '# ' + delimiter + '\n'
            const phpDelimiter = '// ' + delimiter + '\n'
            const restOfFile = '([^\n]*\n)+'
            const python2File = './python/ccxt/base/exchange.py'
            const python3File = './python/ccxt/async_support/base/exchange.py'
            const phpFile = './php/Exchange.php'
            const phpAsyncFile = './php/async/Exchange.php'

            if (this.buildPython) {
                log.magenta ('→', python2File.yellow)
                replaceInFile (python2File,  new RegExp (pythonDelimiter + restOfFile), pythonDelimiter + python2.join ('\n') + '\n')
                log.magenta ('→', python3File.yellow)
                replaceInFile (python3File,  new RegExp (pythonDelimiter + restOfFile), pythonDelimiter + python3Async.join ('\n') + '\n')
            }

            if (this.buildPHP) {
                log.magenta ('→', phpFile.yellow)
                replaceInFile (phpFile,      new RegExp (phpDelimiter + restOfFile),    phpDelimiter + php.join ('\n') + '\n}\n')
                log.magenta ('→', phpAsyncFile.yellow)
                replaceInFile (phpAsyncFile, new RegExp (phpDelimiter + restOfFile),    phpDelimiter + phpAsync.join ('\n') + '\n}\n')
            }
        }
    }

    // ========================================================================

    async getTSClassDeclarationsAllFiles (ids: string[], folder: string, extension = '.js')  {
        const files = fs.readdirSync (folder).filter (file => ids.includes (basename (file, extension)))
        const promiseReadFile = promisify (fs.readFile);
        const fileArray = await Promise.all (files.map (file => promiseReadFile (path.join (folder, file), 'utf8')));
        const classComponents: any[] = await Promise.all (fileArray.map (file => this.getClassDeclarationMatches (file)));

        const classes: any = {}
        classComponents.forEach ( elem => classes[elem[1]] = elem[2] );

        return classes
    }

    // ========================================================================

    exportTypeScriptClassNames (file: string, classes: any) {
        log.bright.cyan ('Exporting TypeScript class names →', file.yellow)

        const regex = /\/[\n]{2}(?:    export class [^\s]+ extends [^\s]+ \{\}[\r]?[\n])+/
        const replacement = "/\n\n" + Object.keys (classes).map (className => {
            const baseClass = classes[className].replace (/ccxt\.[a-z0-9_]+/, 'Exchange')
            return '    export class ' + className + ' extends ' + baseClass + " {}"
        }).join ("\n") + "\n"

        replaceInFile (file, regex, replacement)
    }

    exportTypeScriptExchangeIds (file: string, classes: any) {
        log.bright.cyan ('Exporting TypeScript exchange ids →', file.yellow)

        const regex = /\/[\n]{2}    export type ExchangeId =\n(?:        \| \'[a-z0-9_]+\'[\r]?[\n])+/
        const replacement = "/\n\n    export type ExchangeId =\n" + Object.keys (classes).map (className => {
            return "        | '" + className + "'"
        }).join ("\n") + "\n"

        replaceInFile (file, regex, replacement)
    }

    // ========================================================================

    transpileErrorHierarchy () {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js'
        const errorHierarchyPath = __dirname + '/.' + errorHierarchyFilename

        let js = fs.readFileSync (errorHierarchyPath, 'utf8')

        js = this.regexAll (js, [
            // [ /export { [^\;]+\s*\}\n/s, '' ], // new esm
            [ /\s*export default(.*?);/g, '' ],
            // [ /module\.exports = [^\;]+\;\n/s, '' ], // old commonjs
        ]).trim ()

        const message = 'Transpiling error hierachy →'
        const root = errorHierarchy['BaseError']

        const { python3Body } = this.transpileJavaScriptToPythonAndPHP ({ js })

        // a helper to generate a list of exception class declarations
        // properly derived from corresponding parent classes according
        // to the error hierarchy

        function intellisense (map: any, parent: any, generate: any, classes: any = undefined) {
            function* generator(map: any, parent: any, generate: any, classes: any): any {
                for (const key in map) {
                    yield generate (key, parent, classes)
                    yield* generator (map[key], key, generate, classes)
                }
            }
            return Array.from (generator (map, parent, generate, classes))
        }

        // Python -------------------------------------------------------------
        if (this.buildPython) {
            function pythonDeclareErrorClass (name: string, parent: string, classes: string[]) {
                classes.push (name)
                return [
                    'class ' + name + '(' + parent + '):',
                    '    pass',
                    '',
                    '',
                ].join ('\n');
            }

            const pythonBaseError = [
                'class BaseError(Exception):',
                '    pass',
                '',
                '',
            ].join ('\n');

            const quote = (s: string) => "'" + s + "'" // helper to add quotes around class names
            const pythonExports = [ 'error_hierarchy', 'BaseError' ]
            const pythonErrors = intellisense (root, 'BaseError', pythonDeclareErrorClass, pythonExports)
            const pythonAll = '__all__ = [\n    ' + pythonExports.map (quote).join (',\n    ') + '\n]'
            const python3BodyIntellisense = python3Body + '\n\n\n' + pythonBaseError + '\n' + pythonErrors.join ('\n') + '\n' + pythonAll + '\n'

            const pythonFilename = './python/ccxt/base/errors.py'
            if (fs.existsSync (pythonFilename)) {
                log.bright.cyan (message, pythonFilename.yellow)
                fs.writeFileSync (pythonFilename, python3BodyIntellisense)
            }

        }

        // PHP ----------------------------------------------------------------

        if (this.buildPHP) {
            function phpMakeErrorClassFile (name: string, parent: string) {

                const useClause = "\nuse " + parent + ";\n"
                const requireClause = "\nrequire_once PATH_TO_CCXT . '" + parent + ".php';\n"

                const phpBody = [
                    '<?php',
                    '',
                    'namespace ccxt;',
                    (parent === 'Exception') ? useClause : requireClause,
                    'class ' + name + ' extends ' + parent + ' {};',
                    '',
                ].join ("\n")
                const phpFilename = './php/' + name + '.php'
                log.bright.cyan (message, phpFilename.yellow)
                fs.writeFileSync (phpFilename, phpBody)
                return "require_once PATH_TO_CCXT . '" + name + ".php';"
            }

            const phpFilename ='./ccxt.php'

            if (fs.existsSync (phpFilename)) {
                const phpErrors = intellisense (errorHierarchy, 'Exception', phpMakeErrorClassFile)
                const phpBodyIntellisense = phpErrors.join ("\n") + "\n\n"
                log.bright.cyan (message, phpFilename.yellow)
                const phpRegex = /require_once PATH_TO_CCXT \. \'BaseError\.php\'\;\n(?:require_once PATH_TO_CCXT[^\n]+\n)+\n/m
                replaceInFile (phpFilename, phpRegex, phpBodyIntellisense)
            }
        }
    }

    //-------------------------------------------------------------------------

    transpileCryptoTests () {
        const jsFile = './ts/src/test/base/test.cryptography.ts' // using ts version to avoid formatting issues
        const pyFile = './python/ccxt/test/base/test_cryptography.py'
        const phpFile = './php/test/base/test_cryptography.php'
        log.magenta ('Transpiling from', jsFile.yellow)
        let js = fs.readFileSync (jsFile).toString ()

        js = this.regexAll (js, [
            [ /\'use strict\';?\s+/g, '' ],
            [ /[^\n]+from[^\n]+\n/g, '' ],
            [ /^export default[^\n]+\n/g, '' ],
            [/^const\s+{.*}\s+=.*$/gm, ''],
            [ /function equals \([\S\s]+?return true;?\n}\n/g, '' ],
            [ /(export default .*)/g, '' ],
            [ /testCryptography/g, 'test_cryptography' ],
        ])

        let { python2Body, phpBody } = this.transpileJavaScriptToPythonAndPHP ({ js, removeEmptyLines: false })

        python2Body = this.regexAll (python2Body, [
            [ /function (\w+)\(\) \{/g, 'def $1():' ],
        ])

        const pythonHeader = [
            "",
            "import ccxt  # noqa: F402",
            "import hashlib  # noqa: F402",
            "",
            "Exchange = ccxt.Exchange",
            "hash = Exchange.hash",
            "hmac = Exchange.hmac",
            "ecdsa = Exchange.ecdsa",
            "eddsa = Exchange.eddsa",
            "safe_string = Exchange.safe_string",
            "safe_integer = Exchange.safe_integer",
            "in_array = Exchange.in_array",
            "jwt = Exchange.jwt",
            "crc32 = Exchange.crc32",
            "rsa = Exchange.rsa",
            "encode = Exchange.encode",
            "",
            "",
            "def equals(a, b):",
            "    return a == b",
            "",
        ].join ("\n")

        const phpHeader = [
            "",
            "function hash(...$args) {",
            "    return Exchange::hash(...$args);",
            "}",
            "",
            "function hmac(...$args) {",
            "    return Exchange::hmac(...$args);",
            "}",
            "",
            "function encode(...$args) {",
            "    return Exchange::encode(...$args);",
            "}",
            "",
            "function ecdsa(...$args) {",
            "    return Exchange::ecdsa(...$args);",
            "}",
            "",
            "function eddsa(...$args) {",
            "    return Exchange::eddsa(...$args);",
            "}",
            "",
            "function jwt(...$args) {",
            "    return Exchange::jwt(...$args);",
            "}",
            "",
            "function crc32(...$arg) {",
            "    return Exchange::crc32(...$arg);",
            "}",
            "",
            "function rsa(...$arg) {",
            "    return Exchange::rsa(...$arg);",
            "}",
        ].join ("\n")

        const python = this.getPythonPreamble (4) + pythonHeader + python2Body + '\n'
        const php = this.getPHPPreamble (true, 3) + phpHeader + phpBody

        if (this.buildPython) {
            log.magenta ('→', pyFile.yellow)
            overwriteSafe (pyFile, python)
        }

        if (this.buildPHP) {
            log.magenta ('→', phpFile.yellow)
            overwriteSafe (phpFile, php)

        }
    }

    // ============================================================================

    async readFilesAsync(files: string[]) {
        const promiseReadFile = promisify(fs.readFile);
        const fileArray = await Promise.all(files.map(file => promiseReadFile(file)));
        return fileArray.map( file => file.toString() );
    }

    readTsFileNames (dir: string) {
        return fs.readdirSync (dir).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
    }

    // ============================================================================

    uncamelcaseName (name: string) {
        return unCamelCase (name).replace (/\./g, '_');
    }

    phpReplaceException (cont: string) {
        return cont.
            replace (/catch\(Exception/g, 'catch\(\\Throwable').
            replace (/catch\(\\Exception/g, 'catch\(\\Throwable');
    }

    // ============================================================================

    transpileExchangeTests () {

        this.transpileMainTests ({
            'tsFile': './ts/src/test/tests.ts',
            'pyFileAsync': './python/ccxt/test/tests_async.py',
            'phpFileAsync': './php/test/tests_async.php',
            'pyFileSync': './python/ccxt/test/tests_sync.py',
            'phpFileSync': './php/test/tests_sync.php',
            'jsFile': './js/test/tests.js',
        });

        const baseFolders = {
            ts: './ts/src/test/Exchange/',
            tsBase: './ts/src/test/Exchange/base/',
            py: './python/ccxt/test/',
            pyBase: './python/ccxt/test/exchange/base/',
            php: './php/test/',
            phpBase: './php/test/exchange/base/',
        };

        let baseTests = fs.readdirSync (baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        const exchangeTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter (filename => filename !== 'test.throttle');
        this.createBaseInitFile(baseFolders.pyBase, baseTests);

        const tests: any[] = [];
        for (const testName of baseTests) {
            const unCamelCasedFileName = this.uncamelcaseName(testName);
            const test = {
                base: true,
                name: testName,
                tsFile: baseFolders.tsBase + testName + '.ts',
                pyFileSync: baseFolders.pyBase + unCamelCasedFileName + '.py',
                phpFileSync: baseFolders.phpBase + unCamelCasedFileName + '.php',
            };
            tests.push(test);
        }
        for (const testName of exchangeTests) {
            const unCamelCasedFileName = this.uncamelcaseName(testName);
            const test = {
                base: false,
                name: testName,
                tsFile: baseFolders.ts + testName + '.ts',
                pyFileSync: baseFolders.py + 'exchange/sync/' + unCamelCasedFileName + '.py',
                pyFileAsync: baseFolders.py + 'exchange/async/' + unCamelCasedFileName + '.py',
                phpFileSync: baseFolders.php + 'exchange/sync/' + unCamelCasedFileName + '.php',
                phpFileAsync: baseFolders.php + 'exchange/async/' + unCamelCasedFileName + '.php',
            };
            tests.push(test);
        }
        this.transpileAndSaveExchangeTests (tests);
    }

    baseFunctionalitiesTests () {

        const baseFolders = {
            ts: './ts/src/test/base/',
            pyAsync: './python/ccxt/test/base/',
            phpAsync: './php/test/base/',
        };

        let baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        const tests: { base: boolean; name: string; tsFile: string; pyFileSync: string; phpFileSync: string }[] = [];

        for (const testName of baseFunctionTests) {
            const unCamelCasedFileName = this.uncamelcaseName(testName);
            const tsFile = baseFolders.ts + testName + '.ts';
            const tsContent = fs.readFileSync(tsFile).toString();
            if (!tsContent.includes ('// AUTO_TRANSPILE_ENABLED')) {
                continue;
            }
            const test: any = {
                base: true,
                name: testName,
                tsFile: tsFile,
                pyFileAsync : baseFolders.pyAsync  + unCamelCasedFileName + '.py',
                phpFileAsync: baseFolders.phpAsync + unCamelCasedFileName + '.php',
            };
            // Add ArrayCache imports if the test uses cache classes
            if (tsContent.includes('ArrayCache') || tsContent.includes('ArrayCacheByTimestamp') || 
                tsContent.includes('ArrayCacheBySymbolById') || tsContent.includes('ArrayCacheBySymbolBySide')) {
                test.pyHeaders = ['from ccxt.async_support.base.ws.cache import ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide  # noqa: F402'];
                test.phpHeaders = ['use ccxt\\pro\\ArrayCache;', 'use ccxt\\pro\\ArrayCacheByTimestamp;', 'use ccxt\\pro\\ArrayCacheBySymbolById;', 'use ccxt\\pro\\ArrayCacheBySymbolBySide;'];
            }
            tests.push(test);
        }
        this.transpileAndSaveExchangeTests (tests);
    }


    createBaseInitFile (pyPath: string, tests: string[]) {
        const finalPath = pyPath + '__init__.py';
        const fileNames: string[] = tests.filter(t => t !== 'test.sharedMethods').map(test => this.uncamelcaseName(test));
        const importNames = fileNames.map(testName => `from ccxt.test.exchange.base.${testName} import ${testName} # noqa E402`)
        const baseContent = [
            '',
            this.getPythonGenerated(),
            ...importNames
        ].join('\n');

        log.magenta ('→', finalPath)
        overwriteSafe (finalPath, baseContent)
    }

    isFirstLetterUpperCase (str: string) {
        if (!str || str.length === 0) return false;
        const firstChar = str[0];
        return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
    }

    transpileMainTests (files: any) {
        log.magenta ('Transpiling from', files.tsFile.yellow)
        let ts = fs.readFileSync (files.tsFile).toString ()

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
            [ /[^\n]+require[^\n]+\n/g, '' ],
        ])

        const allDefinedFunctions = [ ...ts.matchAll (/function (.*?) \(/g)].map(m => m[1]);
        const snakeCaseFunctions = (cont: string) => {
            return this.regexAll (cont, allDefinedFunctions.map( fName => {
                return [ new RegExp ('\\b' + fName + '\\b', 'g'), unCamelCase (fName)];
            }));
        };

        const mainContent = ts;
        // let { python2, python3, php, phpAsync, className, baseClass } = this.transpileClass (mainContent);
        const parserConfig = {
            'verbose': false,
            'python':{
                'uncamelcaseIdentifiers': true,
            },
            'php':{
                'uncamelcaseIdentifiers': true,
            },
        };
        const transpiler = new astTranspiler(parserConfig);
        let fileConfig: Object[] = [
            // {
            //     language: "php",
            //     async: true
            // },
            // {
            //     language: "php",
            //     async: false
            // },
            // {
            //     language: "python",
            //     async: true
            // }
        ]
        if (this.buildPHP) {
            fileConfig = [
                {
                    language: "php",
                    async: true
                },
                {
                    language: "php",
                    async: false
                },
            ]
        }
        if (this.buildPython) {
            fileConfig = fileConfig.concat([
                {
                    language: "python",
                    async: true
                }
            ])
        }
        const transpilerResult = transpiler.transpileDifferentLanguages(fileConfig, mainContent);
        let [ phpAsync, php, python3 ] = ['', '', '']
        // let ren = [ transpilerResult[0].content, transpilerResult[1].content, transpilerResult[2].content  ];
        const fileImports = transpilerResult[0].imports

        if (transpilerResult.length == 3) { // all langs were transpiled
            phpAsync =  transpilerResult[0].content
            php = transpilerResult[1].content
            python3 = transpilerResult[2].content
        } else if (transpilerResult.length == 2) { // only  php
            phpAsync =  transpilerResult[0].content
            php = transpilerResult[1].content
        } else { // only python
            python3 = transpilerResult[0].content
        }

        // ########### PYTHON ###########
        if (this.buildPython) {
            python3 = python3.
            // remove async ccxt import
            replace (/from ccxt\.async_support(.*)/g, '').
            // add one more newline before function
            replace (/^(async def|def) (\w)/gs, '\n$1 $2').
            // camelCase walletAddress and privateKey
            replace(/\.wallet_address/g, '.walletAddress').
            replace(/\.private_key/g, '.privateKey').
            replace(/\.api_key/g, '.apiKey');

            let pythonImports: any[] = fileImports.filter(x=>x.path.includes('./tests.helpers.js'));
            pythonImports = pythonImports.map (x=> (x.name in errors || x.name === 'baseMainTestClass' || this.isFirstLetterUpperCase (x.name)) ? x.name : unCamelCase(x.name));
            const impHelper = `# -*- coding: utf-8 -*-\n\nimport asyncio\n\n\n` + 'from tests_helpers import ' + pythonImports.join (', ') + '  # noqa: F401' + '\n\n';
            let newPython = impHelper + python3;
            newPython = snakeCaseFunctions (newPython);
            overwriteSafe (files.pyFileAsync, newPython);
            this.transpilePythonAsyncToSync (files.pyFileAsync, files.pyFileSync);
            // remove 4 extra newlines
            let existingPythonWN = fs.readFileSync (files.pyFileSync).toString ();
            existingPythonWN = existingPythonWN.replace (/(\n){4}/g, '\n\n');
            overwriteSafe (files.pyFileSync, existingPythonWN);
        }


        // ########### PHP ###########
        if (this.buildPHP) {
            const phpReform = (cont: string) => {
                // add exceptions
                let exceptions = '';
                for (const eType of Object.keys(errors)) {
                    if (cont.includes (' ' + eType)) {
                        exceptions += `use ccxt\\${eType};\n`;
                    }
                }
                let head = '<?php\n\n' + 'namespace ccxt;\n\n' + 'use \\React\\Async;\nuse \\React\\Promise;\n' + exceptions + '\nrequire_once __DIR__ . \'/tests_helpers.php\';\n\n';
                let newContent = head + cont;
                newContent = newContent.
                    replace (/use ccxt\\(async\\|)abstract\\testMainClass as baseMainTestClass;/g, '').
                    replace(/\->wallet_address/g, '->walletAddress').
                    replace(/\->private_key/g, '->privateKey').
                    replace(/\->api_key/g, '->apiKey').
                    replace (/class testMainClass/, '#[\\AllowDynamicProperties]\nclass testMainClass');
                newContent = snakeCaseFunctions (newContent);
                newContent = this.phpReplaceException (newContent);
                return newContent;
            }
            let bodyPhpAsync = phpReform (phpAsync);
            overwriteSafe (files.phpFileAsync, bodyPhpAsync);
            let bodyPhpSync = phpReform (php);
            bodyPhpSync = bodyPhpSync.replace (/Promise\\all/g, '');
            overwriteSafe (files.phpFileSync, bodyPhpSync);
        }
    }

    // ============================================================================

    async webworkerTranspile (allFiles: any[], fileConfig: any, parserConfig: any) {
        // create worker config
        const workerConfigArray = allFiles.map( file => {
            return {
                content: file,
                config: fileConfig
            }
        });

        // create worker
        const piscina = new Piscina({
            filename: resolve(__dirname, './ast-transpiler-worker.js')
        });

        const chunkSize = 10;
        const promises: Promise<any>[] = [];
        const now = Date.now();
        for (let i = 0; i < workerConfigArray.length; i += chunkSize) {
            const chunk = workerConfigArray.slice(i, i + chunkSize);
            promises.push(piscina.run({transpilerConfig:parserConfig, filesConfig:chunk}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', workerResult.length, 'tests in', elapsed, 'ms');
        const flatResult = workerResult.flat();
        return flatResult;
    }
    // ============================================================================

    async transpileAndSaveExchangeTests (tests: any[]) {
        const parser = {
            'LINES_BETWEEN_FILE_MEMBERS': 2
        }
        let fileConfig: { language: string; async: boolean }[] = [
            // {
            //     language: "php",
            //     async: true
            // },
            // {
            //     language: "php",
            //     async: false
            // },
            // {
            //     language: "python",
            //     async: false
            // },
            // {
            //     language: "python",
            //     async: true
            // },
        ]

        if (this.buildPHP) {
            fileConfig.push({"language": "php", "async": true})
            fileConfig.push({"language": "php", "async": false})
        }


        if (this.buildPython) {
            fileConfig.push({"language": "python", "async": false})
            fileConfig.push({"language": "python", "async": true})
        }

        const parserConfig = {
            'verbose': false,
            'python':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            },
            'php':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            }
        };

        let allFiles = await this.readFilesAsync (tests.map(t => t.tsFile));

        const needsEquals = allFiles.map(file => file.includes('function equals'));

        // apply regex to every file
        allFiles = allFiles.map( file => this.regexAll (file, [
            [ /\'use strict\';?\s+/g, '' ],
            [ /\/\* eslint-disable \*\/\n*/g, '' ],
            // [ /[^\n]+from[^\n]+\n/g, '' ],
            // [ /export default\s+[^\n]+;*\n*/g, '' ],
            [ /function equals \([\S\s]+?return true;?\n}\n/g, '' ],
        ]));

        allFiles = allFiles.map( file => this.regexAll(file, this.getPreTranspilationRegexes()));

        const flatResult = await this.webworkerTranspile (allFiles, fileConfig, parserConfig);

        const exchangeCamelCaseProps = (str: string) => {
            // replace all snake_case exchange props to camelCase
            return str.
                replace (/precision_mode/g, 'precisionMode');
        };

        const pyFixes = (str: string, sync = false) => {
            str = str.replace (/assert\((.*)\)(?!$)/g, 'assert $1');
            str = str.replace (/ == True/g, ' is True');
            str = str.replace (/ == False/g, ' is False');
            if (sync) {
                // str = str.replace (/asyncio\.gather\(\*(\[.+\])\)/g, '$1');
                str = str.replace (/asyncio\.gather\(\*/g, '(');
            }
            return exchangeCamelCaseProps(str);
        }

        const phpFixes = (str: string) => {
            str = str.
                replace (/\$exchange\[\$method\]/g, '$exchange->$method').
                replace (/\$test_shared_methods\->/g, '').
                replace (/TICK_SIZE/g, '\\ccxt\\TICK_SIZE').
                replace (/Precise\->/g, 'Precise::').
                replace (/function equals(.*?)\{/g, '').
                replace (/\$ccxt->/g, '\\ccxt\\');
            str = this.phpReplaceException (str);
            return exchangeCamelCaseProps(str);
        }

        const fileSaveFunc = (path: string, content: string) => {
            log.magenta ('→', path);
            overwriteSafe (path, content);
        };

        for (let i = 0; i < flatResult.length; i++) {
            const result = flatResult[i];
            const test = tests[i];
            const isWs = test.tsFile.includes('ts/src/pro/');

            // handle different usecases regarding the conditional transpilation
            let phpAsync = ''
            let phpSync = ''

            let pythonAsync = ''
            let pythonSync = ''

            if (this.buildPHP && this.buildPython) {
                phpAsync = phpFixes(result[0].content);
                phpSync = phpFixes(result[1].content);
                pythonSync = pyFixes (result[2].content, true);
                pythonAsync = pyFixes (result[3].content);
            } else if (this.buildPHP) {
                phpAsync = phpFixes(result[0].content);
                phpSync = phpFixes(result[1].content);
            } else if (this.buildPython) {
                pythonAsync = pyFixes(result[1].content);
                pythonSync = pyFixes(result[0].content);
            }

            const usesEqualsFunction = needsEquals[i];

            const imports: any[] = result[0].imports;

            const usesPrecise = imports.find(x => x.name.includes('Precise'));
            const usesNumber = pythonAsync.indexOf ('numbers.') >= 0;
            const requiredSubTests  = imports.filter(x => x.name.includes('test')).map(x => x.name);
            const usesAsyncio = pythonAsync.indexOf ('asyncio.') >= 0;

            let importedExceptionTypes = imports.filter(x => Object.keys(errors).includes(x.name)).map(x => x.name); // returns 'OnMaintenance,ExchangeNotAvailable', etc...

            const getDirLevelForPath = (langFolder: string, filePath: string, defaultDirs: number) => {
                let directoriesToPythonFile: number | undefined = undefined;
                if(filePath && filePath.includes('/' + langFolder + '/')) {
                    directoriesToPythonFile = (filePath.split('/' + langFolder + '/')[1]?.match(/\//g)?.length || defaultDirs) + 1;
                }
                return directoriesToPythonFile;
            };

            const pyDirsAmount = getDirLevelForPath('python', test.pyFileAsync || test.pyFileSync, 3);
            const phpDirsAmount = getDirLevelForPath('php', test.phpFileAsync || test.phpFileSync, 2);
            const pythonPreamble = this.getPythonPreamble(pyDirsAmount);
            // In PHP preable, for specifically WS tests, we need to avoid php namespace differences for tests, for example, if WATCH methods use ccxt\\pro, then the inlcuded non-pro test methods (like "test_trade" etc) are under ccxt, causing the purely transpiled code to have namespace conflicts specifically in PHP. so, for now, let's just leave all watch method tests under `ccxt` namespace, not `ccxt\pro`
            // let phpPreamble = this.getPHPPreamble (false, phpDirsAmount, isWs); 
            const includePath = isWs && test.base;
            const addProNs = isWs && test.base; // only for base CACHE and ORDERBOOK tests
            let phpPreamble = this.getPHPPreamble (includePath, phpDirsAmount, addProNs); 


            let pythonHeaderSync: string[] = []
            let pythonHeaderAsync: string[] = []
            let phpHeaderSync: string[] = []
            let phpHeaderAsync: string[] = []

            if (phpAsync.includes ('React\\') || phpAsync.includes ('Async\\')) {
                phpHeaderAsync.push ('use React\\Async;');
                phpHeaderAsync.push ('use React\\Promise;');
            }

            phpAsync = phpAsync.replace ('\\ccxt\\Exchange', '\\ccxt\\async\\Exchange');

            const decimalProps = [ 'DECIMAL_PLACES', 'TICK_SIZE', 'NO_PADDING', 'TRUNCATE', 'ROUND', 'ROUND_UP', 'ROUND_DOWN', 'SIGNIFICANT_DIGITS', 'PAD_WITH_ZERO', 'decimal_to_precision', 'number_to_string' ];
            for (const propName of decimalProps) {
                if (pythonAsync.includes (propName)) {
                    pythonHeaderSync.push ('from ccxt.base.decimal_to_precision import ' + propName + '  # noqa E402')
                    pythonHeaderAsync.push ('from ccxt.base.decimal_to_precision import ' + propName + '  # noqa E402')
                }
            }
            if (pythonAsync.match (/\sccxt\./)) {
                pythonHeaderSync.push ('import ccxt  # noqa: F402')
                pythonHeaderAsync.push ('import ccxt.async_support as ccxt  # noqa: F402')
            }
            if (usesNumber) {
                pythonHeaderSync.push ('import numbers  # noqa E402')
                pythonHeaderAsync.push ('import numbers  # noqa E402')
            }
            // py: json
            if (pythonAsync.includes ('json.load') || pythonAsync.includes ('json.dump')) {
                pythonHeaderSync.push ('import json  # noqa E402')
                pythonHeaderAsync.push ('import json  # noqa E402')
            }
            if (usesPrecise) {
                pythonHeaderAsync.push ('from ccxt.base.precise import Precise  # noqa E402')
                pythonHeaderSync.push ('from ccxt.base.precise import Precise  # noqa E402')
                phpHeaderAsync.push ('use \\ccxt\\Precise;')
                phpHeaderSync.push ('use \\ccxt\\Precise;')
            }
            if (usesAsyncio) {
                pythonHeaderAsync.push ('import asyncio')
            }
            if (test.pyHeaders) {
                pythonHeaderAsync = pythonHeaderAsync.concat (test.pyHeaders);
                pythonHeaderSync = pythonHeaderSync.concat (test.pyHeaders);
            }
            if (test.phpHeaders) {
                phpHeaderAsync = phpHeaderAsync.concat (test.phpHeaders);
                phpHeaderSync = phpHeaderSync.concat (test.phpHeaders);
            }

            for (const eType of importedExceptionTypes) {
                const py = `from ccxt.base.errors import ${eType}  # noqa E402`;
                pythonHeaderAsync.push (py)
                pythonHeaderSync.push (py)
            }

            for (const subTestName of requiredSubTests) {
                const snake_case = unCamelCase(subTestName);
                const isSharedMethodsImport = subTestName.includes ('SharedMethods');
                const isSameDirImport = tests.find(t => t.name === subTestName);
                const phpPrefix = isSameDirImport ? '__DIR__ . \'/' : 'PATH_TO_CCXT . \'/test/exchange/base/';
                let pySuffix = isSameDirImport ? '' : '.exchange.base';
                const isLangSpec = subTestName === 'testLanguageSpecific';

                if (isSharedMethodsImport) {
                    pythonHeaderAsync.push (`from ccxt.test.exchange.base import test_shared_methods  # noqa E402`)
                    pythonHeaderSync.push (`from ccxt.test.exchange.base import test_shared_methods  # noqa E402`)

                    // in php, we don't need to import this, as it's imported once in `tests_init.php`
                    // phpHeaderAsync.push (`include_once PATH_TO_CCXT . '/test/exchange/base/test_shared_methods.php';`)
                    // phpHeaderSync.push (`include_once PATH_TO_CCXT . '/test/exchange/base/test_shared_methods.php';`)
                } else {
                    if (test.base) {
                        const phpLangSpec =  isLangSpec ? 'language_specific/' : '';
                        phpHeaderSync.push (`include_once __DIR__ . '/${phpLangSpec}${snake_case}.php';`)
                        phpHeaderAsync.push (`include_once __DIR__ . '/${phpLangSpec}${snake_case}.php';`)
                        if (test.tsFile.includes('Exchange/base')) {
                            pythonHeaderSync.push (`from ccxt.test.exchange.base.${snake_case} import ${snake_case}  # noqa E402`)
                            pythonHeaderAsync.push (`from ccxt.test.exchange.base.${snake_case} import ${snake_case}  # noqa E402`)
                        } else {
                            const pyLangSpec =  isLangSpec ? 'language_specific.' : '';
                            pythonHeaderSync.push (`from ccxt.test.base.${pyLangSpec}${snake_case} import ${snake_case}  # noqa E402`)
                            pythonHeaderAsync.push (`from ccxt.test.base.${pyLangSpec}${snake_case} import ${snake_case}  # noqa E402`)
                        }
                    } else {
                        phpHeaderSync.push (`include_once ${phpPrefix}${snake_case}.php';`)
                        phpHeaderAsync.push (`include_once ${phpPrefix}${snake_case}.php';`)
                        pySuffix = (pySuffix === '') ? snake_case : pySuffix;
                        pythonHeaderSync.push (`from ccxt.test${pySuffix} import ${snake_case}  # noqa E402`)
                        pythonHeaderAsync.push (`from ccxt.test${pySuffix} import ${snake_case}  # noqa E402`)
                    }
                }
            }

            if (usesEqualsFunction) {
                const pyEquals = [
                    "",
                    "def equals(a, b):",
                    "    return a == b",
                ].join('\n')
                pythonHeaderSync.push(pyEquals);
                pythonHeaderAsync.push(pyEquals);
            }


            test.pythonPreambleSync = pythonPreamble + pythonCodingUtf8 + '\n\n' + pythonHeaderSync.join ('\n') + '\n\n';
            test.phpPreambleSync = phpPreamble + phpHeaderSync.join ('\n') + "\n\n";
            test.phpPreambleAsync = phpPreamble + phpHeaderAsync.join ('\n') + "\n\n";
            test.pythonPreambleAsync = pythonPreamble + pythonCodingUtf8 + '\n\n' + pythonHeaderAsync.join ('\n') + '\n\n';

            // Remove incorrect ArrayCache imports from transpiled Python code if we added the correct one in headers
            if (test.pyHeaders && test.pyHeaders.some((h: string) => h.includes('from ccxt.async_support.base.ws.cache import'))) {
                pythonSync = pythonSync.replace(/from ccxt\.base\.ws\.cache import ArrayCache[^\n]*\n/g, '');
                pythonAsync = pythonAsync.replace(/from ccxt\.base\.ws\.cache import ArrayCache[^\n]*\n/g, '');
            }

            test.phpFileSyncContent = test.phpPreambleSync + phpSync;
            test.pyFileSyncContent = test.pythonPreambleSync + pythonSync;
            test.phpFileAsyncContent = test.phpPreambleAsync + phpAsync;
            test.pyFileAsyncContent = test.pythonPreambleAsync + pythonAsync;

            if (test.phpFileAsync && this.buildPHP) fileSaveFunc (test.phpFileAsync, test.phpFileAsyncContent);
            if (test.pyFileAsync && this.buildPython) fileSaveFunc (test.pyFileAsync, test.pyFileAsyncContent);
            if (test.phpFileSync && this.buildPHP) fileSaveFunc (test.phpFileSync, test.phpFileSyncContent);
            if (test.pyFileSync && this.buildPython) fileSaveFunc (test.pyFileSync, test.pyFileSyncContent);
        }
    }

    // ============================================================================

    transpileTests () {

        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }

        this.baseFunctionalitiesTests ();

        this.transpileCryptoTests ()

        this.transpileExchangeTests ()
    }

    // ============================================================================
    transpileExamples () {
        const parser = {
            'LINES_BETWEEN_FILE_MEMBERS': 2
        }
        const fileConfig: { language: string; async: boolean }[] = [
            {
                language: "php",
                async: true
            },
            {
                language: "python",
                async: true
            },
        ]
        const parserConfig = {
            'verbose': false,
            'python':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            },
            'php':{
                'uncamelcaseIdentifiers': true,
                'parser': parser
            },
        };
        const transpiler = new astTranspiler(parserConfig);

        const examplesBaseFolder = __dirname + '/../examples/'
        const examplesFolders = {
            ts: examplesBaseFolder +'ts/',
            js: examplesBaseFolder +'js/',
            py: examplesBaseFolder +'py/',
            php: examplesBaseFolder +'php/',
        }
        const transpileFlagPhrase = '// AUTO-TRANSPILE //'

        const pythonPreamble = this.getPythonPreamble ().replace ('sys.path.append(root)', 'sys.path.append(root + \'/python\')'); // as main preamble is meant for derived exchange classes, the path needs to be changed
        const phpPreamble = this.getPHPPreamble ();

        const preambles = {
            phpAsync: phpPreamble,
            pyAsync: pythonPreamble,
        };

        const fileHeaders: any = {
            pyAsync: [
                "import asyncio",
                "import ccxt.async_support as ccxt  # noqa: E402",
                ""
            ],
            pyPro: [
                "import asyncio",
                "import ccxt.pro as ccxt  # noqa: E402",
                "",
                "",
                "",
            ],
            phpAsync: [
                "",
                "error_reporting(E_ALL);",
                "date_default_timezone_set('UTC');",
                "",
                "use ccxt\\Precise;",
                "use React\\Async;",
                "use React\\Promise;",
                "",
                "",
                "",
            ]
        }
        // join header arrays into strings
        for (const [key, value] of Object.entries (fileHeaders)) {
            fileHeaders[key] = (value as any).join ('\n')
        }

        // start iteration through examples folder
        const allTsExamplesFiles = fs.readdirSync (examplesFolders.ts).filter((f) => f.endsWith('.ts'));
        for (const filenameWithExtenstion of allTsExamplesFiles) {
            const tsFile = path.join (examplesFolders.ts, filenameWithExtenstion)
            let tsContent = fs.readFileSync (tsFile).toString ()
            if (tsContent.indexOf (transpileFlagPhrase) > -1) {
                const isCcxtPro = tsContent.indexOf ('ccxt.pro') > -1;
                log.magenta ('Transpiling from', tsFile.yellow)
                const fileName = filenameWithExtenstion.replace ('.ts', '')
                // temporary: avoid console.log with + (plos) because it may break in python.
                if (tsContent.match ('console\.log \((.*?)\\+(.*?)\);')){
                    throw new Error ('console.log with +(plus) detected in ' + tsFile + '. Please use commas or string interpolation.');
                }

                // detect all function declarations in JS, e.g. `async function Xyz (...)`)
                const allDetectedFunctionNames = [...tsContent.matchAll(/\bfunction (.*?)\(/g)].map (match => match[1].trim());

                // exec the main transpile function
                const transpiled = transpiler.transpileDifferentLanguages(fileConfig, tsContent);
                let [ phpAsyncBody, pythonAsyncBody ] = [ transpiled[0].content, transpiled[1].content  ];
                // ###### replace common (synchronity agnostic) syntaxes ######
                const fixPython = (body: string)=> {
                    return this.regexAll (body, [
                        [ /console\.log/g, 'print' ],
                        // in python import ccxt.pro as ccxt
                        [ /ccxt.pro/g, 'ccxt' ],
                        // cases like: exchange = new ccxt.binance ()
                        //[ / ccxt\.(.?)\(/g, 'ccxt.' + '$2\(' ],
                        // cases like: exchange = new ccxt['name' or name] ()
                        [ /ccxt\[(.*?)\]/g, 'getattr(ccxt, $1)'],
                        // cases like: exchange = new ccxt.pro['name' or name] ()
                        [ /ccxt.pro\[(.*?)\]/g, 'getattr(ccxt, $1)'],
                    ]);
                };
                const fixPhp = (body: string)=> {
                    const regexes = [
                        [ /\$console\->log/g, 'var_dump' ],
                        // cases like: exchange = new ccxt.pro.huobi ()
                        [  /new \$ccxt->pro->/g, 'new \\ccxt\\pro\\' ],
                        // cases like: exchange = new ccxt.huobi ()
                        [ /new \$ccxt->/g, 'new \\ccxt\\async\\' ],
                        // cases like: exchange = new ccxt['huobi' or varname] ()
                        [ /(\s*)(\$\w+)\s*=\s*new\s+\$ccxt\[([^\]]*)\]\(([^\]]*)\)/g, '$1$exchange_class = \'\\ccxt\\async\\\\\'.$3;$1$2 = new $exchange_class($4)' ],
                        // cases like: exchange = new ccxt.pro['huobi' or varname] ()
                        [ /(\s*)(\$\w+)\s*=\s*new\s+\$ccxt\\async\\pro\[([^\]]*)\]\(([^\]]*)\)/g, '$1$exchange_class = \'\\ccxt\\pro\\\\\'.$3;$1$2 = new $exchange_class($4)' ],
                        // fix cases like: async\pro->kucoin
                        [ /async\\pro->/g, 'pro\\' ],
                    ];
                    return this.regexAll (body, regexes);
                };

                const finalBodies: any = {};
                finalBodies.pyAsync = fixPython (pythonAsyncBody);
                finalBodies.phpAsync = fixPhp (phpAsyncBody);

                // specifically in python (not needed in other langs), we need add `await .close()` inside matching methods
                for (const funcNameInit of allDetectedFunctionNames) {
                    const funcName = unCamelCase (funcNameInit)
                    // match function bodies
                    const funcBodyRegex = new RegExp ('(?=def ' + funcName + '\\()(.*?)(?=\\n\\w)', 'gs');
                    // inside functions, find exchange initiations
                    finalBodies.pyAsync = finalBodies.pyAsync.replace (funcBodyRegex, function (wholeMatch: string, innerMatch: string){
                        // find inited exchanges
                        // case 1: inited with getattr
                        let matches = [ ... innerMatch.matchAll(/(\w*?) \= getattr\(ccxt,\s*(.*?)\)/g)];
                        if (matches.length === 0) {
                            // case 2: inited with direct call
                            matches = [ ... innerMatch.matchAll(/(\w*?) \= ccxt\.(.*?)\(/g)];
                        }
                        let matchedBody = innerMatch;
                        // add `await exchange.close()` to instantiated variables
                        for (const exchLineMatches of matches) {
                            // we presume all methods to be in main scope, so adding just 4 spaces
                            matchedBody = matchedBody + '    await ' + exchLineMatches[1] + '.close()\n'
                        }
                        return matchedBody;
                    });
                    // place main-scope await function calls within asyncio
                    finalBodies.pyAsync = finalBodies.pyAsync.replace (new RegExp ('await ' + funcName + '\\((.*?)\\)', 'g'), function(wholeMatch: string, innerMatch: string){ return '\nasyncio.run(' + wholeMatch.replace('await ','').trim() + ')';})
                }

                let finalPyHeaders = '';
                if (isCcxtPro) {
                    finalPyHeaders = fileHeaders.pyPro;
                } else {
                    // these are cases when transpliation happens of not specific PRO file, i.e. "example" snippets, where just "new ccxt.pro" appears
                    if (tsContent.match ('new ccxt.pro')){
                        finalPyHeaders += 'import ccxt.pro  # noqa: E402' + '\n'
                    }
                    finalPyHeaders += '\n\n'
                }
                // write files
                overwriteSafe (examplesFolders.py  + fileName + '.py', preambles.pyAsync + finalPyHeaders + finalBodies.pyAsync)
                overwriteSafe (examplesFolders.php + fileName + '.php', preambles.phpAsync + fileHeaders.phpAsync + finalBodies.phpAsync)
            }
        }
    }

    // ============================================================================

    getAllFilesRecursively(folder: string, jsFiles: string[]) {
        fs.readdirSync(folder).forEach(File => {
            const absolute = join(folder, File);
            if (fs.statSync(absolute).isDirectory()) return this.getAllFilesRecursively(absolute, jsFiles);
            else return jsFiles.push(absolute);
        });
    }

    addGeneratedHeaderToJs (jsFolder: string, force = false) {

        // add it to every .js file inside the folder
        let jsFiles: string[] = [];
        this.getAllFilesRecursively(jsFolder, jsFiles);

        jsFiles.filter(f => !f.includes(".d.ts") && !f.includes(".tsbuildinfo")).map (jsFilePath => {
            const content = fs.readFileSync (jsFilePath, 'utf8');
            if (content.indexOf (this.getJsPreamble()) === -1) {
                let contents = [
                    this.getJsPreamble(),
                    content
                ].join ("\n")
                overwriteSafe (jsFilePath, contents)
            }
        })
        log.bright.yellow ('Added JS preamble to all ', jsFiles.length + ' files.')
    }

    // ============================================================================

    missingParsers: string[] = [];
    parserMethodsMap: any;

    defineMethodParsersMap () {
        // test if developer has implemented all parse required parse methods
        this.parserMethodsMap = {
            // basic
            'fetchCurrencies': ['parseCurrency'],
            // parseOrder
            'cancelOrder': ['parseOrder'],
            'createOrder': ['parseOrder'],
            'editOrder': ['parseOrder'],
            'fetchClosedOrder': ['parseOrder'],
            'fetchOpenOrder': ['parseOrder'],
            'fetchOrder': ['parseOrder'],
            // parseOrders  (we also allow parser methods like 'fetchOrders', 'fetchOrdersByState/Status', etc..)
            'cancelAllOrders': ['parseOrders', 'fetchOrders'],
            'cancelOrders': ['parseOrders', 'fetchOrders'],
            'fetchCanceledOrders': ['parseOrders', 'fetchOrders'],
            'fetchClosedOrders': ['parseOrders', 'fetchOrders'],
            'fetchOpenOrders': ['parseOrders', 'fetchOrders'],
            'fetchOrders': ['parseOrders', 'fetchOrdersBy'],
            // parseDepositAddress/es
            'createDepositAddress': ['parseDepositAddress'],
            'fetchDepositAddress': ['parseDepositAddress'],
            'fetchDepositAddresses': ['parseDepositAddresses'],
            'fetchDepositAddressesByNetwork': ['parseDepositAddresses'],
            // ticker/s
            'fetchTicker': ['parseTicker', 'fetchTickers'],
            //     'fetchBidsAsks': ['parseTickers'], // temporarily disabled
            'fetchTickers': ['parseTicker'], // singular also allowed, because some exchanges have iteratation inside implementation
            // transaction/s  (also allow i.e. 'fetchTransactionsByType')
            'fetchDeposit': ['parseTransaction'],
            'fetchWithdrawal': ['parseTransaction'],
            'fetchDeposits': ['parseTransactions', 'fetchTransactions'],
            'fetchWithdrawals': ['parseTransactions', 'fetchTransactions'],
            'withdraw': ['parseTransaction'],
            'fetchTransactions': ['parseTransactions'],
            // rate/s
            'fetchBorrowInterest': ['parseBorrowInterest'],
            'fetchBorrowInterests': ['parseBorrowInterests'],
            'fetchBorrowRate': ['parseBorrowRate'],
            'fetchBorrowRates': ['parseBorrowRates'],
            'fetchBorrowRatesPerSymbol': ['parseBorrowRates'],
            'fetchFundingRate': ['parseFundingRate'],
            'fetchFundingRates': ['parseFundingRates'],
            // borrow & funding historyies
            'fetchBorrowRateHistory': ['parseBorrowRateHistory'],
            'fetchBorrowRateHistories': ['parseBorrowRateHistories'],
            'fetchFundingHistory': ['parseFundingHistory'],
            'fetchFundingRateHistory': ['parseFundingRateHistory'],
            'fetchFundingRateHistories': ['parseFundingRateHistories'],
            // OHLCV
            'fetchOHLCV': ['parseOHLCV'],
            'fetchIndexOHLCV': ['parseOHLCV'],
            'fetchMarkOHLCV': ['parseOHLCV'],
            'fetchPremiumIndexOHLCV': ['parseOHLCV'],
            // orderBook
            'fetchOrderBook': ['parseOrderBook'],
            'fetchOrderBooks': ['parseOrderBook'],
            //    'fetchL1OrderBooks': ['parseOrderBook'], // temporarily disabled
            'fetchL2OrderBook': ['parseOrderBook'],
            // fee/s
            'fetchTransactionFee': ['parseTransactionFee'],
            'fetchTransactionFees': ['parseTransactionFees'],
            'fetchTradingFees': ['parseTradingFee'],
            'fetchTradingFee': ['parseTradingFee'],
            // position/s
            'fetchPositionsRisk': ['parsePositionRisk'],
            'fetchPositions': ['parsePositions'],
            'fetchPosition': ['parsePosition', 'fetchPositions'],
            // trade/s
            'fetchTrades': ['parseTrades'],
            'fetchMyTrades': ['parseTrades'],
            'fetchOrderTrades': ['parseTrades'],
            // transfer/s
            'fetchTransfers': ['parseTransfers'],
            'transfer': ['parseTransfer'],
            // ledger/s
            'fetchLedger': ['parseLedgerEntries'],
            'fetchLedgerEntry': ['parseLedgerEntry'],
            // margin
            'addMargin': ['parseMarginModification'],
            'reduceMargin': ['parseMarginModification'],
            'setMargin': ['parseMarginModification'],
            // misc
            'fetchAccounts': ['parseAccount'],
            'fetchBalance': ['parseBalance'],
            'fetchLeverageTiers': ['parseLeverageTiers'],
            'fetchMarketLeverageTiers': ['parseMarketLeverageTiers'],
            'setMarginMode': ['parseMarginMode'],
            'setPositionMode': ['parsePositionMode'],
            'setLeverage': ['parseLeverageEntry'],
            'fetchTradingLimits': ['parseTradingLimits'],
            // skipped: fetchMarkets, fetchPermissions, fetchStatus, fetchTime, signIn, fetchCurrencies
        };
        this.missingParsers = [];
    }

    checkIfMethodLacksParser (className: string, methodName: string, methodContent: string) {
        if (className === 'Exchange') {
            return;
        }
        // before base class, the check is not needed
        if (!this.parserMethodsMap) {
            this.defineMethodParsersMap ();
        }
        // only check those method names, that are in the list
        if (methodName in this.parserMethodsMap) {
            // get the list of which parsers might be used for current method
            const assignedParserMethods = this.parserMethodsMap[methodName];
            // iterate and ...
            for (const parserMethod of assignedParserMethods) {
                // check if the parser method is found in the body ...
                if (methodContent.includes ('this.' + parserMethod)) {
                    // ... if found, then current method's implementation is ok, and jumpt to next method check
                    return;
                }
            }
            // if code reached here, then it means parser method was not used, so, throw error
            this.missingParsers.push (' * Missing parser method: ' + className.toUpperCase () + ' > ' + methodName + ' (): ' + assignedParserMethods.join ('/'));
        }
    }

    // ============================================================================

    async transpileEverything (force = false, child = false) {

        // default pattern is '.js'
        const exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
            , python2Folder  = './python/ccxt/'
            , python3Folder  = './python/ccxt/async_support/'
            , phpFolder      = './php/'
            , phpAsyncFolder = './php/async/'
            , tsFolder = './ts/src/'
            , jsFolder = './js/src/'
            // , options = { python2Folder, python3Folder, phpFolder, phpAsyncFolder }
            , options = { python2Folder, python3Folder, phpFolder, phpAsyncFolder, jsFolder, exchanges }

        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        if (!transpilingSingleExchange && !child) {
            if (this.buildPython) {
                createFolderRecursively (python2Folder)
                createFolderRecursively (python3Folder)
            }

            if (this.buildPHP) {
                createFolderRecursively (phpFolder)
                createFolderRecursively (phpAsyncFolder)
            }
        }

        // const classes = this.transpileDerivedExchangeFiles (tsFolder, options, pattern, force)
        const classes = this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, (child || !!exchanges.length))

        if (classes === null) {
            log.bright.yellow ('0 files transpiled.')
            return;
        }
        if (child) {
            return
        }

        if (!transpilingSingleExchange) {
            this.transpileBaseMethods ()

            //*/

            this.transpileErrorHierarchy ()

            this.transpileTests ()

            this.transpileExamples ()

            // this.addGeneratedHeaderToJs ('./js/')
        }

        log.bright.green ('Transpiled successfully.')
    }
}

function parallelizeTranspiling (exchanges: string[], processes = undefined, force = false, python = false, php = false) {
    const processesNum = Math.min(processes || os.cpus ().length, exchanges.length)
    log.bright.green ('starting ' + processesNum + ' new processes...')
    let isFirst = true
    const args: string[] = [];
    if (force) {
        args.push ('--force')
    }
    if (python) {
        args.push('--python')
    }
    if (php) {
        args.push('--php')
    }
    for (let i = 0; i < processesNum; i ++) {
        const toProcess = exchanges.filter ((_, index) => index % processesNum === i)
        fork (process.argv[1], toProcess.concat (args))
        if (isFirst) {
            args.push ('--child');
            isFirst = false
        }
    }
}

function isMainEntry(metaUrl: any) {
    // https://exploringjs.com/nodejs-shell-scripting/ch_nodejs-path.html#detecting-if-module-is-main
    if (metaFileUrl.startsWith('file:')) {
        const modulePath = url.fileURLToPath(metaUrl);
        if (process.argv[1] === modulePath) {
            return true;
        }
        // when called without .js extension
        if (process.argv[1] === modulePath.replace('.js','')) {
            return true;
        }
    }
    return false;
}

// ============================================================================
if (isMainEntry(metaFileUrl)) {
    const transpiler = new Transpiler ()
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests')
    const errors = process.argv.includes ('--error') || process.argv.includes ('--errors')
    const child = process.argv.includes ('--child')
    const force = process.argv.includes ('--force')
    const addJsHeaders = process.argv.includes ('--js-headers')
    const multiprocess = process.argv.includes ('--multiprocess') || process.argv.includes ('--multi')
    const baseClassOnly = process.argv.includes ('--baseClass')

    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true

    const phpOnly = process.argv.includes ('--php');
    if (phpOnly) {
        transpiler.buildPython = false // it's easier to handle the language to build this way instead of doing something like (build python only)
    }
    const pyOnly = process.argv.includes ('--python');
    if (pyOnly) {
        transpiler.buildPHP = false
    }

    if (!child && !multiprocess) {
        log.bright.green ({ force })
    }

    if (baseClassOnly) {
        transpiler.transpileBaseMethods ()
    } else if (test) {
        transpiler.transpileTests ()
    } else if (errors) {
        transpiler.transpileErrorHierarchy ()
    } else if (multiprocess) {
        parallelizeTranspiling (exchangeIds, undefined, force, pyOnly, phpOnly)
    } else if (addJsHeaders) {
        transpiler.addGeneratedHeaderToJs ('./js/')
    } else {
        (async () => {
            await transpiler.transpileEverything (force, child)
        })()
    }

} else { // if required as a module

    // do nothing
}

// ============================================================================

export {
    Transpiler,
    parallelizeTranspiling,
    isMainEntry
}
