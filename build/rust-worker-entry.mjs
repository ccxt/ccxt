// piscina loads its worker before tsx is registered in the thread: register it, then load the TS worker
import { register } from 'tsx/esm/api';
register ();
const worker = await import ('./rust-worker.ts');
export default worker.default;
