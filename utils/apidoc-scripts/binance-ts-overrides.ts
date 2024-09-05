
// this is temporary file, before we merge the correct values, we should read this instaed of binance.ts

const manualOverrides = {
    'api': {
        'public': {
            'get': {
                'depth': 5, // dynamic
                'ticker':  4, // dynamic
                'ticker/24hr': { 'cost': 2, 'noSymbol': 80 },
                'ticker/price': { 'cost': 2, 'noSymbol': 4 },
                'ticker/bookTicker': { 'cost': 2, 'noSymbol': 4 },
                'ticker/tradingDay':  4, // dynamic
            }
        },
        'private': {
            'get': {
                'myPreventedMatches': 2, 
                'openOrders': { 'cost': 6, 'noSymbol': 80 },
            },
            'post': {
                'order/test': 1,
                'sor/order/test': 1,
                'orderList/oto': 1,
                'orderList/otoco': 1,
            }
        }
    }
};

export default manualOverrides;

