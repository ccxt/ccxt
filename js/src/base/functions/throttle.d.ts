declare class Throttler {
    constructor(config: any);
    loop(): Promise<void>;
    throttle(cost?: undefined): Promise<unknown>;
}
export { Throttler, };
