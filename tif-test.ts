
async function test(){ 
    const exName = 'bybit';
    const e = await excInit(exName, false) as any; 
    //await e.loadMarkets(); 
    e.verbose = true;
    const go = (func)=>{
        let result = undefined;
        try { 
            result += func(); 
        }
        catch(e:any) { 
            result += e.message; 
        }
        console.log (func.toString(), result);
    };
    //
    //
    //
    const isMarketOrder = true;
    go(()=>e.handlePoTif ('unified', isMarketOrder, {'postOnly': true }));

    //var o = await e.createOrder ('DOGE/USDT', 'limit', 'buy', 200, 0.061, {'triggerPrice':0.056, operator:'lte', 'timeInForce':'PO'});
    debugger;
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