#!/usr/bin/env bash
# Assemble a self-contained C++ source tarball for a subset of exchanges.
# The GENERATED exchange headers are packed in, so consumers need only
# cmake + a C++17 compiler + curl/OpenSSL dev packages -- no node, no npm,
# no transpile step.
#
# Usage: cpp/package.sh [exchangeId ...]   (no ids = every generated exchange)
#
# Output: ccxt-cpp-v<version>-<n>exchanges.tar.gz in the repo root.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo dev)

ids=("$@")
if [ ${#ids[@]} -eq 0 ]; then
    ids=( $(ls cpp/ccxt/exchanges/tu_*.cpp 2>/dev/null | sed 's#.*/tu_##; s#\.cpp$##' | sort) )
    if [ ${#ids[@]} -eq 0 ]; then
        echo "no generated exchanges found -- run:" >&2
        echo "  npm run emitAPI -- --cpp && npm run transpileCpp -- --all --force" >&2
        exit 1
    fi
fi

# pre-flight: every requested id has its generated REST files
missing=0
for id in "${ids[@]}"; do
    for f in "cpp/ccxt/exchanges/tu_$id.cpp" "cpp/ccxt/exchanges/$id.h" "cpp/ccxt/api/$id.h"; do
        if [ ! -f "$f" ]; then echo "missing generated file: $f" >&2; missing=1; fi
    done
done
[ "$missing" = "0" ] || { echo "run: npm run emitAPI -- --cpp && npm run transpileCpp -- --all --force" >&2; exit 1; }

name="ccxt-cpp-v${VERSION}-${#ids[@]}exchanges"
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
mkdir -p "$stage/$name"

# the runtime + the build tree's real CMakeLists (tests/cli are carried so
# the defaults stay valid; consumers flip CCXT_BUILD_TESTS/CLI off)
cp -r cpp/ccxt-base "$stage/$name/"
mkdir -p "$stage/$name/ccxt/base" "$stage/$name/ccxt/exchanges" "$stage/$name/ccxt/api"
cp -r cpp/ccxt/base/. "$stage/$name/ccxt/base/"
cp cpp/ccxt/exchanges/ExchangeFactory.h cpp/ccxt/exchanges/ExchangeFactory.cpp \
   cpp/ccxt/exchanges/BuiltExchanges.h.in "$stage/$name/ccxt/exchanges/"
[ -f cpp/ccxt/exchanges/BuiltExchanges.h ] && cp cpp/ccxt/exchanges/BuiltExchanges.h "$stage/$name/ccxt/exchanges/"
for id in "${ids[@]}"; do
    cp "cpp/ccxt/exchanges/tu_$id.cpp" "cpp/ccxt/exchanges/$id.h" "$stage/$name/ccxt/exchanges/"
    cp "cpp/ccxt/api/$id.h" "$stage/$name/ccxt/api/"
done

# pro/prediction companions for the requested ids (a ws user needs them)
mkdir -p "$stage/$name/ccxt/pro" "$stage/$name/ccxt/prediction"
[ -f cpp/ccxt/pro/ProExchangeFactory.h ] && cp cpp/ccxt/pro/ProExchangeFactory.h cpp/ccxt/pro/ProExchangeFactory.cpp "$stage/$name/ccxt/pro/"
[ -f cpp/ccxt/prediction/PredictionFactory.h ] && cp cpp/ccxt/prediction/PredictionFactory.h cpp/ccxt/prediction/PredictionFactory.cpp "$stage/$name/ccxt/prediction/"
for id in "${ids[@]}"; do
    [ -f "cpp/ccxt/pro/tu_$id.cpp" ] && cp "cpp/ccxt/pro/tu_$id.cpp" "cpp/ccxt/pro/$id.h" "$stage/$name/ccxt/pro/"
    [ -f "cpp/ccxt/prediction/tu_$id.cpp" ] && cp "cpp/ccxt/prediction/tu_$id.cpp" "cpp/ccxt/prediction/$id.h" "$stage/$name/ccxt/prediction/"
done

# tests/cli sources (small; carried so the packaged CMakeLists is the real one)
mkdir -p "$stage/$name/tests" "$stage/$name/cli"
cp cpp/tests/*.cpp cpp/tests/*.h cpp/tests/TestMainClass.Bridge.h "$stage/$name/tests/" 2>/dev/null || true
cp cpp/cli/main.cpp "$stage/$name/cli/"
cp cpp/CMakeLists.txt cpp/ccxtConfig.cmake.in "$stage/$name/"

cat > "$stage/$name/README.md" <<EOF
# ccxt C++ — source package (${#ids[@]} exchanges)

Self-contained: the generated exchange headers are included, so the build
needs only cmake + a C++17 compiler. No node/npm.

Dependencies: libcurl + OpenSSL (dev packages), cmake >= 3.20, ninja (optional).

## Library-only build (the light one)

    cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release \\
        -DCCXT_BUILD_TESTS=OFF -DCCXT_BUILD_CLI=OFF \\
        -DCCXT_BUILD_PRO=OFF -DCCXT_BUILD_PREDICTION=OFF
    cmake --build build --parallel 4
    cmake --install build --prefix /usr/local

To restrict the compiled exchanges further:
    -DCCXT_EXCHANGES=binance
(or any comma-separated subset of the packaged ids). For an even faster
compile at the cost of slower runtime hot paths: -DCCXT_FAST_BUILD=ON.

Then in your own CMake project:
    find_package(ccxt REQUIRED)
    target_link_libraries(app PRIVATE ccxt::ccxt ccxt::ccxt_base)

Included exchanges: $(echo "${ids[@]}" | tr '\n' ' ')
EOF

tar -czf "$name.tar.gz" -C "$stage" "$name"
echo "wrote $name.tar.gz ($(du -h "$name.tar.gz" | cut -f1))"
