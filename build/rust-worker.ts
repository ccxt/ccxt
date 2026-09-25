import { workerData } from 'worker_threads';
import { RustTranspilerBuilder, RUST_WORKER_CACHES } from './rustTranspiler.js';

// task payload posted by rustTranspiler.ts#transpileDerivedExchangeFiles (structured clone)
interface RustWorkerTask {
    exchangeName: string;
    result: { content: string, methodsTypes?: any[] };
    ws: boolean;
    isPrediction: boolean;
    // [parentCore, per-hop method names] as the main thread saw them in list order
    parentHops?: [string, string[][]];
}

let builder: RustTranspilerBuilder | undefined;

export default ({ exchangeName, result, ws, isPrediction, parentHops }: RustWorkerTask): string => {
    if (builder === undefined) {
        builder = new RustTranspilerBuilder();
        for (const k of RUST_WORKER_CACHES) {
            (builder as any)[k] = workerData.caches[k];
        }
    }
    if (parentHops) {
        builder._parentHopsCache.set(parentHops[0], parentHops[1].map(h => new Set(h)));
    }
    return builder.postProcessExchange(exchangeName, result, ws, isPrediction);
};
