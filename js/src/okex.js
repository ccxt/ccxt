// ---------------------------------------------------------------------------
import okx from './okx.js';
// ---------------------------------------------------------------------------
export default class okex extends okx {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okex',
            'alias': true,
        });
    }
}
