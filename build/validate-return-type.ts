
import ts from 'typescript';
import fs from 'fs'

const exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8")).ids;

// Function to extract method names and return types from a .d.ts file
function extractMethodsAndReturnTypes(filePath: string): Record<string, string> {
  const program = ts.createProgram([filePath], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filePath);

  const methods: Record<string, string> = {};

  function visit(node: ts.Node) {
    if (ts.isMethodSignature(node) || ts.isMethodDeclaration(node)) {
      const methodName = node.name.getText(sourceFile);
      const returnType = checker.typeToString(checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)!));

      methods[methodName] = returnType;
    }
    ts.forEachChild(node, visit);
  }

  if (sourceFile) {
    visit(sourceFile);
  }
  return methods;
}

function isUserFacingMethod(method: string) {
    return method.startsWith('fetch')
        || method.startsWith('create')
        || method.startsWith('cancel')
        || method.startsWith('edit')
        || method.startsWith('transfer')
        || method.startsWith('withdraw')
        || method.startsWith('deposit');
}

function main() {
    const basePath = './js/src/';

    const sourceOfTruth = extractMethodsAndReturnTypes(basePath + 'Exchange.d.ts');

    for (const exchange of exchanges) {
        const path = basePath + exchange + '.d.ts';
        const methodsInfo = extractMethodsAndReturnTypes(path);
        for (const method in methodsInfo) {
            const returnType = methodsInfo[method];
            if (method in sourceOfTruth) {
                if (isUserFacingMethod(method)) {
                    if (returnType.indexOf('any') === -1 && !returnType.startsWith('{')) { // ignore any/untyped methods
                        if (sourceOfTruth[method] !== returnType) {
                            console.log('Difference found', exchange, method, returnType, sourceOfTruth[method]);
                        }
                    }
                }
            }
        }
    }

}

main()