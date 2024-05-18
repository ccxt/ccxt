// ---------------------------------------------------------------------------
import onetrading from './onetrading.js';
// ---------------------------------------------------------------------------
export default class bitpanda extends onetrading {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitpanda',
            'alias': true,
        });
    }
}
