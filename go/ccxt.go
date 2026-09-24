// Package ccxt makes `go build` and `go build ./...` work from the go/ directory.
//
// The Go toolchain never lets a `./...` pattern cross module boundaries
// (nested go.mod directories are pruned from the walk — see
// cmd/go/internal/search.MatchDirs), so from go/ the pattern would match
// nothing: the actual library lives in the nested modules go/v4 (and its
// pro subpackage). This stub package blank-imports them, so building it
// compiles the whole CCXT Go library as its dependencies.
//
// The imports resolve to the local ./v4 module through go.work (workspace
// mode), so no require directives are needed in go/go.mod.
package ccxt

import (
	_ "github.com/ccxt/ccxt/go/v4"
	_ "github.com/ccxt/ccxt/go/v4/pro"
)
