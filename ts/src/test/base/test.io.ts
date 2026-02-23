

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';


async function testIo () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleex',
    });

    const ms = exchange.milliseconds ();
    const fileName = 'ccxt-test-io-' + ms.toString ();
    // upper tmp dir
    const filePath = '../../../../../../../../../../../../tmp/' + fileName;
    const fileContent: string = 'hello world';
    assert (exchange.fileWrite (filePath, fileContent), "can not write file " + filePath);
    assert (exchange.fileExists (filePath), "file does not exist: " + filePath);
    const readContent = exchange.fileRead (filePath);
    assert (readContent === fileContent, "file content mismatch. Expected: " + fileContent + ", got: " + readContent);
    // delete methods removed atm
    // exchange.fileDelete (filePath);
    // assert (!exchange.fileExists (filePath), "file was not deleted: " + filePath);
}

export default testIo;
