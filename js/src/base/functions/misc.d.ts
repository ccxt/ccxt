declare const parseTimeframe: (timeframe: any) => number;
declare const roundTimeframe: (timeframe: any, timestamp: any, direction?: number) => number;
declare const buildOHLCVC: (trades: any, timeframe?: string, since?: number, limit?: number) => any[];
declare const extractParams: (string: any) => any[];
declare const implodeParams: (string: any, params: any) => any;
declare function vwap(baseVolume: any, quoteVolume: any): number;
declare function aggregate(bidasks: any): number[][];
export { aggregate, parseTimeframe, roundTimeframe, buildOHLCVC, implodeParams, extractParams, vwap, };
