"use strict";

const fs = require ('fs');
const crypto = require ('crypto');

//  ---------------------------------------------------------------------------

function getExistingExchangeFilePath (lang, exchangeId, asyncVersion = true, isWs = false) {
    let folder = lang === 'py' ? 'python/ccxt' : lang;
    folder = folder + (isWs ? '/pro' : '');
    // calculate md5 hash of the passed exchange
    return __dirname + '/' + folder + '/' + exchangeId + '.' + lang;
}

function getExistingExchangeContentMd5 (lang, exchangeId, asyncVersion = true, isWs = false) {
    const content =  fs.readFileSync (getExistingExchangeFilePath (lang, exchangeId, asyncVersion, isWs), 'utf8');
    const md5Hash = crypto.createHash('md5').update(content).digest("hex");
    return md5Hash;
}

function getExchangeHashFilePath (lang, exchangeId, asyncVersion = true, isWs = false) {
    return getExistingExchangeFilePath (lang, exchangeId, asyncVersion, isWs) + '.passedTestHash';
}

// last 2 arguments will be used in different languages/parts of ccxt
function checkPassedTestHash (lang, exchangeId, asyncVersion = true, isWs = false) {
    const passedTestHashFile = getExchangeHashFilePath (lang, exchangeId, asyncVersion, isWs);
    let result = false;
    if (fs.existsSync (passedTestHashFile) ) { 
        if (fs.existsSync (passedTestHashFile) ) { 
            const md5ChecksumExisting = getExistingExchangeContentMd5 (lang, exchangeId, asyncVersion, isWs);
            const md5ChecksumCached = fs.readFileSync (passedTestHashFile, 'utf8');
            if (md5ChecksumExisting === md5ChecksumCached) {
                result = true;
            }
            fs.unlinkSync(passedTestHashFile);
        }
    }
    return result;
}

module.exports = { 
    getExchangeHashFilePath,
    getExistingExchangeContentMd5,
    checkPassedTestHash
};