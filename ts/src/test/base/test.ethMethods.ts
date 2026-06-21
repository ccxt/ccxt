

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testEthMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const privateKey = '0x27c9c557bd398e354b57ba58046b055035c47788926eb53fcdb394769ef80e1b';
    const publicKey = '0x3096cD9827766E03f8b6DF58996399406DC270Af';
    const generatedAddress = exchange.ethGetAddressFromPrivateKey (privateKey);
    assert (generatedAddress.toLowerCase () === publicKey.toLowerCase (), 'ethGetAddressFromPrivateKey did not generate the expected address: ' + generatedAddress + ' != ' + publicKey);
    // ethAbiEncode (standard ABI parameter encoding)
    const abiEncoded = exchange.binaryToBase16 (exchange.ethAbiEncode ([ 'uint256', 'address', 'bool' ], [ 12345, '0x1111111111111111111111111111111111111111', true ]));
    const abiExpected = '000000000000000000000000000000000000000000000000000000000000303900000000000000000000000011111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000000001';
    assert (abiEncoded === abiExpected, 'ethAbiEncode did not produce the expected output: ' + abiEncoded + ' != ' + abiExpected);
    // ethEncodeStructuredData (EIP-712 "0x1901" + domainSeparator + hashStruct preimage)
    const domain = {
        'chainId': 1337,
        'name': 'Exchange',
        'verifyingContract': '0x0000000000000000000000000000000000000000',
        'version': '1',
    };
    const messageTypes = {
        'Agent': [
            { 'name': 'source', 'type': 'string' },
            { 'name': 'connectionId', 'type': 'bytes32' },
        ],
    };
    const message = {
        'source': 'a',
        'connectionId': '0x7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f',
    };
    const structEncoded = exchange.binaryToBase16 (exchange.ethEncodeStructuredData (domain, messageTypes, message));
    const structExpected = '1901d79297fcdf2ffcd4ae223d01edaa2ba214ff8f401d7c9300d995d17c82aa40403bc755259b7b90cf71417495609d83ab70f4554aa2efa2efdbb76ca3a21a3a12';
    assert (structEncoded === structExpected, 'ethEncodeStructuredData did not produce the expected output: ' + structEncoded + ' != ' + structExpected);
}

export default testEthMethods;
