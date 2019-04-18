# Tools

## `test.sh`

This tool uses [goconvey](https://github.com/smartystreets/goconvey) to spin up a server on `http://localhost:8080` will run all go tests and check for changes every 250ms.

## apiparser

This tool leverages the `text/template` package from go to help build the exchange packages via a JSON file.

```text
$ buildGo.sh
Takes the exchange JSON config in the templates/internal/app/exchanges/ folders and uses
*.txt to build the api.go and exchange.go files
```

```text
$ buildGoTest.sh
Same as above but creates the _test.go files from the *_test.txt
```

```text
$ buildTS.sh
Same as above but generates typescript files
```
