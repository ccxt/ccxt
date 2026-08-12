// Run the real Julia transpiler over `ts/src`, dispatching on the same flags
// the rest of the build surface uses. The historical stub constructed a
// `JuliaTranspiler` (a no-op that only logged "finished") and never emitted a
// single file; this thin wrapper delegates to the working
// `build/juliaTranspileCLI.ts` `main`, forwarding every CLI argument so the
// documented entry point actually drives the generator.
import { main } from './juliaTranspileCLI.js';

main().catch(console.error);
