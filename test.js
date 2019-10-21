const bitbnsApi = require("bitbns");
const {promisify} = require("util")
const axios = require("axios");

const bitbns = new bitbnsApi({
    apiKey :  '3D85E6D9D5B8E13A3D3F988782A0D259',
    apiSecretKey : 'C0A23E11F3A83F50A5B322EDD11495EC'
}); 

const getBuyOrderBook = promisify(bitbns.getBuyOrderBook.bind(bitbns));
const getSellOrderBook = promisify(bitbns.getSellOrderBook.bind(bitbns));

getPayload = (symbol, body) => {
    // const timeStamp_nonce = Date.now().toString();
    const data = {
      symbol : symbol,
    //   timeStamp_nonce : timeStamp_nonce,
      body: body
    };
    return new Buffer(JSON.stringify(data)).toString('base64');
  }

const fetchMarkets2 = async () => {
    let data = await axios.get("https://bitbns.com/order/getTickerWithVolume/");
    data = data.data;
    // console.log(data);
    let keys = Object.keys(data);
    // console.log(keys);

    let res = []

    for(i of keys){
		// console.log(i,i.substr(-4,4));
		let cur1,cur2;
		if(i === "USDT"){
			cur1 = i;
			cur2 = "INR"
		}
		else if(i.substr(-4,4) === 'USDT'){
			cur1 = i.substr(0,i.length - 4)
			cur2 = "USDT";
		}
		else {
			cur1 = i;
			cur2 = "INR"
		}
		// console.log(i,cur1,cur2);
		let marketObj = {
            'id': i,  // string literal for referencing within an exchange
            'symbol': cur1+'/'+cur2, // uppercase string literal of a pair of currencies
            'base': cur1,     // uppercase string, unified base currency code, 3 or more letters
            'quote': cur2,     // uppercase string, unified quote currency code, 3 or more letters
            'baseId': cur1,     // any string, exchange-specific base currency id
            'quoteId': '',     // any string, exchange-specific quote currency id
            'active': true,       // boolean, market status
            'limits': {           // value limits when placing orders on this market
                'amount': {
                    'min': undefined,  // order amount should be > min
                    'max': undefined,  // order amount should be < max
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                }, // same min/max limits for the price of the order
                'cost': {
                    'min': undefined,
                    'max': undefined,
                }, // same limits for order cost = price * amount
            },
            'info': {}, // the original unparsed market info from the exchange
		}
		
		marketObj["quoteId"] = cur2 === 'USDT' ? cur2 : '';
		res.push(marketObj)
    }
    console.log(res);
	
    return res;
}

const fetchTickers2 = async () => {
	let data = await axios.get("https://bitbns.com/order/getTickerWithVolume/");
	data = data.data;
	console.log(data);
	let res = []
	for(let i of )
	
}

(async () => {

    // let sellOB = await getSellOrderBook('BTC');
    // let buyOB = await getSellOrderBook('BTC');
    // console.log(sellOB);
    // console.log(buyOB);
    
	// await fetchMarkets();
	await fetchTickers2();
    
})();

