import { PubKey } from './cosmos/crypto/secp256k1/keys.js';
import { TxExtension } from './dydxprotocol/accountplus/tx.js';
import { MsgPlaceOrder, MsgCancelOrder, MsgBatchCancel, } from './dydxprotocol/clob/tx.js';
import { MsgWithdrawFromSubaccount, MsgDepositToSubaccount, } from './dydxprotocol/sending/transfer.js';
import { MsgCreateTransfer } from './dydxprotocol/sending/tx.js';
import { Any } from "./google/protobuf/any.js";
export const registry = {
    // clob
    '/dydxprotocol.clob.MsgPlaceOrder': MsgPlaceOrder,
    '/dydxprotocol.clob.MsgCancelOrder': MsgCancelOrder,
    '/dydxprotocol.clob.MsgBatchCancel': MsgBatchCancel,
    // sending
    '/dydxprotocol.sending.MsgCreateTransfer': MsgCreateTransfer,
    '/dydxprotocol.sending.MsgWithdrawFromSubaccount': MsgWithdrawFromSubaccount,
    '/dydxprotocol.sending.MsgDepositToSubaccount': MsgDepositToSubaccount,
    '/dydxprotocol.accountplus.TxExtension': TxExtension,
    '/cosmos.crypto.secp256k1.PubKey': PubKey,
};
export function encodeAsAny(encodeObject) {
    const { typeUrl, value } = encodeObject;
    const type = registry[typeUrl];
    if (!type) {
        throw new Error(`Unsupport type url: ${typeUrl}`);
    }
    const encodedMsg = type.encode(type.fromPartial(value)).finish();
    return Any.fromPartial({
        typeUrl: typeUrl,
        value: encodedMsg,
    });
}
