import { UDC } from '../constants.js';
import { InvokeTransactionReceiptResponse } from '../types/provider';
import { cleanHex } from './num.js';

/**
 * Parse Transaction Receipt Event from UDC invoke transaction and
 * create DeployContractResponse compatible response with addition of the UDC Event data
 *
 * @returns DeployContractResponse | UDC Event Response data
 */
export function parseUDCEvent(txReceipt: InvokeTransactionReceiptResponse) {
  if (!txReceipt.events) {
    throw new Error('UDC emitted event is empty');
  }
  const event = txReceipt.events.find(
    (it: any) => cleanHex(it.from_address) === cleanHex(UDC.ADDRESS)
  ) || {
    data: [],
  };
  return {
    transaction_hash: txReceipt.transaction_hash,
    contract_address: event.data[0],
    address: event.data[0],
    deployer: event.data[1],
    unique: event.data[2],
    classHash: event.data[3],
    calldata_len: event.data[4],
    calldata: event.data.slice(5, 5 + parseInt(event.data[4], 16)),
    salt: event.data[event.data.length - 1],
  };
}
