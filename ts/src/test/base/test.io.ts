

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';


function testIo () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleex',
    });

    const ms = exchange.milliseconds ();
    // upper tmp dir
    const upperTmpDir = '../../../../../../../../../../../../tmp/';
    const fileName = upperTmpDir + 'ccxt-test-io-' + ms.toString ();
    const fileContent = 'hello world';
    assert (exchange.fileWrite (fileName, fileContent), "can not write file");
    assert (exchange.fileExists (fileName), "file does not exist");
    const readContent = exchange.fileRead (fileName);
    assert (readContent === fileContent, "file content mismatch. Expected: " + fileContent + ", got: " + readContent);
    exchange.fileDelete (fileName);
    assert (!exchange.fileExists (fileName), "file was not deleted");
}

export default testIo;
