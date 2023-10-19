
import ts from 'typescript';
import fs from 'fs'
import log from 'ololog'

const skipMethods = [
    'fetchMarkets',
    'createDepositAddress', // will be updated later
]

const skipExchanges = [
    'someExchange'
    // place exchanges here
]

const skipMethodsPerExchange = {
    'bitfinex': [
        'fetchPositions',
    ],
    'bitflyer': [
        'fetchPositions',
    ],
    'kraken': [
        'fetchPositions',
    ],
    'okcoin': [
        'fetchPositions',
        'fetchPosition'
    ],
    'btctradeua': [
        'createOrder'
    ],
    'coinspot': [
        'createOrder'
    ],
    'poloniex': [
        'fetchOrderStatus'
    ]
}

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

function isUknownReturnType(type: string) {
    return type === 'any'
        || type === 'Promise<{}>'
        || type === 'Promise<unknown>'
        || type === 'Promise<any>'
        || type === 'Promise<void>'
        || type.startsWith('{')
        || type.startsWith('Promise<{')
}


function main() {
    const args = process.argv.slice(2);
    const basePath = './js/src/';

    let exchangesToCheck: string[] = [];

    if (args.length > 0) {
        exchangesToCheck = args;
    } else {
        exchangesToCheck = exchanges;
    }

    const sourceOfTruth = extractMethodsAndReturnTypes(basePath + 'base/Exchange.d.ts');
    let foundIssues = false;
    let differences = 0;
    let methodsWithDifferences = new Set<string>();
    for (const exchange of exchangesToCheck) {
        if (skipExchanges.includes(exchange)) {
            continue;
        }
        const path = basePath + exchange + '.d.ts';
        const methodsInfo = extractMethodsAndReturnTypes(path);
        for (const method in methodsInfo) {
            if (skipMethods.includes(method)) {
                continue;
            }
            if (skipMethodsPerExchange[exchange] && skipMethodsPerExchange[exchange].includes(method)) {
                continue;
            }
            const returnType = methodsInfo[method];
            if (method in sourceOfTruth) {
                const targetReturnType = sourceOfTruth[method];
                if (isUserFacingMethod(method)) {
                    if (!isUknownReturnType(targetReturnType)) { // ignore any/untyped methods
                        if (sourceOfTruth[method] !== returnType) {
                            foundIssues = true;
                            differences++;
                            methodsWithDifferences.add(method);
                            log.magenta('Difference found', exchange, method, 'found:', returnType, 'expected:' ,targetReturnType);
                        }
                    }
                }
            }
        }
    }
    if (!foundIssues) {
        log.bright.green('No type differences found');
    } else {
        log.bright.red(differences, 'type differences found!');
        log.bright.red('Methods with differences:', methodsWithDifferences)
        process.exit(1);
    }
}

main()