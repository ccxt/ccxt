declare const parseTimeframe: (timeframe: string) => number;
declare const roundTimeframe: (timeframe: any, timestamp: any, direction?: number) => number;
declare const extractParams: (string: any) => never[];
declare const implodeParams: (string: any, params: any) => any;
declare function vwap(baseVolume: any, quoteVolume: any): number | undefined;
declare function aggregate(bidasks: any): number[][];
export { aggregate, parseTimeframe, roundTimeframe, implodeParams, extractParams, vwap, };
