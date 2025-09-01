// TODO: import pb files directly
import { GeneratedType, Registry } from '../../registry';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { TxExtension } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/accountplus/tx';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import {
  MsgPlaceOrder,
  MsgCancelOrder,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/tx';
import {
  MsgWithdrawFromSubaccount,
  MsgDepositToSubaccount,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/transfer';
import { MsgCreateTransfer } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/tx';

import {
  TYPE_URL_MSG_PLACE_ORDER,
  TYPE_URL_MSG_CANCEL_ORDER,
  TYPE_URL_MSG_CREATE_TRANSFER,
  TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT,
  TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT,
} from '../constants';

export const registry: ReadonlyArray<[string, GeneratedType]> = [];
export function generateRegistry(): Registry {
  return new Registry([
    // clob
    [TYPE_URL_MSG_PLACE_ORDER, MsgPlaceOrder as GeneratedType],
    [TYPE_URL_MSG_CANCEL_ORDER, MsgCancelOrder as GeneratedType],

    // sending
    [TYPE_URL_MSG_CREATE_TRANSFER, MsgCreateTransfer as GeneratedType],
    [TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT, MsgWithdrawFromSubaccount as GeneratedType],
    [TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT, MsgDepositToSubaccount as GeneratedType],

    [ '/dydxprotocol.accountplus.TxExtension', TxExtension as GeneratedType ],
    [ '/cosmos.crypto.secp256k1.PubKey', PubKey as GeneratedType ],

    // default types
    // ...defaultRegistryTypes,
  ]);
}
