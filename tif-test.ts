
async function test(){
    const ex = await import ('./ts/src/pro/'+'bybit'+'.js');
    const e = new ex.default() as any; 

    // ### ascendex ###
    // const g        = 'spotAndFutures'; // target groupName under `options->timeInForceMap`
    // const exTifKey = 'time_in_f';      // exchange specific TIF prop name
    // const exPoStr  = undefined;        // exchange specific TIF PO string value
    // const exPoKey  = 'is_pos';         // if exchange needs specific bool prop for postonly

    // ### bybit ###
    const g          = 'v5unified';
    const exTifKey   = 'tim_in_foo'; 
    const exPoStr    = 'PO';
    const exPoKey    = undefined;
    // ###################################

    let o = 'market'; // market order (change this to 'limit' too)
    // mixed exchange-specific and unified key&value
    exec(()=>e.handleRequestTif (g, o, {'postOnly': true }));
    exec(()=>e.handleRequestTif (g, o, {'postOnly': false }));
        if (exPoKey) {
    exec(()=>e.handleRequestTif (g, o, {[exPoKey]: true }));
    exec(()=>e.handleRequestTif (g, o, {[exPoKey]: false }));
        }
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'PO'}));
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': exPoStr}));
    exec(()=>e.handleRequestTif (g, o, {[exTifKey]: 'PO'}));
    exec(()=>e.handleRequestTif (g, o, {[exTifKey]: exPoStr}));
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'PO', 'postOnly': false }));
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'PO', 'postOnly': true }));
    // others
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'FOK', 'postOnly': true }));
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'FOK', 'postOnly': false }));
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'IOC', 'postOnly': true }));
    exec(()=>e.handleRequestTif (g, o, {'timeInForce': 'IOC', 'postOnly': false })); 
}
setTimeout(test, 1);



const exec = (func)=>{
    let result:any = undefined;
    let sign = '';
    try { 
        result = JSON.stringify(func(), (k, v) => v === undefined ? null : v); 
        sign = '🟢' ;
    }
    catch(e:any) { 
        result = e.message; 
        sign = '🔴' ;
    }
    console.log (' ✍  input:' + func.toString().replace(/(.*?)g, o, /,''), ` ${sign} `, result);
};