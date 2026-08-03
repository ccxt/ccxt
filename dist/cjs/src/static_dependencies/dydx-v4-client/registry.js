'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var keys = require('./cosmos/crypto/secp256k1/keys.js');
var tx$2 = require('./dydxprotocol/accountplus/tx.js');
var tx = require('./dydxprotocol/clob/tx.js');
var transfer = require('./dydxprotocol/sending/transfer.js');
var tx$1 = require('./dydxprotocol/sending/tx.js');
var any = require('./google/protobuf/any.js');

const registry = {
    // clob
    '/dydxprotocol.clob.MsgPlaceOrder': tx.MsgPlaceOrder,
    '/dydxprotocol.clob.MsgCancelOrder': tx.MsgCancelOrder,
    '/dydxprotocol.clob.MsgBatchCancel': tx.MsgBatchCancel,
    // sending
    '/dydxprotocol.sending.MsgCreateTransfer': tx$1.MsgCreateTransfer,
    '/dydxprotocol.sending.MsgWithdrawFromSubaccount': transfer.MsgWithdrawFromSubaccount,
    '/dydxprotocol.sending.MsgDepositToSubaccount': transfer.MsgDepositToSubaccount,
    '/dydxprotocol.accountplus.TxExtension': tx$2.TxExtension,
    '/cosmos.crypto.secp256k1.PubKey': keys.PubKey,
};
function encodeAsAny(encodeObject) {
    const { typeUrl, value } = encodeObject;
    const type = registry[typeUrl];
    if (!type) {
        throw new Error(`Unsupport type url: ${typeUrl}`);
    }
    const encodedMsg = type.encode(type.fromPartial(value)).finish();
    return any.Any.fromPartial({
        typeUrl: typeUrl,
        value: encodedMsg,
    });
}

exports.encodeAsAny = encodeAsAny;
exports.registry = registry;
