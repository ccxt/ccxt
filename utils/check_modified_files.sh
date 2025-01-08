

diff=$(git diff origin/master --name-only)
diff=$(echo "$diff" | sed -e "s/^build\.sh//")
diff=$(echo "$diff" | sed -e "s/^skip\-tests\.json//")
diff_without_statics=$(echo "$diff" | sed -e "s/^ts\/src\/test\/static.*json//")

critical_pattern='Client(Trait)?\.php|Exchange\.php|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|composer\.json|ccxt\.ts|__init__.py|test' # add \/test|

echo "Diff:: $diff"

if [[ "$diff_without_statics" =~ $critical_pattern ]]; then
    echo "$msgPrefix Important changes detected - doing full build & test"
else
    echo "$msgPrefix Unimportant changes detected - build & test only specific exchange(s)"
fi

echo "$diff_without_statics"