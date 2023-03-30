declare class Throttler {
    constructor(config: any);
    loop(): Promise<void>;
    throttle(cost?: any): Promise<unknown>;
}
export { Throttler, };
