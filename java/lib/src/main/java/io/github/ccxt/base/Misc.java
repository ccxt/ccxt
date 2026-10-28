package io.github.ccxt.base;

import io.github.ccxt.Exchange;

import java.util.List;
import java.util.Map;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

public class Misc {

    public static int ROUND = Exchange.ROUND;
    public static int ROUND_UP = Exchange.ROUND_UP;
    public static int ROUND_DOWN = Exchange.ROUND_DOWN;

    public static int parseTimeframe(Object timeframe2) {
        if (!(timeframe2 instanceof String)) {
            throw new IllegalArgumentException("Invalid timeframe: " + timeframe2);
        }

        String timeframe = ((String) timeframe2).trim();
        if (timeframe.length() < 2) {
            throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        int amount;
        try {
            amount = Integer.parseInt(timeframe.substring(0, timeframe.length() - 1));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        String unit = timeframe.substring(timeframe.length() - 1);
        int scale;

        switch (unit) {
            case "y":
                scale = 60 * 60 * 24 * 365;
                break;
            case "M":
                scale = 60 * 60 * 24 * 30;
                break;
            case "w":
                scale = 60 * 60 * 24 * 7;
                break;
            case "d":
                scale = 60 * 60 * 24;
                break;
            case "h":
                scale = 60 * 60;
                break;
            case "m":
                scale = 60;
                break;
            case "s":
                scale = 1;
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        return amount * scale;
    }


    public static Object roundTimeframe(Object timeframe, Object timestamp, Object direction) {

        int dir;
        if (direction == null) {
            dir = ROUND_DOWN;
        } else if (direction instanceof Number) {
            dir = ((Number) direction).intValue();
        } else {
            throw new IllegalArgumentException("direction must be numeric or null");
        }

        long ms = parseTimeframe(timeframe) * 1000L;

        if (!(timestamp instanceof Number)) {
            throw new IllegalArgumentException("timestamp must be numeric");
        }
        long ts = ((Number) timestamp).longValue();
        String timeframeString = (String) timeframe;
        int amount = 0;
        try {
            amount = Integer.parseInt(timeframeString.substring(0, timeframeString.length() - 1));
        } catch (NumberFormatException e) {
            amount = 0;
        }
        String unit = timeframeString.substring(timeframeString.length() - 1);
        if ((unit.equals("w") || unit.equals("M") || unit.equals("y")) && amount >= 1) {
            ZonedDateTime date = Instant.ofEpochMilli(ts).atZone(ZoneOffset.UTC);
            ZonedDateTime rounded;
            if (unit.equals("w")) {
                int daysSinceMonday = (date.getDayOfWeek().getValue() + 6) % 7;
                ZonedDateTime monday = date.minusDays(daysSinceMonday).toLocalDate().atStartOfDay(ZoneOffset.UTC);
                ZonedDateTime epochMonday = ZonedDateTime.of(1970, 1, 5, 0, 0, 0, 0, ZoneOffset.UTC);
                long weeksSinceEpochMonday = java.time.Duration.between(epochMonday, monday).toDays() / 7;
                rounded = epochMonday.plusDays(Math.floorDiv(weeksSinceEpochMonday, amount) * amount * 7);
                if (dir == ROUND_UP) {
                    rounded = rounded.plusDays(amount * 7);
                }
            } else if (unit.equals("M")) {
                int monthsSinceYearZero = date.getYear() * 12 + date.getMonthValue() - 1;
                int roundedMonths = Math.floorDiv(monthsSinceYearZero, amount) * amount;
                int year = Math.floorDiv(roundedMonths, 12);
                int month = roundedMonths % 12 + 1;
                rounded = ZonedDateTime.of(year, month, 1, 0, 0, 0, 0, ZoneOffset.UTC);
                if (dir == ROUND_UP) {
                    rounded = rounded.plusMonths(amount);
                }
            } else {
                int year = Math.floorDiv(date.getYear(), amount) * amount;
                rounded = ZonedDateTime.of(year, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC);
                if (dir == ROUND_UP) {
                    rounded = rounded.plusYears(amount);
                }
            }
            return rounded.toInstant().toEpochMilli();
        }

        long offset = ts % ms;

        long result = ts - offset + ((dir == ROUND_UP) ? ms : 0L);
        return result;
    }

    public static Object roundTimeframe(Object timeframe, Object timestamp) {
        return roundTimeframe(timeframe, timestamp, null);
    }

    public static Object implodeParams(Object path2, Object parameter2) {

        String path = (String) path2;

        if (!(parameter2 instanceof List)) {

            if (!(parameter2 instanceof Map)) {
                throw new IllegalArgumentException("parameter2 must be Map<String, Object> or List<Object>");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> parameter = (Map<String, Object>) parameter2;

            // var keys = new List<string>(((dict)parameter).Keys);
            // We just iterate map entries in Java
            // var outList = new List<object>(); // (not actually used)
            for (Map.Entry<String, Object> entry : parameter.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();

                if (value == null) {
                    continue;
                }

                // if (value.GetType() != typeof(List<object>))
                if (!(value instanceof List)) {
                    // path = path.Replace("{"+key+"}", Convert.ToString(value));
                    String replacement = String.valueOf(value);
                    path = path.replace("{" + key + "}", replacement);
                }
            }

            return path;

        } else {
            return (String) path2;
        }
    }
}
