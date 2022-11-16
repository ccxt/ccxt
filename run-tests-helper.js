"use strict";

const fs = require ('fs');
const crypto = require ('crypto');

//  ---------------------------------------------------------------------------

function isEmptyDir(path) {  
    try {
      const directory = fs.opendirSync(path);
      const entry = directory.readSync();
      directory.closeSync();
      return entry === null;
    } catch (error) {
      return false;
    }
}
function getExistingExchangeContent (lang, exchangeId, isWs = false) {
    let folder = lang === 'py' ? 'python/ccxt' : lang;
    folder = folder + (isWs ? '/pro' : '');
    // calculate md5 hash of the passed exchange
    let exchangeFilePath = __dirname + '/' + folder + '/' + exchangeId + '.' + lang;
    const exchangeFileContent = fs.readFileSync (exchangeFilePath, 'utf8');
    return exchangeFileContent;
}
function getExistingExchangeContentMd5 (lang, exchangeId, isWs = false) {
    let folder = lang === 'py' ? 'python/ccxt' : lang;
    folder = folder + (isWs ? '/pro' : '');
    // calculate md5 hash of the passed exchange
    let exchangeFilePath = __dirname + '/' + folder + '/' + exchangeId + '.' + lang;
    const exchangeFileContent = fs.readFileSync (exchangeFilePath, 'utf8');
    const md5Checksum = crypto.createHash('md5').update(exchangeFileContent).digest("hex");
    return md5Checksum;
}

function checkPassedTestHash (lang, exchangeId, isWs = false) {
    const passedTestsHashBaseDir = __dirname + '/.passed-tests-hashes';
    const passedTestsHashLangDir = passedTestsHashBaseDir + '/' + lang + (isWs ? '/pro' : '');
    const passedTestHashFile = passedTestsHashLangDir + '/' + exchangeId;
    let result = '';
    if (fs.existsSync (passedTestsHashBaseDir) ) { 
        if (fs.existsSync (passedTestHashFile) ) { 
            if (fs.existsSync (passedTestHashFile) ) { 
                const md5ChecksumExisting = getExistingExchangeContentMd5 (lang, exchangeId, isWs);
                const md5ChecksumCached = fs.readFileSync (passedTestHashFile, 'utf8');
                result = md5ChecksumExisting + ' : ' + md5ChecksumCached;
                if (md5ChecksumExisting === md5ChecksumCached) {
                    result = '4';
                } else {
                    console.log(getExistingExchangeContent (lang, exchangeId, isWs));
                }
                fs.unlinkSync(passedTestHashFile);
                // if this was the last (only) tested hash, then delete hash-directory 
                if (isEmptyDir(passedTestsHashLangDir)) {
                    fs.rmdirSync(passedTestsHashLangDir, { recursive: true, force: true });
                }
                if (isEmptyDir(passedTestsHashBaseDir)) {
                    fs.rmdirSync(passedTestsHashBaseDir, { recursive: true, force: true });
                }
            }
        }
    }
    return result;
}

module.exports = { 
    getExistingExchangeContentMd5,
    checkPassedTestHash
};