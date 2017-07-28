"use strict";

const fs = require ('fs')
const ccxt = require ('./ccxt')

//-----------------------------------------------------------------------------

console.log ('Updating badges → ./README.rst')

let readmeRst = 'README.rst'
let rst = fs.readFileSync (readmeRst, 'utf8')
let rstNew = 
    rst.replace (/\`([^\`]+)\s\<\#[^\`]+\>\`\_\_/g, '$1')
        .replace (/\\\|/g, '|')

let rstMarketTableRegex = /([\s\S]+?)APIs:[\n][\n](\+\-\-[\s\S]+\-\-\+)[\n][\n]([\s\S]+)/
let match = rstMarketTableRegex.exec (rstNew)
let rstMarketTableLines = match[2].split ("\n")

let newRstMarketTable = rstMarketTableLines.map (line => {
    return line.replace (/(\||\+)(.).+?(\s|\=|\-)(\||\+)/, '$1')
}).join ("\n")

let travisBadgeImage    = ".. image:: https://travis-ci.org/kroitor/ccxt.svg?branch=master\n"
let travisBadgeTarget   = "   :target: https://travis-ci.org/kroitor/ccxt"
let npmBadgeImage       = ".. image:: https://img.shields.io/npm/v/ccxt.svg\n"
let npmBadgeTarget      = "   :target: https://npmjs.com/package/ccxt"
let pypiBadgeImage      = ".. image:: https://img.shields.io/pypi/v/ccxt.svg\n"
let pypiBadgeTarget     = "   :target: https://pypi.python.org/pypi/ccxt"
let npmDownloadsImage   = ".. image:: https://img.shields.io/npm/dm/ccxt.svg\n"
let npmDownloadsTarget  = "   :target: https://www.npmjs.com/package/ccxt"
let pypiDownloadsImage  = ".. image:: https://img.shields.io/pypi/dm/ccxt.svg\n" // always shows 0
let pypiDownloadsTarget = "   :target: https://pypi.org/project/ccxt"
let scrutinizerImage    = ".. image:: https://img.shields.io/scrutinizer/g/kroitor/ccxt.svg\n"
let scrutinizerTarget   = "   :target: https://scrutinizer-ci.com/g/kroitor/ccxt/?branch=master"
let runkitImage         = ".. image:: https://badge.runkitcdn.com/ccxt.svg\n"
let runkitTarget        = "   :target: https://npm.runkit.com/ccxt"
let exchangesImage      = ".. image:: https://img.shields.io/badge/exchanges-" + ccxt.markets.length + "-blue.svg\n"
let exchangesTarget     = "   :target: https://github.com/kroitor/ccxt/wiki/Exchange-Markets"

let travisBadgeRST   = travisBadgeImage   + ' ' + travisBadgeTarget
let npmBadgeRST      = npmBadgeImage      + ' ' + npmBadgeTarget
let pypiBadgeRST     = pypiBadgeImage     + ' ' + pypiBadgeTarget
let npmDownloadsRST  = npmDownloadsImage  + ' ' + npmDownloadsTarget
let pypiDownloadsRST = pypiDownloadsImage + ' ' + pypiDownloadsTarget // always shows 0
let scrutinizerRST   = scrutinizerImage   + ' ' + scrutinizerTarget
let runkitRST        = runkitImage        + ' ' + runkitTarget
let exchangesRST     = exchangesImage     + ' ' + exchangesTarget

let badges = [ 
    travisBadgeRST, 
    npmBadgeRST, 
    pypiBadgeRST, 
    npmDownloadsRST, 
    // pypiDownloadsRST, // always shows 0
    scrutinizerRST, 
    runkitRST,
    exchangesRST,
].join ("\n")

rstNew = match[1] + "APIs:\n\n" + newRstMarketTable + "\n\n" + match[3]
rstNew = rstNew.replace (/\.\.[^\n]+image\:\:[^\n]+[\n]/g, '')
rstNew = rstNew.replace ('|Build Status| |npm| |PyPI| |NPM Downloads| |Scrutinizer Code Quality| |Try ccxt on RunKit| |Supported Exchanges|', badges)
rstNew = rstNew.replace (/   :target[^#]+$/g, '')
fs.truncateSync (readmeRst)
fs.writeFileSync (readmeRst, rstNew)

//-----------------------------------------------------------------------------

console.log ('Updating badges → ./README.md')

let readmeMd = 'README.md'
let md = fs.readFileSync (readmeMd, 'utf8')
let mdNew = 
    md.replace (/shields\.io\/badge\/exchanges\-[0-9]+\-blue/g, 'shields.io/badge/exchanges-' + ccxt.markets.length + '-blue')

fs.truncateSync (readmeMd)
fs.writeFileSync (readmeMd, mdNew)

console.log ('Badges updated successfully.')