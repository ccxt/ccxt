import { PubKey } from './cosmos/crypto/secp256k1/keys';
import { TxExtension } from './dydxprotocol/accountplus/tx';
import {
  MsgPlaceOrder,
  MsgCancelOrder,
  MsgBatchCancel,
} from './dydxprotocol/clob/tx';
import {
  MsgWithdrawFromSubaccount,
  MsgDepositToSubaccount,
} from './dydxprotocol/sending/transfer';
import { MsgCreateTransfer } from './dydxprotocol/sending/tx';
import { Any } from "./google/protobuf/any";

export const registry: Record<string, any> = {
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

export interface EncodeObject {
  readonly typeUrl: string;
  readonly value: any;
}

export function encodeAsAny (encodeObject: EncodeObject) {
  const { typeUrl, value } = encodeObject;
  const type = registry[typeUrl];
  if (!type) {
    throw new Error (`Unsupport type url: ${typeUrl}`);
  }
  const encodedMsg = type.encode (type.fromPartial (value)).finish ();
  return Any.fromPartial ({
    typeUrl: typeUrl,
    value: encodedMsg,
  });
}