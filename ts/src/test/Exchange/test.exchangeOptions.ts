
import assert from 'assert';

function testExchangeOptions (exchange, skippedProperties, method, entry) {
    // as networks are related to currencies, let's check them here (todo: move to a separate test in future)
    if (!('networks' in skippedProperties)) {
        //
        // check "options['networks']"
        // 1) ensure 'networks' dictionary exists in options
        assert ('networks' in exchange.options, 'exchange.options["networks"] is not set');
        assert (typeof exchange.options['networks'] === 'object', 'exchange.options["networks"] is not an object');
        // 2) ensure 'networksById' dictionary exists in options
        assert ('networksById' in exchange.options, 'exchange.options["networksById"] is not set');
        assert (typeof exchange.options['networksById'] === 'object', 'exchange.options["networksById"] is not an object');
        //
        const networkCodes = Object.keys (exchange.options['networks']);
        // 3) ensure that there same network-id is not assigned to multiple networkCodes
        const networkIdsArray = [];
        for (let i = 0; i < networkCodes.length; i++) {
            const networkCode = networkCodes[i];
            const networkId = exchange.options['networks'][networkCode];
            assert (!exchange.inArray (networkId, networkIdsArray), 'exchange.options["networks"] contains multiple networkCodes with the same networkId "' + networkId + '"');
            networkIdsArray.push (networkId);
        }
        // 4) ensure that there are no same networkCode with different case (uppercase/lowercase)
        const networkCodesArray = [];
        for (let i = 0; i < networkCodes.length; i++) {
            const networkCodeLower = (networkCodes[i]).toLowerCase ();
            assert (!exchange.inArray (networkCodeLower, networkCodesArray), 'exchange.options["networks"] contains multiple networkCodes with the same networkCode "' + networkCodes[i] + '" in different uppercase/lowercase format');
            networkCodesArray.push (networkCodeLower);
        }

    }
}

export default testExchangeOptions;
