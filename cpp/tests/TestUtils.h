#pragma once

// Shared test utilities (root resolution, file IO). These used to live in
// StaticTests.h alongside the hand-written static harness; the static tests now
// run through the transpiled tests.ts (TestMainClass.Bridge.h), and these are
// the pieces every part of the test tree still needs.

#include "../ccxt/base/Exchange.h"

#include <fstream>
#include <sstream>
#include <string>

namespace ccxt {
namespace testutils {

inline std::string readFile (const std::string& path) {
    std::ifstream stream (path, std::ios::binary);
    if (!stream) {
        throw BaseError ("cannot read file " + path);
    }
    std::ostringstream buffer;
    buffer << stream.rdbuf ();
    return buffer.str ();
}

inline bool fileExists (const std::string& path) {
    std::ifstream stream (path);
    return static_cast<bool> (stream);
}

// The repo root, relative to where the test binary is invoked from. run-tests.js
// and npm both run from the repo root, so "." is right; the fallback lets the
// binary work from the build directory too.
inline std::string rootDir () {
    if (fileExists ("./ts/src/test/tests.ts")) {
        return "./";
    }
    return "../../../";
}

} // namespace testutils
} // namespace ccxt
