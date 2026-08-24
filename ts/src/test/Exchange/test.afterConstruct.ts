import assert from 'assert';
import { Exchange } from "../../../ccxt.js";

async function testAfterConstruct (exchange: Exchange, skippedProperties: object) {
    if (!('networks' in skippedProperties)) {
        testOptionsNetworks (exchange, skippedProperties);
    }
    return true;
}

function testOptionsNetworks (exchange: Exchange, skippedProperties: object) {
    if (!('networks' in skippedProperties)) {
        // only allow these whitelisted unified networkCodes to be repeated
        const allowedUnifiedAliases = [ 'BTC', 'ERC20', 'ETH', 'TRX', 'TRC20', 'BRC20', 'CRONOS', 'CRC20', 'CRO', 'BEP20', 'BSC', 'HECO', 'HRC20', 'HT', 'OP', 'OPTIMISM', 'SOL', 'POLYGON', 'MATIC', 'CARDANO', 'ADA', 'ATOM', 'COSMOS' ];
        // safeDict, not exchange.options['networks']: a direct missing-key access throws
        // KeyError in Python (e.g. an exchange whose options has no 'networks', like the
        // hyperliquid prediction market)
        const networks = exchange.safeDict (exchange.options, 'networks');
        if (networks === undefined) {
            return;
        }
        // 1) ensure 'networks' dictionary exists in options
        assert (exchange.isDictionary (networks), 'exchange.options["networks"] is not a dict');
        if (Object.keys (networks).length === 0) {
            return;
        }
        // 2) ensure 'networksById' dictionary exists in options
        assert ('networksById' in exchange.options, 'exchange.options["networksById"] is not set');
        assert (exchange.isDictionary (exchange.options['networksById']), 'exchange.options["networksById"] is not a dict');
        //
        const networkCodes = Object.keys (exchange.options['networks']);
        // 3) ensure that the same network-id is not assigned to multiple networkCodes
        const collectedNetworkIds: string[] = [];
        for (let i = 0; i < networkCodes.length; i++) {
            const networkCode = networkCodes[i];
            const networkId = exchange.options['networks'][networkCode];
            if (!exchange.inArray (networkCode, allowedUnifiedAliases)) {
                assert (!exchange.inArray (networkId, collectedNetworkIds), 'exchange.options["networks"] should not contain multiple non-unified networkCodes (in the list of unified-networks) with the same networkId: "' + networkId + '"');
            }
            collectedNetworkIds.push (networkId);
        }
        // 4) ensure that there are no same networkCode with different case (uppercase/lowercase)
        const collectedNetworkCodes: string[] = [];
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
            // ensure networkCode matches for networksById (however, it only works if one mapping is set)
            if (!exchange.inArray (networkCode, allowedUnifiedAliases)) {
                assert (exchange.options['networksById'][networkId] === networkCode, 'exchange.options["networksById"]["' + networkId + '"] value is not expected "' + networkCode + '", but: "' + exchange.options['networksById'][networkId] + '"');
                // check networkIdToCode conversion back
                const networkCodeConverted = exchange.networkIdToCode (networkId);
                assert (networkCode === networkCodeConverted, 'exchange.networkIdToCode ("' + networkId + '")="' + networkCodeConverted + '" does not match key "' + networkCode + '" of exchange.options["networks"]');
            }
        }
    }
}

export default testAfterConstruct;
