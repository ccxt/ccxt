#!/bin/sh
# usage: count.sh <ref>  -> symbol any/string body counts, IsEqual/Add on symbol (generated go/v4 excl hand-written)
R=$1; P="go/v4/*.go go/v4/pro/*.go go/v4/prediction/*.go"
G="git grep -h -E"
X=":!go/v4/exchange_helpers.go :!go/v4/exchange.go :!go/v4/exchange_functions.go :!go/v4/exchange_safe.go :!go/v4/exchange_interface.go"
echo "body_symbol_any $($G 'Body\(ch chan any, symbol any' $R -- go/v4 $X | wc -l)"
echo "body_symbol_string $($G 'Body\(ch chan any, symbol string' $R -- go/v4 $X | wc -l)"
echo "func_symbol_any $($G '^func .*[(,] ?symbol any' $R -- go/v4 $X | wc -l)"
echo "func_symbol_string $($G '^func .*[(,] ?symbol string' $R -- go/v4 $X | wc -l)"
echo "IsEqual_symbol $($G -o 'IsEqual\(symbol,' $R -- go/v4 $X | wc -l)"
echo "Add_symbol $($G -o 'Add\([^()]*\bsymbol\b' $R -- go/v4 $X | wc -l)"
echo "StringArg $($G -o 'StringArg\(' $R -- go/v4 $X | wc -l)"
echo "IsEqual_all $($G -o '\bIsEqual\(' $R -- go/v4 $X | wc -l)"
echo "Add_all $($G -o '\bAdd\(' $R -- go/v4 $X | wc -l)"
