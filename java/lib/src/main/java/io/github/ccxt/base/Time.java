package io.github.ccxt.base;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;

public final class Time {

    private Time() {}

    // -------- now --------


    public static Long seconds() {
        return System.currentTimeMillis() / 1000;
    }

    public static Long nonce() {
        return System.currentTimeMillis();
    }

    public static long milliseconds() {
        return System.currentTimeMillis();
    }

    public static long microseconds() {
        // epoch micros = seconds * 1_000_000 + nanos/1000
        Instant now = Instant.now();
        return now.getEpochSecond() * 1_000_000L + (now.getNano() / 1_000);
    }

    // -------- parsing helpers --------

    private static Long parseToMillis(String s) {
        if (s == null || s.isEmpty()) return null;

        // C# code special-case: if it contains "+0" (e.g., "+0000"), drop offset part
        if (s.contains("+0")) {
            int plus = s.indexOf('+');
            if (plus > 0) s = s.substring(0, plus);
        }

        // Try a few reasonable ISO-ish formats
        try { return Instant.parse(s).toEpochMilli(); } catch (Exception ignored) {}

        try { return OffsetDateTime.parse(s).toInstant().toEpochMilli(); } catch (Exception ignored) {}

        try { return ZonedDateTime.parse(s).toInstant().toEpochMilli(); } catch (Exception ignored) {}

        try { return LocalDateTime.parse(s).toInstant(ZoneOffset.UTC).toEpochMilli(); } catch (Exception ignored) {}

        return null;
    }

    // -------- parseDate / parse8601 --------

    // public static Object parseDate(Object datetime2) {
    //     if (!(datetime2 instanceof String)) return null;
    //     Long ms = parseToMillis((String) datetime2);
    //     return ms;
    // }

        private static final DateTimeFormatter SPACE_FORMAT =
            DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss")
                    .withResolverStyle(ResolverStyle.STRICT);

    // Returns Long (epoch millis) or null
    public static Object parseDate(Object datetime2) {
        if (!(datetime2 instanceof String)) {
            return null;
        }

        String datetime = ((String) datetime2).trim();
        if (datetime.isEmpty()) {
            return null;
        }

        try {
            // ISO 8601 like: 1986-04-26T01:23:47.000Z
            if (datetime.indexOf('T') >= 0) {
                return Instant.parse(datetime).toEpochMilli();
            }

            // Space format like: 1986-04-26 00:00:00 (treated as UTC)
            LocalDateTime ldt = LocalDateTime.parse(datetime, SPACE_FORMAT);
            return ldt.toInstant(ZoneOffset.UTC).toEpochMilli();

        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    // public static Long parse8601(Object datetime2) {
    //     if (!(datetime2 instanceof String)) return null;
    //     return parseToMillis((String) datetime2);
    // }

    public static Long parse8601(Object datetime2) {
        if (!(datetime2 instanceof String)) {
            return null;
        }

        String datetime = ((String) datetime2).trim();
        if (datetime.isEmpty()) {
            return null;
        }

        try {
            // Handle: "2023-05-08T17:04:43+0000" (strip "+0000" part like C# code)
            if (datetime.contains("+0")) {
                int plus = datetime.indexOf('+');
                if (plus >= 0) {
                    datetime = datetime.substring(0, plus);
                }
            }

            // ISO 8601 with Z, e.g. "1986-04-26T01:23:47.000Z"
            if (datetime.indexOf('T') >= 0) {
                return Instant.parse(datetime).toEpochMilli();
            }

            // Space format, e.g. "2019-08-12 13:20:00" (treat as UTC)
            LocalDateTime ldt = LocalDateTime.parse(datetime, SPACE_FORMAT);
            return ldt.toInstant(ZoneOffset.UTC).toEpochMilli();

        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    // -------- iso8601 formatting --------

    private static final DateTimeFormatter ISO_MILLIS_Z =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    public static String Iso8601(Object ts) {
        if (ts == null) return null;
        final long ms;
        try {
            ms = Long.parseLong(String.valueOf(ts));
        } catch (NumberFormatException e) {
            return null;
        }
        if (ms < 0) return null;
        return ISO_MILLIS_Z.format(Instant.ofEpochMilli(ms));
    }

    public static String iso8601(Object ts) {
        return Iso8601(ts);
    }

    // -------- ymd/hms utilities --------

    public static String ymdhms(Object ts, Object infix) {
//        String sep = (infix == null) ? " " : String.valueOf(infix);
        String sep = (infix == null) ? " " : "'" + infix + "'";
        if (ts == null) return null;
        long ms = Long.parseLong(String.valueOf(ts));
        Instant inst = Instant.ofEpochMilli(ms);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd" + sep + "HH:mm:ss")
                                                 .withZone(ZoneOffset.UTC);
        return fmt.format(inst);
    }

    public static String ymdhms(Object ts) {
        return ymdhms(ts, " ");
    }

    public static String yyyymmdd(Object ts, Object infix) {
        String sep = (infix == null) ? "-" : String.valueOf(infix);
        if (ts == null) return null;
        long ms = Long.parseLong(String.valueOf(ts));
        Instant inst = Instant.ofEpochMilli(ms);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy" + sep + "MM" + sep + "dd")
                                                 .withZone(ZoneOffset.UTC);
        return fmt.format(inst);
    }

    public static String yyyymmdd(Object ts) {
        return yyyymmdd(ts, "-");
    }

    public static String yymmdd(Object ts, Object infix) {
        String sep = (infix == null) ? "-" : String.valueOf(infix);
        if (ts == null) return null;
        try {
            long ms = Long.parseLong(String.valueOf(ts));
            Instant inst = Instant.ofEpochMilli(ms);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yy" + sep + "MM" + sep + "dd")
                                                     .withZone(ZoneOffset.UTC);
            return fmt.format(inst);
        } catch (Exception ignored) {
            // match the C# version which swallows and returns empty string on failure
            return "";
        }
    }

    public static String yymmdd(Object ts) {
        return yymmdd(ts, "-");
    }

    public static Object ymd(Object ts, Object infix) {
        String sep = (infix == null) ? "-" : String.valueOf(infix);
        if (ts == null) return null;
        long ms = Long.parseLong(String.valueOf(ts));
        Instant inst = Instant.ofEpochMilli(ms);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy" + sep + "MM" + sep + "dd")
                                                 .withZone(ZoneOffset.UTC);
        return fmt.format(inst);
    }

    public static Object ymd(Object ts) {
        return ymd(ts, "-");
    }
}