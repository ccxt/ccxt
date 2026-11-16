

import assert from 'assert';
import ccxt from '../../../ccxt.js';

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
    // paths escaping the temp dir and pem files must not be writable
    const rejectedPaths = [
        tempDir + '..' + '/' + fileName,
        '../../' + fileName,
        tempDir + 'ccxt-test-io-' + ms.toString () + '.pem',
    ];
    for (let i = 0; i < rejectedPaths.length; i++) {
        let written = false;
        try {
            written = exchange.writeFile (rejectedPaths[i], fileContent);
        } catch (e) {
            written = false;
        }
        assert (!written, 'writeFile must reject ' + rejectedPaths[i]);
    }
}

export default testIo;
