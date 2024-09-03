

import jsYaml from 'js-yaml';
// https://github.com/binance/binance-api-swagger

class RLParser {
    url = 'https://raw.githubusercontent.com/binance/binance-api-swagger/master/spot_api.yaml';

    async fetchData () {
        const response = await fetch (this.url);
        const data = await response.text ();
        return data;
    }

    parseToJSON (data: string) {
        return jsYaml.load (data);
    }

    async init () {
        const data = await this.fetchData ();
        const json = this.parseToJSON (data);
        const result = this.generator (json);
        return result;
    }

    generator (json) {
        const paths = json.paths;
        //
        // {
        //     '/api/v3/account': ..
        //     '/sapi/v1/accountSnapshot': ..
        //     '/sapi/v2/accountSnapshot': 
        //     ...
        // }
        //
        const apiTree = {};
        for (const [path, obj] of Object.entries (paths)) {
            // eg: path = '/sapi/v2/account/balance'
            const parts = path.split ('/');
            const kind = parts[1]; // 'sapi'
            if (!(kind in apiTree)) {
                apiTree[kind] = {};
            }
            const endpoint = parts.slice(2).join ('/'); // 'v2/account/balance'
            //
            const requestMethods = Object.entries (obj as any);
            for (const [method, value] of requestMethods) {
                // method can be `get`, `post, etc
                const methodUppercase = method.toUpperCase ();
                if (!(methodUppercase in apiTree[kind])) {
                    apiTree[kind][methodUppercase] = {};
                }
                const description = (value as any).description;
                apiTree[kind][methodUppercase][endpoint] = this.getWeightFromText (description);
            }
        }
        return apiTree;
    }

    getWeightFromText (text: string) {
        // such text: 'whatever xyz xyz\nWeight(IP): 1'
        const regex = /Weight\(IP\): (\d+)/;
        const match = text.match (regex);
        if (match) {
            return parseInt (match[1]);
        }
        return undefined;
    }
}


const tree = await (new RLParser ()).init ();
// comment below
console.log(JSON.stringify(tree, null, 2));