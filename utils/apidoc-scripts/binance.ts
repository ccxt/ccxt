
import jsYaml from 'js-yaml';
// https://github.com/binance/binance-api-swagger

async function main() {
    const  url = 'https://raw.githubusercontent.com/binance/binance-api-swagger/master/spot_api.yaml';
    const response = await fetch(url);
    const data = await response.text();
    const json = jsYaml.load(data);
    const paths = json.paths;
    console.log(JSON.stringify(json, null, 2));
    debugger;
}

main()