// Lists every this.handleDelta(s) call in ts/src with the checker type of argument 0.
import ts from 'typescript6';
const cfg = ts.getParsedCommandLineOfConfigFile ('tsconfig.json', {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const program = ts.createProgram (cfg.fileNames, cfg.options);
const checker = program.getTypeChecker ();
const names = new Set (process.argv.slice (2).length ? process.argv.slice (2) : [ 'handleDelta', 'handleDeltas' ]);
for (const sf of program.getSourceFiles ()) {
    if (!/ts\/src\/(pro|base)\//.test (sf.fileName)) continue;
    const visit = (n) => {
        if (ts.isCallExpression (n) && ts.isPropertyAccessExpression (n.expression) && n.expression.expression.kind === ts.SyntaxKind.ThisKeyword && names.has (n.expression.name.text) && n.arguments.length) {
            const a = n.arguments[0];
            const t = checker.typeToString (checker.getTypeAtLocation (a));
            const { line } = sf.getLineAndCharacterOfPosition (n.getStart ());
            console.log (`${t.includes ('IOrderBookSide') ? 'OK ' : 'BAD'} ${sf.fileName.replace (/.*ts\/src\//, '')}:${line + 1} ${n.expression.name.text} (${a.getText ()}) : ${t}`);
        }
        ts.forEachChild (n, visit);
    };
    visit (sf);
}
