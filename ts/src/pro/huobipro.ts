
//  ---------------------------------------------------------------------------

import huobi from './huobi.js';

// ---------------------------------------------------------------------------

export default class huobipro extends huobi {
    /**
     * @class
     * @name huobipro
     * @description websocket exchange class for huobipro api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'alias': true,
            'id': 'huobipro',
        });
    }
}
