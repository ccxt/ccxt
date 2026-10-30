// hx11 w8 printer-go-createorders-body-orders-slice.
// `createOrders (orders: OrderRequest[])` prints `orders any` on the base, every venue and ICreateOrders, so the
// bodies call GetArrayLength(orders). Every caller already hands over a `[]any` (the typed wrappers pass
// ConvertOrderRequestListToArray, ws/hyperliquid pass `[]any{order}`, the base tests pass a `[]any` local), so the
// whole family prints `[]any` together and `.length` becomes len().
import { ts } from './csharp-local-types.js';

const ANNOTATIONS = [ 'OrderRequest[]', 'PredictionOrderRequest[]' ];

export function installHx11w8CreateOrdersSlice (goTranspiler: any) {
    const flag = 'hx11w8CreateOrdersSliceInstalled';
    if ((goTranspiler === undefined) || (goTranspiler[flag] === true) || (typeof goTranspiler.goNativeParameterTypeOf !== 'function')) {
        return;
    }
    goTranspiler[flag] = true;
    const upstream = goTranspiler.goNativeParameterTypeOf;
    goTranspiler.goNativeParameterTypeOf = function (this: any, param: any) {
        const result = upstream.call (this, param);
        if (result !== undefined) { return result; }
        const fn: any = param.parent;
        if ((fn?.kind !== ts.SyntaxKind.MethodDeclaration) || (fn.name?.text !== 'createOrders') || (fn.parameters?.[0] !== param)
            || (param.initializer !== undefined) || (param.dotDotDotToken !== undefined) || (param.name?.kind !== ts.SyntaxKind.Identifier)
            || (fn.body === undefined) || !ANNOTATIONS.includes (String (param.type?.getText () ?? '').replace (/\s+/g, ''))) {
            return undefined;
        }
        // the table types the base and every override together (one interface signature): a body that breaks it fails the build
        if (!this.goLocalIsSafeToType (fn.body, param, param.name.text, '[]any')) {
            throw new Error ('createOrders: parameter orders is written as something other than []any');
        }
        return '[]any';
    };
    // element reads keep GetValue: the native read would trade it for DerefScalar (a family move)
    if (typeof goTranspiler.goNativeListElementRead === 'function') {
        const upstreamRead = goTranspiler.goNativeListElementRead;
        goTranspiler.goNativeListElementRead = function (this: any, node: any, containerStr: string, keyNode: any, keyStr: string) {
            const base: any = node?.expression;
            const decl: any = (base?.kind === ts.SyntaxKind.Identifier) ? this.checkerOrUndefined ()?.getSymbolAtLocation (base)?.valueDeclaration?.resolve () : undefined;
            const fn: any = decl?.parent;
            if ((fn?.name?.text === 'createOrders') && (decl.name?.text === 'orders') && (fn.parameters?.[0]?.name?.text === 'orders')) {
                return undefined;
            }
            return upstreamRead.call (this, node, containerStr, keyNode, keyStr);
        };
    }
}
