import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testSharedMethods from './base/test.sharedMethods.js';

async function testFeatures (exchange: Exchange, skippedProperties: object) {
    const marketTypes = [ 'spot', 'swap', 'future' ];
    const subTypes = [ 'linear', 'swap' ];
    const features = exchange.features;
    if (features !== undefined) {
        const keys = Object.keys (features);
        for (let i = 0; i < keys.length; i++) {
            testSharedMethods.assertInArray (exchange, skippedProperties, 'features', keys, i, marketTypes);
            const marketType = keys[i];
            const value = features[marketType];
            assert (value !== undefined, 'exchange.features["' + marketType + '"] is undefined, that key should be either absent or have a value');
            if (marketType === 'spot') {
                testFeaturesInner (exchange, skippedProperties, 'features', value);
            } else {
                const subKeys = Object.keys (value);
                for (let j = 0; j < subKeys.length; j++) {
                    const subKey = subKeys[j];
                    testSharedMethods.assertInArray (exchange, skippedProperties, 'features', subKeys, j, subTypes);
                    const subValue = value[subKey];
                    testFeaturesInner (exchange, skippedProperties, 'features', subValue);
                }
            }
        }
    }
}

function testFeaturesInner (exchange: Exchange, skippedProperties: object, methodName: string, value: any) {
    const featureKeys = Object.keys (value);
    const allMethods = Object.keys (exchange.has);
    for (let i = 0; i < featureKeys.length; i++) {
        const methodName = featureKeys[i];
        testSharedMethods.assertInArray (exchange, skippedProperties, 'features', featureKeys, i, allMethods);
        if (methodName !== 'sandbox') {
            const methodValue = value[methodName];
            assert (typeof methodValue === 'object', 'exchange.features["' + methodName + '"] should be a dict');
        }
    }
}

export default testFeatures;
