// goOperandStaticType on a binary operand re-prints its whole subtree, so a `+` chain of
// depth n costs O(2^n) (tests.ts: 108 s, prediction/hyperliquid.ts: 27 s). A binary
// node's Go type does not depend on the printed text, so memoize it per node.
export function installGoOperandTypeMemo (goTranspiler: any) {
    const original = goTranspiler.goOperandStaticType;
    const memo = new WeakMap<object, string | undefined> ();
    goTranspiler.goOperandStaticType = function (node: any, printedText: string) {
        if (node?.operatorToken === undefined) {
            return original.call (this, node, printedText);
        }
        if (memo.has (node)) {
            return memo.get (node);
        }
        const goType = original.call (this, node, printedText);
        memo.set (node, goType);
        return goType;
    };
}
