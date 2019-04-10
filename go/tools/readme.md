# Tools

## apiparser

This tool leverages the `text/template` package from go to help build the exchange packages via a JSON file.

```
$ buildApis.sh
Takes the exchange JSON config in the go/internal/app/exchanges/ folders and uses
tmpl_*.txt to build the api.go and exchange.go files
```

```
$ buildApisTests.sh
Same as above but creates the _test.go files from the tmpl_*_test.txt
```

```
$ buildExchanges.sh
Same as running both scripts above
```
