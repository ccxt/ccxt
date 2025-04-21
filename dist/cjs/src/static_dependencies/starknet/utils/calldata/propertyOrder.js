'use strict';

var uint256 = require('../cairoDataTypes/uint256.js');
var uint512 = require('../cairoDataTypes/uint512.js');
var cairo = require('./cairo.js');
var CairoCustomEnum = require('./enum/CairoCustomEnum.js');
var CairoOption = require('./enum/CairoOption.js');
var CairoResult = require('./enum/CairoResult.js');
var tuple = require('./tuple.js');
var shortString = require('../shortString.js');

function errorU256(key) {
    return Error(`Your object includes the property : ${key}, containing an Uint256 object without the 'low' and 'high' keys.`);
}
function errorU512(key) {
    return Error(`Your object includes the property : ${key}, containing an Uint512 object without the 'limb0' to 'limb3' keys.`);
}
function orderPropsByAbi(unorderedObject, abiOfObject, structs, enums) {
    const orderInput = (unorderedItem, abiType) => {
        if (cairo.isTypeArray(abiType)) {
            return orderArray(unorderedItem, abiType);
        }
        if (cairo.isTypeEnum(abiType, enums)) {
            const abiObj = enums[abiType];
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return orderEnum(unorderedItem, abiObj);
        }
        if (cairo.isTypeTuple(abiType)) {
            return orderTuple(unorderedItem, abiType);
        }
        if (cairo.isTypeEthAddress(abiType)) {
            return unorderedItem;
        }
        if (cairo.isTypeByteArray(abiType)) {
            return unorderedItem;
        }
        if (cairo.isTypeSecp256k1Point(abiType)) {
            return unorderedItem;
        }
        if (uint256.CairoUint256.isAbiType(abiType)) {
            const u256 = unorderedItem;
            if (typeof u256 !== 'object') {
                // BigNumberish --> just copy
                return u256;
            }
            if (!('low' in u256 && 'high' in u256)) {
                throw errorU256(abiType);
            }
            return { low: u256.low, high: u256.high };
        }
        if (uint512.CairoUint512.isAbiType(abiType)) {
            const u512 = unorderedItem;
            if (typeof u512 !== 'object') {
                // BigNumberish --> just copy
                return u512;
            }
            if (!['limb0', 'limb1', 'limb2', 'limb3'].every((key) => key in u512)) {
                throw errorU512(abiType);
            }
            return { limb0: u512.limb0, limb1: u512.limb1, limb2: u512.limb2, limb3: u512.limb3 };
        }
        if (cairo.isTypeStruct(abiType, structs)) {
            const abiOfStruct = structs[abiType].members;
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return orderStruct(unorderedItem, abiOfStruct);
        }
        // literals
        return unorderedItem;
    };
    const orderStruct = (unorderedObject2, abiObject) => {
        const orderedObject2 = abiObject.reduce((orderedObject, abiParam) => {
            const setProperty = (value) => Object.defineProperty(orderedObject, abiParam.name, {
                enumerable: true,
                value: value ?? unorderedObject2[abiParam.name],
            });
            if (unorderedObject2[abiParam.name] === 'undefined') {
                if (cairo.isCairo1Type(abiParam.type) || !cairo.isLen(abiParam.name)) {
                    throw Error(`Your object needs a property with key : ${abiParam.name} .`);
                }
            }
            setProperty(orderInput(unorderedObject2[abiParam.name], abiParam.type));
            return orderedObject;
        }, {});
        return orderedObject2;
    };
    function orderArray(myArray, abiParam) {
        const typeInArray = cairo.getArrayType(abiParam);
        if (shortString.isString(myArray)) {
            return myArray; // longstring
        }
        return myArray.map((myElem) => orderInput(myElem, typeInArray));
    }
    function orderTuple(unorderedObject2, abiParam) {
        const typeList = tuple(abiParam);
        const orderedObject2 = typeList.reduce((orderedObject, abiTypeCairoX, index) => {
            const myObjKeys = Object.keys(unorderedObject2);
            const setProperty = (value) => Object.defineProperty(orderedObject, index.toString(), {
                enumerable: true,
                value: value ?? unorderedObject2[myObjKeys[index]],
            });
            const abiType = abiTypeCairoX?.type ? abiTypeCairoX.type : abiTypeCairoX; // Named tuple, or tuple
            setProperty(orderInput(unorderedObject2[myObjKeys[index]], abiType));
            return orderedObject;
        }, {});
        return orderedObject2;
    }
    const orderEnum = (unorderedObject2, abiObject) => {
        if (cairo.isTypeResult(abiObject.name)) {
            const unorderedResult = unorderedObject2;
            const resultOkType = abiObject.name.substring(abiObject.name.indexOf('<') + 1, abiObject.name.lastIndexOf(','));
            const resultErrType = abiObject.name.substring(abiObject.name.indexOf(',') + 1, abiObject.name.lastIndexOf('>'));
            if (unorderedResult.isOk()) {
                return new CairoResult.CairoResult(CairoResult.CairoResultVariant.Ok, orderInput(unorderedObject2.unwrap(), resultOkType));
            }
            return new CairoResult.CairoResult(CairoResult.CairoResultVariant.Err, orderInput(unorderedObject2.unwrap(), resultErrType));
        }
        if (cairo.isTypeOption(abiObject.name)) {
            const unorderedOption = unorderedObject2;
            const resultSomeType = abiObject.name.substring(abiObject.name.indexOf('<') + 1, abiObject.name.lastIndexOf('>'));
            if (unorderedOption.isSome()) {
                return new CairoOption.CairoOption(CairoOption.CairoOptionVariant.Some, orderInput(unorderedOption.unwrap(), resultSomeType));
            }
            // none(())
            return new CairoOption.CairoOption(CairoOption.CairoOptionVariant.None, {});
        }
        // custom Enum
        const unorderedCustomEnum = unorderedObject2;
        const variants = Object.entries(unorderedCustomEnum.variant);
        const newEntries = variants.map((variant) => {
            if (typeof variant[1] === 'undefined') {
                return variant;
            }
            const variantType = abiObject.type.substring(abiObject.type.lastIndexOf('<') + 1, abiObject.type.lastIndexOf('>'));
            if (variantType === '()') {
                return variant;
            }
            return [variant[0], orderInput(unorderedCustomEnum.unwrap(), variantType)];
        });
        return new CairoCustomEnum.CairoCustomEnum(Object.fromEntries(newEntries));
    };
    // Order Call Parameters
    const finalOrderedObject = abiOfObject.reduce((orderedObject, abiParam) => {
        const setProperty = (value) => Object.defineProperty(orderedObject, abiParam.name, {
            enumerable: true,
            value,
        });
        if (cairo.isLen(abiParam.name) && !cairo.isCairo1Type(abiParam.type)) {
            return orderedObject;
        }
        setProperty(orderInput(unorderedObject[abiParam.name], abiParam.type));
        return orderedObject;
    }, {});
    return finalOrderedObject;
}

module.exports = orderPropsByAbi;
