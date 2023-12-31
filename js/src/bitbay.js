// ---------------------------------------------------------------------------
import zonda from './zonda.js';
// ---------------------------------------------------------------------------
export default class bitbay extends zonda {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitbay',
            'name': 'BitBay',
            'alias': true,
        });
    }
}
