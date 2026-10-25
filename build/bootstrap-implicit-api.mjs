import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript6';

// A new venue imports its implicit API before that API can be generated. Seed
// only missing abstracts with their real parent so describe() can be evaluated.
// The normal emitter replaces these temporary classes with endpoint methods.
export function bootstrapImplicitApiAbstracts(root, exchanges) {
    const sources = [
        { ids: exchanges.ids || [], folder: '', abstractFolder: '', prediction: false },
        { ids: exchanges.ws || [], folder: 'pro', abstractFolder: 'pro', prediction: false },
        { ids: exchanges.prediction || [], folder: 'prediction', abstractFolder: 'prediction', prediction: true },
    ];
    const pending = [];
    for (const group of sources) {
        for (const id of group.ids) {
            if (!/^[a-zA-Z0-9_]+$/.test(id)) {
                throw new Error(`Invalid exchange id for implicit API bootstrap: ${id}`);
            }
            const sourcePath = path.join(root, 'ts/src', group.folder, `${id}.ts`);
            const target = path.join(root, 'ts/src/abstract', group.abstractFolder, `${id}.ts`);
            if (!fs.existsSync(sourcePath) || fs.existsSync(target)) {
                continue;
            }
            const source = ts.createSourceFile(sourcePath, fs.readFileSync(sourcePath, 'utf8'), ts.ScriptTarget.Latest, true);
            const imports = source.statements.filter(node => ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier));
            const abstractImport = imports.find(node => path.resolve(path.dirname(sourcePath), node.moduleSpecifier.text).replace(/\.js$/, '.ts') === target);
            // Most WebSocket classes inherit the REST class directly.
            if (!abstractImport) {
                continue;
            }
            const declaration = source.statements.find(node => ts.isClassDeclaration(node) && node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword));
            const heritage = declaration?.heritageClauses?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression;
            const parent = heritage && ts.isIdentifier(heritage) ? heritage.text : undefined;
            if (!parent || abstractImport.importClause?.isTypeOnly || abstractImport.importClause?.name?.text !== parent) {
                throw new Error(`Cannot resolve implicit API parent binding in ${sourcePath}`);
            }
            const rootParent = parent === 'Exchange';
            const parentPath = rootParent
                ? path.join(root, 'ts/src/base', group.prediction ? 'PredictionExchange.ts' : 'Exchange.ts')
                : path.join(root, 'ts/src', group.folder, `${parent}.ts`);
            if (parentPath === sourcePath || !fs.existsSync(parentPath)) {
                throw new Error(`Cannot resolve implicit API parent ${parent} in ${sourcePath}`);
            }
            let relative = path.relative(path.dirname(target), parentPath).split(path.sep).join('/').replace(/\.ts$/, '.js');
            if (!relative.startsWith('.')) {
                relative = './' + relative;
            }
            const imported = rootParent && !group.prediction ? `{ Exchange as _${parent} }` : `_${parent}`;
            pending.push({
                target,
                contents: '// Temporary implicit API bootstrap; overwritten by generateImplicitAPI.ts.\n'
                    + `import ${imported} from '${relative}';\n\n`
                    + `abstract class ${parent} extends _${parent} {}\n\nexport default ${parent};\n`,
            });
        }
    }
    for (const { target, contents } of pending) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        // Never replace an existing generated file, including another process's
        // output appearing between inspection and creation.
        try {
            fs.writeFileSync(target, contents, { flag: 'wx' });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
}
