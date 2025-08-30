import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import { MsgAddAuthenticator, MsgRemoveAuthenticator } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/accountplus/tx';
import { MsgRegisterAffiliate } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/affiliates/tx';
import {
  MsgPlaceOrder,
  MsgCancelOrder,
  MsgCreateClobPair,
  MsgUpdateClobPair,
  MsgBatchCancel,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/tx';
import { MsgDelayMessage } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/delaymsg/tx';
import { MsgCreateMarketPermissionless } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/listing/tx';
import { MsgCreatePerpetual } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/perpetuals/tx';
import { MsgCreateOracleMarket } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/prices/tx';
import {
  MsgWithdrawFromSubaccount,
  MsgDepositToSubaccount,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/transfer';
import { MsgCreateTransfer } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/tx';
import {
  MsgDepositToMegavault,
  MsgWithdrawFromMegavault,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/vault/tx';

import {
  TYPE_URL_MSG_PLACE_ORDER,
  TYPE_URL_MSG_CANCEL_ORDER,
  TYPE_URL_MSG_CREATE_CLOB_PAIR,
  TYPE_URL_MSG_UPDATE_CLOB_PAIR,
  TYPE_URL_MSG_DELAY_MESSAGE,
  TYPE_URL_MSG_CREATE_PERPETUAL,
  TYPE_URL_MSG_CREATE_ORACLE_MARKET,
  TYPE_URL_MSG_CREATE_TRANSFER,
  TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT,
  TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT,
  TYPE_URL_BATCH_CANCEL,
  TYPE_URL_MSG_DEPOSIT_TO_MEGAVAULT,
  TYPE_URL_MSG_WITHDRAW_FROM_MEGAVAULT,
  TYPE_URL_MSG_REGISTER_AFFILIATE,
  TYPE_URL_MSG_CREATE_MARKET_PERMISSIONLESS,
  TYPE_URL_MSG_ADD_AUTHENTICATOR,
  TYPE_URL_MSG_REMOVE_AUTHENTICATOR,
} from '../constants';

export const registry: ReadonlyArray<[string, GeneratedType]> = [];
export function generateRegistry(): Registry {
  return new Registry([
    // clob
    [TYPE_URL_MSG_PLACE_ORDER, MsgPlaceOrder as GeneratedType],
    [TYPE_URL_MSG_CANCEL_ORDER, MsgCancelOrder as GeneratedType],
    [TYPE_URL_BATCH_CANCEL, MsgBatchCancel as GeneratedType],
    [TYPE_URL_MSG_CREATE_CLOB_PAIR, MsgCreateClobPair as GeneratedType],
    [TYPE_URL_MSG_UPDATE_CLOB_PAIR, MsgUpdateClobPair as GeneratedType],

    // delaymsg
    [TYPE_URL_MSG_DELAY_MESSAGE, MsgDelayMessage as GeneratedType],

    // listing
    [TYPE_URL_MSG_CREATE_MARKET_PERMISSIONLESS, MsgCreateMarketPermissionless as GeneratedType],

    // perpetuals
    [TYPE_URL_MSG_CREATE_PERPETUAL, MsgCreatePerpetual as GeneratedType],

    // prices
    [TYPE_URL_MSG_CREATE_ORACLE_MARKET, MsgCreateOracleMarket as GeneratedType],

    // vaults
    [TYPE_URL_MSG_DEPOSIT_TO_MEGAVAULT, MsgDepositToMegavault as GeneratedType],
    [TYPE_URL_MSG_WITHDRAW_FROM_MEGAVAULT, MsgWithdrawFromMegavault as GeneratedType],

    // sending
    [TYPE_URL_MSG_CREATE_TRANSFER, MsgCreateTransfer as GeneratedType],
    [TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT, MsgWithdrawFromSubaccount as GeneratedType],
    [TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT, MsgDepositToSubaccount as GeneratedType],

    // affiliates
    [TYPE_URL_MSG_REGISTER_AFFILIATE, MsgRegisterAffiliate as GeneratedType],


    // authentication
    [TYPE_URL_MSG_ADD_AUTHENTICATOR, MsgAddAuthenticator as GeneratedType],
    [TYPE_URL_MSG_REMOVE_AUTHENTICATOR, MsgRemoveAuthenticator as GeneratedType],

    // default types
    ...defaultRegistryTypes,
  ]);
}
