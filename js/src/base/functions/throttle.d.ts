declare class Throttler {
    static QUEUE_COMPACTION_THRESHOLD: number;
    running: boolean;
    queue: {
        resolver: any;
        cost: number;
    }[];
    queueHead: number;
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
    totalCost: number;
    constructor(config: any);
    dequeue(): void;
    leakyBucketLoop(): Promise<void>;
    rollingWindowLoop(): Promise<void>;
    loop(): Promise<void>;
    throttle(cost?: Num): Promise<unknown>;
}
export { Throttler, };
