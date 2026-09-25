import { nativeDeclaredHelperCalls } from './helpers.ts';
const src = `public partial class x : Exchange
{
    public void handle(object message)
    {
        string? symbol = this.safeString(message, "s");
        string code = "a";
        object a = getValue(this.ohlcvs, symbol);
        object b = getValue(this.balance, code);
        if (inOp(this.trades, symbol)) { }
        object c = getValue(this.orderbooks, code);
        object d = getValue(this.positions, code);
    }
}`;
console.log(nativeDeclaredHelperCalls(src));
