
const exec = (func)=>{
    let result:any = undefined;
    let sign = '';
    try { 
        result = JSON.stringify(func()); 
        sign = '🟢' ;
    }
    catch(e:any) { 
        result = e.message; 
        sign = '🔴' ;
    }
    console.log ('  ✍  ' + func.toString().replace(/(.*?)g, o, /,''), ` ${sign} `, result, '\n');
};

async function test(){ 
    const exNames = [
        'bybit' /* https://bybit-exchange.github.io/docs/spot/enum#timeinforce */
    ];
    for (const exName of exNames) { 
        const e = await excInit(exName, false) as any; 
        const g = 'v5unified'; //groupName
        const exPoStr = 'PostOnly'; // exchange specific PO tif string
        let o = 'market'; // market order (change this to test !)
        // you can comment below two lines to test without simulating exchange-specific tif key
        const simulatedTifKey = 'tiim_in_foo'; // simulate any exchange-specific tif key
        e.options.timeInForceMap[g].exchangeSpecificTifKey = simulatedTifKey;
        //
        exec(()=>e.handleRequestTif (g, o, {'postOnly': true }));
        exec(()=>e.handleRequestTif (g, o, {'postOnly': false }));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'PO'}));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': exPoStr}));
        exec(()=>e.handleRequestTif (g, o, {simulatedTifKey: 'PO'}));
        exec(()=>e.handleRequestTif (g, o, {simulatedTifKey: exPoStr}));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'PO', 'postOnly': false }));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'PO', 'postOnly': true }));
        // others
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'FOK', 'postOnly': true }));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'FOK', 'postOnly': false }));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'IOC', 'postOnly': true }));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'IOC', 'postOnly': false }));
    }
    //var o = await e.createOrder ('DOGE/USDT', 'limit', 'buy', 200, 0.061, {'triggerPrice':0.056, operator:'lte', 'timeInForce':'PO'});
}
setTimeout(test, 20);







import * as fs from 'fs'; 
const u = undefined;
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
var exchange = undefined; 
async function excInit(exchangeId: string, verbose = false) {
    let settingsFile: any = {};
    try {
        const str: string = fs.readFileSync(__dirname + '/keys.local.json').toString();
        settingsFile = JSON.parse(str);
    } catch {}
    let settings = !(exchangeId in settingsFile) ? {} : settingsFile[exchangeId] as any;
    const timeout = 30000;
    try {
        let exImport : any= null;
        try {
            exImport = await import ('./ts/src/pro/'+exchangeId+'.js');
        } catch (e) {
            exImport = await import ('./ts/src/'+exchangeId+'.js');
        }
        exchange = new exImport.default({
            timeout,
            newUpdates: true,
            ...settings,
            validateServerSsl: false
        });
    } catch (e) {
        console.log(e);
        process.exit();
    }
    return exchange;
}