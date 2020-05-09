# Tools

## `test.sh`

This tool uses [goconvey](https://github.com/smartystreets/goconvey) to spin up a server on `http://localhost:8080` will run all go tests and check for changes every 250ms.

## apiparser

This tool leverages the `text/template` package from go to help build the exchange packages via a JSON file.

```text
$ buildApis.sh
Takes the exchange JSON config in the go/internal/app/exchanges/ folders and uses
tmpl_*.txt to build the api.go and exchange.go files
```

```text
$ buildApisTests.sh
Same as above but creates the _test.go files from the tmpl_*_test.txt
```

```text
$ buildExchanges.sh
Same as running both scripts above
```
