const hollaex = require('./js/hollaex');

const holla = new hollaex();


holla.fetchOrderBook('BTC/EUR').then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
})
