#pragma once

// decimalToPrecision and the number formatting it rests on.
//
// A direct port of ts/src/base/functions/number.ts. The algorithm is transcribed rather
// than reimplemented on top of printf: ccxt rounds money, and the digit-buffer approach
// there produces exact carries (999 -> 1000) and exact truncation without a second
// floating-point conversion. Anything built on snprintf("%.*f") would round half-to-even
// and disagree on exactly the boundary cases the test suite pins.
//
// The mode constants (TRUNCATE / ROUND / DECIMAL_PLACES / SIGNIFICANT_DIGITS /
// TICK_SIZE / NO_PADDING / PAD_WITH_ZERO) live in helpers.h, where the transpiled code
// picks them up unqualified.

#include "Value.h"

#include <any>
#include <string>

namespace ccxt {

// JS Number#toString: the shortest representation that round-trips, with any
// scientific notation expanded so an amount never reaches an exchange as "7.8e-7".
std::string numberToText (const std::any& value);

// TS truncate_to_string: cut to `precision` decimals without rounding.
std::string truncateToString (const std::any& value, int precision);

int precisionFromText (const std::string& value);

std::string decimalToPrecisionText (const std::any& x, int roundingMode,
                                    const std::any& numPrecisionDigits,
                                    int countingMode, int paddingMode);

} // namespace ccxt
