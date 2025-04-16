echo "running py setup"
echo "TOKEN ${PYPI_TOKEN:0:10}"
echo "TOKEN ${GITHUB_TOKEN:0:10}"

git remote add origin https://${GITHUB_TOKEN}@github.com/ccxt/ccxt.git
touch test123
git add .
echo "pushing changes to remote" # debug
git push origin HEAD:master