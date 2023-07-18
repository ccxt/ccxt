//  ---------------------------------------------------------------------------
import huobi from './huobi.js';
// ---------------------------------------------------------------------------
export default class huobipro extends huobi {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'huobipro',
        });
    }
}
