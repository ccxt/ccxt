'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../../../_virtual/_commonjsHelpers.js');
var require$$0 = require('protobufjs/minimal');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

var $protobuf = require$$0__default["default"];
// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
$root.PrivateAccountV3Api = (function () {
    /**
     * Properties of a PrivateAccountV3Api.
     * @exports IPrivateAccountV3Api
     * @interface IPrivateAccountV3Api
     * @property {string|null} [vcoinName] PrivateAccountV3Api vcoinName
     * @property {string|null} [coinId] PrivateAccountV3Api coinId
     * @property {string|null} [balanceAmount] PrivateAccountV3Api balanceAmount
     * @property {string|null} [balanceAmountChange] PrivateAccountV3Api balanceAmountChange
     * @property {string|null} [frozenAmount] PrivateAccountV3Api frozenAmount
     * @property {string|null} [frozenAmountChange] PrivateAccountV3Api frozenAmountChange
     * @property {string|null} [type] PrivateAccountV3Api type
     * @property {number|Long|null} [time] PrivateAccountV3Api time
     */
    /**
     * Constructs a new PrivateAccountV3Api.
     * @exports PrivateAccountV3Api
     * @classdesc Represents a PrivateAccountV3Api.
     * @implements IPrivateAccountV3Api
     * @constructor
     * @param {IPrivateAccountV3Api=} [properties] Properties to set
     */
    function PrivateAccountV3Api(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PrivateAccountV3Api vcoinName.
     * @member {string} vcoinName
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.vcoinName = "";
    /**
     * PrivateAccountV3Api coinId.
     * @member {string} coinId
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.coinId = "";
    /**
     * PrivateAccountV3Api balanceAmount.
     * @member {string} balanceAmount
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.balanceAmount = "";
    /**
     * PrivateAccountV3Api balanceAmountChange.
     * @member {string} balanceAmountChange
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.balanceAmountChange = "";
    /**
     * PrivateAccountV3Api frozenAmount.
     * @member {string} frozenAmount
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.frozenAmount = "";
    /**
     * PrivateAccountV3Api frozenAmountChange.
     * @member {string} frozenAmountChange
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.frozenAmountChange = "";
    /**
     * PrivateAccountV3Api type.
     * @member {string} type
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.type = "";
    /**
     * PrivateAccountV3Api time.
     * @member {number|Long} time
     * @memberof PrivateAccountV3Api
     * @instance
     */
    PrivateAccountV3Api.prototype.time = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    /**
     * Creates a new PrivateAccountV3Api instance using the specified properties.
     * @function create
     * @memberof PrivateAccountV3Api
     * @static
     * @param {IPrivateAccountV3Api=} [properties] Properties to set
     * @returns {PrivateAccountV3Api} PrivateAccountV3Api instance
     */
    PrivateAccountV3Api.create = function create(properties) {
        return new PrivateAccountV3Api(properties);
    };
    /**
     * Encodes the specified PrivateAccountV3Api message. Does not implicitly {@link PrivateAccountV3Api.verify|verify} messages.
     * @function encode
     * @memberof PrivateAccountV3Api
     * @static
     * @param {IPrivateAccountV3Api} message PrivateAccountV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrivateAccountV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.vcoinName != null && Object.hasOwnProperty.call(message, "vcoinName"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.vcoinName);
        if (message.coinId != null && Object.hasOwnProperty.call(message, "coinId"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.coinId);
        if (message.balanceAmount != null && Object.hasOwnProperty.call(message, "balanceAmount"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.balanceAmount);
        if (message.balanceAmountChange != null && Object.hasOwnProperty.call(message, "balanceAmountChange"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.balanceAmountChange);
        if (message.frozenAmount != null && Object.hasOwnProperty.call(message, "frozenAmount"))
            writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.frozenAmount);
        if (message.frozenAmountChange != null && Object.hasOwnProperty.call(message, "frozenAmountChange"))
            writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.frozenAmountChange);
        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
            writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.type);
        if (message.time != null && Object.hasOwnProperty.call(message, "time"))
            writer.uint32(/* id 8, wireType 0 =*/ 64).int64(message.time);
        return writer;
    };
    /**
     * Encodes the specified PrivateAccountV3Api message, length delimited. Does not implicitly {@link PrivateAccountV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PrivateAccountV3Api
     * @static
     * @param {IPrivateAccountV3Api} message PrivateAccountV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrivateAccountV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PrivateAccountV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PrivateAccountV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PrivateAccountV3Api} PrivateAccountV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrivateAccountV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrivateAccountV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.vcoinName = reader.string();
                    break;
                }
                case 2: {
                    message.coinId = reader.string();
                    break;
                }
                case 3: {
                    message.balanceAmount = reader.string();
                    break;
                }
                case 4: {
                    message.balanceAmountChange = reader.string();
                    break;
                }
                case 5: {
                    message.frozenAmount = reader.string();
                    break;
                }
                case 6: {
                    message.frozenAmountChange = reader.string();
                    break;
                }
                case 7: {
                    message.type = reader.string();
                    break;
                }
                case 8: {
                    message.time = reader.int64();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PrivateAccountV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PrivateAccountV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PrivateAccountV3Api} PrivateAccountV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrivateAccountV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PrivateAccountV3Api message.
     * @function verify
     * @memberof PrivateAccountV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PrivateAccountV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.vcoinName != null && message.hasOwnProperty("vcoinName"))
            if (!$util.isString(message.vcoinName))
                return "vcoinName: string expected";
        if (message.coinId != null && message.hasOwnProperty("coinId"))
            if (!$util.isString(message.coinId))
                return "coinId: string expected";
        if (message.balanceAmount != null && message.hasOwnProperty("balanceAmount"))
            if (!$util.isString(message.balanceAmount))
                return "balanceAmount: string expected";
        if (message.balanceAmountChange != null && message.hasOwnProperty("balanceAmountChange"))
            if (!$util.isString(message.balanceAmountChange))
                return "balanceAmountChange: string expected";
        if (message.frozenAmount != null && message.hasOwnProperty("frozenAmount"))
            if (!$util.isString(message.frozenAmount))
                return "frozenAmount: string expected";
        if (message.frozenAmountChange != null && message.hasOwnProperty("frozenAmountChange"))
            if (!$util.isString(message.frozenAmountChange))
                return "frozenAmountChange: string expected";
        if (message.type != null && message.hasOwnProperty("type"))
            if (!$util.isString(message.type))
                return "type: string expected";
        if (message.time != null && message.hasOwnProperty("time"))
            if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                return "time: integer|Long expected";
        return null;
    };
    /**
     * Creates a PrivateAccountV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PrivateAccountV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PrivateAccountV3Api} PrivateAccountV3Api
     */
    PrivateAccountV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PrivateAccountV3Api)
            return object;
        var message = new $root.PrivateAccountV3Api();
        if (object.vcoinName != null)
            message.vcoinName = String(object.vcoinName);
        if (object.coinId != null)
            message.coinId = String(object.coinId);
        if (object.balanceAmount != null)
            message.balanceAmount = String(object.balanceAmount);
        if (object.balanceAmountChange != null)
            message.balanceAmountChange = String(object.balanceAmountChange);
        if (object.frozenAmount != null)
            message.frozenAmount = String(object.frozenAmount);
        if (object.frozenAmountChange != null)
            message.frozenAmountChange = String(object.frozenAmountChange);
        if (object.type != null)
            message.type = String(object.type);
        if (object.time != null)
            if ($util.Long)
                (message.time = $util.Long.fromValue(object.time)).unsigned = false;
            else if (typeof object.time === "string")
                message.time = parseInt(object.time, 10);
            else if (typeof object.time === "number")
                message.time = object.time;
            else if (typeof object.time === "object")
                message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
        return message;
    };
    /**
     * Creates a plain object from a PrivateAccountV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PrivateAccountV3Api
     * @static
     * @param {PrivateAccountV3Api} message PrivateAccountV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PrivateAccountV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.vcoinName = "";
            object.coinId = "";
            object.balanceAmount = "";
            object.balanceAmountChange = "";
            object.frozenAmount = "";
            object.frozenAmountChange = "";
            object.type = "";
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            }
            else
                object.time = options.longs === String ? "0" : 0;
        }
        if (message.vcoinName != null && message.hasOwnProperty("vcoinName"))
            object.vcoinName = message.vcoinName;
        if (message.coinId != null && message.hasOwnProperty("coinId"))
            object.coinId = message.coinId;
        if (message.balanceAmount != null && message.hasOwnProperty("balanceAmount"))
            object.balanceAmount = message.balanceAmount;
        if (message.balanceAmountChange != null && message.hasOwnProperty("balanceAmountChange"))
            object.balanceAmountChange = message.balanceAmountChange;
        if (message.frozenAmount != null && message.hasOwnProperty("frozenAmount"))
            object.frozenAmount = message.frozenAmount;
        if (message.frozenAmountChange != null && message.hasOwnProperty("frozenAmountChange"))
            object.frozenAmountChange = message.frozenAmountChange;
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = message.type;
        if (message.time != null && message.hasOwnProperty("time"))
            if (typeof message.time === "number")
                object.time = options.longs === String ? String(message.time) : message.time;
            else
                object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
        return object;
    };
    /**
     * Converts this PrivateAccountV3Api to JSON.
     * @function toJSON
     * @memberof PrivateAccountV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PrivateAccountV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PrivateAccountV3Api
     * @function getTypeUrl
     * @memberof PrivateAccountV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PrivateAccountV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PrivateAccountV3Api";
    };
    return PrivateAccountV3Api;
})();
$root.PrivateDealsV3Api = (function () {
    /**
     * Properties of a PrivateDealsV3Api.
     * @exports IPrivateDealsV3Api
     * @interface IPrivateDealsV3Api
     * @property {string|null} [price] PrivateDealsV3Api price
     * @property {string|null} [quantity] PrivateDealsV3Api quantity
     * @property {string|null} [amount] PrivateDealsV3Api amount
     * @property {number|null} [tradeType] PrivateDealsV3Api tradeType
     * @property {boolean|null} [isMaker] PrivateDealsV3Api isMaker
     * @property {boolean|null} [isSelfTrade] PrivateDealsV3Api isSelfTrade
     * @property {string|null} [tradeId] PrivateDealsV3Api tradeId
     * @property {string|null} [clientOrderId] PrivateDealsV3Api clientOrderId
     * @property {string|null} [orderId] PrivateDealsV3Api orderId
     * @property {string|null} [feeAmount] PrivateDealsV3Api feeAmount
     * @property {string|null} [feeCurrency] PrivateDealsV3Api feeCurrency
     * @property {number|Long|null} [time] PrivateDealsV3Api time
     */
    /**
     * Constructs a new PrivateDealsV3Api.
     * @exports PrivateDealsV3Api
     * @classdesc Represents a PrivateDealsV3Api.
     * @implements IPrivateDealsV3Api
     * @constructor
     * @param {IPrivateDealsV3Api=} [properties] Properties to set
     */
    function PrivateDealsV3Api(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PrivateDealsV3Api price.
     * @member {string} price
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.price = "";
    /**
     * PrivateDealsV3Api quantity.
     * @member {string} quantity
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.quantity = "";
    /**
     * PrivateDealsV3Api amount.
     * @member {string} amount
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.amount = "";
    /**
     * PrivateDealsV3Api tradeType.
     * @member {number} tradeType
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.tradeType = 0;
    /**
     * PrivateDealsV3Api isMaker.
     * @member {boolean} isMaker
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.isMaker = false;
    /**
     * PrivateDealsV3Api isSelfTrade.
     * @member {boolean} isSelfTrade
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.isSelfTrade = false;
    /**
     * PrivateDealsV3Api tradeId.
     * @member {string} tradeId
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.tradeId = "";
    /**
     * PrivateDealsV3Api clientOrderId.
     * @member {string} clientOrderId
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.clientOrderId = "";
    /**
     * PrivateDealsV3Api orderId.
     * @member {string} orderId
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.orderId = "";
    /**
     * PrivateDealsV3Api feeAmount.
     * @member {string} feeAmount
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.feeAmount = "";
    /**
     * PrivateDealsV3Api feeCurrency.
     * @member {string} feeCurrency
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.feeCurrency = "";
    /**
     * PrivateDealsV3Api time.
     * @member {number|Long} time
     * @memberof PrivateDealsV3Api
     * @instance
     */
    PrivateDealsV3Api.prototype.time = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    /**
     * Creates a new PrivateDealsV3Api instance using the specified properties.
     * @function create
     * @memberof PrivateDealsV3Api
     * @static
     * @param {IPrivateDealsV3Api=} [properties] Properties to set
     * @returns {PrivateDealsV3Api} PrivateDealsV3Api instance
     */
    PrivateDealsV3Api.create = function create(properties) {
        return new PrivateDealsV3Api(properties);
    };
    /**
     * Encodes the specified PrivateDealsV3Api message. Does not implicitly {@link PrivateDealsV3Api.verify|verify} messages.
     * @function encode
     * @memberof PrivateDealsV3Api
     * @static
     * @param {IPrivateDealsV3Api} message PrivateDealsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrivateDealsV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.price);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.quantity);
        if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.amount);
        if (message.tradeType != null && Object.hasOwnProperty.call(message, "tradeType"))
            writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.tradeType);
        if (message.isMaker != null && Object.hasOwnProperty.call(message, "isMaker"))
            writer.uint32(/* id 5, wireType 0 =*/ 40).bool(message.isMaker);
        if (message.isSelfTrade != null && Object.hasOwnProperty.call(message, "isSelfTrade"))
            writer.uint32(/* id 6, wireType 0 =*/ 48).bool(message.isSelfTrade);
        if (message.tradeId != null && Object.hasOwnProperty.call(message, "tradeId"))
            writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.tradeId);
        if (message.clientOrderId != null && Object.hasOwnProperty.call(message, "clientOrderId"))
            writer.uint32(/* id 8, wireType 2 =*/ 66).string(message.clientOrderId);
        if (message.orderId != null && Object.hasOwnProperty.call(message, "orderId"))
            writer.uint32(/* id 9, wireType 2 =*/ 74).string(message.orderId);
        if (message.feeAmount != null && Object.hasOwnProperty.call(message, "feeAmount"))
            writer.uint32(/* id 10, wireType 2 =*/ 82).string(message.feeAmount);
        if (message.feeCurrency != null && Object.hasOwnProperty.call(message, "feeCurrency"))
            writer.uint32(/* id 11, wireType 2 =*/ 90).string(message.feeCurrency);
        if (message.time != null && Object.hasOwnProperty.call(message, "time"))
            writer.uint32(/* id 12, wireType 0 =*/ 96).int64(message.time);
        return writer;
    };
    /**
     * Encodes the specified PrivateDealsV3Api message, length delimited. Does not implicitly {@link PrivateDealsV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PrivateDealsV3Api
     * @static
     * @param {IPrivateDealsV3Api} message PrivateDealsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrivateDealsV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PrivateDealsV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PrivateDealsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PrivateDealsV3Api} PrivateDealsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrivateDealsV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrivateDealsV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.price = reader.string();
                    break;
                }
                case 2: {
                    message.quantity = reader.string();
                    break;
                }
                case 3: {
                    message.amount = reader.string();
                    break;
                }
                case 4: {
                    message.tradeType = reader.int32();
                    break;
                }
                case 5: {
                    message.isMaker = reader.bool();
                    break;
                }
                case 6: {
                    message.isSelfTrade = reader.bool();
                    break;
                }
                case 7: {
                    message.tradeId = reader.string();
                    break;
                }
                case 8: {
                    message.clientOrderId = reader.string();
                    break;
                }
                case 9: {
                    message.orderId = reader.string();
                    break;
                }
                case 10: {
                    message.feeAmount = reader.string();
                    break;
                }
                case 11: {
                    message.feeCurrency = reader.string();
                    break;
                }
                case 12: {
                    message.time = reader.int64();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PrivateDealsV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PrivateDealsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PrivateDealsV3Api} PrivateDealsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrivateDealsV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PrivateDealsV3Api message.
     * @function verify
     * @memberof PrivateDealsV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PrivateDealsV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        if (message.amount != null && message.hasOwnProperty("amount"))
            if (!$util.isString(message.amount))
                return "amount: string expected";
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            if (!$util.isInteger(message.tradeType))
                return "tradeType: integer expected";
        if (message.isMaker != null && message.hasOwnProperty("isMaker"))
            if (typeof message.isMaker !== "boolean")
                return "isMaker: boolean expected";
        if (message.isSelfTrade != null && message.hasOwnProperty("isSelfTrade"))
            if (typeof message.isSelfTrade !== "boolean")
                return "isSelfTrade: boolean expected";
        if (message.tradeId != null && message.hasOwnProperty("tradeId"))
            if (!$util.isString(message.tradeId))
                return "tradeId: string expected";
        if (message.clientOrderId != null && message.hasOwnProperty("clientOrderId"))
            if (!$util.isString(message.clientOrderId))
                return "clientOrderId: string expected";
        if (message.orderId != null && message.hasOwnProperty("orderId"))
            if (!$util.isString(message.orderId))
                return "orderId: string expected";
        if (message.feeAmount != null && message.hasOwnProperty("feeAmount"))
            if (!$util.isString(message.feeAmount))
                return "feeAmount: string expected";
        if (message.feeCurrency != null && message.hasOwnProperty("feeCurrency"))
            if (!$util.isString(message.feeCurrency))
                return "feeCurrency: string expected";
        if (message.time != null && message.hasOwnProperty("time"))
            if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                return "time: integer|Long expected";
        return null;
    };
    /**
     * Creates a PrivateDealsV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PrivateDealsV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PrivateDealsV3Api} PrivateDealsV3Api
     */
    PrivateDealsV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PrivateDealsV3Api)
            return object;
        var message = new $root.PrivateDealsV3Api();
        if (object.price != null)
            message.price = String(object.price);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        if (object.amount != null)
            message.amount = String(object.amount);
        if (object.tradeType != null)
            message.tradeType = object.tradeType | 0;
        if (object.isMaker != null)
            message.isMaker = Boolean(object.isMaker);
        if (object.isSelfTrade != null)
            message.isSelfTrade = Boolean(object.isSelfTrade);
        if (object.tradeId != null)
            message.tradeId = String(object.tradeId);
        if (object.clientOrderId != null)
            message.clientOrderId = String(object.clientOrderId);
        if (object.orderId != null)
            message.orderId = String(object.orderId);
        if (object.feeAmount != null)
            message.feeAmount = String(object.feeAmount);
        if (object.feeCurrency != null)
            message.feeCurrency = String(object.feeCurrency);
        if (object.time != null)
            if ($util.Long)
                (message.time = $util.Long.fromValue(object.time)).unsigned = false;
            else if (typeof object.time === "string")
                message.time = parseInt(object.time, 10);
            else if (typeof object.time === "number")
                message.time = object.time;
            else if (typeof object.time === "object")
                message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
        return message;
    };
    /**
     * Creates a plain object from a PrivateDealsV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PrivateDealsV3Api
     * @static
     * @param {PrivateDealsV3Api} message PrivateDealsV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PrivateDealsV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.price = "";
            object.quantity = "";
            object.amount = "";
            object.tradeType = 0;
            object.isMaker = false;
            object.isSelfTrade = false;
            object.tradeId = "";
            object.clientOrderId = "";
            object.orderId = "";
            object.feeAmount = "";
            object.feeCurrency = "";
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            }
            else
                object.time = options.longs === String ? "0" : 0;
        }
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        if (message.amount != null && message.hasOwnProperty("amount"))
            object.amount = message.amount;
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            object.tradeType = message.tradeType;
        if (message.isMaker != null && message.hasOwnProperty("isMaker"))
            object.isMaker = message.isMaker;
        if (message.isSelfTrade != null && message.hasOwnProperty("isSelfTrade"))
            object.isSelfTrade = message.isSelfTrade;
        if (message.tradeId != null && message.hasOwnProperty("tradeId"))
            object.tradeId = message.tradeId;
        if (message.clientOrderId != null && message.hasOwnProperty("clientOrderId"))
            object.clientOrderId = message.clientOrderId;
        if (message.orderId != null && message.hasOwnProperty("orderId"))
            object.orderId = message.orderId;
        if (message.feeAmount != null && message.hasOwnProperty("feeAmount"))
            object.feeAmount = message.feeAmount;
        if (message.feeCurrency != null && message.hasOwnProperty("feeCurrency"))
            object.feeCurrency = message.feeCurrency;
        if (message.time != null && message.hasOwnProperty("time"))
            if (typeof message.time === "number")
                object.time = options.longs === String ? String(message.time) : message.time;
            else
                object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
        return object;
    };
    /**
     * Converts this PrivateDealsV3Api to JSON.
     * @function toJSON
     * @memberof PrivateDealsV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PrivateDealsV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PrivateDealsV3Api
     * @function getTypeUrl
     * @memberof PrivateDealsV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PrivateDealsV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PrivateDealsV3Api";
    };
    return PrivateDealsV3Api;
})();
$root.PrivateOrdersV3Api = (function () {
    /**
     * Properties of a PrivateOrdersV3Api.
     * @exports IPrivateOrdersV3Api
     * @interface IPrivateOrdersV3Api
     * @property {string|null} [id] PrivateOrdersV3Api id
     * @property {string|null} [clientId] PrivateOrdersV3Api clientId
     * @property {string|null} [price] PrivateOrdersV3Api price
     * @property {string|null} [quantity] PrivateOrdersV3Api quantity
     * @property {string|null} [amount] PrivateOrdersV3Api amount
     * @property {string|null} [avgPrice] PrivateOrdersV3Api avgPrice
     * @property {number|null} [orderType] PrivateOrdersV3Api orderType
     * @property {number|null} [tradeType] PrivateOrdersV3Api tradeType
     * @property {boolean|null} [isMaker] PrivateOrdersV3Api isMaker
     * @property {string|null} [remainAmount] PrivateOrdersV3Api remainAmount
     * @property {string|null} [remainQuantity] PrivateOrdersV3Api remainQuantity
     * @property {string|null} [lastDealQuantity] PrivateOrdersV3Api lastDealQuantity
     * @property {string|null} [cumulativeQuantity] PrivateOrdersV3Api cumulativeQuantity
     * @property {string|null} [cumulativeAmount] PrivateOrdersV3Api cumulativeAmount
     * @property {number|null} [status] PrivateOrdersV3Api status
     * @property {number|Long|null} [createTime] PrivateOrdersV3Api createTime
     * @property {string|null} [market] PrivateOrdersV3Api market
     * @property {number|null} [triggerType] PrivateOrdersV3Api triggerType
     * @property {string|null} [triggerPrice] PrivateOrdersV3Api triggerPrice
     * @property {number|null} [state] PrivateOrdersV3Api state
     * @property {string|null} [ocoId] PrivateOrdersV3Api ocoId
     * @property {string|null} [routeFactor] PrivateOrdersV3Api routeFactor
     * @property {string|null} [symbolId] PrivateOrdersV3Api symbolId
     * @property {string|null} [marketId] PrivateOrdersV3Api marketId
     * @property {string|null} [marketCurrencyId] PrivateOrdersV3Api marketCurrencyId
     * @property {string|null} [currencyId] PrivateOrdersV3Api currencyId
     */
    /**
     * Constructs a new PrivateOrdersV3Api.
     * @exports PrivateOrdersV3Api
     * @classdesc Represents a PrivateOrdersV3Api.
     * @implements IPrivateOrdersV3Api
     * @constructor
     * @param {IPrivateOrdersV3Api=} [properties] Properties to set
     */
    function PrivateOrdersV3Api(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PrivateOrdersV3Api id.
     * @member {string} id
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.id = "";
    /**
     * PrivateOrdersV3Api clientId.
     * @member {string} clientId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.clientId = "";
    /**
     * PrivateOrdersV3Api price.
     * @member {string} price
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.price = "";
    /**
     * PrivateOrdersV3Api quantity.
     * @member {string} quantity
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.quantity = "";
    /**
     * PrivateOrdersV3Api amount.
     * @member {string} amount
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.amount = "";
    /**
     * PrivateOrdersV3Api avgPrice.
     * @member {string} avgPrice
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.avgPrice = "";
    /**
     * PrivateOrdersV3Api orderType.
     * @member {number} orderType
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.orderType = 0;
    /**
     * PrivateOrdersV3Api tradeType.
     * @member {number} tradeType
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.tradeType = 0;
    /**
     * PrivateOrdersV3Api isMaker.
     * @member {boolean} isMaker
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.isMaker = false;
    /**
     * PrivateOrdersV3Api remainAmount.
     * @member {string} remainAmount
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.remainAmount = "";
    /**
     * PrivateOrdersV3Api remainQuantity.
     * @member {string} remainQuantity
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.remainQuantity = "";
    /**
     * PrivateOrdersV3Api lastDealQuantity.
     * @member {string|null|undefined} lastDealQuantity
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.lastDealQuantity = null;
    /**
     * PrivateOrdersV3Api cumulativeQuantity.
     * @member {string} cumulativeQuantity
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.cumulativeQuantity = "";
    /**
     * PrivateOrdersV3Api cumulativeAmount.
     * @member {string} cumulativeAmount
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.cumulativeAmount = "";
    /**
     * PrivateOrdersV3Api status.
     * @member {number} status
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.status = 0;
    /**
     * PrivateOrdersV3Api createTime.
     * @member {number|Long} createTime
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.createTime = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    /**
     * PrivateOrdersV3Api market.
     * @member {string|null|undefined} market
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.market = null;
    /**
     * PrivateOrdersV3Api triggerType.
     * @member {number|null|undefined} triggerType
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.triggerType = null;
    /**
     * PrivateOrdersV3Api triggerPrice.
     * @member {string|null|undefined} triggerPrice
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.triggerPrice = null;
    /**
     * PrivateOrdersV3Api state.
     * @member {number|null|undefined} state
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.state = null;
    /**
     * PrivateOrdersV3Api ocoId.
     * @member {string|null|undefined} ocoId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.ocoId = null;
    /**
     * PrivateOrdersV3Api routeFactor.
     * @member {string|null|undefined} routeFactor
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.routeFactor = null;
    /**
     * PrivateOrdersV3Api symbolId.
     * @member {string|null|undefined} symbolId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.symbolId = null;
    /**
     * PrivateOrdersV3Api marketId.
     * @member {string|null|undefined} marketId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.marketId = null;
    /**
     * PrivateOrdersV3Api marketCurrencyId.
     * @member {string|null|undefined} marketCurrencyId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.marketCurrencyId = null;
    /**
     * PrivateOrdersV3Api currencyId.
     * @member {string|null|undefined} currencyId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    PrivateOrdersV3Api.prototype.currencyId = null;
    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;
    /**
     * PrivateOrdersV3Api _lastDealQuantity.
     * @member {"lastDealQuantity"|undefined} _lastDealQuantity
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_lastDealQuantity", {
        get: $util.oneOfGetter($oneOfFields = ["lastDealQuantity"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _market.
     * @member {"market"|undefined} _market
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_market", {
        get: $util.oneOfGetter($oneOfFields = ["market"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _triggerType.
     * @member {"triggerType"|undefined} _triggerType
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_triggerType", {
        get: $util.oneOfGetter($oneOfFields = ["triggerType"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _triggerPrice.
     * @member {"triggerPrice"|undefined} _triggerPrice
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_triggerPrice", {
        get: $util.oneOfGetter($oneOfFields = ["triggerPrice"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _state.
     * @member {"state"|undefined} _state
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_state", {
        get: $util.oneOfGetter($oneOfFields = ["state"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _ocoId.
     * @member {"ocoId"|undefined} _ocoId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_ocoId", {
        get: $util.oneOfGetter($oneOfFields = ["ocoId"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _routeFactor.
     * @member {"routeFactor"|undefined} _routeFactor
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_routeFactor", {
        get: $util.oneOfGetter($oneOfFields = ["routeFactor"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _symbolId.
     * @member {"symbolId"|undefined} _symbolId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_symbolId", {
        get: $util.oneOfGetter($oneOfFields = ["symbolId"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _marketId.
     * @member {"marketId"|undefined} _marketId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_marketId", {
        get: $util.oneOfGetter($oneOfFields = ["marketId"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _marketCurrencyId.
     * @member {"marketCurrencyId"|undefined} _marketCurrencyId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_marketCurrencyId", {
        get: $util.oneOfGetter($oneOfFields = ["marketCurrencyId"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PrivateOrdersV3Api _currencyId.
     * @member {"currencyId"|undefined} _currencyId
     * @memberof PrivateOrdersV3Api
     * @instance
     */
    Object.defineProperty(PrivateOrdersV3Api.prototype, "_currencyId", {
        get: $util.oneOfGetter($oneOfFields = ["currencyId"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * Creates a new PrivateOrdersV3Api instance using the specified properties.
     * @function create
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {IPrivateOrdersV3Api=} [properties] Properties to set
     * @returns {PrivateOrdersV3Api} PrivateOrdersV3Api instance
     */
    PrivateOrdersV3Api.create = function create(properties) {
        return new PrivateOrdersV3Api(properties);
    };
    /**
     * Encodes the specified PrivateOrdersV3Api message. Does not implicitly {@link PrivateOrdersV3Api.verify|verify} messages.
     * @function encode
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {IPrivateOrdersV3Api} message PrivateOrdersV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrivateOrdersV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.id);
        if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.clientId);
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.price);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.quantity);
        if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
            writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.amount);
        if (message.avgPrice != null && Object.hasOwnProperty.call(message, "avgPrice"))
            writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.avgPrice);
        if (message.orderType != null && Object.hasOwnProperty.call(message, "orderType"))
            writer.uint32(/* id 7, wireType 0 =*/ 56).int32(message.orderType);
        if (message.tradeType != null && Object.hasOwnProperty.call(message, "tradeType"))
            writer.uint32(/* id 8, wireType 0 =*/ 64).int32(message.tradeType);
        if (message.isMaker != null && Object.hasOwnProperty.call(message, "isMaker"))
            writer.uint32(/* id 9, wireType 0 =*/ 72).bool(message.isMaker);
        if (message.remainAmount != null && Object.hasOwnProperty.call(message, "remainAmount"))
            writer.uint32(/* id 10, wireType 2 =*/ 82).string(message.remainAmount);
        if (message.remainQuantity != null && Object.hasOwnProperty.call(message, "remainQuantity"))
            writer.uint32(/* id 11, wireType 2 =*/ 90).string(message.remainQuantity);
        if (message.lastDealQuantity != null && Object.hasOwnProperty.call(message, "lastDealQuantity"))
            writer.uint32(/* id 12, wireType 2 =*/ 98).string(message.lastDealQuantity);
        if (message.cumulativeQuantity != null && Object.hasOwnProperty.call(message, "cumulativeQuantity"))
            writer.uint32(/* id 13, wireType 2 =*/ 106).string(message.cumulativeQuantity);
        if (message.cumulativeAmount != null && Object.hasOwnProperty.call(message, "cumulativeAmount"))
            writer.uint32(/* id 14, wireType 2 =*/ 114).string(message.cumulativeAmount);
        if (message.status != null && Object.hasOwnProperty.call(message, "status"))
            writer.uint32(/* id 15, wireType 0 =*/ 120).int32(message.status);
        if (message.createTime != null && Object.hasOwnProperty.call(message, "createTime"))
            writer.uint32(/* id 16, wireType 0 =*/ 128).int64(message.createTime);
        if (message.market != null && Object.hasOwnProperty.call(message, "market"))
            writer.uint32(/* id 17, wireType 2 =*/ 138).string(message.market);
        if (message.triggerType != null && Object.hasOwnProperty.call(message, "triggerType"))
            writer.uint32(/* id 18, wireType 0 =*/ 144).int32(message.triggerType);
        if (message.triggerPrice != null && Object.hasOwnProperty.call(message, "triggerPrice"))
            writer.uint32(/* id 19, wireType 2 =*/ 154).string(message.triggerPrice);
        if (message.state != null && Object.hasOwnProperty.call(message, "state"))
            writer.uint32(/* id 20, wireType 0 =*/ 160).int32(message.state);
        if (message.ocoId != null && Object.hasOwnProperty.call(message, "ocoId"))
            writer.uint32(/* id 21, wireType 2 =*/ 170).string(message.ocoId);
        if (message.routeFactor != null && Object.hasOwnProperty.call(message, "routeFactor"))
            writer.uint32(/* id 22, wireType 2 =*/ 178).string(message.routeFactor);
        if (message.symbolId != null && Object.hasOwnProperty.call(message, "symbolId"))
            writer.uint32(/* id 23, wireType 2 =*/ 186).string(message.symbolId);
        if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
            writer.uint32(/* id 24, wireType 2 =*/ 194).string(message.marketId);
        if (message.marketCurrencyId != null && Object.hasOwnProperty.call(message, "marketCurrencyId"))
            writer.uint32(/* id 25, wireType 2 =*/ 202).string(message.marketCurrencyId);
        if (message.currencyId != null && Object.hasOwnProperty.call(message, "currencyId"))
            writer.uint32(/* id 26, wireType 2 =*/ 210).string(message.currencyId);
        return writer;
    };
    /**
     * Encodes the specified PrivateOrdersV3Api message, length delimited. Does not implicitly {@link PrivateOrdersV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {IPrivateOrdersV3Api} message PrivateOrdersV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PrivateOrdersV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PrivateOrdersV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PrivateOrdersV3Api} PrivateOrdersV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrivateOrdersV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PrivateOrdersV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.id = reader.string();
                    break;
                }
                case 2: {
                    message.clientId = reader.string();
                    break;
                }
                case 3: {
                    message.price = reader.string();
                    break;
                }
                case 4: {
                    message.quantity = reader.string();
                    break;
                }
                case 5: {
                    message.amount = reader.string();
                    break;
                }
                case 6: {
                    message.avgPrice = reader.string();
                    break;
                }
                case 7: {
                    message.orderType = reader.int32();
                    break;
                }
                case 8: {
                    message.tradeType = reader.int32();
                    break;
                }
                case 9: {
                    message.isMaker = reader.bool();
                    break;
                }
                case 10: {
                    message.remainAmount = reader.string();
                    break;
                }
                case 11: {
                    message.remainQuantity = reader.string();
                    break;
                }
                case 12: {
                    message.lastDealQuantity = reader.string();
                    break;
                }
                case 13: {
                    message.cumulativeQuantity = reader.string();
                    break;
                }
                case 14: {
                    message.cumulativeAmount = reader.string();
                    break;
                }
                case 15: {
                    message.status = reader.int32();
                    break;
                }
                case 16: {
                    message.createTime = reader.int64();
                    break;
                }
                case 17: {
                    message.market = reader.string();
                    break;
                }
                case 18: {
                    message.triggerType = reader.int32();
                    break;
                }
                case 19: {
                    message.triggerPrice = reader.string();
                    break;
                }
                case 20: {
                    message.state = reader.int32();
                    break;
                }
                case 21: {
                    message.ocoId = reader.string();
                    break;
                }
                case 22: {
                    message.routeFactor = reader.string();
                    break;
                }
                case 23: {
                    message.symbolId = reader.string();
                    break;
                }
                case 24: {
                    message.marketId = reader.string();
                    break;
                }
                case 25: {
                    message.marketCurrencyId = reader.string();
                    break;
                }
                case 26: {
                    message.currencyId = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PrivateOrdersV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PrivateOrdersV3Api} PrivateOrdersV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PrivateOrdersV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PrivateOrdersV3Api message.
     * @function verify
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PrivateOrdersV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.clientId != null && message.hasOwnProperty("clientId"))
            if (!$util.isString(message.clientId))
                return "clientId: string expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        if (message.amount != null && message.hasOwnProperty("amount"))
            if (!$util.isString(message.amount))
                return "amount: string expected";
        if (message.avgPrice != null && message.hasOwnProperty("avgPrice"))
            if (!$util.isString(message.avgPrice))
                return "avgPrice: string expected";
        if (message.orderType != null && message.hasOwnProperty("orderType"))
            if (!$util.isInteger(message.orderType))
                return "orderType: integer expected";
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            if (!$util.isInteger(message.tradeType))
                return "tradeType: integer expected";
        if (message.isMaker != null && message.hasOwnProperty("isMaker"))
            if (typeof message.isMaker !== "boolean")
                return "isMaker: boolean expected";
        if (message.remainAmount != null && message.hasOwnProperty("remainAmount"))
            if (!$util.isString(message.remainAmount))
                return "remainAmount: string expected";
        if (message.remainQuantity != null && message.hasOwnProperty("remainQuantity"))
            if (!$util.isString(message.remainQuantity))
                return "remainQuantity: string expected";
        if (message.lastDealQuantity != null && message.hasOwnProperty("lastDealQuantity")) {
            if (!$util.isString(message.lastDealQuantity))
                return "lastDealQuantity: string expected";
        }
        if (message.cumulativeQuantity != null && message.hasOwnProperty("cumulativeQuantity"))
            if (!$util.isString(message.cumulativeQuantity))
                return "cumulativeQuantity: string expected";
        if (message.cumulativeAmount != null && message.hasOwnProperty("cumulativeAmount"))
            if (!$util.isString(message.cumulativeAmount))
                return "cumulativeAmount: string expected";
        if (message.status != null && message.hasOwnProperty("status"))
            if (!$util.isInteger(message.status))
                return "status: integer expected";
        if (message.createTime != null && message.hasOwnProperty("createTime"))
            if (!$util.isInteger(message.createTime) && !(message.createTime && $util.isInteger(message.createTime.low) && $util.isInteger(message.createTime.high)))
                return "createTime: integer|Long expected";
        if (message.market != null && message.hasOwnProperty("market")) {
            if (!$util.isString(message.market))
                return "market: string expected";
        }
        if (message.triggerType != null && message.hasOwnProperty("triggerType")) {
            if (!$util.isInteger(message.triggerType))
                return "triggerType: integer expected";
        }
        if (message.triggerPrice != null && message.hasOwnProperty("triggerPrice")) {
            if (!$util.isString(message.triggerPrice))
                return "triggerPrice: string expected";
        }
        if (message.state != null && message.hasOwnProperty("state")) {
            if (!$util.isInteger(message.state))
                return "state: integer expected";
        }
        if (message.ocoId != null && message.hasOwnProperty("ocoId")) {
            if (!$util.isString(message.ocoId))
                return "ocoId: string expected";
        }
        if (message.routeFactor != null && message.hasOwnProperty("routeFactor")) {
            if (!$util.isString(message.routeFactor))
                return "routeFactor: string expected";
        }
        if (message.symbolId != null && message.hasOwnProperty("symbolId")) {
            if (!$util.isString(message.symbolId))
                return "symbolId: string expected";
        }
        if (message.marketId != null && message.hasOwnProperty("marketId")) {
            if (!$util.isString(message.marketId))
                return "marketId: string expected";
        }
        if (message.marketCurrencyId != null && message.hasOwnProperty("marketCurrencyId")) {
            if (!$util.isString(message.marketCurrencyId))
                return "marketCurrencyId: string expected";
        }
        if (message.currencyId != null && message.hasOwnProperty("currencyId")) {
            if (!$util.isString(message.currencyId))
                return "currencyId: string expected";
        }
        return null;
    };
    /**
     * Creates a PrivateOrdersV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PrivateOrdersV3Api} PrivateOrdersV3Api
     */
    PrivateOrdersV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PrivateOrdersV3Api)
            return object;
        var message = new $root.PrivateOrdersV3Api();
        if (object.id != null)
            message.id = String(object.id);
        if (object.clientId != null)
            message.clientId = String(object.clientId);
        if (object.price != null)
            message.price = String(object.price);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        if (object.amount != null)
            message.amount = String(object.amount);
        if (object.avgPrice != null)
            message.avgPrice = String(object.avgPrice);
        if (object.orderType != null)
            message.orderType = object.orderType | 0;
        if (object.tradeType != null)
            message.tradeType = object.tradeType | 0;
        if (object.isMaker != null)
            message.isMaker = Boolean(object.isMaker);
        if (object.remainAmount != null)
            message.remainAmount = String(object.remainAmount);
        if (object.remainQuantity != null)
            message.remainQuantity = String(object.remainQuantity);
        if (object.lastDealQuantity != null)
            message.lastDealQuantity = String(object.lastDealQuantity);
        if (object.cumulativeQuantity != null)
            message.cumulativeQuantity = String(object.cumulativeQuantity);
        if (object.cumulativeAmount != null)
            message.cumulativeAmount = String(object.cumulativeAmount);
        if (object.status != null)
            message.status = object.status | 0;
        if (object.createTime != null)
            if ($util.Long)
                (message.createTime = $util.Long.fromValue(object.createTime)).unsigned = false;
            else if (typeof object.createTime === "string")
                message.createTime = parseInt(object.createTime, 10);
            else if (typeof object.createTime === "number")
                message.createTime = object.createTime;
            else if (typeof object.createTime === "object")
                message.createTime = new $util.LongBits(object.createTime.low >>> 0, object.createTime.high >>> 0).toNumber();
        if (object.market != null)
            message.market = String(object.market);
        if (object.triggerType != null)
            message.triggerType = object.triggerType | 0;
        if (object.triggerPrice != null)
            message.triggerPrice = String(object.triggerPrice);
        if (object.state != null)
            message.state = object.state | 0;
        if (object.ocoId != null)
            message.ocoId = String(object.ocoId);
        if (object.routeFactor != null)
            message.routeFactor = String(object.routeFactor);
        if (object.symbolId != null)
            message.symbolId = String(object.symbolId);
        if (object.marketId != null)
            message.marketId = String(object.marketId);
        if (object.marketCurrencyId != null)
            message.marketCurrencyId = String(object.marketCurrencyId);
        if (object.currencyId != null)
            message.currencyId = String(object.currencyId);
        return message;
    };
    /**
     * Creates a plain object from a PrivateOrdersV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {PrivateOrdersV3Api} message PrivateOrdersV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PrivateOrdersV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.id = "";
            object.clientId = "";
            object.price = "";
            object.quantity = "";
            object.amount = "";
            object.avgPrice = "";
            object.orderType = 0;
            object.tradeType = 0;
            object.isMaker = false;
            object.remainAmount = "";
            object.remainQuantity = "";
            object.cumulativeQuantity = "";
            object.cumulativeAmount = "";
            object.status = 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.createTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            }
            else
                object.createTime = options.longs === String ? "0" : 0;
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.clientId != null && message.hasOwnProperty("clientId"))
            object.clientId = message.clientId;
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        if (message.amount != null && message.hasOwnProperty("amount"))
            object.amount = message.amount;
        if (message.avgPrice != null && message.hasOwnProperty("avgPrice"))
            object.avgPrice = message.avgPrice;
        if (message.orderType != null && message.hasOwnProperty("orderType"))
            object.orderType = message.orderType;
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            object.tradeType = message.tradeType;
        if (message.isMaker != null && message.hasOwnProperty("isMaker"))
            object.isMaker = message.isMaker;
        if (message.remainAmount != null && message.hasOwnProperty("remainAmount"))
            object.remainAmount = message.remainAmount;
        if (message.remainQuantity != null && message.hasOwnProperty("remainQuantity"))
            object.remainQuantity = message.remainQuantity;
        if (message.lastDealQuantity != null && message.hasOwnProperty("lastDealQuantity")) {
            object.lastDealQuantity = message.lastDealQuantity;
            if (options.oneofs)
                object._lastDealQuantity = "lastDealQuantity";
        }
        if (message.cumulativeQuantity != null && message.hasOwnProperty("cumulativeQuantity"))
            object.cumulativeQuantity = message.cumulativeQuantity;
        if (message.cumulativeAmount != null && message.hasOwnProperty("cumulativeAmount"))
            object.cumulativeAmount = message.cumulativeAmount;
        if (message.status != null && message.hasOwnProperty("status"))
            object.status = message.status;
        if (message.createTime != null && message.hasOwnProperty("createTime"))
            if (typeof message.createTime === "number")
                object.createTime = options.longs === String ? String(message.createTime) : message.createTime;
            else
                object.createTime = options.longs === String ? $util.Long.prototype.toString.call(message.createTime) : options.longs === Number ? new $util.LongBits(message.createTime.low >>> 0, message.createTime.high >>> 0).toNumber() : message.createTime;
        if (message.market != null && message.hasOwnProperty("market")) {
            object.market = message.market;
            if (options.oneofs)
                object._market = "market";
        }
        if (message.triggerType != null && message.hasOwnProperty("triggerType")) {
            object.triggerType = message.triggerType;
            if (options.oneofs)
                object._triggerType = "triggerType";
        }
        if (message.triggerPrice != null && message.hasOwnProperty("triggerPrice")) {
            object.triggerPrice = message.triggerPrice;
            if (options.oneofs)
                object._triggerPrice = "triggerPrice";
        }
        if (message.state != null && message.hasOwnProperty("state")) {
            object.state = message.state;
            if (options.oneofs)
                object._state = "state";
        }
        if (message.ocoId != null && message.hasOwnProperty("ocoId")) {
            object.ocoId = message.ocoId;
            if (options.oneofs)
                object._ocoId = "ocoId";
        }
        if (message.routeFactor != null && message.hasOwnProperty("routeFactor")) {
            object.routeFactor = message.routeFactor;
            if (options.oneofs)
                object._routeFactor = "routeFactor";
        }
        if (message.symbolId != null && message.hasOwnProperty("symbolId")) {
            object.symbolId = message.symbolId;
            if (options.oneofs)
                object._symbolId = "symbolId";
        }
        if (message.marketId != null && message.hasOwnProperty("marketId")) {
            object.marketId = message.marketId;
            if (options.oneofs)
                object._marketId = "marketId";
        }
        if (message.marketCurrencyId != null && message.hasOwnProperty("marketCurrencyId")) {
            object.marketCurrencyId = message.marketCurrencyId;
            if (options.oneofs)
                object._marketCurrencyId = "marketCurrencyId";
        }
        if (message.currencyId != null && message.hasOwnProperty("currencyId")) {
            object.currencyId = message.currencyId;
            if (options.oneofs)
                object._currencyId = "currencyId";
        }
        return object;
    };
    /**
     * Converts this PrivateOrdersV3Api to JSON.
     * @function toJSON
     * @memberof PrivateOrdersV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PrivateOrdersV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PrivateOrdersV3Api
     * @function getTypeUrl
     * @memberof PrivateOrdersV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PrivateOrdersV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PrivateOrdersV3Api";
    };
    return PrivateOrdersV3Api;
})();
$root.PublicAggreBookTickerV3Api = (function () {
    /**
     * Properties of a PublicAggreBookTickerV3Api.
     * @exports IPublicAggreBookTickerV3Api
     * @interface IPublicAggreBookTickerV3Api
     * @property {string|null} [bidPrice] PublicAggreBookTickerV3Api bidPrice
     * @property {string|null} [bidQuantity] PublicAggreBookTickerV3Api bidQuantity
     * @property {string|null} [askPrice] PublicAggreBookTickerV3Api askPrice
     * @property {string|null} [askQuantity] PublicAggreBookTickerV3Api askQuantity
     */
    /**
     * Constructs a new PublicAggreBookTickerV3Api.
     * @exports PublicAggreBookTickerV3Api
     * @classdesc Represents a PublicAggreBookTickerV3Api.
     * @implements IPublicAggreBookTickerV3Api
     * @constructor
     * @param {IPublicAggreBookTickerV3Api=} [properties] Properties to set
     */
    function PublicAggreBookTickerV3Api(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicAggreBookTickerV3Api bidPrice.
     * @member {string} bidPrice
     * @memberof PublicAggreBookTickerV3Api
     * @instance
     */
    PublicAggreBookTickerV3Api.prototype.bidPrice = "";
    /**
     * PublicAggreBookTickerV3Api bidQuantity.
     * @member {string} bidQuantity
     * @memberof PublicAggreBookTickerV3Api
     * @instance
     */
    PublicAggreBookTickerV3Api.prototype.bidQuantity = "";
    /**
     * PublicAggreBookTickerV3Api askPrice.
     * @member {string} askPrice
     * @memberof PublicAggreBookTickerV3Api
     * @instance
     */
    PublicAggreBookTickerV3Api.prototype.askPrice = "";
    /**
     * PublicAggreBookTickerV3Api askQuantity.
     * @member {string} askQuantity
     * @memberof PublicAggreBookTickerV3Api
     * @instance
     */
    PublicAggreBookTickerV3Api.prototype.askQuantity = "";
    /**
     * Creates a new PublicAggreBookTickerV3Api instance using the specified properties.
     * @function create
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {IPublicAggreBookTickerV3Api=} [properties] Properties to set
     * @returns {PublicAggreBookTickerV3Api} PublicAggreBookTickerV3Api instance
     */
    PublicAggreBookTickerV3Api.create = function create(properties) {
        return new PublicAggreBookTickerV3Api(properties);
    };
    /**
     * Encodes the specified PublicAggreBookTickerV3Api message. Does not implicitly {@link PublicAggreBookTickerV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {IPublicAggreBookTickerV3Api} message PublicAggreBookTickerV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreBookTickerV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.bidPrice != null && Object.hasOwnProperty.call(message, "bidPrice"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.bidPrice);
        if (message.bidQuantity != null && Object.hasOwnProperty.call(message, "bidQuantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.bidQuantity);
        if (message.askPrice != null && Object.hasOwnProperty.call(message, "askPrice"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.askPrice);
        if (message.askQuantity != null && Object.hasOwnProperty.call(message, "askQuantity"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.askQuantity);
        return writer;
    };
    /**
     * Encodes the specified PublicAggreBookTickerV3Api message, length delimited. Does not implicitly {@link PublicAggreBookTickerV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {IPublicAggreBookTickerV3Api} message PublicAggreBookTickerV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreBookTickerV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicAggreBookTickerV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicAggreBookTickerV3Api} PublicAggreBookTickerV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreBookTickerV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicAggreBookTickerV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.bidPrice = reader.string();
                    break;
                }
                case 2: {
                    message.bidQuantity = reader.string();
                    break;
                }
                case 3: {
                    message.askPrice = reader.string();
                    break;
                }
                case 4: {
                    message.askQuantity = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicAggreBookTickerV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicAggreBookTickerV3Api} PublicAggreBookTickerV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreBookTickerV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicAggreBookTickerV3Api message.
     * @function verify
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicAggreBookTickerV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.bidPrice != null && message.hasOwnProperty("bidPrice"))
            if (!$util.isString(message.bidPrice))
                return "bidPrice: string expected";
        if (message.bidQuantity != null && message.hasOwnProperty("bidQuantity"))
            if (!$util.isString(message.bidQuantity))
                return "bidQuantity: string expected";
        if (message.askPrice != null && message.hasOwnProperty("askPrice"))
            if (!$util.isString(message.askPrice))
                return "askPrice: string expected";
        if (message.askQuantity != null && message.hasOwnProperty("askQuantity"))
            if (!$util.isString(message.askQuantity))
                return "askQuantity: string expected";
        return null;
    };
    /**
     * Creates a PublicAggreBookTickerV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicAggreBookTickerV3Api} PublicAggreBookTickerV3Api
     */
    PublicAggreBookTickerV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicAggreBookTickerV3Api)
            return object;
        var message = new $root.PublicAggreBookTickerV3Api();
        if (object.bidPrice != null)
            message.bidPrice = String(object.bidPrice);
        if (object.bidQuantity != null)
            message.bidQuantity = String(object.bidQuantity);
        if (object.askPrice != null)
            message.askPrice = String(object.askPrice);
        if (object.askQuantity != null)
            message.askQuantity = String(object.askQuantity);
        return message;
    };
    /**
     * Creates a plain object from a PublicAggreBookTickerV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {PublicAggreBookTickerV3Api} message PublicAggreBookTickerV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicAggreBookTickerV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.bidPrice = "";
            object.bidQuantity = "";
            object.askPrice = "";
            object.askQuantity = "";
        }
        if (message.bidPrice != null && message.hasOwnProperty("bidPrice"))
            object.bidPrice = message.bidPrice;
        if (message.bidQuantity != null && message.hasOwnProperty("bidQuantity"))
            object.bidQuantity = message.bidQuantity;
        if (message.askPrice != null && message.hasOwnProperty("askPrice"))
            object.askPrice = message.askPrice;
        if (message.askQuantity != null && message.hasOwnProperty("askQuantity"))
            object.askQuantity = message.askQuantity;
        return object;
    };
    /**
     * Converts this PublicAggreBookTickerV3Api to JSON.
     * @function toJSON
     * @memberof PublicAggreBookTickerV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicAggreBookTickerV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicAggreBookTickerV3Api
     * @function getTypeUrl
     * @memberof PublicAggreBookTickerV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicAggreBookTickerV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicAggreBookTickerV3Api";
    };
    return PublicAggreBookTickerV3Api;
})();
$root.PublicAggreDealsV3Api = (function () {
    /**
     * Properties of a PublicAggreDealsV3Api.
     * @exports IPublicAggreDealsV3Api
     * @interface IPublicAggreDealsV3Api
     * @property {Array.<IPublicAggreDealsV3ApiItem>|null} [deals] PublicAggreDealsV3Api deals
     * @property {string|null} [eventType] PublicAggreDealsV3Api eventType
     */
    /**
     * Constructs a new PublicAggreDealsV3Api.
     * @exports PublicAggreDealsV3Api
     * @classdesc Represents a PublicAggreDealsV3Api.
     * @implements IPublicAggreDealsV3Api
     * @constructor
     * @param {IPublicAggreDealsV3Api=} [properties] Properties to set
     */
    function PublicAggreDealsV3Api(properties) {
        this.deals = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicAggreDealsV3Api deals.
     * @member {Array.<IPublicAggreDealsV3ApiItem>} deals
     * @memberof PublicAggreDealsV3Api
     * @instance
     */
    PublicAggreDealsV3Api.prototype.deals = $util.emptyArray;
    /**
     * PublicAggreDealsV3Api eventType.
     * @member {string} eventType
     * @memberof PublicAggreDealsV3Api
     * @instance
     */
    PublicAggreDealsV3Api.prototype.eventType = "";
    /**
     * Creates a new PublicAggreDealsV3Api instance using the specified properties.
     * @function create
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {IPublicAggreDealsV3Api=} [properties] Properties to set
     * @returns {PublicAggreDealsV3Api} PublicAggreDealsV3Api instance
     */
    PublicAggreDealsV3Api.create = function create(properties) {
        return new PublicAggreDealsV3Api(properties);
    };
    /**
     * Encodes the specified PublicAggreDealsV3Api message. Does not implicitly {@link PublicAggreDealsV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {IPublicAggreDealsV3Api} message PublicAggreDealsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDealsV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.deals != null && message.deals.length)
            for (var i = 0; i < message.deals.length; ++i)
                $root.PublicAggreDealsV3ApiItem.encode(message.deals[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.eventType);
        return writer;
    };
    /**
     * Encodes the specified PublicAggreDealsV3Api message, length delimited. Does not implicitly {@link PublicAggreDealsV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {IPublicAggreDealsV3Api} message PublicAggreDealsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDealsV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicAggreDealsV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicAggreDealsV3Api} PublicAggreDealsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDealsV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicAggreDealsV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.deals && message.deals.length))
                        message.deals = [];
                    message.deals.push($root.PublicAggreDealsV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 2: {
                    message.eventType = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicAggreDealsV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicAggreDealsV3Api} PublicAggreDealsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDealsV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicAggreDealsV3Api message.
     * @function verify
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicAggreDealsV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.deals != null && message.hasOwnProperty("deals")) {
            if (!Array.isArray(message.deals))
                return "deals: array expected";
            for (var i = 0; i < message.deals.length; ++i) {
                var error = $root.PublicAggreDealsV3ApiItem.verify(message.deals[i]);
                if (error)
                    return "deals." + error;
            }
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            if (!$util.isString(message.eventType))
                return "eventType: string expected";
        return null;
    };
    /**
     * Creates a PublicAggreDealsV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicAggreDealsV3Api} PublicAggreDealsV3Api
     */
    PublicAggreDealsV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicAggreDealsV3Api)
            return object;
        var message = new $root.PublicAggreDealsV3Api();
        if (object.deals) {
            if (!Array.isArray(object.deals))
                throw TypeError(".PublicAggreDealsV3Api.deals: array expected");
            message.deals = [];
            for (var i = 0; i < object.deals.length; ++i) {
                if (typeof object.deals[i] !== "object")
                    throw TypeError(".PublicAggreDealsV3Api.deals: object expected");
                message.deals[i] = $root.PublicAggreDealsV3ApiItem.fromObject(object.deals[i]);
            }
        }
        if (object.eventType != null)
            message.eventType = String(object.eventType);
        return message;
    };
    /**
     * Creates a plain object from a PublicAggreDealsV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {PublicAggreDealsV3Api} message PublicAggreDealsV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicAggreDealsV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.deals = [];
        if (options.defaults)
            object.eventType = "";
        if (message.deals && message.deals.length) {
            object.deals = [];
            for (var j = 0; j < message.deals.length; ++j)
                object.deals[j] = $root.PublicAggreDealsV3ApiItem.toObject(message.deals[j], options);
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            object.eventType = message.eventType;
        return object;
    };
    /**
     * Converts this PublicAggreDealsV3Api to JSON.
     * @function toJSON
     * @memberof PublicAggreDealsV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicAggreDealsV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicAggreDealsV3Api
     * @function getTypeUrl
     * @memberof PublicAggreDealsV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicAggreDealsV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicAggreDealsV3Api";
    };
    return PublicAggreDealsV3Api;
})();
$root.PublicAggreDealsV3ApiItem = (function () {
    /**
     * Properties of a PublicAggreDealsV3ApiItem.
     * @exports IPublicAggreDealsV3ApiItem
     * @interface IPublicAggreDealsV3ApiItem
     * @property {string|null} [price] PublicAggreDealsV3ApiItem price
     * @property {string|null} [quantity] PublicAggreDealsV3ApiItem quantity
     * @property {number|null} [tradeType] PublicAggreDealsV3ApiItem tradeType
     * @property {number|Long|null} [time] PublicAggreDealsV3ApiItem time
     */
    /**
     * Constructs a new PublicAggreDealsV3ApiItem.
     * @exports PublicAggreDealsV3ApiItem
     * @classdesc Represents a PublicAggreDealsV3ApiItem.
     * @implements IPublicAggreDealsV3ApiItem
     * @constructor
     * @param {IPublicAggreDealsV3ApiItem=} [properties] Properties to set
     */
    function PublicAggreDealsV3ApiItem(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicAggreDealsV3ApiItem price.
     * @member {string} price
     * @memberof PublicAggreDealsV3ApiItem
     * @instance
     */
    PublicAggreDealsV3ApiItem.prototype.price = "";
    /**
     * PublicAggreDealsV3ApiItem quantity.
     * @member {string} quantity
     * @memberof PublicAggreDealsV3ApiItem
     * @instance
     */
    PublicAggreDealsV3ApiItem.prototype.quantity = "";
    /**
     * PublicAggreDealsV3ApiItem tradeType.
     * @member {number} tradeType
     * @memberof PublicAggreDealsV3ApiItem
     * @instance
     */
    PublicAggreDealsV3ApiItem.prototype.tradeType = 0;
    /**
     * PublicAggreDealsV3ApiItem time.
     * @member {number|Long} time
     * @memberof PublicAggreDealsV3ApiItem
     * @instance
     */
    PublicAggreDealsV3ApiItem.prototype.time = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    /**
     * Creates a new PublicAggreDealsV3ApiItem instance using the specified properties.
     * @function create
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {IPublicAggreDealsV3ApiItem=} [properties] Properties to set
     * @returns {PublicAggreDealsV3ApiItem} PublicAggreDealsV3ApiItem instance
     */
    PublicAggreDealsV3ApiItem.create = function create(properties) {
        return new PublicAggreDealsV3ApiItem(properties);
    };
    /**
     * Encodes the specified PublicAggreDealsV3ApiItem message. Does not implicitly {@link PublicAggreDealsV3ApiItem.verify|verify} messages.
     * @function encode
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {IPublicAggreDealsV3ApiItem} message PublicAggreDealsV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDealsV3ApiItem.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.price);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.quantity);
        if (message.tradeType != null && Object.hasOwnProperty.call(message, "tradeType"))
            writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.tradeType);
        if (message.time != null && Object.hasOwnProperty.call(message, "time"))
            writer.uint32(/* id 4, wireType 0 =*/ 32).int64(message.time);
        return writer;
    };
    /**
     * Encodes the specified PublicAggreDealsV3ApiItem message, length delimited. Does not implicitly {@link PublicAggreDealsV3ApiItem.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {IPublicAggreDealsV3ApiItem} message PublicAggreDealsV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDealsV3ApiItem.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicAggreDealsV3ApiItem message from the specified reader or buffer.
     * @function decode
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicAggreDealsV3ApiItem} PublicAggreDealsV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDealsV3ApiItem.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicAggreDealsV3ApiItem();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.price = reader.string();
                    break;
                }
                case 2: {
                    message.quantity = reader.string();
                    break;
                }
                case 3: {
                    message.tradeType = reader.int32();
                    break;
                }
                case 4: {
                    message.time = reader.int64();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicAggreDealsV3ApiItem message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicAggreDealsV3ApiItem} PublicAggreDealsV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDealsV3ApiItem.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicAggreDealsV3ApiItem message.
     * @function verify
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicAggreDealsV3ApiItem.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            if (!$util.isInteger(message.tradeType))
                return "tradeType: integer expected";
        if (message.time != null && message.hasOwnProperty("time"))
            if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                return "time: integer|Long expected";
        return null;
    };
    /**
     * Creates a PublicAggreDealsV3ApiItem message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicAggreDealsV3ApiItem} PublicAggreDealsV3ApiItem
     */
    PublicAggreDealsV3ApiItem.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicAggreDealsV3ApiItem)
            return object;
        var message = new $root.PublicAggreDealsV3ApiItem();
        if (object.price != null)
            message.price = String(object.price);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        if (object.tradeType != null)
            message.tradeType = object.tradeType | 0;
        if (object.time != null)
            if ($util.Long)
                (message.time = $util.Long.fromValue(object.time)).unsigned = false;
            else if (typeof object.time === "string")
                message.time = parseInt(object.time, 10);
            else if (typeof object.time === "number")
                message.time = object.time;
            else if (typeof object.time === "object")
                message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
        return message;
    };
    /**
     * Creates a plain object from a PublicAggreDealsV3ApiItem message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {PublicAggreDealsV3ApiItem} message PublicAggreDealsV3ApiItem
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicAggreDealsV3ApiItem.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.price = "";
            object.quantity = "";
            object.tradeType = 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            }
            else
                object.time = options.longs === String ? "0" : 0;
        }
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            object.tradeType = message.tradeType;
        if (message.time != null && message.hasOwnProperty("time"))
            if (typeof message.time === "number")
                object.time = options.longs === String ? String(message.time) : message.time;
            else
                object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
        return object;
    };
    /**
     * Converts this PublicAggreDealsV3ApiItem to JSON.
     * @function toJSON
     * @memberof PublicAggreDealsV3ApiItem
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicAggreDealsV3ApiItem.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicAggreDealsV3ApiItem
     * @function getTypeUrl
     * @memberof PublicAggreDealsV3ApiItem
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicAggreDealsV3ApiItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicAggreDealsV3ApiItem";
    };
    return PublicAggreDealsV3ApiItem;
})();
$root.PublicAggreDepthsV3Api = (function () {
    /**
     * Properties of a PublicAggreDepthsV3Api.
     * @exports IPublicAggreDepthsV3Api
     * @interface IPublicAggreDepthsV3Api
     * @property {Array.<IPublicAggreDepthV3ApiItem>|null} [asks] PublicAggreDepthsV3Api asks
     * @property {Array.<IPublicAggreDepthV3ApiItem>|null} [bids] PublicAggreDepthsV3Api bids
     * @property {string|null} [eventType] PublicAggreDepthsV3Api eventType
     * @property {string|null} [fromVersion] PublicAggreDepthsV3Api fromVersion
     * @property {string|null} [toVersion] PublicAggreDepthsV3Api toVersion
     */
    /**
     * Constructs a new PublicAggreDepthsV3Api.
     * @exports PublicAggreDepthsV3Api
     * @classdesc Represents a PublicAggreDepthsV3Api.
     * @implements IPublicAggreDepthsV3Api
     * @constructor
     * @param {IPublicAggreDepthsV3Api=} [properties] Properties to set
     */
    function PublicAggreDepthsV3Api(properties) {
        this.asks = [];
        this.bids = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicAggreDepthsV3Api asks.
     * @member {Array.<IPublicAggreDepthV3ApiItem>} asks
     * @memberof PublicAggreDepthsV3Api
     * @instance
     */
    PublicAggreDepthsV3Api.prototype.asks = $util.emptyArray;
    /**
     * PublicAggreDepthsV3Api bids.
     * @member {Array.<IPublicAggreDepthV3ApiItem>} bids
     * @memberof PublicAggreDepthsV3Api
     * @instance
     */
    PublicAggreDepthsV3Api.prototype.bids = $util.emptyArray;
    /**
     * PublicAggreDepthsV3Api eventType.
     * @member {string} eventType
     * @memberof PublicAggreDepthsV3Api
     * @instance
     */
    PublicAggreDepthsV3Api.prototype.eventType = "";
    /**
     * PublicAggreDepthsV3Api fromVersion.
     * @member {string} fromVersion
     * @memberof PublicAggreDepthsV3Api
     * @instance
     */
    PublicAggreDepthsV3Api.prototype.fromVersion = "";
    /**
     * PublicAggreDepthsV3Api toVersion.
     * @member {string} toVersion
     * @memberof PublicAggreDepthsV3Api
     * @instance
     */
    PublicAggreDepthsV3Api.prototype.toVersion = "";
    /**
     * Creates a new PublicAggreDepthsV3Api instance using the specified properties.
     * @function create
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {IPublicAggreDepthsV3Api=} [properties] Properties to set
     * @returns {PublicAggreDepthsV3Api} PublicAggreDepthsV3Api instance
     */
    PublicAggreDepthsV3Api.create = function create(properties) {
        return new PublicAggreDepthsV3Api(properties);
    };
    /**
     * Encodes the specified PublicAggreDepthsV3Api message. Does not implicitly {@link PublicAggreDepthsV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {IPublicAggreDepthsV3Api} message PublicAggreDepthsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDepthsV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.asks != null && message.asks.length)
            for (var i = 0; i < message.asks.length; ++i)
                $root.PublicAggreDepthV3ApiItem.encode(message.asks[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        if (message.bids != null && message.bids.length)
            for (var i = 0; i < message.bids.length; ++i)
                $root.PublicAggreDepthV3ApiItem.encode(message.bids[i], writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
        if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.eventType);
        if (message.fromVersion != null && Object.hasOwnProperty.call(message, "fromVersion"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.fromVersion);
        if (message.toVersion != null && Object.hasOwnProperty.call(message, "toVersion"))
            writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.toVersion);
        return writer;
    };
    /**
     * Encodes the specified PublicAggreDepthsV3Api message, length delimited. Does not implicitly {@link PublicAggreDepthsV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {IPublicAggreDepthsV3Api} message PublicAggreDepthsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDepthsV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicAggreDepthsV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicAggreDepthsV3Api} PublicAggreDepthsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDepthsV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicAggreDepthsV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.asks && message.asks.length))
                        message.asks = [];
                    message.asks.push($root.PublicAggreDepthV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 2: {
                    if (!(message.bids && message.bids.length))
                        message.bids = [];
                    message.bids.push($root.PublicAggreDepthV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 3: {
                    message.eventType = reader.string();
                    break;
                }
                case 4: {
                    message.fromVersion = reader.string();
                    break;
                }
                case 5: {
                    message.toVersion = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicAggreDepthsV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicAggreDepthsV3Api} PublicAggreDepthsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDepthsV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicAggreDepthsV3Api message.
     * @function verify
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicAggreDepthsV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.asks != null && message.hasOwnProperty("asks")) {
            if (!Array.isArray(message.asks))
                return "asks: array expected";
            for (var i = 0; i < message.asks.length; ++i) {
                var error = $root.PublicAggreDepthV3ApiItem.verify(message.asks[i]);
                if (error)
                    return "asks." + error;
            }
        }
        if (message.bids != null && message.hasOwnProperty("bids")) {
            if (!Array.isArray(message.bids))
                return "bids: array expected";
            for (var i = 0; i < message.bids.length; ++i) {
                var error = $root.PublicAggreDepthV3ApiItem.verify(message.bids[i]);
                if (error)
                    return "bids." + error;
            }
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            if (!$util.isString(message.eventType))
                return "eventType: string expected";
        if (message.fromVersion != null && message.hasOwnProperty("fromVersion"))
            if (!$util.isString(message.fromVersion))
                return "fromVersion: string expected";
        if (message.toVersion != null && message.hasOwnProperty("toVersion"))
            if (!$util.isString(message.toVersion))
                return "toVersion: string expected";
        return null;
    };
    /**
     * Creates a PublicAggreDepthsV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicAggreDepthsV3Api} PublicAggreDepthsV3Api
     */
    PublicAggreDepthsV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicAggreDepthsV3Api)
            return object;
        var message = new $root.PublicAggreDepthsV3Api();
        if (object.asks) {
            if (!Array.isArray(object.asks))
                throw TypeError(".PublicAggreDepthsV3Api.asks: array expected");
            message.asks = [];
            for (var i = 0; i < object.asks.length; ++i) {
                if (typeof object.asks[i] !== "object")
                    throw TypeError(".PublicAggreDepthsV3Api.asks: object expected");
                message.asks[i] = $root.PublicAggreDepthV3ApiItem.fromObject(object.asks[i]);
            }
        }
        if (object.bids) {
            if (!Array.isArray(object.bids))
                throw TypeError(".PublicAggreDepthsV3Api.bids: array expected");
            message.bids = [];
            for (var i = 0; i < object.bids.length; ++i) {
                if (typeof object.bids[i] !== "object")
                    throw TypeError(".PublicAggreDepthsV3Api.bids: object expected");
                message.bids[i] = $root.PublicAggreDepthV3ApiItem.fromObject(object.bids[i]);
            }
        }
        if (object.eventType != null)
            message.eventType = String(object.eventType);
        if (object.fromVersion != null)
            message.fromVersion = String(object.fromVersion);
        if (object.toVersion != null)
            message.toVersion = String(object.toVersion);
        return message;
    };
    /**
     * Creates a plain object from a PublicAggreDepthsV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {PublicAggreDepthsV3Api} message PublicAggreDepthsV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicAggreDepthsV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.asks = [];
            object.bids = [];
        }
        if (options.defaults) {
            object.eventType = "";
            object.fromVersion = "";
            object.toVersion = "";
        }
        if (message.asks && message.asks.length) {
            object.asks = [];
            for (var j = 0; j < message.asks.length; ++j)
                object.asks[j] = $root.PublicAggreDepthV3ApiItem.toObject(message.asks[j], options);
        }
        if (message.bids && message.bids.length) {
            object.bids = [];
            for (var j = 0; j < message.bids.length; ++j)
                object.bids[j] = $root.PublicAggreDepthV3ApiItem.toObject(message.bids[j], options);
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            object.eventType = message.eventType;
        if (message.fromVersion != null && message.hasOwnProperty("fromVersion"))
            object.fromVersion = message.fromVersion;
        if (message.toVersion != null && message.hasOwnProperty("toVersion"))
            object.toVersion = message.toVersion;
        return object;
    };
    /**
     * Converts this PublicAggreDepthsV3Api to JSON.
     * @function toJSON
     * @memberof PublicAggreDepthsV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicAggreDepthsV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicAggreDepthsV3Api
     * @function getTypeUrl
     * @memberof PublicAggreDepthsV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicAggreDepthsV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicAggreDepthsV3Api";
    };
    return PublicAggreDepthsV3Api;
})();
$root.PublicAggreDepthV3ApiItem = (function () {
    /**
     * Properties of a PublicAggreDepthV3ApiItem.
     * @exports IPublicAggreDepthV3ApiItem
     * @interface IPublicAggreDepthV3ApiItem
     * @property {string|null} [price] PublicAggreDepthV3ApiItem price
     * @property {string|null} [quantity] PublicAggreDepthV3ApiItem quantity
     */
    /**
     * Constructs a new PublicAggreDepthV3ApiItem.
     * @exports PublicAggreDepthV3ApiItem
     * @classdesc Represents a PublicAggreDepthV3ApiItem.
     * @implements IPublicAggreDepthV3ApiItem
     * @constructor
     * @param {IPublicAggreDepthV3ApiItem=} [properties] Properties to set
     */
    function PublicAggreDepthV3ApiItem(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicAggreDepthV3ApiItem price.
     * @member {string} price
     * @memberof PublicAggreDepthV3ApiItem
     * @instance
     */
    PublicAggreDepthV3ApiItem.prototype.price = "";
    /**
     * PublicAggreDepthV3ApiItem quantity.
     * @member {string} quantity
     * @memberof PublicAggreDepthV3ApiItem
     * @instance
     */
    PublicAggreDepthV3ApiItem.prototype.quantity = "";
    /**
     * Creates a new PublicAggreDepthV3ApiItem instance using the specified properties.
     * @function create
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {IPublicAggreDepthV3ApiItem=} [properties] Properties to set
     * @returns {PublicAggreDepthV3ApiItem} PublicAggreDepthV3ApiItem instance
     */
    PublicAggreDepthV3ApiItem.create = function create(properties) {
        return new PublicAggreDepthV3ApiItem(properties);
    };
    /**
     * Encodes the specified PublicAggreDepthV3ApiItem message. Does not implicitly {@link PublicAggreDepthV3ApiItem.verify|verify} messages.
     * @function encode
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {IPublicAggreDepthV3ApiItem} message PublicAggreDepthV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDepthV3ApiItem.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.price);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.quantity);
        return writer;
    };
    /**
     * Encodes the specified PublicAggreDepthV3ApiItem message, length delimited. Does not implicitly {@link PublicAggreDepthV3ApiItem.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {IPublicAggreDepthV3ApiItem} message PublicAggreDepthV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicAggreDepthV3ApiItem.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicAggreDepthV3ApiItem message from the specified reader or buffer.
     * @function decode
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicAggreDepthV3ApiItem} PublicAggreDepthV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDepthV3ApiItem.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicAggreDepthV3ApiItem();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.price = reader.string();
                    break;
                }
                case 2: {
                    message.quantity = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicAggreDepthV3ApiItem message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicAggreDepthV3ApiItem} PublicAggreDepthV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicAggreDepthV3ApiItem.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicAggreDepthV3ApiItem message.
     * @function verify
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicAggreDepthV3ApiItem.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        return null;
    };
    /**
     * Creates a PublicAggreDepthV3ApiItem message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicAggreDepthV3ApiItem} PublicAggreDepthV3ApiItem
     */
    PublicAggreDepthV3ApiItem.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicAggreDepthV3ApiItem)
            return object;
        var message = new $root.PublicAggreDepthV3ApiItem();
        if (object.price != null)
            message.price = String(object.price);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        return message;
    };
    /**
     * Creates a plain object from a PublicAggreDepthV3ApiItem message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {PublicAggreDepthV3ApiItem} message PublicAggreDepthV3ApiItem
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicAggreDepthV3ApiItem.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.price = "";
            object.quantity = "";
        }
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        return object;
    };
    /**
     * Converts this PublicAggreDepthV3ApiItem to JSON.
     * @function toJSON
     * @memberof PublicAggreDepthV3ApiItem
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicAggreDepthV3ApiItem.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicAggreDepthV3ApiItem
     * @function getTypeUrl
     * @memberof PublicAggreDepthV3ApiItem
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicAggreDepthV3ApiItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicAggreDepthV3ApiItem";
    };
    return PublicAggreDepthV3ApiItem;
})();
$root.PublicBookTickerBatchV3Api = (function () {
    /**
     * Properties of a PublicBookTickerBatchV3Api.
     * @exports IPublicBookTickerBatchV3Api
     * @interface IPublicBookTickerBatchV3Api
     * @property {Array.<IPublicBookTickerV3Api>|null} [items] PublicBookTickerBatchV3Api items
     */
    /**
     * Constructs a new PublicBookTickerBatchV3Api.
     * @exports PublicBookTickerBatchV3Api
     * @classdesc Represents a PublicBookTickerBatchV3Api.
     * @implements IPublicBookTickerBatchV3Api
     * @constructor
     * @param {IPublicBookTickerBatchV3Api=} [properties] Properties to set
     */
    function PublicBookTickerBatchV3Api(properties) {
        this.items = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicBookTickerBatchV3Api items.
     * @member {Array.<IPublicBookTickerV3Api>} items
     * @memberof PublicBookTickerBatchV3Api
     * @instance
     */
    PublicBookTickerBatchV3Api.prototype.items = $util.emptyArray;
    /**
     * Creates a new PublicBookTickerBatchV3Api instance using the specified properties.
     * @function create
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {IPublicBookTickerBatchV3Api=} [properties] Properties to set
     * @returns {PublicBookTickerBatchV3Api} PublicBookTickerBatchV3Api instance
     */
    PublicBookTickerBatchV3Api.create = function create(properties) {
        return new PublicBookTickerBatchV3Api(properties);
    };
    /**
     * Encodes the specified PublicBookTickerBatchV3Api message. Does not implicitly {@link PublicBookTickerBatchV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {IPublicBookTickerBatchV3Api} message PublicBookTickerBatchV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicBookTickerBatchV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.items != null && message.items.length)
            for (var i = 0; i < message.items.length; ++i)
                $root.PublicBookTickerV3Api.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        return writer;
    };
    /**
     * Encodes the specified PublicBookTickerBatchV3Api message, length delimited. Does not implicitly {@link PublicBookTickerBatchV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {IPublicBookTickerBatchV3Api} message PublicBookTickerBatchV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicBookTickerBatchV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicBookTickerBatchV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicBookTickerBatchV3Api} PublicBookTickerBatchV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicBookTickerBatchV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicBookTickerBatchV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.items && message.items.length))
                        message.items = [];
                    message.items.push($root.PublicBookTickerV3Api.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicBookTickerBatchV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicBookTickerBatchV3Api} PublicBookTickerBatchV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicBookTickerBatchV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicBookTickerBatchV3Api message.
     * @function verify
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicBookTickerBatchV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.items != null && message.hasOwnProperty("items")) {
            if (!Array.isArray(message.items))
                return "items: array expected";
            for (var i = 0; i < message.items.length; ++i) {
                var error = $root.PublicBookTickerV3Api.verify(message.items[i]);
                if (error)
                    return "items." + error;
            }
        }
        return null;
    };
    /**
     * Creates a PublicBookTickerBatchV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicBookTickerBatchV3Api} PublicBookTickerBatchV3Api
     */
    PublicBookTickerBatchV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicBookTickerBatchV3Api)
            return object;
        var message = new $root.PublicBookTickerBatchV3Api();
        if (object.items) {
            if (!Array.isArray(object.items))
                throw TypeError(".PublicBookTickerBatchV3Api.items: array expected");
            message.items = [];
            for (var i = 0; i < object.items.length; ++i) {
                if (typeof object.items[i] !== "object")
                    throw TypeError(".PublicBookTickerBatchV3Api.items: object expected");
                message.items[i] = $root.PublicBookTickerV3Api.fromObject(object.items[i]);
            }
        }
        return message;
    };
    /**
     * Creates a plain object from a PublicBookTickerBatchV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {PublicBookTickerBatchV3Api} message PublicBookTickerBatchV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicBookTickerBatchV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.items = [];
        if (message.items && message.items.length) {
            object.items = [];
            for (var j = 0; j < message.items.length; ++j)
                object.items[j] = $root.PublicBookTickerV3Api.toObject(message.items[j], options);
        }
        return object;
    };
    /**
     * Converts this PublicBookTickerBatchV3Api to JSON.
     * @function toJSON
     * @memberof PublicBookTickerBatchV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicBookTickerBatchV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicBookTickerBatchV3Api
     * @function getTypeUrl
     * @memberof PublicBookTickerBatchV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicBookTickerBatchV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicBookTickerBatchV3Api";
    };
    return PublicBookTickerBatchV3Api;
})();
$root.PublicBookTickerV3Api = (function () {
    /**
     * Properties of a PublicBookTickerV3Api.
     * @exports IPublicBookTickerV3Api
     * @interface IPublicBookTickerV3Api
     * @property {string|null} [bidPrice] PublicBookTickerV3Api bidPrice
     * @property {string|null} [bidQuantity] PublicBookTickerV3Api bidQuantity
     * @property {string|null} [askPrice] PublicBookTickerV3Api askPrice
     * @property {string|null} [askQuantity] PublicBookTickerV3Api askQuantity
     */
    /**
     * Constructs a new PublicBookTickerV3Api.
     * @exports PublicBookTickerV3Api
     * @classdesc Represents a PublicBookTickerV3Api.
     * @implements IPublicBookTickerV3Api
     * @constructor
     * @param {IPublicBookTickerV3Api=} [properties] Properties to set
     */
    function PublicBookTickerV3Api(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicBookTickerV3Api bidPrice.
     * @member {string} bidPrice
     * @memberof PublicBookTickerV3Api
     * @instance
     */
    PublicBookTickerV3Api.prototype.bidPrice = "";
    /**
     * PublicBookTickerV3Api bidQuantity.
     * @member {string} bidQuantity
     * @memberof PublicBookTickerV3Api
     * @instance
     */
    PublicBookTickerV3Api.prototype.bidQuantity = "";
    /**
     * PublicBookTickerV3Api askPrice.
     * @member {string} askPrice
     * @memberof PublicBookTickerV3Api
     * @instance
     */
    PublicBookTickerV3Api.prototype.askPrice = "";
    /**
     * PublicBookTickerV3Api askQuantity.
     * @member {string} askQuantity
     * @memberof PublicBookTickerV3Api
     * @instance
     */
    PublicBookTickerV3Api.prototype.askQuantity = "";
    /**
     * Creates a new PublicBookTickerV3Api instance using the specified properties.
     * @function create
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {IPublicBookTickerV3Api=} [properties] Properties to set
     * @returns {PublicBookTickerV3Api} PublicBookTickerV3Api instance
     */
    PublicBookTickerV3Api.create = function create(properties) {
        return new PublicBookTickerV3Api(properties);
    };
    /**
     * Encodes the specified PublicBookTickerV3Api message. Does not implicitly {@link PublicBookTickerV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {IPublicBookTickerV3Api} message PublicBookTickerV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicBookTickerV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.bidPrice != null && Object.hasOwnProperty.call(message, "bidPrice"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.bidPrice);
        if (message.bidQuantity != null && Object.hasOwnProperty.call(message, "bidQuantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.bidQuantity);
        if (message.askPrice != null && Object.hasOwnProperty.call(message, "askPrice"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.askPrice);
        if (message.askQuantity != null && Object.hasOwnProperty.call(message, "askQuantity"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.askQuantity);
        return writer;
    };
    /**
     * Encodes the specified PublicBookTickerV3Api message, length delimited. Does not implicitly {@link PublicBookTickerV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {IPublicBookTickerV3Api} message PublicBookTickerV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicBookTickerV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicBookTickerV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicBookTickerV3Api} PublicBookTickerV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicBookTickerV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicBookTickerV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.bidPrice = reader.string();
                    break;
                }
                case 2: {
                    message.bidQuantity = reader.string();
                    break;
                }
                case 3: {
                    message.askPrice = reader.string();
                    break;
                }
                case 4: {
                    message.askQuantity = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicBookTickerV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicBookTickerV3Api} PublicBookTickerV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicBookTickerV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicBookTickerV3Api message.
     * @function verify
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicBookTickerV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.bidPrice != null && message.hasOwnProperty("bidPrice"))
            if (!$util.isString(message.bidPrice))
                return "bidPrice: string expected";
        if (message.bidQuantity != null && message.hasOwnProperty("bidQuantity"))
            if (!$util.isString(message.bidQuantity))
                return "bidQuantity: string expected";
        if (message.askPrice != null && message.hasOwnProperty("askPrice"))
            if (!$util.isString(message.askPrice))
                return "askPrice: string expected";
        if (message.askQuantity != null && message.hasOwnProperty("askQuantity"))
            if (!$util.isString(message.askQuantity))
                return "askQuantity: string expected";
        return null;
    };
    /**
     * Creates a PublicBookTickerV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicBookTickerV3Api} PublicBookTickerV3Api
     */
    PublicBookTickerV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicBookTickerV3Api)
            return object;
        var message = new $root.PublicBookTickerV3Api();
        if (object.bidPrice != null)
            message.bidPrice = String(object.bidPrice);
        if (object.bidQuantity != null)
            message.bidQuantity = String(object.bidQuantity);
        if (object.askPrice != null)
            message.askPrice = String(object.askPrice);
        if (object.askQuantity != null)
            message.askQuantity = String(object.askQuantity);
        return message;
    };
    /**
     * Creates a plain object from a PublicBookTickerV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {PublicBookTickerV3Api} message PublicBookTickerV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicBookTickerV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.bidPrice = "";
            object.bidQuantity = "";
            object.askPrice = "";
            object.askQuantity = "";
        }
        if (message.bidPrice != null && message.hasOwnProperty("bidPrice"))
            object.bidPrice = message.bidPrice;
        if (message.bidQuantity != null && message.hasOwnProperty("bidQuantity"))
            object.bidQuantity = message.bidQuantity;
        if (message.askPrice != null && message.hasOwnProperty("askPrice"))
            object.askPrice = message.askPrice;
        if (message.askQuantity != null && message.hasOwnProperty("askQuantity"))
            object.askQuantity = message.askQuantity;
        return object;
    };
    /**
     * Converts this PublicBookTickerV3Api to JSON.
     * @function toJSON
     * @memberof PublicBookTickerV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicBookTickerV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicBookTickerV3Api
     * @function getTypeUrl
     * @memberof PublicBookTickerV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicBookTickerV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicBookTickerV3Api";
    };
    return PublicBookTickerV3Api;
})();
$root.PublicDealsV3Api = (function () {
    /**
     * Properties of a PublicDealsV3Api.
     * @exports IPublicDealsV3Api
     * @interface IPublicDealsV3Api
     * @property {Array.<IPublicDealsV3ApiItem>|null} [deals] PublicDealsV3Api deals
     * @property {string|null} [eventType] PublicDealsV3Api eventType
     */
    /**
     * Constructs a new PublicDealsV3Api.
     * @exports PublicDealsV3Api
     * @classdesc Represents a PublicDealsV3Api.
     * @implements IPublicDealsV3Api
     * @constructor
     * @param {IPublicDealsV3Api=} [properties] Properties to set
     */
    function PublicDealsV3Api(properties) {
        this.deals = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicDealsV3Api deals.
     * @member {Array.<IPublicDealsV3ApiItem>} deals
     * @memberof PublicDealsV3Api
     * @instance
     */
    PublicDealsV3Api.prototype.deals = $util.emptyArray;
    /**
     * PublicDealsV3Api eventType.
     * @member {string} eventType
     * @memberof PublicDealsV3Api
     * @instance
     */
    PublicDealsV3Api.prototype.eventType = "";
    /**
     * Creates a new PublicDealsV3Api instance using the specified properties.
     * @function create
     * @memberof PublicDealsV3Api
     * @static
     * @param {IPublicDealsV3Api=} [properties] Properties to set
     * @returns {PublicDealsV3Api} PublicDealsV3Api instance
     */
    PublicDealsV3Api.create = function create(properties) {
        return new PublicDealsV3Api(properties);
    };
    /**
     * Encodes the specified PublicDealsV3Api message. Does not implicitly {@link PublicDealsV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicDealsV3Api
     * @static
     * @param {IPublicDealsV3Api} message PublicDealsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicDealsV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.deals != null && message.deals.length)
            for (var i = 0; i < message.deals.length; ++i)
                $root.PublicDealsV3ApiItem.encode(message.deals[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.eventType);
        return writer;
    };
    /**
     * Encodes the specified PublicDealsV3Api message, length delimited. Does not implicitly {@link PublicDealsV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicDealsV3Api
     * @static
     * @param {IPublicDealsV3Api} message PublicDealsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicDealsV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicDealsV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicDealsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicDealsV3Api} PublicDealsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicDealsV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicDealsV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.deals && message.deals.length))
                        message.deals = [];
                    message.deals.push($root.PublicDealsV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 2: {
                    message.eventType = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicDealsV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicDealsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicDealsV3Api} PublicDealsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicDealsV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicDealsV3Api message.
     * @function verify
     * @memberof PublicDealsV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicDealsV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.deals != null && message.hasOwnProperty("deals")) {
            if (!Array.isArray(message.deals))
                return "deals: array expected";
            for (var i = 0; i < message.deals.length; ++i) {
                var error = $root.PublicDealsV3ApiItem.verify(message.deals[i]);
                if (error)
                    return "deals." + error;
            }
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            if (!$util.isString(message.eventType))
                return "eventType: string expected";
        return null;
    };
    /**
     * Creates a PublicDealsV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicDealsV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicDealsV3Api} PublicDealsV3Api
     */
    PublicDealsV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicDealsV3Api)
            return object;
        var message = new $root.PublicDealsV3Api();
        if (object.deals) {
            if (!Array.isArray(object.deals))
                throw TypeError(".PublicDealsV3Api.deals: array expected");
            message.deals = [];
            for (var i = 0; i < object.deals.length; ++i) {
                if (typeof object.deals[i] !== "object")
                    throw TypeError(".PublicDealsV3Api.deals: object expected");
                message.deals[i] = $root.PublicDealsV3ApiItem.fromObject(object.deals[i]);
            }
        }
        if (object.eventType != null)
            message.eventType = String(object.eventType);
        return message;
    };
    /**
     * Creates a plain object from a PublicDealsV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicDealsV3Api
     * @static
     * @param {PublicDealsV3Api} message PublicDealsV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicDealsV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.deals = [];
        if (options.defaults)
            object.eventType = "";
        if (message.deals && message.deals.length) {
            object.deals = [];
            for (var j = 0; j < message.deals.length; ++j)
                object.deals[j] = $root.PublicDealsV3ApiItem.toObject(message.deals[j], options);
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            object.eventType = message.eventType;
        return object;
    };
    /**
     * Converts this PublicDealsV3Api to JSON.
     * @function toJSON
     * @memberof PublicDealsV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicDealsV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicDealsV3Api
     * @function getTypeUrl
     * @memberof PublicDealsV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicDealsV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicDealsV3Api";
    };
    return PublicDealsV3Api;
})();
$root.PublicDealsV3ApiItem = (function () {
    /**
     * Properties of a PublicDealsV3ApiItem.
     * @exports IPublicDealsV3ApiItem
     * @interface IPublicDealsV3ApiItem
     * @property {string|null} [price] PublicDealsV3ApiItem price
     * @property {string|null} [quantity] PublicDealsV3ApiItem quantity
     * @property {number|null} [tradeType] PublicDealsV3ApiItem tradeType
     * @property {number|Long|null} [time] PublicDealsV3ApiItem time
     */
    /**
     * Constructs a new PublicDealsV3ApiItem.
     * @exports PublicDealsV3ApiItem
     * @classdesc Represents a PublicDealsV3ApiItem.
     * @implements IPublicDealsV3ApiItem
     * @constructor
     * @param {IPublicDealsV3ApiItem=} [properties] Properties to set
     */
    function PublicDealsV3ApiItem(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicDealsV3ApiItem price.
     * @member {string} price
     * @memberof PublicDealsV3ApiItem
     * @instance
     */
    PublicDealsV3ApiItem.prototype.price = "";
    /**
     * PublicDealsV3ApiItem quantity.
     * @member {string} quantity
     * @memberof PublicDealsV3ApiItem
     * @instance
     */
    PublicDealsV3ApiItem.prototype.quantity = "";
    /**
     * PublicDealsV3ApiItem tradeType.
     * @member {number} tradeType
     * @memberof PublicDealsV3ApiItem
     * @instance
     */
    PublicDealsV3ApiItem.prototype.tradeType = 0;
    /**
     * PublicDealsV3ApiItem time.
     * @member {number|Long} time
     * @memberof PublicDealsV3ApiItem
     * @instance
     */
    PublicDealsV3ApiItem.prototype.time = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    /**
     * Creates a new PublicDealsV3ApiItem instance using the specified properties.
     * @function create
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {IPublicDealsV3ApiItem=} [properties] Properties to set
     * @returns {PublicDealsV3ApiItem} PublicDealsV3ApiItem instance
     */
    PublicDealsV3ApiItem.create = function create(properties) {
        return new PublicDealsV3ApiItem(properties);
    };
    /**
     * Encodes the specified PublicDealsV3ApiItem message. Does not implicitly {@link PublicDealsV3ApiItem.verify|verify} messages.
     * @function encode
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {IPublicDealsV3ApiItem} message PublicDealsV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicDealsV3ApiItem.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.price);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.quantity);
        if (message.tradeType != null && Object.hasOwnProperty.call(message, "tradeType"))
            writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.tradeType);
        if (message.time != null && Object.hasOwnProperty.call(message, "time"))
            writer.uint32(/* id 4, wireType 0 =*/ 32).int64(message.time);
        return writer;
    };
    /**
     * Encodes the specified PublicDealsV3ApiItem message, length delimited. Does not implicitly {@link PublicDealsV3ApiItem.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {IPublicDealsV3ApiItem} message PublicDealsV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicDealsV3ApiItem.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicDealsV3ApiItem message from the specified reader or buffer.
     * @function decode
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicDealsV3ApiItem} PublicDealsV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicDealsV3ApiItem.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicDealsV3ApiItem();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.price = reader.string();
                    break;
                }
                case 2: {
                    message.quantity = reader.string();
                    break;
                }
                case 3: {
                    message.tradeType = reader.int32();
                    break;
                }
                case 4: {
                    message.time = reader.int64();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicDealsV3ApiItem message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicDealsV3ApiItem} PublicDealsV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicDealsV3ApiItem.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicDealsV3ApiItem message.
     * @function verify
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicDealsV3ApiItem.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            if (!$util.isInteger(message.tradeType))
                return "tradeType: integer expected";
        if (message.time != null && message.hasOwnProperty("time"))
            if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                return "time: integer|Long expected";
        return null;
    };
    /**
     * Creates a PublicDealsV3ApiItem message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicDealsV3ApiItem} PublicDealsV3ApiItem
     */
    PublicDealsV3ApiItem.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicDealsV3ApiItem)
            return object;
        var message = new $root.PublicDealsV3ApiItem();
        if (object.price != null)
            message.price = String(object.price);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        if (object.tradeType != null)
            message.tradeType = object.tradeType | 0;
        if (object.time != null)
            if ($util.Long)
                (message.time = $util.Long.fromValue(object.time)).unsigned = false;
            else if (typeof object.time === "string")
                message.time = parseInt(object.time, 10);
            else if (typeof object.time === "number")
                message.time = object.time;
            else if (typeof object.time === "object")
                message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
        return message;
    };
    /**
     * Creates a plain object from a PublicDealsV3ApiItem message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {PublicDealsV3ApiItem} message PublicDealsV3ApiItem
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicDealsV3ApiItem.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.price = "";
            object.quantity = "";
            object.tradeType = 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            }
            else
                object.time = options.longs === String ? "0" : 0;
        }
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        if (message.tradeType != null && message.hasOwnProperty("tradeType"))
            object.tradeType = message.tradeType;
        if (message.time != null && message.hasOwnProperty("time"))
            if (typeof message.time === "number")
                object.time = options.longs === String ? String(message.time) : message.time;
            else
                object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
        return object;
    };
    /**
     * Converts this PublicDealsV3ApiItem to JSON.
     * @function toJSON
     * @memberof PublicDealsV3ApiItem
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicDealsV3ApiItem.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicDealsV3ApiItem
     * @function getTypeUrl
     * @memberof PublicDealsV3ApiItem
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicDealsV3ApiItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicDealsV3ApiItem";
    };
    return PublicDealsV3ApiItem;
})();
$root.PublicIncreaseDepthsBatchV3Api = (function () {
    /**
     * Properties of a PublicIncreaseDepthsBatchV3Api.
     * @exports IPublicIncreaseDepthsBatchV3Api
     * @interface IPublicIncreaseDepthsBatchV3Api
     * @property {Array.<IPublicIncreaseDepthsV3Api>|null} [items] PublicIncreaseDepthsBatchV3Api items
     * @property {string|null} [eventType] PublicIncreaseDepthsBatchV3Api eventType
     */
    /**
     * Constructs a new PublicIncreaseDepthsBatchV3Api.
     * @exports PublicIncreaseDepthsBatchV3Api
     * @classdesc Represents a PublicIncreaseDepthsBatchV3Api.
     * @implements IPublicIncreaseDepthsBatchV3Api
     * @constructor
     * @param {IPublicIncreaseDepthsBatchV3Api=} [properties] Properties to set
     */
    function PublicIncreaseDepthsBatchV3Api(properties) {
        this.items = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicIncreaseDepthsBatchV3Api items.
     * @member {Array.<IPublicIncreaseDepthsV3Api>} items
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @instance
     */
    PublicIncreaseDepthsBatchV3Api.prototype.items = $util.emptyArray;
    /**
     * PublicIncreaseDepthsBatchV3Api eventType.
     * @member {string} eventType
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @instance
     */
    PublicIncreaseDepthsBatchV3Api.prototype.eventType = "";
    /**
     * Creates a new PublicIncreaseDepthsBatchV3Api instance using the specified properties.
     * @function create
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {IPublicIncreaseDepthsBatchV3Api=} [properties] Properties to set
     * @returns {PublicIncreaseDepthsBatchV3Api} PublicIncreaseDepthsBatchV3Api instance
     */
    PublicIncreaseDepthsBatchV3Api.create = function create(properties) {
        return new PublicIncreaseDepthsBatchV3Api(properties);
    };
    /**
     * Encodes the specified PublicIncreaseDepthsBatchV3Api message. Does not implicitly {@link PublicIncreaseDepthsBatchV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {IPublicIncreaseDepthsBatchV3Api} message PublicIncreaseDepthsBatchV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicIncreaseDepthsBatchV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.items != null && message.items.length)
            for (var i = 0; i < message.items.length; ++i)
                $root.PublicIncreaseDepthsV3Api.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.eventType);
        return writer;
    };
    /**
     * Encodes the specified PublicIncreaseDepthsBatchV3Api message, length delimited. Does not implicitly {@link PublicIncreaseDepthsBatchV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {IPublicIncreaseDepthsBatchV3Api} message PublicIncreaseDepthsBatchV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicIncreaseDepthsBatchV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicIncreaseDepthsBatchV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicIncreaseDepthsBatchV3Api} PublicIncreaseDepthsBatchV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicIncreaseDepthsBatchV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicIncreaseDepthsBatchV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.items && message.items.length))
                        message.items = [];
                    message.items.push($root.PublicIncreaseDepthsV3Api.decode(reader, reader.uint32()));
                    break;
                }
                case 2: {
                    message.eventType = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicIncreaseDepthsBatchV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicIncreaseDepthsBatchV3Api} PublicIncreaseDepthsBatchV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicIncreaseDepthsBatchV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicIncreaseDepthsBatchV3Api message.
     * @function verify
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicIncreaseDepthsBatchV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.items != null && message.hasOwnProperty("items")) {
            if (!Array.isArray(message.items))
                return "items: array expected";
            for (var i = 0; i < message.items.length; ++i) {
                var error = $root.PublicIncreaseDepthsV3Api.verify(message.items[i]);
                if (error)
                    return "items." + error;
            }
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            if (!$util.isString(message.eventType))
                return "eventType: string expected";
        return null;
    };
    /**
     * Creates a PublicIncreaseDepthsBatchV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicIncreaseDepthsBatchV3Api} PublicIncreaseDepthsBatchV3Api
     */
    PublicIncreaseDepthsBatchV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicIncreaseDepthsBatchV3Api)
            return object;
        var message = new $root.PublicIncreaseDepthsBatchV3Api();
        if (object.items) {
            if (!Array.isArray(object.items))
                throw TypeError(".PublicIncreaseDepthsBatchV3Api.items: array expected");
            message.items = [];
            for (var i = 0; i < object.items.length; ++i) {
                if (typeof object.items[i] !== "object")
                    throw TypeError(".PublicIncreaseDepthsBatchV3Api.items: object expected");
                message.items[i] = $root.PublicIncreaseDepthsV3Api.fromObject(object.items[i]);
            }
        }
        if (object.eventType != null)
            message.eventType = String(object.eventType);
        return message;
    };
    /**
     * Creates a plain object from a PublicIncreaseDepthsBatchV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {PublicIncreaseDepthsBatchV3Api} message PublicIncreaseDepthsBatchV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicIncreaseDepthsBatchV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.items = [];
        if (options.defaults)
            object.eventType = "";
        if (message.items && message.items.length) {
            object.items = [];
            for (var j = 0; j < message.items.length; ++j)
                object.items[j] = $root.PublicIncreaseDepthsV3Api.toObject(message.items[j], options);
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            object.eventType = message.eventType;
        return object;
    };
    /**
     * Converts this PublicIncreaseDepthsBatchV3Api to JSON.
     * @function toJSON
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicIncreaseDepthsBatchV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicIncreaseDepthsBatchV3Api
     * @function getTypeUrl
     * @memberof PublicIncreaseDepthsBatchV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicIncreaseDepthsBatchV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicIncreaseDepthsBatchV3Api";
    };
    return PublicIncreaseDepthsBatchV3Api;
})();
$root.PublicIncreaseDepthsV3Api = (function () {
    /**
     * Properties of a PublicIncreaseDepthsV3Api.
     * @exports IPublicIncreaseDepthsV3Api
     * @interface IPublicIncreaseDepthsV3Api
     * @property {Array.<IPublicIncreaseDepthV3ApiItem>|null} [asks] PublicIncreaseDepthsV3Api asks
     * @property {Array.<IPublicIncreaseDepthV3ApiItem>|null} [bids] PublicIncreaseDepthsV3Api bids
     * @property {string|null} [eventType] PublicIncreaseDepthsV3Api eventType
     * @property {string|null} [version] PublicIncreaseDepthsV3Api version
     */
    /**
     * Constructs a new PublicIncreaseDepthsV3Api.
     * @exports PublicIncreaseDepthsV3Api
     * @classdesc Represents a PublicIncreaseDepthsV3Api.
     * @implements IPublicIncreaseDepthsV3Api
     * @constructor
     * @param {IPublicIncreaseDepthsV3Api=} [properties] Properties to set
     */
    function PublicIncreaseDepthsV3Api(properties) {
        this.asks = [];
        this.bids = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicIncreaseDepthsV3Api asks.
     * @member {Array.<IPublicIncreaseDepthV3ApiItem>} asks
     * @memberof PublicIncreaseDepthsV3Api
     * @instance
     */
    PublicIncreaseDepthsV3Api.prototype.asks = $util.emptyArray;
    /**
     * PublicIncreaseDepthsV3Api bids.
     * @member {Array.<IPublicIncreaseDepthV3ApiItem>} bids
     * @memberof PublicIncreaseDepthsV3Api
     * @instance
     */
    PublicIncreaseDepthsV3Api.prototype.bids = $util.emptyArray;
    /**
     * PublicIncreaseDepthsV3Api eventType.
     * @member {string} eventType
     * @memberof PublicIncreaseDepthsV3Api
     * @instance
     */
    PublicIncreaseDepthsV3Api.prototype.eventType = "";
    /**
     * PublicIncreaseDepthsV3Api version.
     * @member {string} version
     * @memberof PublicIncreaseDepthsV3Api
     * @instance
     */
    PublicIncreaseDepthsV3Api.prototype.version = "";
    /**
     * Creates a new PublicIncreaseDepthsV3Api instance using the specified properties.
     * @function create
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {IPublicIncreaseDepthsV3Api=} [properties] Properties to set
     * @returns {PublicIncreaseDepthsV3Api} PublicIncreaseDepthsV3Api instance
     */
    PublicIncreaseDepthsV3Api.create = function create(properties) {
        return new PublicIncreaseDepthsV3Api(properties);
    };
    /**
     * Encodes the specified PublicIncreaseDepthsV3Api message. Does not implicitly {@link PublicIncreaseDepthsV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {IPublicIncreaseDepthsV3Api} message PublicIncreaseDepthsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicIncreaseDepthsV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.asks != null && message.asks.length)
            for (var i = 0; i < message.asks.length; ++i)
                $root.PublicIncreaseDepthV3ApiItem.encode(message.asks[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        if (message.bids != null && message.bids.length)
            for (var i = 0; i < message.bids.length; ++i)
                $root.PublicIncreaseDepthV3ApiItem.encode(message.bids[i], writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
        if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.eventType);
        if (message.version != null && Object.hasOwnProperty.call(message, "version"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.version);
        return writer;
    };
    /**
     * Encodes the specified PublicIncreaseDepthsV3Api message, length delimited. Does not implicitly {@link PublicIncreaseDepthsV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {IPublicIncreaseDepthsV3Api} message PublicIncreaseDepthsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicIncreaseDepthsV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicIncreaseDepthsV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicIncreaseDepthsV3Api} PublicIncreaseDepthsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicIncreaseDepthsV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicIncreaseDepthsV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.asks && message.asks.length))
                        message.asks = [];
                    message.asks.push($root.PublicIncreaseDepthV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 2: {
                    if (!(message.bids && message.bids.length))
                        message.bids = [];
                    message.bids.push($root.PublicIncreaseDepthV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 3: {
                    message.eventType = reader.string();
                    break;
                }
                case 4: {
                    message.version = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicIncreaseDepthsV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicIncreaseDepthsV3Api} PublicIncreaseDepthsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicIncreaseDepthsV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicIncreaseDepthsV3Api message.
     * @function verify
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicIncreaseDepthsV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.asks != null && message.hasOwnProperty("asks")) {
            if (!Array.isArray(message.asks))
                return "asks: array expected";
            for (var i = 0; i < message.asks.length; ++i) {
                var error = $root.PublicIncreaseDepthV3ApiItem.verify(message.asks[i]);
                if (error)
                    return "asks." + error;
            }
        }
        if (message.bids != null && message.hasOwnProperty("bids")) {
            if (!Array.isArray(message.bids))
                return "bids: array expected";
            for (var i = 0; i < message.bids.length; ++i) {
                var error = $root.PublicIncreaseDepthV3ApiItem.verify(message.bids[i]);
                if (error)
                    return "bids." + error;
            }
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            if (!$util.isString(message.eventType))
                return "eventType: string expected";
        if (message.version != null && message.hasOwnProperty("version"))
            if (!$util.isString(message.version))
                return "version: string expected";
        return null;
    };
    /**
     * Creates a PublicIncreaseDepthsV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicIncreaseDepthsV3Api} PublicIncreaseDepthsV3Api
     */
    PublicIncreaseDepthsV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicIncreaseDepthsV3Api)
            return object;
        var message = new $root.PublicIncreaseDepthsV3Api();
        if (object.asks) {
            if (!Array.isArray(object.asks))
                throw TypeError(".PublicIncreaseDepthsV3Api.asks: array expected");
            message.asks = [];
            for (var i = 0; i < object.asks.length; ++i) {
                if (typeof object.asks[i] !== "object")
                    throw TypeError(".PublicIncreaseDepthsV3Api.asks: object expected");
                message.asks[i] = $root.PublicIncreaseDepthV3ApiItem.fromObject(object.asks[i]);
            }
        }
        if (object.bids) {
            if (!Array.isArray(object.bids))
                throw TypeError(".PublicIncreaseDepthsV3Api.bids: array expected");
            message.bids = [];
            for (var i = 0; i < object.bids.length; ++i) {
                if (typeof object.bids[i] !== "object")
                    throw TypeError(".PublicIncreaseDepthsV3Api.bids: object expected");
                message.bids[i] = $root.PublicIncreaseDepthV3ApiItem.fromObject(object.bids[i]);
            }
        }
        if (object.eventType != null)
            message.eventType = String(object.eventType);
        if (object.version != null)
            message.version = String(object.version);
        return message;
    };
    /**
     * Creates a plain object from a PublicIncreaseDepthsV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {PublicIncreaseDepthsV3Api} message PublicIncreaseDepthsV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicIncreaseDepthsV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.asks = [];
            object.bids = [];
        }
        if (options.defaults) {
            object.eventType = "";
            object.version = "";
        }
        if (message.asks && message.asks.length) {
            object.asks = [];
            for (var j = 0; j < message.asks.length; ++j)
                object.asks[j] = $root.PublicIncreaseDepthV3ApiItem.toObject(message.asks[j], options);
        }
        if (message.bids && message.bids.length) {
            object.bids = [];
            for (var j = 0; j < message.bids.length; ++j)
                object.bids[j] = $root.PublicIncreaseDepthV3ApiItem.toObject(message.bids[j], options);
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            object.eventType = message.eventType;
        if (message.version != null && message.hasOwnProperty("version"))
            object.version = message.version;
        return object;
    };
    /**
     * Converts this PublicIncreaseDepthsV3Api to JSON.
     * @function toJSON
     * @memberof PublicIncreaseDepthsV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicIncreaseDepthsV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicIncreaseDepthsV3Api
     * @function getTypeUrl
     * @memberof PublicIncreaseDepthsV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicIncreaseDepthsV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicIncreaseDepthsV3Api";
    };
    return PublicIncreaseDepthsV3Api;
})();
$root.PublicIncreaseDepthV3ApiItem = (function () {
    /**
     * Properties of a PublicIncreaseDepthV3ApiItem.
     * @exports IPublicIncreaseDepthV3ApiItem
     * @interface IPublicIncreaseDepthV3ApiItem
     * @property {string|null} [price] PublicIncreaseDepthV3ApiItem price
     * @property {string|null} [quantity] PublicIncreaseDepthV3ApiItem quantity
     */
    /**
     * Constructs a new PublicIncreaseDepthV3ApiItem.
     * @exports PublicIncreaseDepthV3ApiItem
     * @classdesc Represents a PublicIncreaseDepthV3ApiItem.
     * @implements IPublicIncreaseDepthV3ApiItem
     * @constructor
     * @param {IPublicIncreaseDepthV3ApiItem=} [properties] Properties to set
     */
    function PublicIncreaseDepthV3ApiItem(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicIncreaseDepthV3ApiItem price.
     * @member {string} price
     * @memberof PublicIncreaseDepthV3ApiItem
     * @instance
     */
    PublicIncreaseDepthV3ApiItem.prototype.price = "";
    /**
     * PublicIncreaseDepthV3ApiItem quantity.
     * @member {string} quantity
     * @memberof PublicIncreaseDepthV3ApiItem
     * @instance
     */
    PublicIncreaseDepthV3ApiItem.prototype.quantity = "";
    /**
     * Creates a new PublicIncreaseDepthV3ApiItem instance using the specified properties.
     * @function create
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {IPublicIncreaseDepthV3ApiItem=} [properties] Properties to set
     * @returns {PublicIncreaseDepthV3ApiItem} PublicIncreaseDepthV3ApiItem instance
     */
    PublicIncreaseDepthV3ApiItem.create = function create(properties) {
        return new PublicIncreaseDepthV3ApiItem(properties);
    };
    /**
     * Encodes the specified PublicIncreaseDepthV3ApiItem message. Does not implicitly {@link PublicIncreaseDepthV3ApiItem.verify|verify} messages.
     * @function encode
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {IPublicIncreaseDepthV3ApiItem} message PublicIncreaseDepthV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicIncreaseDepthV3ApiItem.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.price);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.quantity);
        return writer;
    };
    /**
     * Encodes the specified PublicIncreaseDepthV3ApiItem message, length delimited. Does not implicitly {@link PublicIncreaseDepthV3ApiItem.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {IPublicIncreaseDepthV3ApiItem} message PublicIncreaseDepthV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicIncreaseDepthV3ApiItem.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicIncreaseDepthV3ApiItem message from the specified reader or buffer.
     * @function decode
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicIncreaseDepthV3ApiItem} PublicIncreaseDepthV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicIncreaseDepthV3ApiItem.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicIncreaseDepthV3ApiItem();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.price = reader.string();
                    break;
                }
                case 2: {
                    message.quantity = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicIncreaseDepthV3ApiItem message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicIncreaseDepthV3ApiItem} PublicIncreaseDepthV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicIncreaseDepthV3ApiItem.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicIncreaseDepthV3ApiItem message.
     * @function verify
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicIncreaseDepthV3ApiItem.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        return null;
    };
    /**
     * Creates a PublicIncreaseDepthV3ApiItem message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicIncreaseDepthV3ApiItem} PublicIncreaseDepthV3ApiItem
     */
    PublicIncreaseDepthV3ApiItem.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicIncreaseDepthV3ApiItem)
            return object;
        var message = new $root.PublicIncreaseDepthV3ApiItem();
        if (object.price != null)
            message.price = String(object.price);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        return message;
    };
    /**
     * Creates a plain object from a PublicIncreaseDepthV3ApiItem message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {PublicIncreaseDepthV3ApiItem} message PublicIncreaseDepthV3ApiItem
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicIncreaseDepthV3ApiItem.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.price = "";
            object.quantity = "";
        }
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        return object;
    };
    /**
     * Converts this PublicIncreaseDepthV3ApiItem to JSON.
     * @function toJSON
     * @memberof PublicIncreaseDepthV3ApiItem
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicIncreaseDepthV3ApiItem.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicIncreaseDepthV3ApiItem
     * @function getTypeUrl
     * @memberof PublicIncreaseDepthV3ApiItem
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicIncreaseDepthV3ApiItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicIncreaseDepthV3ApiItem";
    };
    return PublicIncreaseDepthV3ApiItem;
})();
$root.PublicLimitDepthsV3Api = (function () {
    /**
     * Properties of a PublicLimitDepthsV3Api.
     * @exports IPublicLimitDepthsV3Api
     * @interface IPublicLimitDepthsV3Api
     * @property {Array.<IPublicLimitDepthV3ApiItem>|null} [asks] PublicLimitDepthsV3Api asks
     * @property {Array.<IPublicLimitDepthV3ApiItem>|null} [bids] PublicLimitDepthsV3Api bids
     * @property {string|null} [eventType] PublicLimitDepthsV3Api eventType
     * @property {string|null} [version] PublicLimitDepthsV3Api version
     */
    /**
     * Constructs a new PublicLimitDepthsV3Api.
     * @exports PublicLimitDepthsV3Api
     * @classdesc Represents a PublicLimitDepthsV3Api.
     * @implements IPublicLimitDepthsV3Api
     * @constructor
     * @param {IPublicLimitDepthsV3Api=} [properties] Properties to set
     */
    function PublicLimitDepthsV3Api(properties) {
        this.asks = [];
        this.bids = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicLimitDepthsV3Api asks.
     * @member {Array.<IPublicLimitDepthV3ApiItem>} asks
     * @memberof PublicLimitDepthsV3Api
     * @instance
     */
    PublicLimitDepthsV3Api.prototype.asks = $util.emptyArray;
    /**
     * PublicLimitDepthsV3Api bids.
     * @member {Array.<IPublicLimitDepthV3ApiItem>} bids
     * @memberof PublicLimitDepthsV3Api
     * @instance
     */
    PublicLimitDepthsV3Api.prototype.bids = $util.emptyArray;
    /**
     * PublicLimitDepthsV3Api eventType.
     * @member {string} eventType
     * @memberof PublicLimitDepthsV3Api
     * @instance
     */
    PublicLimitDepthsV3Api.prototype.eventType = "";
    /**
     * PublicLimitDepthsV3Api version.
     * @member {string} version
     * @memberof PublicLimitDepthsV3Api
     * @instance
     */
    PublicLimitDepthsV3Api.prototype.version = "";
    /**
     * Creates a new PublicLimitDepthsV3Api instance using the specified properties.
     * @function create
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {IPublicLimitDepthsV3Api=} [properties] Properties to set
     * @returns {PublicLimitDepthsV3Api} PublicLimitDepthsV3Api instance
     */
    PublicLimitDepthsV3Api.create = function create(properties) {
        return new PublicLimitDepthsV3Api(properties);
    };
    /**
     * Encodes the specified PublicLimitDepthsV3Api message. Does not implicitly {@link PublicLimitDepthsV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {IPublicLimitDepthsV3Api} message PublicLimitDepthsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicLimitDepthsV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.asks != null && message.asks.length)
            for (var i = 0; i < message.asks.length; ++i)
                $root.PublicLimitDepthV3ApiItem.encode(message.asks[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        if (message.bids != null && message.bids.length)
            for (var i = 0; i < message.bids.length; ++i)
                $root.PublicLimitDepthV3ApiItem.encode(message.bids[i], writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
        if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.eventType);
        if (message.version != null && Object.hasOwnProperty.call(message, "version"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.version);
        return writer;
    };
    /**
     * Encodes the specified PublicLimitDepthsV3Api message, length delimited. Does not implicitly {@link PublicLimitDepthsV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {IPublicLimitDepthsV3Api} message PublicLimitDepthsV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicLimitDepthsV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicLimitDepthsV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicLimitDepthsV3Api} PublicLimitDepthsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicLimitDepthsV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicLimitDepthsV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.asks && message.asks.length))
                        message.asks = [];
                    message.asks.push($root.PublicLimitDepthV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 2: {
                    if (!(message.bids && message.bids.length))
                        message.bids = [];
                    message.bids.push($root.PublicLimitDepthV3ApiItem.decode(reader, reader.uint32()));
                    break;
                }
                case 3: {
                    message.eventType = reader.string();
                    break;
                }
                case 4: {
                    message.version = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicLimitDepthsV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicLimitDepthsV3Api} PublicLimitDepthsV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicLimitDepthsV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicLimitDepthsV3Api message.
     * @function verify
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicLimitDepthsV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.asks != null && message.hasOwnProperty("asks")) {
            if (!Array.isArray(message.asks))
                return "asks: array expected";
            for (var i = 0; i < message.asks.length; ++i) {
                var error = $root.PublicLimitDepthV3ApiItem.verify(message.asks[i]);
                if (error)
                    return "asks." + error;
            }
        }
        if (message.bids != null && message.hasOwnProperty("bids")) {
            if (!Array.isArray(message.bids))
                return "bids: array expected";
            for (var i = 0; i < message.bids.length; ++i) {
                var error = $root.PublicLimitDepthV3ApiItem.verify(message.bids[i]);
                if (error)
                    return "bids." + error;
            }
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            if (!$util.isString(message.eventType))
                return "eventType: string expected";
        if (message.version != null && message.hasOwnProperty("version"))
            if (!$util.isString(message.version))
                return "version: string expected";
        return null;
    };
    /**
     * Creates a PublicLimitDepthsV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicLimitDepthsV3Api} PublicLimitDepthsV3Api
     */
    PublicLimitDepthsV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicLimitDepthsV3Api)
            return object;
        var message = new $root.PublicLimitDepthsV3Api();
        if (object.asks) {
            if (!Array.isArray(object.asks))
                throw TypeError(".PublicLimitDepthsV3Api.asks: array expected");
            message.asks = [];
            for (var i = 0; i < object.asks.length; ++i) {
                if (typeof object.asks[i] !== "object")
                    throw TypeError(".PublicLimitDepthsV3Api.asks: object expected");
                message.asks[i] = $root.PublicLimitDepthV3ApiItem.fromObject(object.asks[i]);
            }
        }
        if (object.bids) {
            if (!Array.isArray(object.bids))
                throw TypeError(".PublicLimitDepthsV3Api.bids: array expected");
            message.bids = [];
            for (var i = 0; i < object.bids.length; ++i) {
                if (typeof object.bids[i] !== "object")
                    throw TypeError(".PublicLimitDepthsV3Api.bids: object expected");
                message.bids[i] = $root.PublicLimitDepthV3ApiItem.fromObject(object.bids[i]);
            }
        }
        if (object.eventType != null)
            message.eventType = String(object.eventType);
        if (object.version != null)
            message.version = String(object.version);
        return message;
    };
    /**
     * Creates a plain object from a PublicLimitDepthsV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {PublicLimitDepthsV3Api} message PublicLimitDepthsV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicLimitDepthsV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.asks = [];
            object.bids = [];
        }
        if (options.defaults) {
            object.eventType = "";
            object.version = "";
        }
        if (message.asks && message.asks.length) {
            object.asks = [];
            for (var j = 0; j < message.asks.length; ++j)
                object.asks[j] = $root.PublicLimitDepthV3ApiItem.toObject(message.asks[j], options);
        }
        if (message.bids && message.bids.length) {
            object.bids = [];
            for (var j = 0; j < message.bids.length; ++j)
                object.bids[j] = $root.PublicLimitDepthV3ApiItem.toObject(message.bids[j], options);
        }
        if (message.eventType != null && message.hasOwnProperty("eventType"))
            object.eventType = message.eventType;
        if (message.version != null && message.hasOwnProperty("version"))
            object.version = message.version;
        return object;
    };
    /**
     * Converts this PublicLimitDepthsV3Api to JSON.
     * @function toJSON
     * @memberof PublicLimitDepthsV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicLimitDepthsV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicLimitDepthsV3Api
     * @function getTypeUrl
     * @memberof PublicLimitDepthsV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicLimitDepthsV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicLimitDepthsV3Api";
    };
    return PublicLimitDepthsV3Api;
})();
$root.PublicLimitDepthV3ApiItem = (function () {
    /**
     * Properties of a PublicLimitDepthV3ApiItem.
     * @exports IPublicLimitDepthV3ApiItem
     * @interface IPublicLimitDepthV3ApiItem
     * @property {string|null} [price] PublicLimitDepthV3ApiItem price
     * @property {string|null} [quantity] PublicLimitDepthV3ApiItem quantity
     */
    /**
     * Constructs a new PublicLimitDepthV3ApiItem.
     * @exports PublicLimitDepthV3ApiItem
     * @classdesc Represents a PublicLimitDepthV3ApiItem.
     * @implements IPublicLimitDepthV3ApiItem
     * @constructor
     * @param {IPublicLimitDepthV3ApiItem=} [properties] Properties to set
     */
    function PublicLimitDepthV3ApiItem(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicLimitDepthV3ApiItem price.
     * @member {string} price
     * @memberof PublicLimitDepthV3ApiItem
     * @instance
     */
    PublicLimitDepthV3ApiItem.prototype.price = "";
    /**
     * PublicLimitDepthV3ApiItem quantity.
     * @member {string} quantity
     * @memberof PublicLimitDepthV3ApiItem
     * @instance
     */
    PublicLimitDepthV3ApiItem.prototype.quantity = "";
    /**
     * Creates a new PublicLimitDepthV3ApiItem instance using the specified properties.
     * @function create
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {IPublicLimitDepthV3ApiItem=} [properties] Properties to set
     * @returns {PublicLimitDepthV3ApiItem} PublicLimitDepthV3ApiItem instance
     */
    PublicLimitDepthV3ApiItem.create = function create(properties) {
        return new PublicLimitDepthV3ApiItem(properties);
    };
    /**
     * Encodes the specified PublicLimitDepthV3ApiItem message. Does not implicitly {@link PublicLimitDepthV3ApiItem.verify|verify} messages.
     * @function encode
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {IPublicLimitDepthV3ApiItem} message PublicLimitDepthV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicLimitDepthV3ApiItem.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.price);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.quantity);
        return writer;
    };
    /**
     * Encodes the specified PublicLimitDepthV3ApiItem message, length delimited. Does not implicitly {@link PublicLimitDepthV3ApiItem.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {IPublicLimitDepthV3ApiItem} message PublicLimitDepthV3ApiItem message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicLimitDepthV3ApiItem.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicLimitDepthV3ApiItem message from the specified reader or buffer.
     * @function decode
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicLimitDepthV3ApiItem} PublicLimitDepthV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicLimitDepthV3ApiItem.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicLimitDepthV3ApiItem();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.price = reader.string();
                    break;
                }
                case 2: {
                    message.quantity = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicLimitDepthV3ApiItem message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicLimitDepthV3ApiItem} PublicLimitDepthV3ApiItem
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicLimitDepthV3ApiItem.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicLimitDepthV3ApiItem message.
     * @function verify
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicLimitDepthV3ApiItem.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        return null;
    };
    /**
     * Creates a PublicLimitDepthV3ApiItem message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicLimitDepthV3ApiItem} PublicLimitDepthV3ApiItem
     */
    PublicLimitDepthV3ApiItem.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicLimitDepthV3ApiItem)
            return object;
        var message = new $root.PublicLimitDepthV3ApiItem();
        if (object.price != null)
            message.price = String(object.price);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        return message;
    };
    /**
     * Creates a plain object from a PublicLimitDepthV3ApiItem message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {PublicLimitDepthV3ApiItem} message PublicLimitDepthV3ApiItem
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicLimitDepthV3ApiItem.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.price = "";
            object.quantity = "";
        }
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        return object;
    };
    /**
     * Converts this PublicLimitDepthV3ApiItem to JSON.
     * @function toJSON
     * @memberof PublicLimitDepthV3ApiItem
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicLimitDepthV3ApiItem.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicLimitDepthV3ApiItem
     * @function getTypeUrl
     * @memberof PublicLimitDepthV3ApiItem
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicLimitDepthV3ApiItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicLimitDepthV3ApiItem";
    };
    return PublicLimitDepthV3ApiItem;
})();
$root.PublicMiniTickerV3Api = (function () {
    /**
     * Properties of a PublicMiniTickerV3Api.
     * @exports IPublicMiniTickerV3Api
     * @interface IPublicMiniTickerV3Api
     * @property {string|null} [symbol] PublicMiniTickerV3Api symbol
     * @property {string|null} [price] PublicMiniTickerV3Api price
     * @property {string|null} [rate] PublicMiniTickerV3Api rate
     * @property {string|null} [zonedRate] PublicMiniTickerV3Api zonedRate
     * @property {string|null} [high] PublicMiniTickerV3Api high
     * @property {string|null} [low] PublicMiniTickerV3Api low
     * @property {string|null} [volume] PublicMiniTickerV3Api volume
     * @property {string|null} [quantity] PublicMiniTickerV3Api quantity
     * @property {string|null} [lastCloseRate] PublicMiniTickerV3Api lastCloseRate
     * @property {string|null} [lastCloseZonedRate] PublicMiniTickerV3Api lastCloseZonedRate
     * @property {string|null} [lastCloseHigh] PublicMiniTickerV3Api lastCloseHigh
     * @property {string|null} [lastCloseLow] PublicMiniTickerV3Api lastCloseLow
     */
    /**
     * Constructs a new PublicMiniTickerV3Api.
     * @exports PublicMiniTickerV3Api
     * @classdesc Represents a PublicMiniTickerV3Api.
     * @implements IPublicMiniTickerV3Api
     * @constructor
     * @param {IPublicMiniTickerV3Api=} [properties] Properties to set
     */
    function PublicMiniTickerV3Api(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicMiniTickerV3Api symbol.
     * @member {string} symbol
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.symbol = "";
    /**
     * PublicMiniTickerV3Api price.
     * @member {string} price
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.price = "";
    /**
     * PublicMiniTickerV3Api rate.
     * @member {string} rate
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.rate = "";
    /**
     * PublicMiniTickerV3Api zonedRate.
     * @member {string} zonedRate
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.zonedRate = "";
    /**
     * PublicMiniTickerV3Api high.
     * @member {string} high
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.high = "";
    /**
     * PublicMiniTickerV3Api low.
     * @member {string} low
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.low = "";
    /**
     * PublicMiniTickerV3Api volume.
     * @member {string} volume
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.volume = "";
    /**
     * PublicMiniTickerV3Api quantity.
     * @member {string} quantity
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.quantity = "";
    /**
     * PublicMiniTickerV3Api lastCloseRate.
     * @member {string} lastCloseRate
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.lastCloseRate = "";
    /**
     * PublicMiniTickerV3Api lastCloseZonedRate.
     * @member {string} lastCloseZonedRate
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.lastCloseZonedRate = "";
    /**
     * PublicMiniTickerV3Api lastCloseHigh.
     * @member {string} lastCloseHigh
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.lastCloseHigh = "";
    /**
     * PublicMiniTickerV3Api lastCloseLow.
     * @member {string} lastCloseLow
     * @memberof PublicMiniTickerV3Api
     * @instance
     */
    PublicMiniTickerV3Api.prototype.lastCloseLow = "";
    /**
     * Creates a new PublicMiniTickerV3Api instance using the specified properties.
     * @function create
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {IPublicMiniTickerV3Api=} [properties] Properties to set
     * @returns {PublicMiniTickerV3Api} PublicMiniTickerV3Api instance
     */
    PublicMiniTickerV3Api.create = function create(properties) {
        return new PublicMiniTickerV3Api(properties);
    };
    /**
     * Encodes the specified PublicMiniTickerV3Api message. Does not implicitly {@link PublicMiniTickerV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {IPublicMiniTickerV3Api} message PublicMiniTickerV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicMiniTickerV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.symbol != null && Object.hasOwnProperty.call(message, "symbol"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.symbol);
        if (message.price != null && Object.hasOwnProperty.call(message, "price"))
            writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.price);
        if (message.rate != null && Object.hasOwnProperty.call(message, "rate"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.rate);
        if (message.zonedRate != null && Object.hasOwnProperty.call(message, "zonedRate"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.zonedRate);
        if (message.high != null && Object.hasOwnProperty.call(message, "high"))
            writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.high);
        if (message.low != null && Object.hasOwnProperty.call(message, "low"))
            writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.low);
        if (message.volume != null && Object.hasOwnProperty.call(message, "volume"))
            writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.volume);
        if (message.quantity != null && Object.hasOwnProperty.call(message, "quantity"))
            writer.uint32(/* id 8, wireType 2 =*/ 66).string(message.quantity);
        if (message.lastCloseRate != null && Object.hasOwnProperty.call(message, "lastCloseRate"))
            writer.uint32(/* id 9, wireType 2 =*/ 74).string(message.lastCloseRate);
        if (message.lastCloseZonedRate != null && Object.hasOwnProperty.call(message, "lastCloseZonedRate"))
            writer.uint32(/* id 10, wireType 2 =*/ 82).string(message.lastCloseZonedRate);
        if (message.lastCloseHigh != null && Object.hasOwnProperty.call(message, "lastCloseHigh"))
            writer.uint32(/* id 11, wireType 2 =*/ 90).string(message.lastCloseHigh);
        if (message.lastCloseLow != null && Object.hasOwnProperty.call(message, "lastCloseLow"))
            writer.uint32(/* id 12, wireType 2 =*/ 98).string(message.lastCloseLow);
        return writer;
    };
    /**
     * Encodes the specified PublicMiniTickerV3Api message, length delimited. Does not implicitly {@link PublicMiniTickerV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {IPublicMiniTickerV3Api} message PublicMiniTickerV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicMiniTickerV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicMiniTickerV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicMiniTickerV3Api} PublicMiniTickerV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicMiniTickerV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicMiniTickerV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.symbol = reader.string();
                    break;
                }
                case 2: {
                    message.price = reader.string();
                    break;
                }
                case 3: {
                    message.rate = reader.string();
                    break;
                }
                case 4: {
                    message.zonedRate = reader.string();
                    break;
                }
                case 5: {
                    message.high = reader.string();
                    break;
                }
                case 6: {
                    message.low = reader.string();
                    break;
                }
                case 7: {
                    message.volume = reader.string();
                    break;
                }
                case 8: {
                    message.quantity = reader.string();
                    break;
                }
                case 9: {
                    message.lastCloseRate = reader.string();
                    break;
                }
                case 10: {
                    message.lastCloseZonedRate = reader.string();
                    break;
                }
                case 11: {
                    message.lastCloseHigh = reader.string();
                    break;
                }
                case 12: {
                    message.lastCloseLow = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicMiniTickerV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicMiniTickerV3Api} PublicMiniTickerV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicMiniTickerV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicMiniTickerV3Api message.
     * @function verify
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicMiniTickerV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.symbol != null && message.hasOwnProperty("symbol"))
            if (!$util.isString(message.symbol))
                return "symbol: string expected";
        if (message.price != null && message.hasOwnProperty("price"))
            if (!$util.isString(message.price))
                return "price: string expected";
        if (message.rate != null && message.hasOwnProperty("rate"))
            if (!$util.isString(message.rate))
                return "rate: string expected";
        if (message.zonedRate != null && message.hasOwnProperty("zonedRate"))
            if (!$util.isString(message.zonedRate))
                return "zonedRate: string expected";
        if (message.high != null && message.hasOwnProperty("high"))
            if (!$util.isString(message.high))
                return "high: string expected";
        if (message.low != null && message.hasOwnProperty("low"))
            if (!$util.isString(message.low))
                return "low: string expected";
        if (message.volume != null && message.hasOwnProperty("volume"))
            if (!$util.isString(message.volume))
                return "volume: string expected";
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            if (!$util.isString(message.quantity))
                return "quantity: string expected";
        if (message.lastCloseRate != null && message.hasOwnProperty("lastCloseRate"))
            if (!$util.isString(message.lastCloseRate))
                return "lastCloseRate: string expected";
        if (message.lastCloseZonedRate != null && message.hasOwnProperty("lastCloseZonedRate"))
            if (!$util.isString(message.lastCloseZonedRate))
                return "lastCloseZonedRate: string expected";
        if (message.lastCloseHigh != null && message.hasOwnProperty("lastCloseHigh"))
            if (!$util.isString(message.lastCloseHigh))
                return "lastCloseHigh: string expected";
        if (message.lastCloseLow != null && message.hasOwnProperty("lastCloseLow"))
            if (!$util.isString(message.lastCloseLow))
                return "lastCloseLow: string expected";
        return null;
    };
    /**
     * Creates a PublicMiniTickerV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicMiniTickerV3Api} PublicMiniTickerV3Api
     */
    PublicMiniTickerV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicMiniTickerV3Api)
            return object;
        var message = new $root.PublicMiniTickerV3Api();
        if (object.symbol != null)
            message.symbol = String(object.symbol);
        if (object.price != null)
            message.price = String(object.price);
        if (object.rate != null)
            message.rate = String(object.rate);
        if (object.zonedRate != null)
            message.zonedRate = String(object.zonedRate);
        if (object.high != null)
            message.high = String(object.high);
        if (object.low != null)
            message.low = String(object.low);
        if (object.volume != null)
            message.volume = String(object.volume);
        if (object.quantity != null)
            message.quantity = String(object.quantity);
        if (object.lastCloseRate != null)
            message.lastCloseRate = String(object.lastCloseRate);
        if (object.lastCloseZonedRate != null)
            message.lastCloseZonedRate = String(object.lastCloseZonedRate);
        if (object.lastCloseHigh != null)
            message.lastCloseHigh = String(object.lastCloseHigh);
        if (object.lastCloseLow != null)
            message.lastCloseLow = String(object.lastCloseLow);
        return message;
    };
    /**
     * Creates a plain object from a PublicMiniTickerV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {PublicMiniTickerV3Api} message PublicMiniTickerV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicMiniTickerV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.symbol = "";
            object.price = "";
            object.rate = "";
            object.zonedRate = "";
            object.high = "";
            object.low = "";
            object.volume = "";
            object.quantity = "";
            object.lastCloseRate = "";
            object.lastCloseZonedRate = "";
            object.lastCloseHigh = "";
            object.lastCloseLow = "";
        }
        if (message.symbol != null && message.hasOwnProperty("symbol"))
            object.symbol = message.symbol;
        if (message.price != null && message.hasOwnProperty("price"))
            object.price = message.price;
        if (message.rate != null && message.hasOwnProperty("rate"))
            object.rate = message.rate;
        if (message.zonedRate != null && message.hasOwnProperty("zonedRate"))
            object.zonedRate = message.zonedRate;
        if (message.high != null && message.hasOwnProperty("high"))
            object.high = message.high;
        if (message.low != null && message.hasOwnProperty("low"))
            object.low = message.low;
        if (message.volume != null && message.hasOwnProperty("volume"))
            object.volume = message.volume;
        if (message.quantity != null && message.hasOwnProperty("quantity"))
            object.quantity = message.quantity;
        if (message.lastCloseRate != null && message.hasOwnProperty("lastCloseRate"))
            object.lastCloseRate = message.lastCloseRate;
        if (message.lastCloseZonedRate != null && message.hasOwnProperty("lastCloseZonedRate"))
            object.lastCloseZonedRate = message.lastCloseZonedRate;
        if (message.lastCloseHigh != null && message.hasOwnProperty("lastCloseHigh"))
            object.lastCloseHigh = message.lastCloseHigh;
        if (message.lastCloseLow != null && message.hasOwnProperty("lastCloseLow"))
            object.lastCloseLow = message.lastCloseLow;
        return object;
    };
    /**
     * Converts this PublicMiniTickerV3Api to JSON.
     * @function toJSON
     * @memberof PublicMiniTickerV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicMiniTickerV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicMiniTickerV3Api
     * @function getTypeUrl
     * @memberof PublicMiniTickerV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicMiniTickerV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicMiniTickerV3Api";
    };
    return PublicMiniTickerV3Api;
})();
$root.PublicMiniTickersV3Api = (function () {
    /**
     * Properties of a PublicMiniTickersV3Api.
     * @exports IPublicMiniTickersV3Api
     * @interface IPublicMiniTickersV3Api
     * @property {Array.<IPublicMiniTickerV3Api>|null} [items] PublicMiniTickersV3Api items
     */
    /**
     * Constructs a new PublicMiniTickersV3Api.
     * @exports PublicMiniTickersV3Api
     * @classdesc Represents a PublicMiniTickersV3Api.
     * @implements IPublicMiniTickersV3Api
     * @constructor
     * @param {IPublicMiniTickersV3Api=} [properties] Properties to set
     */
    function PublicMiniTickersV3Api(properties) {
        this.items = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicMiniTickersV3Api items.
     * @member {Array.<IPublicMiniTickerV3Api>} items
     * @memberof PublicMiniTickersV3Api
     * @instance
     */
    PublicMiniTickersV3Api.prototype.items = $util.emptyArray;
    /**
     * Creates a new PublicMiniTickersV3Api instance using the specified properties.
     * @function create
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {IPublicMiniTickersV3Api=} [properties] Properties to set
     * @returns {PublicMiniTickersV3Api} PublicMiniTickersV3Api instance
     */
    PublicMiniTickersV3Api.create = function create(properties) {
        return new PublicMiniTickersV3Api(properties);
    };
    /**
     * Encodes the specified PublicMiniTickersV3Api message. Does not implicitly {@link PublicMiniTickersV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {IPublicMiniTickersV3Api} message PublicMiniTickersV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicMiniTickersV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.items != null && message.items.length)
            for (var i = 0; i < message.items.length; ++i)
                $root.PublicMiniTickerV3Api.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/ 10).fork()).ldelim();
        return writer;
    };
    /**
     * Encodes the specified PublicMiniTickersV3Api message, length delimited. Does not implicitly {@link PublicMiniTickersV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {IPublicMiniTickersV3Api} message PublicMiniTickersV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicMiniTickersV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicMiniTickersV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicMiniTickersV3Api} PublicMiniTickersV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicMiniTickersV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicMiniTickersV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    if (!(message.items && message.items.length))
                        message.items = [];
                    message.items.push($root.PublicMiniTickerV3Api.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicMiniTickersV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicMiniTickersV3Api} PublicMiniTickersV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicMiniTickersV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicMiniTickersV3Api message.
     * @function verify
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicMiniTickersV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.items != null && message.hasOwnProperty("items")) {
            if (!Array.isArray(message.items))
                return "items: array expected";
            for (var i = 0; i < message.items.length; ++i) {
                var error = $root.PublicMiniTickerV3Api.verify(message.items[i]);
                if (error)
                    return "items." + error;
            }
        }
        return null;
    };
    /**
     * Creates a PublicMiniTickersV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicMiniTickersV3Api} PublicMiniTickersV3Api
     */
    PublicMiniTickersV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicMiniTickersV3Api)
            return object;
        var message = new $root.PublicMiniTickersV3Api();
        if (object.items) {
            if (!Array.isArray(object.items))
                throw TypeError(".PublicMiniTickersV3Api.items: array expected");
            message.items = [];
            for (var i = 0; i < object.items.length; ++i) {
                if (typeof object.items[i] !== "object")
                    throw TypeError(".PublicMiniTickersV3Api.items: object expected");
                message.items[i] = $root.PublicMiniTickerV3Api.fromObject(object.items[i]);
            }
        }
        return message;
    };
    /**
     * Creates a plain object from a PublicMiniTickersV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {PublicMiniTickersV3Api} message PublicMiniTickersV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicMiniTickersV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.items = [];
        if (message.items && message.items.length) {
            object.items = [];
            for (var j = 0; j < message.items.length; ++j)
                object.items[j] = $root.PublicMiniTickerV3Api.toObject(message.items[j], options);
        }
        return object;
    };
    /**
     * Converts this PublicMiniTickersV3Api to JSON.
     * @function toJSON
     * @memberof PublicMiniTickersV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicMiniTickersV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicMiniTickersV3Api
     * @function getTypeUrl
     * @memberof PublicMiniTickersV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicMiniTickersV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicMiniTickersV3Api";
    };
    return PublicMiniTickersV3Api;
})();
$root.PublicSpotKlineV3Api = (function () {
    /**
     * Properties of a PublicSpotKlineV3Api.
     * @exports IPublicSpotKlineV3Api
     * @interface IPublicSpotKlineV3Api
     * @property {string|null} [interval] PublicSpotKlineV3Api interval
     * @property {number|Long|null} [windowStart] PublicSpotKlineV3Api windowStart
     * @property {string|null} [openingPrice] PublicSpotKlineV3Api openingPrice
     * @property {string|null} [closingPrice] PublicSpotKlineV3Api closingPrice
     * @property {string|null} [highestPrice] PublicSpotKlineV3Api highestPrice
     * @property {string|null} [lowestPrice] PublicSpotKlineV3Api lowestPrice
     * @property {string|null} [volume] PublicSpotKlineV3Api volume
     * @property {string|null} [amount] PublicSpotKlineV3Api amount
     * @property {number|Long|null} [windowEnd] PublicSpotKlineV3Api windowEnd
     */
    /**
     * Constructs a new PublicSpotKlineV3Api.
     * @exports PublicSpotKlineV3Api
     * @classdesc Represents a PublicSpotKlineV3Api.
     * @implements IPublicSpotKlineV3Api
     * @constructor
     * @param {IPublicSpotKlineV3Api=} [properties] Properties to set
     */
    function PublicSpotKlineV3Api(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * PublicSpotKlineV3Api interval.
     * @member {string} interval
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.interval = "";
    /**
     * PublicSpotKlineV3Api windowStart.
     * @member {number|Long} windowStart
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.windowStart = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    /**
     * PublicSpotKlineV3Api openingPrice.
     * @member {string} openingPrice
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.openingPrice = "";
    /**
     * PublicSpotKlineV3Api closingPrice.
     * @member {string} closingPrice
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.closingPrice = "";
    /**
     * PublicSpotKlineV3Api highestPrice.
     * @member {string} highestPrice
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.highestPrice = "";
    /**
     * PublicSpotKlineV3Api lowestPrice.
     * @member {string} lowestPrice
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.lowestPrice = "";
    /**
     * PublicSpotKlineV3Api volume.
     * @member {string} volume
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.volume = "";
    /**
     * PublicSpotKlineV3Api amount.
     * @member {string} amount
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.amount = "";
    /**
     * PublicSpotKlineV3Api windowEnd.
     * @member {number|Long} windowEnd
     * @memberof PublicSpotKlineV3Api
     * @instance
     */
    PublicSpotKlineV3Api.prototype.windowEnd = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
    /**
     * Creates a new PublicSpotKlineV3Api instance using the specified properties.
     * @function create
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {IPublicSpotKlineV3Api=} [properties] Properties to set
     * @returns {PublicSpotKlineV3Api} PublicSpotKlineV3Api instance
     */
    PublicSpotKlineV3Api.create = function create(properties) {
        return new PublicSpotKlineV3Api(properties);
    };
    /**
     * Encodes the specified PublicSpotKlineV3Api message. Does not implicitly {@link PublicSpotKlineV3Api.verify|verify} messages.
     * @function encode
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {IPublicSpotKlineV3Api} message PublicSpotKlineV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicSpotKlineV3Api.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.interval != null && Object.hasOwnProperty.call(message, "interval"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.interval);
        if (message.windowStart != null && Object.hasOwnProperty.call(message, "windowStart"))
            writer.uint32(/* id 2, wireType 0 =*/ 16).int64(message.windowStart);
        if (message.openingPrice != null && Object.hasOwnProperty.call(message, "openingPrice"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.openingPrice);
        if (message.closingPrice != null && Object.hasOwnProperty.call(message, "closingPrice"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.closingPrice);
        if (message.highestPrice != null && Object.hasOwnProperty.call(message, "highestPrice"))
            writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.highestPrice);
        if (message.lowestPrice != null && Object.hasOwnProperty.call(message, "lowestPrice"))
            writer.uint32(/* id 6, wireType 2 =*/ 50).string(message.lowestPrice);
        if (message.volume != null && Object.hasOwnProperty.call(message, "volume"))
            writer.uint32(/* id 7, wireType 2 =*/ 58).string(message.volume);
        if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
            writer.uint32(/* id 8, wireType 2 =*/ 66).string(message.amount);
        if (message.windowEnd != null && Object.hasOwnProperty.call(message, "windowEnd"))
            writer.uint32(/* id 9, wireType 0 =*/ 72).int64(message.windowEnd);
        return writer;
    };
    /**
     * Encodes the specified PublicSpotKlineV3Api message, length delimited. Does not implicitly {@link PublicSpotKlineV3Api.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {IPublicSpotKlineV3Api} message PublicSpotKlineV3Api message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PublicSpotKlineV3Api.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PublicSpotKlineV3Api message from the specified reader or buffer.
     * @function decode
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PublicSpotKlineV3Api} PublicSpotKlineV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicSpotKlineV3Api.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PublicSpotKlineV3Api();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.interval = reader.string();
                    break;
                }
                case 2: {
                    message.windowStart = reader.int64();
                    break;
                }
                case 3: {
                    message.openingPrice = reader.string();
                    break;
                }
                case 4: {
                    message.closingPrice = reader.string();
                    break;
                }
                case 5: {
                    message.highestPrice = reader.string();
                    break;
                }
                case 6: {
                    message.lowestPrice = reader.string();
                    break;
                }
                case 7: {
                    message.volume = reader.string();
                    break;
                }
                case 8: {
                    message.amount = reader.string();
                    break;
                }
                case 9: {
                    message.windowEnd = reader.int64();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PublicSpotKlineV3Api message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PublicSpotKlineV3Api} PublicSpotKlineV3Api
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PublicSpotKlineV3Api.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PublicSpotKlineV3Api message.
     * @function verify
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PublicSpotKlineV3Api.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.interval != null && message.hasOwnProperty("interval"))
            if (!$util.isString(message.interval))
                return "interval: string expected";
        if (message.windowStart != null && message.hasOwnProperty("windowStart"))
            if (!$util.isInteger(message.windowStart) && !(message.windowStart && $util.isInteger(message.windowStart.low) && $util.isInteger(message.windowStart.high)))
                return "windowStart: integer|Long expected";
        if (message.openingPrice != null && message.hasOwnProperty("openingPrice"))
            if (!$util.isString(message.openingPrice))
                return "openingPrice: string expected";
        if (message.closingPrice != null && message.hasOwnProperty("closingPrice"))
            if (!$util.isString(message.closingPrice))
                return "closingPrice: string expected";
        if (message.highestPrice != null && message.hasOwnProperty("highestPrice"))
            if (!$util.isString(message.highestPrice))
                return "highestPrice: string expected";
        if (message.lowestPrice != null && message.hasOwnProperty("lowestPrice"))
            if (!$util.isString(message.lowestPrice))
                return "lowestPrice: string expected";
        if (message.volume != null && message.hasOwnProperty("volume"))
            if (!$util.isString(message.volume))
                return "volume: string expected";
        if (message.amount != null && message.hasOwnProperty("amount"))
            if (!$util.isString(message.amount))
                return "amount: string expected";
        if (message.windowEnd != null && message.hasOwnProperty("windowEnd"))
            if (!$util.isInteger(message.windowEnd) && !(message.windowEnd && $util.isInteger(message.windowEnd.low) && $util.isInteger(message.windowEnd.high)))
                return "windowEnd: integer|Long expected";
        return null;
    };
    /**
     * Creates a PublicSpotKlineV3Api message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PublicSpotKlineV3Api} PublicSpotKlineV3Api
     */
    PublicSpotKlineV3Api.fromObject = function fromObject(object) {
        if (object instanceof $root.PublicSpotKlineV3Api)
            return object;
        var message = new $root.PublicSpotKlineV3Api();
        if (object.interval != null)
            message.interval = String(object.interval);
        if (object.windowStart != null)
            if ($util.Long)
                (message.windowStart = $util.Long.fromValue(object.windowStart)).unsigned = false;
            else if (typeof object.windowStart === "string")
                message.windowStart = parseInt(object.windowStart, 10);
            else if (typeof object.windowStart === "number")
                message.windowStart = object.windowStart;
            else if (typeof object.windowStart === "object")
                message.windowStart = new $util.LongBits(object.windowStart.low >>> 0, object.windowStart.high >>> 0).toNumber();
        if (object.openingPrice != null)
            message.openingPrice = String(object.openingPrice);
        if (object.closingPrice != null)
            message.closingPrice = String(object.closingPrice);
        if (object.highestPrice != null)
            message.highestPrice = String(object.highestPrice);
        if (object.lowestPrice != null)
            message.lowestPrice = String(object.lowestPrice);
        if (object.volume != null)
            message.volume = String(object.volume);
        if (object.amount != null)
            message.amount = String(object.amount);
        if (object.windowEnd != null)
            if ($util.Long)
                (message.windowEnd = $util.Long.fromValue(object.windowEnd)).unsigned = false;
            else if (typeof object.windowEnd === "string")
                message.windowEnd = parseInt(object.windowEnd, 10);
            else if (typeof object.windowEnd === "number")
                message.windowEnd = object.windowEnd;
            else if (typeof object.windowEnd === "object")
                message.windowEnd = new $util.LongBits(object.windowEnd.low >>> 0, object.windowEnd.high >>> 0).toNumber();
        return message;
    };
    /**
     * Creates a plain object from a PublicSpotKlineV3Api message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {PublicSpotKlineV3Api} message PublicSpotKlineV3Api
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PublicSpotKlineV3Api.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.interval = "";
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.windowStart = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            }
            else
                object.windowStart = options.longs === String ? "0" : 0;
            object.openingPrice = "";
            object.closingPrice = "";
            object.highestPrice = "";
            object.lowestPrice = "";
            object.volume = "";
            object.amount = "";
            if ($util.Long) {
                var long = new $util.Long(0, 0, false);
                object.windowEnd = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            }
            else
                object.windowEnd = options.longs === String ? "0" : 0;
        }
        if (message.interval != null && message.hasOwnProperty("interval"))
            object.interval = message.interval;
        if (message.windowStart != null && message.hasOwnProperty("windowStart"))
            if (typeof message.windowStart === "number")
                object.windowStart = options.longs === String ? String(message.windowStart) : message.windowStart;
            else
                object.windowStart = options.longs === String ? $util.Long.prototype.toString.call(message.windowStart) : options.longs === Number ? new $util.LongBits(message.windowStart.low >>> 0, message.windowStart.high >>> 0).toNumber() : message.windowStart;
        if (message.openingPrice != null && message.hasOwnProperty("openingPrice"))
            object.openingPrice = message.openingPrice;
        if (message.closingPrice != null && message.hasOwnProperty("closingPrice"))
            object.closingPrice = message.closingPrice;
        if (message.highestPrice != null && message.hasOwnProperty("highestPrice"))
            object.highestPrice = message.highestPrice;
        if (message.lowestPrice != null && message.hasOwnProperty("lowestPrice"))
            object.lowestPrice = message.lowestPrice;
        if (message.volume != null && message.hasOwnProperty("volume"))
            object.volume = message.volume;
        if (message.amount != null && message.hasOwnProperty("amount"))
            object.amount = message.amount;
        if (message.windowEnd != null && message.hasOwnProperty("windowEnd"))
            if (typeof message.windowEnd === "number")
                object.windowEnd = options.longs === String ? String(message.windowEnd) : message.windowEnd;
            else
                object.windowEnd = options.longs === String ? $util.Long.prototype.toString.call(message.windowEnd) : options.longs === Number ? new $util.LongBits(message.windowEnd.low >>> 0, message.windowEnd.high >>> 0).toNumber() : message.windowEnd;
        return object;
    };
    /**
     * Converts this PublicSpotKlineV3Api to JSON.
     * @function toJSON
     * @memberof PublicSpotKlineV3Api
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PublicSpotKlineV3Api.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PublicSpotKlineV3Api
     * @function getTypeUrl
     * @memberof PublicSpotKlineV3Api
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PublicSpotKlineV3Api.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PublicSpotKlineV3Api";
    };
    return PublicSpotKlineV3Api;
})();
$root.PushDataV3ApiWrapper = (function () {
    /**
     * Properties of a PushDataV3ApiWrapper.
     * @exports IPushDataV3ApiWrapper
     * @interface IPushDataV3ApiWrapper
     * @property {string|null} [channel] 频道
     * @property {IPublicDealsV3Api|null} [publicDeals] PushDataV3ApiWrapper publicDeals
     * @property {IPublicIncreaseDepthsV3Api|null} [publicIncreaseDepths] PushDataV3ApiWrapper publicIncreaseDepths
     * @property {IPublicLimitDepthsV3Api|null} [publicLimitDepths] PushDataV3ApiWrapper publicLimitDepths
     * @property {IPrivateOrdersV3Api|null} [privateOrders] PushDataV3ApiWrapper privateOrders
     * @property {IPublicBookTickerV3Api|null} [publicBookTicker] PushDataV3ApiWrapper publicBookTicker
     * @property {IPrivateDealsV3Api|null} [privateDeals] PushDataV3ApiWrapper privateDeals
     * @property {IPrivateAccountV3Api|null} [privateAccount] PushDataV3ApiWrapper privateAccount
     * @property {IPublicSpotKlineV3Api|null} [publicSpotKline] PushDataV3ApiWrapper publicSpotKline
     * @property {IPublicMiniTickerV3Api|null} [publicMiniTicker] PushDataV3ApiWrapper publicMiniTicker
     * @property {IPublicMiniTickersV3Api|null} [publicMiniTickers] PushDataV3ApiWrapper publicMiniTickers
     * @property {IPublicBookTickerBatchV3Api|null} [publicBookTickerBatch] PushDataV3ApiWrapper publicBookTickerBatch
     * @property {IPublicIncreaseDepthsBatchV3Api|null} [publicIncreaseDepthsBatch] PushDataV3ApiWrapper publicIncreaseDepthsBatch
     * @property {IPublicAggreDepthsV3Api|null} [publicAggreDepths] PushDataV3ApiWrapper publicAggreDepths
     * @property {IPublicAggreDealsV3Api|null} [publicAggreDeals] PushDataV3ApiWrapper publicAggreDeals
     * @property {IPublicAggreBookTickerV3Api|null} [publicAggreBookTicker] PushDataV3ApiWrapper publicAggreBookTicker
     * @property {string|null} [symbol] 交易对
     * @property {string|null} [symbolId] 交易对ID
     * @property {number|Long|null} [createTime] 消息生成时间
     * @property {number|Long|null} [sendTime] 消息推送时间
     */
    /**
     * Constructs a new PushDataV3ApiWrapper.
     * @exports PushDataV3ApiWrapper
     * @classdesc Represents a PushDataV3ApiWrapper.
     * @implements IPushDataV3ApiWrapper
     * @constructor
     * @param {IPushDataV3ApiWrapper=} [properties] Properties to set
     */
    function PushDataV3ApiWrapper(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }
    /**
     * 频道
     * @member {string} channel
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.channel = "";
    /**
     * PushDataV3ApiWrapper publicDeals.
     * @member {IPublicDealsV3Api|null|undefined} publicDeals
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicDeals = null;
    /**
     * PushDataV3ApiWrapper publicIncreaseDepths.
     * @member {IPublicIncreaseDepthsV3Api|null|undefined} publicIncreaseDepths
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicIncreaseDepths = null;
    /**
     * PushDataV3ApiWrapper publicLimitDepths.
     * @member {IPublicLimitDepthsV3Api|null|undefined} publicLimitDepths
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicLimitDepths = null;
    /**
     * PushDataV3ApiWrapper privateOrders.
     * @member {IPrivateOrdersV3Api|null|undefined} privateOrders
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.privateOrders = null;
    /**
     * PushDataV3ApiWrapper publicBookTicker.
     * @member {IPublicBookTickerV3Api|null|undefined} publicBookTicker
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicBookTicker = null;
    /**
     * PushDataV3ApiWrapper privateDeals.
     * @member {IPrivateDealsV3Api|null|undefined} privateDeals
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.privateDeals = null;
    /**
     * PushDataV3ApiWrapper privateAccount.
     * @member {IPrivateAccountV3Api|null|undefined} privateAccount
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.privateAccount = null;
    /**
     * PushDataV3ApiWrapper publicSpotKline.
     * @member {IPublicSpotKlineV3Api|null|undefined} publicSpotKline
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicSpotKline = null;
    /**
     * PushDataV3ApiWrapper publicMiniTicker.
     * @member {IPublicMiniTickerV3Api|null|undefined} publicMiniTicker
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicMiniTicker = null;
    /**
     * PushDataV3ApiWrapper publicMiniTickers.
     * @member {IPublicMiniTickersV3Api|null|undefined} publicMiniTickers
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicMiniTickers = null;
    /**
     * PushDataV3ApiWrapper publicBookTickerBatch.
     * @member {IPublicBookTickerBatchV3Api|null|undefined} publicBookTickerBatch
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicBookTickerBatch = null;
    /**
     * PushDataV3ApiWrapper publicIncreaseDepthsBatch.
     * @member {IPublicIncreaseDepthsBatchV3Api|null|undefined} publicIncreaseDepthsBatch
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicIncreaseDepthsBatch = null;
    /**
     * PushDataV3ApiWrapper publicAggreDepths.
     * @member {IPublicAggreDepthsV3Api|null|undefined} publicAggreDepths
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicAggreDepths = null;
    /**
     * PushDataV3ApiWrapper publicAggreDeals.
     * @member {IPublicAggreDealsV3Api|null|undefined} publicAggreDeals
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicAggreDeals = null;
    /**
     * PushDataV3ApiWrapper publicAggreBookTicker.
     * @member {IPublicAggreBookTickerV3Api|null|undefined} publicAggreBookTicker
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.publicAggreBookTicker = null;
    /**
     * 交易对
     * @member {string|null|undefined} symbol
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.symbol = null;
    /**
     * 交易对ID
     * @member {string|null|undefined} symbolId
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.symbolId = null;
    /**
     * 消息生成时间
     * @member {number|Long|null|undefined} createTime
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.createTime = null;
    /**
     * 消息推送时间
     * @member {number|Long|null|undefined} sendTime
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    PushDataV3ApiWrapper.prototype.sendTime = null;
    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;
    /**
     * 数据，NOTE：因为不能重复，所以类型和变量名尽量使用全名
     * @member {"publicDeals"|"publicIncreaseDepths"|"publicLimitDepths"|"privateOrders"|"publicBookTicker"|"privateDeals"|"privateAccount"|"publicSpotKline"|"publicMiniTicker"|"publicMiniTickers"|"publicBookTickerBatch"|"publicIncreaseDepthsBatch"|"publicAggreDepths"|"publicAggreDeals"|"publicAggreBookTicker"|undefined} body
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    Object.defineProperty(PushDataV3ApiWrapper.prototype, "body", {
        get: $util.oneOfGetter($oneOfFields = ["publicDeals", "publicIncreaseDepths", "publicLimitDepths", "privateOrders", "publicBookTicker", "privateDeals", "privateAccount", "publicSpotKline", "publicMiniTicker", "publicMiniTickers", "publicBookTickerBatch", "publicIncreaseDepthsBatch", "publicAggreDepths", "publicAggreDeals", "publicAggreBookTicker"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PushDataV3ApiWrapper _symbol.
     * @member {"symbol"|undefined} _symbol
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    Object.defineProperty(PushDataV3ApiWrapper.prototype, "_symbol", {
        get: $util.oneOfGetter($oneOfFields = ["symbol"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PushDataV3ApiWrapper _symbolId.
     * @member {"symbolId"|undefined} _symbolId
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    Object.defineProperty(PushDataV3ApiWrapper.prototype, "_symbolId", {
        get: $util.oneOfGetter($oneOfFields = ["symbolId"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PushDataV3ApiWrapper _createTime.
     * @member {"createTime"|undefined} _createTime
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    Object.defineProperty(PushDataV3ApiWrapper.prototype, "_createTime", {
        get: $util.oneOfGetter($oneOfFields = ["createTime"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * PushDataV3ApiWrapper _sendTime.
     * @member {"sendTime"|undefined} _sendTime
     * @memberof PushDataV3ApiWrapper
     * @instance
     */
    Object.defineProperty(PushDataV3ApiWrapper.prototype, "_sendTime", {
        get: $util.oneOfGetter($oneOfFields = ["sendTime"]),
        set: $util.oneOfSetter($oneOfFields)
    });
    /**
     * Creates a new PushDataV3ApiWrapper instance using the specified properties.
     * @function create
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {IPushDataV3ApiWrapper=} [properties] Properties to set
     * @returns {PushDataV3ApiWrapper} PushDataV3ApiWrapper instance
     */
    PushDataV3ApiWrapper.create = function create(properties) {
        return new PushDataV3ApiWrapper(properties);
    };
    /**
     * Encodes the specified PushDataV3ApiWrapper message. Does not implicitly {@link PushDataV3ApiWrapper.verify|verify} messages.
     * @function encode
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {IPushDataV3ApiWrapper} message PushDataV3ApiWrapper message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PushDataV3ApiWrapper.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.channel != null && Object.hasOwnProperty.call(message, "channel"))
            writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.channel);
        if (message.symbol != null && Object.hasOwnProperty.call(message, "symbol"))
            writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.symbol);
        if (message.symbolId != null && Object.hasOwnProperty.call(message, "symbolId"))
            writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.symbolId);
        if (message.createTime != null && Object.hasOwnProperty.call(message, "createTime"))
            writer.uint32(/* id 5, wireType 0 =*/ 40).int64(message.createTime);
        if (message.sendTime != null && Object.hasOwnProperty.call(message, "sendTime"))
            writer.uint32(/* id 6, wireType 0 =*/ 48).int64(message.sendTime);
        if (message.publicDeals != null && Object.hasOwnProperty.call(message, "publicDeals"))
            $root.PublicDealsV3Api.encode(message.publicDeals, writer.uint32(/* id 301, wireType 2 =*/ 2410).fork()).ldelim();
        if (message.publicIncreaseDepths != null && Object.hasOwnProperty.call(message, "publicIncreaseDepths"))
            $root.PublicIncreaseDepthsV3Api.encode(message.publicIncreaseDepths, writer.uint32(/* id 302, wireType 2 =*/ 2418).fork()).ldelim();
        if (message.publicLimitDepths != null && Object.hasOwnProperty.call(message, "publicLimitDepths"))
            $root.PublicLimitDepthsV3Api.encode(message.publicLimitDepths, writer.uint32(/* id 303, wireType 2 =*/ 2426).fork()).ldelim();
        if (message.privateOrders != null && Object.hasOwnProperty.call(message, "privateOrders"))
            $root.PrivateOrdersV3Api.encode(message.privateOrders, writer.uint32(/* id 304, wireType 2 =*/ 2434).fork()).ldelim();
        if (message.publicBookTicker != null && Object.hasOwnProperty.call(message, "publicBookTicker"))
            $root.PublicBookTickerV3Api.encode(message.publicBookTicker, writer.uint32(/* id 305, wireType 2 =*/ 2442).fork()).ldelim();
        if (message.privateDeals != null && Object.hasOwnProperty.call(message, "privateDeals"))
            $root.PrivateDealsV3Api.encode(message.privateDeals, writer.uint32(/* id 306, wireType 2 =*/ 2450).fork()).ldelim();
        if (message.privateAccount != null && Object.hasOwnProperty.call(message, "privateAccount"))
            $root.PrivateAccountV3Api.encode(message.privateAccount, writer.uint32(/* id 307, wireType 2 =*/ 2458).fork()).ldelim();
        if (message.publicSpotKline != null && Object.hasOwnProperty.call(message, "publicSpotKline"))
            $root.PublicSpotKlineV3Api.encode(message.publicSpotKline, writer.uint32(/* id 308, wireType 2 =*/ 2466).fork()).ldelim();
        if (message.publicMiniTicker != null && Object.hasOwnProperty.call(message, "publicMiniTicker"))
            $root.PublicMiniTickerV3Api.encode(message.publicMiniTicker, writer.uint32(/* id 309, wireType 2 =*/ 2474).fork()).ldelim();
        if (message.publicMiniTickers != null && Object.hasOwnProperty.call(message, "publicMiniTickers"))
            $root.PublicMiniTickersV3Api.encode(message.publicMiniTickers, writer.uint32(/* id 310, wireType 2 =*/ 2482).fork()).ldelim();
        if (message.publicBookTickerBatch != null && Object.hasOwnProperty.call(message, "publicBookTickerBatch"))
            $root.PublicBookTickerBatchV3Api.encode(message.publicBookTickerBatch, writer.uint32(/* id 311, wireType 2 =*/ 2490).fork()).ldelim();
        if (message.publicIncreaseDepthsBatch != null && Object.hasOwnProperty.call(message, "publicIncreaseDepthsBatch"))
            $root.PublicIncreaseDepthsBatchV3Api.encode(message.publicIncreaseDepthsBatch, writer.uint32(/* id 312, wireType 2 =*/ 2498).fork()).ldelim();
        if (message.publicAggreDepths != null && Object.hasOwnProperty.call(message, "publicAggreDepths"))
            $root.PublicAggreDepthsV3Api.encode(message.publicAggreDepths, writer.uint32(/* id 313, wireType 2 =*/ 2506).fork()).ldelim();
        if (message.publicAggreDeals != null && Object.hasOwnProperty.call(message, "publicAggreDeals"))
            $root.PublicAggreDealsV3Api.encode(message.publicAggreDeals, writer.uint32(/* id 314, wireType 2 =*/ 2514).fork()).ldelim();
        if (message.publicAggreBookTicker != null && Object.hasOwnProperty.call(message, "publicAggreBookTicker"))
            $root.PublicAggreBookTickerV3Api.encode(message.publicAggreBookTicker, writer.uint32(/* id 315, wireType 2 =*/ 2522).fork()).ldelim();
        return writer;
    };
    /**
     * Encodes the specified PushDataV3ApiWrapper message, length delimited. Does not implicitly {@link PushDataV3ApiWrapper.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {IPushDataV3ApiWrapper} message PushDataV3ApiWrapper message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PushDataV3ApiWrapper.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };
    /**
     * Decodes a PushDataV3ApiWrapper message from the specified reader or buffer.
     * @function decode
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PushDataV3ApiWrapper} PushDataV3ApiWrapper
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PushDataV3ApiWrapper.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PushDataV3ApiWrapper();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
                case 1: {
                    message.channel = reader.string();
                    break;
                }
                case 301: {
                    message.publicDeals = $root.PublicDealsV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 302: {
                    message.publicIncreaseDepths = $root.PublicIncreaseDepthsV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 303: {
                    message.publicLimitDepths = $root.PublicLimitDepthsV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 304: {
                    message.privateOrders = $root.PrivateOrdersV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 305: {
                    message.publicBookTicker = $root.PublicBookTickerV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 306: {
                    message.privateDeals = $root.PrivateDealsV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 307: {
                    message.privateAccount = $root.PrivateAccountV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 308: {
                    message.publicSpotKline = $root.PublicSpotKlineV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 309: {
                    message.publicMiniTicker = $root.PublicMiniTickerV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 310: {
                    message.publicMiniTickers = $root.PublicMiniTickersV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 311: {
                    message.publicBookTickerBatch = $root.PublicBookTickerBatchV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 312: {
                    message.publicIncreaseDepthsBatch = $root.PublicIncreaseDepthsBatchV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 313: {
                    message.publicAggreDepths = $root.PublicAggreDepthsV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 314: {
                    message.publicAggreDeals = $root.PublicAggreDealsV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 315: {
                    message.publicAggreBookTicker = $root.PublicAggreBookTickerV3Api.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.symbol = reader.string();
                    break;
                }
                case 4: {
                    message.symbolId = reader.string();
                    break;
                }
                case 5: {
                    message.createTime = reader.int64();
                    break;
                }
                case 6: {
                    message.sendTime = reader.int64();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };
    /**
     * Decodes a PushDataV3ApiWrapper message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PushDataV3ApiWrapper} PushDataV3ApiWrapper
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PushDataV3ApiWrapper.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };
    /**
     * Verifies a PushDataV3ApiWrapper message.
     * @function verify
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PushDataV3ApiWrapper.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.channel != null && message.hasOwnProperty("channel"))
            if (!$util.isString(message.channel))
                return "channel: string expected";
        if (message.publicDeals != null && message.hasOwnProperty("publicDeals")) {
            properties.body = 1;
            {
                var error = $root.PublicDealsV3Api.verify(message.publicDeals);
                if (error)
                    return "publicDeals." + error;
            }
        }
        if (message.publicIncreaseDepths != null && message.hasOwnProperty("publicIncreaseDepths")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicIncreaseDepthsV3Api.verify(message.publicIncreaseDepths);
                if (error)
                    return "publicIncreaseDepths." + error;
            }
        }
        if (message.publicLimitDepths != null && message.hasOwnProperty("publicLimitDepths")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicLimitDepthsV3Api.verify(message.publicLimitDepths);
                if (error)
                    return "publicLimitDepths." + error;
            }
        }
        if (message.privateOrders != null && message.hasOwnProperty("privateOrders")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PrivateOrdersV3Api.verify(message.privateOrders);
                if (error)
                    return "privateOrders." + error;
            }
        }
        if (message.publicBookTicker != null && message.hasOwnProperty("publicBookTicker")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicBookTickerV3Api.verify(message.publicBookTicker);
                if (error)
                    return "publicBookTicker." + error;
            }
        }
        if (message.privateDeals != null && message.hasOwnProperty("privateDeals")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PrivateDealsV3Api.verify(message.privateDeals);
                if (error)
                    return "privateDeals." + error;
            }
        }
        if (message.privateAccount != null && message.hasOwnProperty("privateAccount")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PrivateAccountV3Api.verify(message.privateAccount);
                if (error)
                    return "privateAccount." + error;
            }
        }
        if (message.publicSpotKline != null && message.hasOwnProperty("publicSpotKline")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicSpotKlineV3Api.verify(message.publicSpotKline);
                if (error)
                    return "publicSpotKline." + error;
            }
        }
        if (message.publicMiniTicker != null && message.hasOwnProperty("publicMiniTicker")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicMiniTickerV3Api.verify(message.publicMiniTicker);
                if (error)
                    return "publicMiniTicker." + error;
            }
        }
        if (message.publicMiniTickers != null && message.hasOwnProperty("publicMiniTickers")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicMiniTickersV3Api.verify(message.publicMiniTickers);
                if (error)
                    return "publicMiniTickers." + error;
            }
        }
        if (message.publicBookTickerBatch != null && message.hasOwnProperty("publicBookTickerBatch")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicBookTickerBatchV3Api.verify(message.publicBookTickerBatch);
                if (error)
                    return "publicBookTickerBatch." + error;
            }
        }
        if (message.publicIncreaseDepthsBatch != null && message.hasOwnProperty("publicIncreaseDepthsBatch")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicIncreaseDepthsBatchV3Api.verify(message.publicIncreaseDepthsBatch);
                if (error)
                    return "publicIncreaseDepthsBatch." + error;
            }
        }
        if (message.publicAggreDepths != null && message.hasOwnProperty("publicAggreDepths")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicAggreDepthsV3Api.verify(message.publicAggreDepths);
                if (error)
                    return "publicAggreDepths." + error;
            }
        }
        if (message.publicAggreDeals != null && message.hasOwnProperty("publicAggreDeals")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicAggreDealsV3Api.verify(message.publicAggreDeals);
                if (error)
                    return "publicAggreDeals." + error;
            }
        }
        if (message.publicAggreBookTicker != null && message.hasOwnProperty("publicAggreBookTicker")) {
            if (properties.body === 1)
                return "body: multiple values";
            properties.body = 1;
            {
                var error = $root.PublicAggreBookTickerV3Api.verify(message.publicAggreBookTicker);
                if (error)
                    return "publicAggreBookTicker." + error;
            }
        }
        if (message.symbol != null && message.hasOwnProperty("symbol")) {
            properties._symbol = 1;
            if (!$util.isString(message.symbol))
                return "symbol: string expected";
        }
        if (message.symbolId != null && message.hasOwnProperty("symbolId")) {
            properties._symbolId = 1;
            if (!$util.isString(message.symbolId))
                return "symbolId: string expected";
        }
        if (message.createTime != null && message.hasOwnProperty("createTime")) {
            properties._createTime = 1;
            if (!$util.isInteger(message.createTime) && !(message.createTime && $util.isInteger(message.createTime.low) && $util.isInteger(message.createTime.high)))
                return "createTime: integer|Long expected";
        }
        if (message.sendTime != null && message.hasOwnProperty("sendTime")) {
            properties._sendTime = 1;
            if (!$util.isInteger(message.sendTime) && !(message.sendTime && $util.isInteger(message.sendTime.low) && $util.isInteger(message.sendTime.high)))
                return "sendTime: integer|Long expected";
        }
        return null;
    };
    /**
     * Creates a PushDataV3ApiWrapper message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PushDataV3ApiWrapper} PushDataV3ApiWrapper
     */
    PushDataV3ApiWrapper.fromObject = function fromObject(object) {
        if (object instanceof $root.PushDataV3ApiWrapper)
            return object;
        var message = new $root.PushDataV3ApiWrapper();
        if (object.channel != null)
            message.channel = String(object.channel);
        if (object.publicDeals != null) {
            if (typeof object.publicDeals !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicDeals: object expected");
            message.publicDeals = $root.PublicDealsV3Api.fromObject(object.publicDeals);
        }
        if (object.publicIncreaseDepths != null) {
            if (typeof object.publicIncreaseDepths !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicIncreaseDepths: object expected");
            message.publicIncreaseDepths = $root.PublicIncreaseDepthsV3Api.fromObject(object.publicIncreaseDepths);
        }
        if (object.publicLimitDepths != null) {
            if (typeof object.publicLimitDepths !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicLimitDepths: object expected");
            message.publicLimitDepths = $root.PublicLimitDepthsV3Api.fromObject(object.publicLimitDepths);
        }
        if (object.privateOrders != null) {
            if (typeof object.privateOrders !== "object")
                throw TypeError(".PushDataV3ApiWrapper.privateOrders: object expected");
            message.privateOrders = $root.PrivateOrdersV3Api.fromObject(object.privateOrders);
        }
        if (object.publicBookTicker != null) {
            if (typeof object.publicBookTicker !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicBookTicker: object expected");
            message.publicBookTicker = $root.PublicBookTickerV3Api.fromObject(object.publicBookTicker);
        }
        if (object.privateDeals != null) {
            if (typeof object.privateDeals !== "object")
                throw TypeError(".PushDataV3ApiWrapper.privateDeals: object expected");
            message.privateDeals = $root.PrivateDealsV3Api.fromObject(object.privateDeals);
        }
        if (object.privateAccount != null) {
            if (typeof object.privateAccount !== "object")
                throw TypeError(".PushDataV3ApiWrapper.privateAccount: object expected");
            message.privateAccount = $root.PrivateAccountV3Api.fromObject(object.privateAccount);
        }
        if (object.publicSpotKline != null) {
            if (typeof object.publicSpotKline !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicSpotKline: object expected");
            message.publicSpotKline = $root.PublicSpotKlineV3Api.fromObject(object.publicSpotKline);
        }
        if (object.publicMiniTicker != null) {
            if (typeof object.publicMiniTicker !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicMiniTicker: object expected");
            message.publicMiniTicker = $root.PublicMiniTickerV3Api.fromObject(object.publicMiniTicker);
        }
        if (object.publicMiniTickers != null) {
            if (typeof object.publicMiniTickers !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicMiniTickers: object expected");
            message.publicMiniTickers = $root.PublicMiniTickersV3Api.fromObject(object.publicMiniTickers);
        }
        if (object.publicBookTickerBatch != null) {
            if (typeof object.publicBookTickerBatch !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicBookTickerBatch: object expected");
            message.publicBookTickerBatch = $root.PublicBookTickerBatchV3Api.fromObject(object.publicBookTickerBatch);
        }
        if (object.publicIncreaseDepthsBatch != null) {
            if (typeof object.publicIncreaseDepthsBatch !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicIncreaseDepthsBatch: object expected");
            message.publicIncreaseDepthsBatch = $root.PublicIncreaseDepthsBatchV3Api.fromObject(object.publicIncreaseDepthsBatch);
        }
        if (object.publicAggreDepths != null) {
            if (typeof object.publicAggreDepths !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicAggreDepths: object expected");
            message.publicAggreDepths = $root.PublicAggreDepthsV3Api.fromObject(object.publicAggreDepths);
        }
        if (object.publicAggreDeals != null) {
            if (typeof object.publicAggreDeals !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicAggreDeals: object expected");
            message.publicAggreDeals = $root.PublicAggreDealsV3Api.fromObject(object.publicAggreDeals);
        }
        if (object.publicAggreBookTicker != null) {
            if (typeof object.publicAggreBookTicker !== "object")
                throw TypeError(".PushDataV3ApiWrapper.publicAggreBookTicker: object expected");
            message.publicAggreBookTicker = $root.PublicAggreBookTickerV3Api.fromObject(object.publicAggreBookTicker);
        }
        if (object.symbol != null)
            message.symbol = String(object.symbol);
        if (object.symbolId != null)
            message.symbolId = String(object.symbolId);
        if (object.createTime != null)
            if ($util.Long)
                (message.createTime = $util.Long.fromValue(object.createTime)).unsigned = false;
            else if (typeof object.createTime === "string")
                message.createTime = parseInt(object.createTime, 10);
            else if (typeof object.createTime === "number")
                message.createTime = object.createTime;
            else if (typeof object.createTime === "object")
                message.createTime = new $util.LongBits(object.createTime.low >>> 0, object.createTime.high >>> 0).toNumber();
        if (object.sendTime != null)
            if ($util.Long)
                (message.sendTime = $util.Long.fromValue(object.sendTime)).unsigned = false;
            else if (typeof object.sendTime === "string")
                message.sendTime = parseInt(object.sendTime, 10);
            else if (typeof object.sendTime === "number")
                message.sendTime = object.sendTime;
            else if (typeof object.sendTime === "object")
                message.sendTime = new $util.LongBits(object.sendTime.low >>> 0, object.sendTime.high >>> 0).toNumber();
        return message;
    };
    /**
     * Creates a plain object from a PushDataV3ApiWrapper message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {PushDataV3ApiWrapper} message PushDataV3ApiWrapper
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PushDataV3ApiWrapper.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults)
            object.channel = "";
        if (message.channel != null && message.hasOwnProperty("channel"))
            object.channel = message.channel;
        if (message.symbol != null && message.hasOwnProperty("symbol")) {
            object.symbol = message.symbol;
            if (options.oneofs)
                object._symbol = "symbol";
        }
        if (message.symbolId != null && message.hasOwnProperty("symbolId")) {
            object.symbolId = message.symbolId;
            if (options.oneofs)
                object._symbolId = "symbolId";
        }
        if (message.createTime != null && message.hasOwnProperty("createTime")) {
            if (typeof message.createTime === "number")
                object.createTime = options.longs === String ? String(message.createTime) : message.createTime;
            else
                object.createTime = options.longs === String ? $util.Long.prototype.toString.call(message.createTime) : options.longs === Number ? new $util.LongBits(message.createTime.low >>> 0, message.createTime.high >>> 0).toNumber() : message.createTime;
            if (options.oneofs)
                object._createTime = "createTime";
        }
        if (message.sendTime != null && message.hasOwnProperty("sendTime")) {
            if (typeof message.sendTime === "number")
                object.sendTime = options.longs === String ? String(message.sendTime) : message.sendTime;
            else
                object.sendTime = options.longs === String ? $util.Long.prototype.toString.call(message.sendTime) : options.longs === Number ? new $util.LongBits(message.sendTime.low >>> 0, message.sendTime.high >>> 0).toNumber() : message.sendTime;
            if (options.oneofs)
                object._sendTime = "sendTime";
        }
        if (message.publicDeals != null && message.hasOwnProperty("publicDeals")) {
            object.publicDeals = $root.PublicDealsV3Api.toObject(message.publicDeals, options);
            if (options.oneofs)
                object.body = "publicDeals";
        }
        if (message.publicIncreaseDepths != null && message.hasOwnProperty("publicIncreaseDepths")) {
            object.publicIncreaseDepths = $root.PublicIncreaseDepthsV3Api.toObject(message.publicIncreaseDepths, options);
            if (options.oneofs)
                object.body = "publicIncreaseDepths";
        }
        if (message.publicLimitDepths != null && message.hasOwnProperty("publicLimitDepths")) {
            object.publicLimitDepths = $root.PublicLimitDepthsV3Api.toObject(message.publicLimitDepths, options);
            if (options.oneofs)
                object.body = "publicLimitDepths";
        }
        if (message.privateOrders != null && message.hasOwnProperty("privateOrders")) {
            object.privateOrders = $root.PrivateOrdersV3Api.toObject(message.privateOrders, options);
            if (options.oneofs)
                object.body = "privateOrders";
        }
        if (message.publicBookTicker != null && message.hasOwnProperty("publicBookTicker")) {
            object.publicBookTicker = $root.PublicBookTickerV3Api.toObject(message.publicBookTicker, options);
            if (options.oneofs)
                object.body = "publicBookTicker";
        }
        if (message.privateDeals != null && message.hasOwnProperty("privateDeals")) {
            object.privateDeals = $root.PrivateDealsV3Api.toObject(message.privateDeals, options);
            if (options.oneofs)
                object.body = "privateDeals";
        }
        if (message.privateAccount != null && message.hasOwnProperty("privateAccount")) {
            object.privateAccount = $root.PrivateAccountV3Api.toObject(message.privateAccount, options);
            if (options.oneofs)
                object.body = "privateAccount";
        }
        if (message.publicSpotKline != null && message.hasOwnProperty("publicSpotKline")) {
            object.publicSpotKline = $root.PublicSpotKlineV3Api.toObject(message.publicSpotKline, options);
            if (options.oneofs)
                object.body = "publicSpotKline";
        }
        if (message.publicMiniTicker != null && message.hasOwnProperty("publicMiniTicker")) {
            object.publicMiniTicker = $root.PublicMiniTickerV3Api.toObject(message.publicMiniTicker, options);
            if (options.oneofs)
                object.body = "publicMiniTicker";
        }
        if (message.publicMiniTickers != null && message.hasOwnProperty("publicMiniTickers")) {
            object.publicMiniTickers = $root.PublicMiniTickersV3Api.toObject(message.publicMiniTickers, options);
            if (options.oneofs)
                object.body = "publicMiniTickers";
        }
        if (message.publicBookTickerBatch != null && message.hasOwnProperty("publicBookTickerBatch")) {
            object.publicBookTickerBatch = $root.PublicBookTickerBatchV3Api.toObject(message.publicBookTickerBatch, options);
            if (options.oneofs)
                object.body = "publicBookTickerBatch";
        }
        if (message.publicIncreaseDepthsBatch != null && message.hasOwnProperty("publicIncreaseDepthsBatch")) {
            object.publicIncreaseDepthsBatch = $root.PublicIncreaseDepthsBatchV3Api.toObject(message.publicIncreaseDepthsBatch, options);
            if (options.oneofs)
                object.body = "publicIncreaseDepthsBatch";
        }
        if (message.publicAggreDepths != null && message.hasOwnProperty("publicAggreDepths")) {
            object.publicAggreDepths = $root.PublicAggreDepthsV3Api.toObject(message.publicAggreDepths, options);
            if (options.oneofs)
                object.body = "publicAggreDepths";
        }
        if (message.publicAggreDeals != null && message.hasOwnProperty("publicAggreDeals")) {
            object.publicAggreDeals = $root.PublicAggreDealsV3Api.toObject(message.publicAggreDeals, options);
            if (options.oneofs)
                object.body = "publicAggreDeals";
        }
        if (message.publicAggreBookTicker != null && message.hasOwnProperty("publicAggreBookTicker")) {
            object.publicAggreBookTicker = $root.PublicAggreBookTickerV3Api.toObject(message.publicAggreBookTicker, options);
            if (options.oneofs)
                object.body = "publicAggreBookTicker";
        }
        return object;
    };
    /**
     * Converts this PushDataV3ApiWrapper to JSON.
     * @function toJSON
     * @memberof PushDataV3ApiWrapper
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PushDataV3ApiWrapper.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };
    /**
     * Gets the default type url for PushDataV3ApiWrapper
     * @function getTypeUrl
     * @memberof PushDataV3ApiWrapper
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PushDataV3ApiWrapper.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PushDataV3ApiWrapper";
    };
    return PushDataV3ApiWrapper;
})();
var compiled = $root;

exports["default"] = compiled;
