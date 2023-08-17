declare class baseMainTestClass {
    info: boolean;
    verbose: boolean;
    debug: boolean;
    privateTest: boolean;
    privateTestOnly: boolean;
    sandbox: boolean;
    skippedMethods: {};
    checkedPublicTests: {};
    testFiles: {};
    publicTests: {};
}
export default class testMainClass extends baseMainTestClass {
    parseCliArgs(): void;
    init(exchangeId: any, symbol: any): Promise<void>;
    importFiles(exchange: any): Promise<void>;
    expandSettings(exchange: any, symbol: any): void;
    addPadding(message: any, size: any): string;
    testMethod(methodName: any, exchange: any, args: any, isPublic: any): Promise<void>;
    testSafe(methodName: any, exchange: any, args?: any[], isPublic?: boolean): Promise<boolean>;
    runPublicTests(exchange: any, symbol: any): Promise<void>;
    loadExchange(exchange: any): Promise<void>;
    getTestSymbol(exchange: any, isSpot: any, symbols: any): any;
    getExchangeCode(exchange: any, codes?: any): any;
    getMarketsFromExchange(exchange: any, spot?: boolean): {};
    getValidSymbol(exchange: any, spot?: boolean): any;
    testExchange(exchange: any, providedSymbol?: any): Promise<void>;
    runPrivateTests(exchange: any, symbol: any): Promise<void>;
    startTest(exchange: any, symbol: any): Promise<void>;
}
export {};
