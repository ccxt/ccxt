// ---------------------------------------------------------------------------
import htx from './htx.js';
// ---------------------------------------------------------------------------
export default class huobi extends htx {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'huobi',
            'alias': true,
        });
    }
}
