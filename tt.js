const keys = require('./keys.local.json');
const ccxt = require('./ccxt');

const lbank =  new ccxt.lbank2(keys['lbank2']);

(async function run (){
    const balance = await lbank.fetchBalance();
    console.log(balance);
})()
