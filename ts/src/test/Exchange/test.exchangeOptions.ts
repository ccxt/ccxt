
import assert from 'assert';

function testExchangeOptions (exchange, skippedProperties, method, entry) {
    testOptionsNetwoks (exchange, skippedProperties, method, entry);
}

function testOptionsNetwoks (exchange, skippedProperties, method, entry) {
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
        const collectedNetworkIds = [];
        for (let i = 0; i < networkCodes.length; i++) {
            const networkCode = networkCodes[i];
            const networkId = exchange.options['networks'][networkCode];
            assert (!exchange.inArray (networkId, collectedNetworkIds), 'exchange.options["networks"] contains multiple networkCodes with the same networkId "' + networkId + '"');
            collectedNetworkIds.push (networkId);
        }
        // 4) ensure that there are no same networkCode with different case (uppercase/lowercase)
        const collectedNetworkCodes = [];
        for (let i = 0; i < networkCodes.length; i++) {
            const networkCodeLower = (networkCodes[i]).toLowerCase ();
            assert (!exchange.inArray (networkCodeLower, collectedNetworkCodes), 'exchange.options["networks"] contains multiple networkCodes with the same networkCode "' + networkCodes[i] + '" in different uppercase/lowercase format');
            collectedNetworkCodes.push (networkCodeLower);
        }
        // 5) test networkCodeToId & networkIdToCode
        for (let i = 0; i < networkCodes.length; i++) {
            const networkCode = networkCodes[i];
            const networkId = exchange.options['networks'][networkCode];
            // check networkCodeToId
            const networkIdConverted = exchange.networkCodeToId (networkCode);
            assert (networkId === networkIdConverted, 'exchange.networkCodeToId ("' + networkCode + '")="' + networkIdConverted + '" does not match exchange.options["networks"]["' + networkCode + '"]="' + networkId + '"');
            // ensure it exists in networksById
            assert (networkId in exchange.options['networksById'], 'exchange.options["networksById"] does not contain networkId "' + networkId + '"');
            // ensure networkCode matches for networksById
            assert (exchange.options['networksById'][networkId] === networkCode, 'exchange.options["networksById"]["' + networkId + '"] value is not expected "' + networkCode + '"');
            // check networkIdToCode conversion back
            const networkCodeConverted = exchange.networkIdToCode (networkId);
            assert (networkCode === networkCodeConverted, 'exchange.networkIdToCode ("' + networkId + '")="' + networkCodeConverted + '" does not match key "' + networkCode + '" of exchange.options["networks"]');
        }
    }
}
export default testExchangeOptions;
