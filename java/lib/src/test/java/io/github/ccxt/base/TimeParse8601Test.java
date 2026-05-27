package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/**
 * parse8601 must handle the formats real exchanges actually return.
 * Aftermath returns datetime strings like "2025-12-29 22:43:54.639 UTC"
 * (space-separated date, fractional seconds, trailing " UTC"). JS's
 * Date.parse and Python's dateutil accept these; Java's strict
 * java.time parsers do not, so parse8601 has to normalize first.
 *
 * Without this, the live test harness's AssertTimestampAndDatetime
 * gets a null from parse8601, then Double.parseDouble(null) deep
 * inside the assertion crashes with the misleading
 * `Cannot invoke "String.trim()" because "in" is null`.
 */
class TimeParse8601Test {

    @Test
    void aftermathStyleSpaceWithUtcSuffix() {
        Long ts = Time.parse8601("2025-12-29 22:43:54.639 UTC");
        assertNotNull(ts, "space-separated datetime with ' UTC' suffix should parse");
        assertEquals(1767048234639L, ts);
    }

    @Test
    void utcSuffixCaseInsensitive() {
        assertEquals(1767048234000L, Time.parse8601("2025-12-29 22:43:54 utc"));
        assertEquals(1767048234000L, Time.parse8601("2025-12-29T22:43:54 UTC"));
    }

    @Test
    void plainIsoStillWorks() {
        assertEquals(1767048234639L, Time.parse8601("2025-12-29T22:43:54.639Z"));
    }

    @Test
    void plainSpaceStillWorks() {
        assertEquals(1767048234000L, Time.parse8601("2025-12-29 22:43:54"));
    }

    @Test
    void nullAndEmptyAndJunkReturnNull() {
        assertNull(Time.parse8601(null));
        assertNull(Time.parse8601(""));
        assertNull(Time.parse8601("   "));
        assertNull(Time.parse8601("not a date"));
    }
}
