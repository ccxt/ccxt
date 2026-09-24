// piscina require()s its worker first, which loads ast-transpiler's CJS build (slow getter
// interop on every typescript enum read); the top-level await makes that require fail, so
// piscina import()s this file and the worker runs on the ESM builds
import { register } from 'tsx/esm/api';
register ();
const worker = await import ('./csharp-worker.ts');
export default worker.default;
