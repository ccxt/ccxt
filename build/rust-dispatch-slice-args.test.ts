// Slice-argument emission checks for the dynamic-dispatch arms in build/rustTranspiler.ts.
//
//   npx tsx build/rust-dispatch-slice-args.test.ts
//
// Every dispatch arm passes the TAIL of `args` to a method's trailing `&[Value]`
// parameter. It must read that tail straight out of `args` (`&args[..]` /
// `&args[N.min(args.len())..]`): the old `&args.get(N..).unwrap_or(&[]).to_vec()[..]`
// copied the tail into a fresh Vec on every dynamic call. Both spellings hand the
// callee the same slice (`N > args.len()` yields an empty slice either way).
const { RustTranspilerBuilder } = await import ('./rustTranspiler.js');

const t = new RustTranspilerBuilder ();

let failures = 0;
const check = (name: string, expected: string[], actualOf: () => string, forbidden: string[]) => {
    let actual: string;
    try {
        actual = actualOf ();
    } catch (e: any) {
        actual = 'THREW ' + (e && e.message ? e.message : String (e));
    }
    const ok = expected.every (l => actual.includes (l)) && !forbidden.some (f => actual.includes (f));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected.join (' | '));
        if (forbidden.length) console.log ('  forbidden: ' + forbidden.join (' | '));
        console.log ('  actual:   ' + actual.replace (/\s+/g, ' ').slice (0, 400));
    }
};

const OLD = ['unwrap_or(&[])', 'to_vec()[..]'];

// whole-list tail (index 0) and a deeper tail (index N > 0)
check ('dispatchSliceArg whole list', ['&args[..]'], () => t.dispatchSliceArg (0), OLD);
check ('dispatchSliceArg tail', ['&args[2.min(args.len())..]'], () => t.dispatchSliceArg (2), OLD);
check ('dispatchSliceArg N=1', ['&args[1.min(args.len())..]'], () => t.dispatchSliceArg (1), OLD);

const content = [
    'pub async fn fetch_balance(&mut self, optional_args: &[Value]) -> crate::Value {',
    'pub async fn create_order(&mut self, symbol: Value, optional_args: &[Value]) -> crate::Value {',
    'pub fn void_handler(&mut self, a: Value, optional_args: &[crate::Value]) {',
    'pub fn sync_calc(&mut self, a: Value, b: Value, optional_args: &[crate::Value]) -> crate::Value {',
    'fn cancel_orders(&self, optional_args: &[Value]) -> crate::Value {',
].join ('\n');

const sigs = [
    { name: 'fetch_balance', isAsync: true, paramKinds: ['slice'] },
    { name: 'create_order', isAsync: true, paramKinds: ['value', 'value', 'slice'] },
    { name: 'void_handler', isAsync: false, paramKinds: ['value', 'slice'], isVoid: true },
];

check ('emitCoreDispatchImpl', [
    'self.fetch_balance(&args[..]).await',
    'self.create_order(args.get(0).cloned().unwrap_or(crate::Value::Null), args.get(1).cloned().unwrap_or(crate::Value::Null), &args[2.min(args.len())..]).await',
    '{ self.void_handler(args.get(0).cloned().unwrap_or(crate::Value::Null), &args[1.min(args.len())..]); crate::Value::Null }',
], () => t.emitCoreDispatchImpl ('TestCore', sigs, null), OLD);

check ('emitCallDynamic (whole-args dispatch)', [
    'self.fetch_balance(&args[..]).await',
    '&args[2.min(args.len())..]).await',
], () => t.emitCallDynamic (sigs, true), OLD);

check ('emitCallDynamicBaseTrait', [
    'self.fetch_balance(&args[..]).await',
    'self.create_order(args.get(0).cloned().unwrap_or(crate::Value::Null), &args[1.min(args.len())..]).await',
], () => t.emitCallDynamicBaseTrait (content), OLD);

check ('emitCallDynamicPredictionBase', [
    '<Self as crate::prediction_exchange_generated::PredictionBase>::fetch_balance(self, &args[..])',
    '<Self as crate::prediction_exchange_generated::PredictionBase>::create_order(self, args.get(0).cloned().unwrap_or(crate::Value::Null), &args[1.min(args.len())..]).await',
], () => t.emitCallDynamicPredictionBase (content), OLD);

check ('emitWsHandlerDispatch (args: &[Value])', [
    'self.void_handler(args.get(0).cloned().unwrap_or(crate::Value::Null), &args[1.min(args.len())..])',
    'self.sync_calc(args.get(0).cloned().unwrap_or(crate::Value::Null), args.get(1).cloned().unwrap_or(crate::Value::Null), &args[2.min(args.len())..])',
], () => t.emitWsHandlerDispatch ('TestCore', content), OLD);

console.log (failures === 0 ? 'all ok' : failures + ' failure(s)');
process.exit (failures === 0 ? 0 : 1);
