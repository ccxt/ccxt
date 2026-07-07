declare class Throttler {
    running: boolean;
    queue: {
        resolver: any;
        cost: number;
    }[];
    config: {
        refillRate: number;
        delay: number;
        capacity: number;
        tokens: number;
        cost: number;
        algorithm: string;
        rateLimit: number;
        windowSize: number;
        maxWeight: number;
    };
    timestamps: {
        timestamp: number;
        cost: number;
    }[];
    constructor(config: any);
    leakyBucketLoop(): Promise<void>;
    rollingWindowLoop(): Promise<void>;
    loop(): Promise<void>;
    throttle(cost?: any): Promise<unknown>;
}
export { Throttler, };
