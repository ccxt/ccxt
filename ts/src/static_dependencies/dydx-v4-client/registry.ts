import { GeneratedType, Registry } from './cregistry';
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

export const registry: ReadonlyArray<[string, GeneratedType]> = [];
export function generateRegistry(): Registry {
  return new Registry([
    // clob
    [ '/dydxprotocol.clob.MsgPlaceOrder', MsgPlaceOrder as GeneratedType ],
    [ '/dydxprotocol.clob.MsgCancelOrder', MsgCancelOrder as GeneratedType ],
    [ '/dydxprotocol.clob.MsgBatchCancel', MsgBatchCancel as GeneratedType ],

    // sending
    [ '/dydxprotocol.sending.MsgCreateTransfer', MsgCreateTransfer as GeneratedType ],
    [ '/dydxprotocol.sending.MsgWithdrawFromSubaccount', MsgWithdrawFromSubaccount as GeneratedType ],
    [ '/dydxprotocol.sending.MsgDepositToSubaccount', MsgDepositToSubaccount as GeneratedType ],

    [ '/dydxprotocol.accountplus.TxExtension', TxExtension as GeneratedType ],
    [ '/cosmos.crypto.secp256k1.PubKey', PubKey as GeneratedType ],

  ]);
}