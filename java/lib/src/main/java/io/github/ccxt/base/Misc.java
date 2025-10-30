package io.github.ccxt.base;

import java.util.List;
import java.util.Map;

public class Misc {

    public static final int ROUND_UP = 1;
    public static final int ROUND_DOWN = 0;

    public static long parseTimeframe(Object timeframe) {
        // throw if it's not implemented yet in your port
        throw new UnsupportedOperationException("parseTimeframe not implemented");
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
