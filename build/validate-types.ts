
import ts from 'typescript';
import fs from 'fs'
import log from 'ololog'

const skipMethods = [
    // 'fetchMarkets',
    'fetchMarketsWs',
    'createDepositAddress', // will be updated later
    // skip because of c# already typed methods
    "fetchDepositWithdrawFees",
    "fetchDepositWithdrawFee",
    "fetchDepositId",
    "fetchDepositIds",
    'watchTickers', // will be updated later
]

const skipExchanges = [
    'someExchange'
    // place exchanges here
]

const skipMethodsPerExchange = {
    'bitfinex1': [
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

const allExchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchanges = allExchanges.ids;
const wsExchanges = allExchanges.ws;

// Function to extract method names and return types from a .d.ts file
function extractMethodsInfo(filePath: string, program: ts.Program): Record<string, string> {
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filePath);

  const methods: Record<string, any> = {};

  function visit(node: ts.Node) {
    if (ts.isMethodSignature(node) || ts.isMethodDeclaration(node)) {
      const methodName = node.name.getText(sourceFile);
      const returnType = checker.typeToString(checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)!));

      methods[methodName] = {};
      methods[methodName]['return'] = returnType;
      methods[methodName]['parameters'] = {}

      node.parameters.forEach((param) => {
        const paramName = param.name.getText(sourceFile);
        let paramType: string;
        const param2 = param as any;
        var customType = param2?.type?.typeName?.escapedText;
        if (customType && customType.startsWith('Int'))  { // right now handle only the difference between Int and Number, and let
            // the rest be handled by the default typeToString, like Str vs string, Strings vs string[], etc
            paramType = param2?.type?.typeName?.escapedText;
        } else {
            const typeNode = checker.getTypeAtLocation(param);
            paramType = checker.typeToString(typeNode);
        }

        methods[methodName]['parameters'][paramName] = paramType;
      });
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
        || method.startsWith('deposit')
        || method.startsWith('watch')
        || method.startsWith('setM')
        || method.startsWith('setP')
        || method.startsWith('setL');
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

    let restPaths = new Array<string>();
    let wsPaths = new Array<string>();
    for (const exchange of exchangesToCheck) {
        restPaths.push(basePath + exchange + '.d.ts')
        if (wsExchanges.includes(exchange)) { 
            wsPaths.push(basePath + 'pro/' + exchange + '.d.ts')
        }
    }
    const program = ts.createProgram([...restPaths, ...wsPaths,basePath + 'base/Exchange.d.ts'], {});
    
    const sourceOfTruth = extractMethodsInfo(basePath + 'base/Exchange.d.ts', program);
    let foundIssues = false;
    let foundParametersIssues = false;
    let paramsDifferences = 0;
    let differences = 0;
    let methodsWithDifferences = new Set<string>();
    let methodsWithParamsDifferences = new Set<string>();

    for (const exchange of exchangesToCheck) {

        if (skipExchanges.includes(exchange)) {
            continue;
        }
        const restPath = basePath + exchange + '.d.ts';
        const wsPath = basePath + 'pro/' + exchange + '.d.ts';
        const restMethodsInfo = extractMethodsInfo(restPath, program); // rest API
        let wsMethodsInfo: any = {};
        if (wsExchanges.includes(exchange)) {
            wsMethodsInfo = extractMethodsInfo(wsPath, program); // ws API
        }
        const methodsInfo = {...restMethodsInfo, ...wsMethodsInfo};
        for (const method in methodsInfo) {
            if (skipMethods.includes(method)) {
                continue;
            }
            if (skipMethodsPerExchange[exchange] && skipMethodsPerExchange[exchange].includes(method)) {
                continue;
            }
            // check return types
            const returnType = methodsInfo[method]['return'];
            const parametersType = methodsInfo[method]['parameters'];
            if (method in sourceOfTruth) {
                const targetReturnType = sourceOfTruth[method]['return'];
                if (isUserFacingMethod(method)) {
                    if (!isUknownReturnType(targetReturnType)) { // ignore any/untyped methods
                        if (sourceOfTruth[method]['return'] !== returnType) {
                            foundIssues = true;
                            differences++;
                            methodsWithDifferences.add(method);
                            log.magenta('Difference found', exchange, method, 'found:', returnType, 'expected:' ,targetReturnType);
                        }
                    }

                    for (const param in parametersType) {
                        const targetParamType = sourceOfTruth[method]['parameters'][param];
                        if (targetParamType && targetParamType !== parametersType[param]) {
                            foundParametersIssues = true;
                            paramsDifferences++;
                            methodsWithParamsDifferences.add(method);
                            log.magenta( '[' + exchange + '][Parameter] Difference', method, 'param:', param, 'found:', parametersType[param], 'expected:' ,targetParamType);
                        }
                    }
                }
            }
        }
    }
    if (!foundIssues) {
        log.bright.green('No return type differences found');
    } else {
        log.bright.red(differences, 'type differences found!');
        log.bright.red('Methods with differences:', methodsWithDifferences)
        // process.exit(1);
    }

    if (!foundParametersIssues) {
        log.bright.green('No parameter type differences found');
    } else {
        log.bright.red(paramsDifferences, 'parameter differences found!');
        log.bright.red('Methods with differences:', methodsWithParamsDifferences)
    }

    if (foundIssues || foundParametersIssues) {
        process.exit(1);
    }
}

main()