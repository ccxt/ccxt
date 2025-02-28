import { Dictionary, Num } from '../types.js';
declare const parseTimeframe: (timeframe: string) => number;
declare const roundTimeframe: (timeframe: string, timestamp: number, direction?: number) => number;
declare const extractParams: (string: string) => string[];
declare const implodeParams: (string: string, params: Dictionary<any> | any[]) => string;
declare function vwap(baseVolume: number, quoteVolume: number): Num;
declare function aggregate(bidasks: any): number[][];
declare function selfIsDefined(): boolean;
export { aggregate, parseTimeframe, roundTimeframe, implodeParams, extractParams, vwap, selfIsDefined };
