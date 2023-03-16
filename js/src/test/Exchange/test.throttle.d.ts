declare const throttle: any;
declare const delta = 10;
declare const testCases: {
    tokens: number;
    refillRate: number;
    cost: number;
    runs: number;
}[];
declare let number: number;
declare function runner(test: any): Promise<void>;
