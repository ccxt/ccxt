

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
}

export default testEthMethods;
