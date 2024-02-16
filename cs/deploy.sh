version=$(cat package.json | jq -r '.version')

bin_folder="./cs/ccxt/bin/Release/"

bin_file="ccxt.${version}.nupkg"

bin_path="${bin_folder}${bin_file}"

echo "Will publish nuget package: ${bin_path}"

dotnet nuget push ${bin_path} -k ${NUGGET_TOKEN} -s https://api.nuget.org/v3/index.json