version=$(cat package.json | jq -r '.version')

bin_folder="./c#/ccxt/bin/Release/"

bin_file="ccxt.${version}.nupkg"

bin_path="${bin_folder}${bin_file}"

echo "Will publish nugget package: ${bin_path}"

dotnet nuget push ${bin_path} -k ${NUGET_TOKEN} -s https://api.nuget.org/v3/index.json