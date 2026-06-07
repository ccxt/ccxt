template_path='build/templates'
exchanges_path='ts/src'
tests_path='ts/src/test/static'

read -p "

    Enter the exchange name (lower case, no special characters): " exchange_name

new_exchange_file="${exchanges_path}/${exchange_name}.ts"
new_currencies_file="${tests_path}/currencies/${exchange_name}.json"
new_markets_file="${tests_path}/markets/${exchange_name}.json"
new_request_file="${tests_path}/request/${exchange_name}.json"
new_response_file="${tests_path}/response/${exchange_name}.json"

sed_string="s/template_exchange_name/${exchange_name}/g"

cat "${template_path}/exchange/spot.ts" | sed $sed_string > $new_exchange_file
cat "${template_path}/test/currencies.json" > $new_currencies_file
cat "${template_path}/test/markets.json" > $new_markets_file
cat "${template_path}/test/request.json" | sed $sed_string > $new_request_file
cat "${template_path}/test/response.json" | sed $sed_string > $new_response_file

echo "


    Exchange created from template

    Update the following files before submitting

        - ${new_exchange_file}
        - ${new_currencies_file}
        - ${new_markets_file}
        - ${new_request_file}
        - ${new_response_file}

    Within ${new_exchange_file}

        - complete all TODO's
        - replace all instances of api_request_key with the applicable string values for the parameter request
        - replace all instances of api_response_key with the applicable string values to obtain the value from the response object
        - replace implicitMethodName with the actual implicit methods
        - remove all methods that cannot be implemented
            - remember to also remove the methods from ${tests_path}

    After adding all api paths in the describe method, you must do the following before you can test the exchange

        - run \`npm run export-exchanges\`
        - run \`npm run build\`
        - change the first import in ${new_exchange_file} to \`import Exchange from './abstract/${exchange_name}.js';\`
        - run \`npm run build\` again

    

    For guidance, refer to

        - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code
        - https://docs.ccxt.com/
        - matching methods from any of the other exchange files

"