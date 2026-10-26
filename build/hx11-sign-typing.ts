// hx11: the `api: string[]` parameter of sign/fetch2/request binds through GetArgStringSlice as a
// []string. The printer excludes those positions from GetArg typing; this answers only that case.
import { ts } from './csharp-local-types.js';

const SIGN_API_METHODS: { [name: string]: number } = { 'sign': 1, 'fetch2': 1, 'request': 1 };

function signApiParameter (param: any): boolean {
    const SK = ts.SyntaxKind;
    const fn = param?.parent;
    if ((param?.kind !== SK.Parameter) || (fn?.kind !== SK.MethodDeclaration) || (fn.name?.kind !== SK.Identifier)) { return false; }
    if (SIGN_API_METHODS[fn.name.text] !== fn.parameters.indexOf (param)) { return false; }
    if (String (param.type?.getText?.() ?? '').replace (/\s+/g, '') !== 'string[]') { return false; }
    const init = param.initializer;
    return (init?.kind === SK.ArrayLiteralExpression) && (init.elements ?? []).every ((e: any) => e.kind === SK.StringLiteral);
}

function signApiElement (go: any, node: any): boolean {
    const SK = ts.SyntaxKind;
    if ((node?.kind !== SK.ElementAccessExpression) || (node.expression?.kind !== SK.Identifier)
        || (node.argumentExpression?.kind !== SK.NumericLiteral) || !/^\d+$/.test (String (node.argumentExpression.text))) { return false; }
    const decl = go.checkerOrUndefined ()?.getSymbolAtLocation (node.expression)?.valueDeclaration?.resolve ();
    return signApiParameter (decl) && (go.goGetArgParameterType (decl) === '[]string');
}

export function installCcxtGoSignTyping (goTranspiler: any) {
    const flag = 'hx11SignTypingInstalled';
    if (goTranspiler[flag] === true) { return; }
    goTranspiler[flag] = true;
    const printLiteral = goTranspiler.printArrayLiteralExpression;
    goTranspiler.printArrayLiteralExpression = function (this: any, node: any, ...rest: any[]) {
        if (signApiParameter (node?.parent)) { this.goSliceLiteralTypes.set (node, '[]string'); }
        return printLiteral.call (this, node, ...rest);
    };
    // `api[0]` on the typed slice is Go's own bounds-checked index, never the GetValue closure
    const printElement = goTranspiler.printElementAccessExpression;
    goTranspiler.printElementAccessExpression = function (this: any, node: any, ...rest: any[]) {
        if (signApiElement (this, node) && !this.isGoElementAccessAssignmentTarget (node)) {
            return node.expression.text + '[' + node.argumentExpression.text + ']';
        }
        return printElement.call (this, node, ...rest);
    };
    // the element of the typed slice is a Go string, so `const apiName = api[0]` declares a string
    const initType = goTranspiler.goTypeOfInitializer;
    goTranspiler.goTypeOfInitializer = function (this: any, node: any, printed: string) {
        if (signApiElement (this, node)) { return 'string'; }
        return initType.call (this, node, printed);
    };
    const original = goTranspiler.goGetArgParameterType;
    goTranspiler.goGetArgParameterType = function (this: any, decl: any) {
        const answer = original.call (this, decl);
        if ((answer !== undefined) || !signApiParameter (decl)) { return answer; }
        if (!this.goLocalIsSafeToType (decl.parent.body, decl, decl.name.text, '[]string')) { return undefined; }
        return '[]string';
    };
}

// Rust: `let mut apiName: Value = api.get(0)...` whose every later use is `apiName.as_str() == Some("lit")` is a
// native Option<String>, exactly what the safe_string form was typed as before the element read.
export function hx11RustSignApiStr (content: string): string {
    // an unbound `api` / `section` read: the bounds-checked nth of the list view, no closure
    content = content.replace (/\b(api|section)\.as_array\(\)\.and_then\(\|__arr\| __arr\.get\((\d+)\)\)/g, '$1.as_array().into_iter().flatten().nth($2)');
    if (content.indexOf ('.get(') < 0) { return content; }
    const lines = content.split ('\n');
    const decl = /^(\s*)let mut (\w+): Value = (?:api|section)\.get\((\d+)\)\.cloned\(\)\.unwrap_or\(Value::Null\);$/;
    const fnHead = /^ {4}(?:pub )?(?:async )?fn /;
    for (let i = 0; i < lines.length; i++) {
        const m = decl.exec (lines[i]);
        if (m === null) { continue; }
        let end = i + 1;
        while ((end < lines.length) && !fnHead.test (lines[end])) { end++; }
        const name = new RegExp ('(?<![\\w.])' + m[2] + '(?![\\w])', 'g');
        const use = new RegExp ('(?<![\\w.])' + m[2] + '\\.as_str\\(\\) (==|!=) Some\\("', 'g');
        let uses = 0;
        let others = 0;
        for (let j = i + 1; j < end; j++) {
            const masked = lines[j].replace (/"(?:[^"\\]|\\.)*"/g, '""');
            uses += (lines[j].match (use) ?? []).length;
            others += (masked.match (name) ?? []).length;
        }
        if ((uses === 0) || (uses !== others)) { continue; }
        lines[i] = m[1] + 'let mut ' + m[2] + ': Option<String> = ' + ((m[0].indexOf ('section') >= 0 ? 'section' : 'api')) + '.get(' + m[3] + ').and_then(Value::as_str).map(str::to_owned);';
        for (let j = i + 1; j < end; j++) {
            lines[j] = lines[j].replace (use, (all, op) => m[2] + '.as_deref() ' + op + ' Some("');
        }
    }
    return lines.join ('\n');
}
