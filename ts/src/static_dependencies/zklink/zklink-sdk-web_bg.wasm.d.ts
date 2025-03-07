/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_jsonrpcsigner_free(a: number): void;
export function newRpcSignerWithProvider(a: number, b: number): void;
export function newRpcSignerWithSigner(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function jsonrpcsigner_initZklinkSigner(a: number, b: number, c: number): number;
export function jsonrpcsigner_getPubkey(a: number, b: number): void;
export function jsonrpcsigner_pubkeyHash(a: number, b: number): void;
export function jsonrpcsigner_address(a: number, b: number): void;
export function jsonrpcsigner_signatureSeed(a: number, b: number): void;
export function jsonrpcsigner_signChangePubkeyWithOnchain(a: number, b: number, c: number): void;
export function jsonrpcsigner_signChangePubkeyWithEthEcdsaAuth(a: number, b: number): number;
export function jsonrpcsigner_signChangePubkeyWithCreate2DataAuth(a: number, b: number, c: number, d: number): void;
export function jsonrpcsigner_signTransfer(a: number, b: number, c: number, d: number): number;
export function jsonrpcsigner_createSignedOrder(a: number, b: number, c: number): void;
export function jsonrpcsigner_signOrderMatching(a: number, b: number, c: number): void;
export function jsonrpcsigner_signWithdraw(a: number, b: number, c: number, d: number): number;
export function jsonrpcsigner_signForcedExit(a: number, b: number, c: number): void;
export function jsonrpcsigner_signAutoDeleveraging(a: number, b: number, c: number): void;
export function jsonrpcsigner_createSignedContract(a: number, b: number, c: number): void;
export function jsonrpcsigner_signContractMatching(a: number, b: number, c: number): void;
export function jsonrpcsigner_signFunding(a: number, b: number, c: number): void;
export function jsonrpcsigner_signLiquidation(a: number, b: number, c: number): void;
export function jsonrpcsigner_signMusig(a: number, b: number, c: number, d: number): void;
export function jsonrpcsigner_getZkLinkSigner(a: number): number;
export function __wbg_create2data_free(a: number): void;
export function __wbg_changepubkey_free(a: number): void;
export function create2data_new(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void;
export function create2data_salt(a: number, b: number, c: number, d: number): void;
export function create2data_jsValue(a: number, b: number): void;
export function changepubkey_jsValue(a: number, b: number): void;
export function changepubkey_getChangePubkeyMessage(a: number, b: number, c: number, d: number, e: number): void;
export function changepubkey_getEthSignMsg(a: number, b: number, c: number, d: number): void;
export function changepubkey_setEthAuthData(a: number, b: number, c: number, d: number): void;
export function changepubkey_sign(a: number, b: number, c: number): void;
export function __wbg_changepubkeybuilder_free(a: number): void;
export function changepubkeybuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number
): void;
export function changepubkeybuilder_build(a: number): number;
export function newChangePubkey(a: number): number;
export function __wbg_liquidation_free(a: number): void;
export function liquidation_jsValue(a: number, b: number): void;
export function liquidation_sign(a: number, b: number, c: number): void;
export function __wbg_liquidationbuilder_free(a: number): void;
export function liquidationbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number
): void;
export function liquidationbuilder_build(a: number): number;
export function newLiquidation(a: number): number;
export function __wbg_forcedexit_free(a: number): void;
export function forcedexit_jsValue(a: number, b: number): void;
export function forcedexit_sign(a: number, b: number, c: number): void;
export function __wbg_forcedexitbuilder_free(a: number): void;
export function forcedexitbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number,
  o: number
): void;
export function forcedexitbuilder_build(a: number): number;
export function newForcedExit(a: number): number;
export function __wbg_transfer_free(a: number): void;
export function transfer_jsValue(a: number, b: number): void;
export function transfer_getEthSignMsg(a: number, b: number, c: number, d: number): void;
export function transfer_sign(a: number, b: number, c: number): void;
export function __wbg_transferbuilder_free(a: number): void;
export function transferbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number
): void;
export function transferbuilder_build(a: number): number;
export function newTransfer(a: number): number;
export function __wbg_autodeleveraging_free(a: number): void;
export function autodeleveraging_jsValue(a: number, b: number): void;
export function autodeleveraging_sign(a: number, b: number, c: number): void;
export function __wbg_autodeleveragingbuilder_free(a: number): void;
export function autodeleveragingbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number,
  o: number,
  p: number,
  q: number
): void;
export function autodeleveragingbuilder_build(a: number): number;
export function newAutoDeleveraging(a: number): number;
export function __wbg_updateglobalvar_free(a: number): void;
export function updateglobalvar_jsValue(a: number, b: number): void;
export function updateglobalvar_zklinkTx(a: number, b: number): void;
export function updateglobalvarbuilder_new(a: number, b: number, c: number, d: number, e: number): void;
export function updateglobalvarbuilder_build(a: number): number;
export function newUpdateGlobalVar(a: number): number;
export function __wbg_parameter_free(a: number): void;
export function parameter_new(a: number, b: number): number;
export function __wbg_margininfo_free(a: number): void;
export function margininfo_new(a: number, b: number, c: number): number;
export function margininfo_jsValue(a: number, b: number): void;
export function __wbg_contractinfo_free(a: number): void;
export function contractinfo_new(a: number, b: number, c: number, d: number, e: number): number;
export function contractinfo_jsValue(a: number, b: number): void;
export function __wbg_ethtxoption_free(a: number): void;
export function ethtxoption_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number
): void;
export function ethtxoption_jsValue(a: number, b: number): void;
export function __wbg_wallet_free(a: number): void;
export function wallet_new(a: number, b: number, c: number, d: number, e: number): void;
export function wallet_getBalance(a: number): number;
export function wallet_getNonce(a: number, b: number, c: number, d: number): number;
export function wallet_getDepositFee(a: number, b: number): number;
export function wallet_waitForTransaction(a: number, b: number, c: number, d: number, e: number): number;
export function wallet_approveERC20(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function wallet_depositERC20(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number
): number;
export function wallet_depositETH(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function wallet_setAuthPubkeyHash(a: number, b: number, c: number, d: number, e: number): number;
export function wallet_fullExit(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function __wbg_zklinksigner_free(a: number): void;
export function zklinksigner_ethSig(a: number, b: number, c: number): void;
export function zklinksigner_starknetSig(a: number, b: number, c: number): void;
export function __wbg_updateglobalvarbuilder_free(a: number): void;
export function __wbg_rpcclient_free(a: number): void;
export function rpcclient_new(a: number, b: number, c: number, d: number, e: number): void;
export function rpcclient_getSupportTokens(a: number): number;
export function rpcclient_getAccountSnapshot(a: number, b: number, c: number, d: number, e: number): number;
export function rpcclient_sendTransaction(a: number, b: number, c: number, d: number): number;
export function rpcclient_getSupportChains(a: number): number;
export function rpcclient_getLatestBlockNumber(a: number): number;
export function rpcclient_getBlockByNumber(a: number, b: number, c: number, d: number, e: number): number;
export function rpcclient_getPendingBlock(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function rpcclient_getBlockOnChainByNumber(a: number, b: number): number;
export function rpcclient_getAccount(a: number, b: number): number;
export function rpcclient_getAccountBalances(a: number, b: number, c: number): number;
export function rpcclient_getAccountOrderSlots(a: number, b: number, c: number): number;
export function rpcclient_getTokenReserve(a: number, b: number, c: number): number;
export function rpcclient_getTransactionByHash(a: number, b: number, c: number, d: number): number;
export function rpcclient_getAccountTransactionHistory(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
): number;
export function rpcclient_getWithdrawTxs(a: number, b: number, c: number): number;
export function rpcclient_pullForwardTxs(a: number, b: number, c: number, d: number): number;
export function rpcclient_getWebSocketEvents(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function __wbg_accountquery_free(a: number): void;
export function __wbg_txzklinksignature_free(a: number): void;
export function __wbg_zklinktx_free(a: number): void;
export function txzklinksignature_new(a: number, b: number, c: number, d: number, e: number): void;
export function accountquery_new(a: number, b: number, c: number): number;
export function txlayer1signature_new(a: number, b: number, c: number): number;
export function txlayer1signature_signType(a: number): number;
export function txlayer1signature_signature(a: number, b: number): void;
export function txzklinksignature_pubKey(a: number, b: number): void;
export function txzklinksignature_signature(a: number, b: number): void;
export function zklinktx_new(a: number, b: number): number;
export function __wbg_fundinginfo_free(a: number): void;
export function fundinginfo_new(a: number, b: number, c: number, d: number, e: number): void;
export function fundinginfo_jsValue(a: number, b: number): void;
export function __wbg_funding_free(a: number): void;
export function funding_jsValue(a: number, b: number): void;
export function funding_sign(a: number, b: number, c: number): void;
export function __wbg_fundingbuilder_free(a: number): void;
export function fundingbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number
): void;
export function fundingbuilder_build(a: number): number;
export function newFunding(a: number): number;
export function __wbg_contractprice_free(a: number): void;
export function contractprice_new(a: number, b: number, c: number, d: number): void;
export function contractprice_jsValue(a: number, b: number): void;
export function __wbg_spotpriceinfo_free(a: number): void;
export function spotpriceinfo_new(a: number, b: number, c: number, d: number): void;
export function spotpriceinfo_jsValue(a: number, b: number): void;
export function __wbg_withdraw_free(a: number): void;
export function withdraw_jsValue(a: number, b: number): void;
export function withdraw_getEthSignMsg(a: number, b: number, c: number, d: number): void;
export function withdraw_sign(a: number, b: number, c: number): void;
export function __wbg_withdrawbuilder_free(a: number): void;
export function withdrawbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number,
  o: number,
  p: number,
  q: number,
  r: number,
  s: number
): void;
export function withdrawbuilder_build(a: number): number;
export function newWithdraw(a: number): number;
export function __wbg_txlayer1signature_free(a: number): void;
export function __wbg_contractmatching_free(a: number): void;
export function contractmatching_jsValue(a: number, b: number): void;
export function contractmatching_sign(a: number, b: number, c: number): void;
export function __wbg_contractmatchingbuilder_free(a: number): void;
export function contractmatchingbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number
): void;
export function contractmatchingbuilder_build(a: number): number;
export function newContractMatching(a: number): number;
export function __wbg_contract_free(a: number): void;
export function contract_jsValue(a: number, b: number): void;
export function contract_sign(a: number, b: number, c: number): void;
export function __wbg_contractbuilder_free(a: number): void;
export function contractbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number
): void;
export function contractbuilder_build(a: number): number;
export function newContract(a: number): number;
export function __wbg_order_free(a: number): void;
export function __wbg_ordermatching_free(a: number): void;
export function order_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number,
  o: number
): void;
export function order_jsValue(a: number, b: number): void;
export function order_sign(a: number, b: number, c: number): void;
export function ordermatching_jsValue(a: number, b: number): void;
export function __wbg_ordermatchingbuilder_free(a: number): void;
export function ordermatchingbuilder_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number,
  o: number,
  p: number
): void;
export function ordermatchingbuilder_build(a: number): number;
export function newOrderMatching(a: number): number;
export function isTokenAmountPackable(a: number, b: number, c: number): void;
export function isFeeAmountPackable(a: number, b: number, c: number): void;
export function closestPackableTransactionAmount(a: number, b: number, c: number): void;
export function closestPackableTransactionFee(a: number, b: number, c: number): void;
export function __wbg_requestarguments_free(a: number): void;
export function __wbindgen_export_0(a: number, b: number): number;
export function __wbindgen_export_1(a: number, b: number, c: number, d: number): number;
export const __wbindgen_export_2: WebAssembly.Table;
export function __wbindgen_export_3(a: number, b: number): void;
export function __wbindgen_export_4(a: number, b: number, c: number): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_export_5(a: number, b: number, c: number): void;
export function __wbindgen_export_6(a: number): void;
export function __wbindgen_export_7(a: number, b: number, c: number, d: number): void;
