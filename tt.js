const ccxt = require('./ccxt');
const keys = require('./keys.local.json');

const luno = new ccxt.luno (keys['luno']);

const now =  Date.now ();

(async () {
    while (true) {

    }
}) ()

