
async function test(){ 
    const exNames = [
        'bybit' /* https://bybit-exchange.github.io/docs/spot/enum#timeinforce */
    ];
    for (const exName of exNames) { 
        const e = await exchangeInit(exName, false) as any; 
        const g = 'v5unified'; //groupName
        const exPoKey = 'tim_in_foo'; // exchange specific PO tif string
        const exPoStr = 'PostOnly'; // exchange specific PO tif string
        let o = 'market'; // market order (change this to 'limit' too)
        // mixed exchange-specific and unified key&value
        exec(()=>e.handleRequestTif (g, o, {'postOnly': true }));
        exec(()=>e.handleRequestTif (g, o, {'postOnly': false }));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'PO'}));
        exec(()=>e.handleRequestTif (g, o, {'timeInForce': exPoStr}));
        exec(()=>e.handleRequestTif (g, o, {[exPoKey]: 'PO'}));
        exec(()=>e.handleRequestTif (g, o, {[exPoKey]: exPoStr}));
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
setTimeout(test, 1);




import * as fs from 'fs'; 
async function exchangeInit(exchangeId: string, verbose = false) {
    let settingsFile: any = {};
    try {
        settingsFile = JSON.parse(fs.readFileSync('./keys.local.json').toString());
    } catch {}
    let settings = !(exchangeId in settingsFile) ? {} : settingsFile[exchangeId] as any;
    try {
        let exImport : any = null;
        try       { exImport = await import ('./ts/src/pro/'+exchangeId+'.js'); }
        catch (e) { exImport = await import ('./ts/src/'+exchangeId+'.js');     }
        return new exImport.default({ ...settings, });
    } catch (e) {
        console.log(e);
        process.exit();
    }
}



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
    console.log (' ✍  input:' + func.toString().replace(/(.*?)g, o, /,''), ` ${sign} `, result);
};