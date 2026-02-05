/**
 *
 * @param obj
 * @param indent
 */
declare function jsonStringify(obj: any, indent?: any): string;
/**
 *
 * @param fn
 */
declare function countAllParams(fn: any): any;
/**
 *
 * @param fn
 * @param args
 */
declare function injectMissingUndefined(fn: any, args: any): any;
/**
 *
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
declare function createRequestTemplate(cliOptions: any, exchange: any, methodName: any, args: any, result: any): void;
/**
 *
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
declare function createResponseTemplate(cliOptions: any, exchange: any, methodName: any, args: any, result: any): void;
/**
 *
 * @param commandToShow
 */
declare function printUsage(commandToShow: any): void;
/**
 *
 * @param cliOptions
 */
declare function printSavedCommand(cliOptions: any): void;
declare const printHumanReadable: (exchange: any, result: any, cliOptions: any, useTable?: boolean) => any;
/**
 *
 * @param exchange
 * @param forceCache
 */
declare function handleMarketsLoading(exchange: any, forceRefresh?: boolean): Promise<void>;
/**
 *
 * @param exchange
 */
declare function setNoSend(exchange: any): any;
/**
 *
 * @param exchange
 * @param params
 * @param methodName
 * @param cliOptions
 */
declare function parseMethodArgs(exchange: any, params: any, methodName: any, cliOptions: any, inject?: boolean): any[];
/**
 *
 * @param exchangeId
 * @param cliOptions
 */
declare function loadSettingsAndCreateExchange(exchangeId: any, cliOptions: any, printUsageOnly?: boolean): Promise<any>;
/**
 *
 * @param cliOptions
 */
declare function handleDebug(cliOptions: any): void;
/**
 *
 * @param cliOptions
 * @param exchange
 * @param methodName
 * @param args
 * @param result
 */
declare function handleStaticTests(cliOptions: any, exchange: any, methodName: any, args: any, result: any): void;
/**
 *
 * @param value
 * @param previous
 */
declare function collectKeyValue(value: string, previous: Record<string, string>): {
    [x: string]: any;
};
/**
 *
 * @param prompt
 */
declare function askForArgv(prompt: string): Promise<string[]>;
declare function printExchangeMethods(exchangeId: string): void;
declare function printMethodUsage(methodName: string): void;
declare function parseValue(value: string): any;
export { createRequestTemplate, createResponseTemplate, countAllParams, jsonStringify, printSavedCommand, printHumanReadable, handleMarketsLoading, setNoSend, parseMethodArgs, printUsage, loadSettingsAndCreateExchange, collectKeyValue, injectMissingUndefined, handleDebug, handleStaticTests, askForArgv, printMethodUsage, parseValue, printExchangeMethods, };
