import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange'

interface Exchange {
  v3PublicGetRestV3Currencies (params?: {}): Promise<implicitReturnType>;
}
abstract class Exchange extends _Exchange {}

export default Exchange