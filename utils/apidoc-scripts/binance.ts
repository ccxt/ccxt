

class RLParser  {

    type = 'spot';
    url = 'https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md';
    baseUrl = 'https://api.binance.com';

    async fetchData () {
        if (!this.url) {
            throw new Error ('URL not set');
        }
        const response = await fetch (this.url);
        const data = await response.text ();
        return data;
    }

    async init () {
        const data = await this.fetchData ();
        const regex2 = /\n(GET|POST|PUT|DELETE)\s+(.+)((.|\n)*?)Weight(.*?)\s+(\d+)/g;
        const matches = data.matchAll(regex2);
        const matchesArray = [...matches];
        const apiTree = {};
        for (const match of matchesArray) {
            if (match.length != 7) {
                console.log('match length is not 7', match);
                continue;
            }
            const method = match[1];
            const endpoint = match[2]; // sometimes needed
            // eg: path = '/sapi/v2/account/balance'
            const parts = endpoint.split ('/');
            const kind = parts[1]; // eg: 'sapi'
            if (!(kind in apiTree)) {
                apiTree[kind] = {};
            }
            const rl = parseInt (match[6]);
            if (!(method in apiTree[kind])) {
                apiTree[kind][method] = {};
            }
            const path = endpoint.substring(1 + kind.length + 1);
            apiTree[kind][method][path] = rl;
        }
        return apiTree;
    }

}


const tree = await (new RLParser ()).init ();
// comment below
console.log(JSON.stringify(tree, null, 2));