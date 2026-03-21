

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';


function testIo () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleex',
    });

    const ms = exchange.milliseconds ();
    const fileName = 'ccxt-test-io-' + ms.toString () + '.ccxtfile';
    // upper tmp dir
    const tempDir = exchange.getTempDir ();
    assert (tempDir !== undefined && tempDir !== '', "temp dir should not be empty");
    const filePath = tempDir + fileName; // '../../../../../../../../../../../../tmp/' + fileName;
    const fileContent: string = 'hello world';
    assert (exchange.writeFile (filePath, fileContent), "can not write file " + filePath);
    assert (exchange.existsFile (filePath), "file does not exist: " + filePath);
    const readContent = exchange.readFile (filePath);
    assert (readContent === fileContent, "file content mismatch. Expected: " + fileContent + ", got: " + readContent);
    // delete methods removed atm
    // exchange.fileDelete (filePath);
    // assert (!exchange.fileExists (filePath), "file was not deleted: " + filePath);
}

export default testIo;
