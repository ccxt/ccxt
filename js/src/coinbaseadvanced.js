// ---------------------------------------------------------------------------
import coinbase from './coinbase.js';
// ---------------------------------------------------------------------------
export default class coinbaseadvanced extends coinbase {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinbaseadvanced',
            'name': 'Coinbase Advanced',
            'alias': true,
        });
    }
}
