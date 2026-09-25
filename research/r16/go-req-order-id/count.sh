#!/bin/sh
# usage: count.sh <ref> -> id/code/amount any bodies, StringArg, IsEqual on id/code (generated go/v4)
R=$1; G="git grep -h -E"
X=":!go/v4/exchange_helpers.go :!go/v4/exchange.go :!go/v4/exchange_functions.go :!go/v4/exchange_safe.go :!go/v4/exchange_interface.go"
for p in id code amount; do for t in any string float64; do echo "body_${p}_$t $($G "Body\(ch chan any, ([a-zA-Z]+ [a-z0-9]+, )*$p $t\b" $R -- go/v4 $X | wc -l)"; done; echo "func_${p}_any $($G "^func .*[(,] ?$p any\b" $R -- go/v4 $X | wc -l)"; done
echo "StringArg $($G -o 'StringArg\(' $R -- go/v4 $X | wc -l)"
echo "IsEqual_id_code $($G -o 'IsEqual\((id|code),' $R -- go/v4 $X | wc -l)"
