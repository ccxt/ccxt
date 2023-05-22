
Function build_and_test_all {
  npm run force-build
  Exit
}

### CHECK IF THIS IS A PR ###
if ($Env:APPVEYOR_REPO_BRANCH -eq "master") {
  echo "This is merger in master, will build everything"
  build_and_test_all
}

##### DETECT CHANGES #####
# temporarily remove the below scripts from diff
# in appveyor, there is no origin/master locally, so we need to fetch it
git remote set-branches origin 'master'
git fetch --depth=1
$diff=$(git diff origin/master --name-only)

# for some reason using "sed" commands (in appveyor) turns variable into empty string, so manually replacing them
$replace_with=""
$skipFiles = 'build.sh','.travis.yml','appveyor.yml','package.json','package-lock.json','python/qa.py','python/tox.ini','build/export-exchanges.js'
foreach ($skipFile in $skipFiles)
{
  $diff=$diff.replace($skipFile, '')
}

$critical_pattern='^Client(Trait)?\.php|Exchange\.php|\/test|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|composer\.json|ccxt\.ts|__init__.py'
if ($diff -match $critical_pattern) {
  echo "- Detected changes require full build & test"
  build_and_test_all
}

echo "- Detected changes require only specific exchange(s) build & test"
$diffFilesArray=$diff.Split("`n")
$rest_pattern='ts\/src\/([A-Za-z0-9_-]+).ts' # \w not working for some reason
$ws_pattern='ts\/src\/pro\/([A-Za-z0-9_-]+)\.ts'

$REST_EXCHANGES=@()
$WS_EXCHANGES=@()
foreach ($file in $diffFilesArray)
{
  if ($file -match $rest_pattern) {
    $modified_exchange=$matches[1]
    $REST_EXCHANGES+=$modified_exchange
  }
  ElseIf ($file -match $ws_pattern) {
    $modified_exchange=$matches[1]
    $WS_EXCHANGES+=$modified_exchange
  }
}

### BUILD SPECIFIC EXCHANGES ###
# faster version of pre-transpile (without bundle and atomic linting)
#npm run export-exchanges; npm run tsBuild; npm run emitAPI;

$PYTHON_FILES=@()
echo "REST_EXCHANGES TO BE TRANSPILED: $REST_EXCHANGES"
foreach ($exchange in $REST_EXCHANGES){
  npm run eslint "ts/src/$exchange.ts"
  node build/transpile.js $exchange --force --child
  $PYTHON_FILES+=("$exchange.py")
  $PYTHON_FILES+=("async_support/$exchange.py")
}
echo "WS_EXCHANGES TO BE TRANSPILED: $WS_EXCHANGES"
foreach ($exchange in $WS_EXCHANGES){
  npm run eslint "ts/src/pro/$exchange.ts"
  node build/transpileWS.js $exchange --force --child
  $PYTHON_FILES+=("pro/$exchange.py")
}
npm run check-php-syntax
cd python; tox -e qa -- $PYTHON_FILES; cd ..;