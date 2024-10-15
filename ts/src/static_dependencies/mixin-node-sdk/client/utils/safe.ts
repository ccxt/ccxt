// https://github.com/MixinNetwork/bot-api-nodejs-client/blob/c71b7c4dec9613da2435c55b840809c361df2067/src/client/utils/safe.ts
import { BigNumber } from './_bignumber.js';
import { SafeTransactionRecipient, SafeUtxoOutput } from '../types';

export const getUnspentOutputsForRecipients = (outputs: SafeUtxoOutput[], rs: SafeTransactionRecipient[]) => {
    const totalOutput = rs.reduce((prev, cur) => prev.plus(BigNumber(cur.amount)), BigNumber('0'));
  
    let totalInput = BigNumber('0');
    for (let i = 0; i < outputs.length; i++) {
      const o = outputs[i];
      if (o.state !== 'unspent') continue;
      totalInput = totalInput.plus(BigNumber(o.amount));
      if (totalInput.minus(totalOutput).isNegative()) continue;
  
      return {
        utxos: outputs.slice(0, i + 1),
        change: totalInput.minus(totalOutput),
      };
    }
    throw new Error('insufficient total input outputs');
  };