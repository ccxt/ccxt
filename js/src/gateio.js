// ---------------------------------------------------------------------------
import gate from './gate.js';
// ---------------------------------------------------------------------------
export default class gateio extends gate {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'gateio',
            'alias': true,
        });
    }
}
