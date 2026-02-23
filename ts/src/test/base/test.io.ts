

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';


async function testIo () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleex',
    });

    assert ("GO_SKIP_START");
    const ms = exchange.milliseconds ();
    const fileName = 'ccxt-test-io-' + ms.toString ();
    // upper tmp dir
    let filePath = '../../../../../../../../../../../../tmp/' + fileName;
    const fileContent: string = 'hello world';
    try {
        assert (exchange.fileWrite (filePath, fileContent), "can not write file " + filePath);
    } catch (e) {
        filePath = '/tmp/' + fileName;
        assert (exchange.fileWrite (filePath, fileContent), "can not write file " + filePath);
    }
    assert (exchange.fileExists (filePath), "file does not exist: " + filePath);
    const readContent = exchange.fileRead (filePath);
    assert (readContent === fileContent, "file content mismatch. Expected: " + fileContent + ", got: " + readContent);
    exchange.fileDelete (filePath);
    assert (!exchange.fileExists (filePath), "file was not deleted: " + filePath);
    assert ("GO_SKIP_END");
    assert (exchange.safeString (undefined, undefined) === undefined, "safeString failed on undefined input"); // go-trick
}

export default testIo;
