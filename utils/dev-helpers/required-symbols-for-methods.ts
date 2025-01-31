
/*
this script checks which methods (under 'features') requres symbol (or code) argument
*/

import ccxt from '../../ts/ccxt.js';

const methodsDict = {
    'rest': {
      'symbol':  [
        'fetchOrder',
        'fetchOrders',
        'fetchOpenOrders',
        'fetchClosedOrders',
        'fetchMyTrades',
        // 'fetchOrderTrades', 'cancelOrders', 'cancelOrder', 'cancelAllOrders'
      ], 
      'code': [
        // 'fetchDeposits', 'fetchWithdrawals', 'fetchTransactions', 'fetchDepositsWithdrawals', 'fetchDepositWithdrawFees'
     ]
    },
    'ws': {}
  };
  const marketTypes = ['spot', 'future', 'swap'];
  const subTypes = ['linear', 'inverse'];

  async function runCheck() {
    const proms: Promise<any>[] = [];
    const exchanges = [];
    for (const exName of ccxt.exchanges) {
        const proOrRest = exName in ccxt.pro ? ccxt.pro : ccxt;
        const ex = new (proOrRest as any)[exName]();
        exchanges.push(ex);
        ex.fetch = ()=> {return {}};
        ex.fetch2 = ()=> {return {}};
    }
    await Promise.all(proms);
    const allMethods = [... methodsDict.rest.symbol, ... methodsDict.rest.code];
    const results: any = {};
    for (const ex of exchanges) {
      if (!ex.features) continue; // only bitfinex1 has no features
      for (const marketType of marketTypes) {
        if (
           (marketType === 'spot' && ex.features[marketType] !== undefined)
              ||
           (marketType !== 'spot' && (ex.features[marketType]['linear'] !== undefined || ex.features[marketType]['inverse'] !== undefined))
        ) {
          for (const method of allMethods) {
            ex.options['defaultType'] = marketType;
            try {
                const arg1 = ['fetchOrder', 'cancelOrder'].includes(method) ? 'id123456' : undefined;
                const args = [arg1];
                await ex[method](...args);
            } catch(e: any) {
                const supportedMethod = !(e.message.includes ('is not supported yet'));
                // we are only interested in supported methods
                if (supportedMethod) {
                    results[ex.id] = results[ex.id] || {};
                    results[ex.id][marketType] = results[ex.id][marketType] || {};
                    if (e.constructor.name === 'ArgumentsRequired') {
                        results[ex.id][marketType][method] = {res:true, msg: e.message};
                    } else {
                        results[ex.id][marketType][method] = {res:false, msg: e.message};
                    }
                } else {
                // console.log('unsupported:', ex.id, method);
                }
            }
          }
        }
      }
    }
    console.log(results);
  }
  
  runCheck();
  
  
  