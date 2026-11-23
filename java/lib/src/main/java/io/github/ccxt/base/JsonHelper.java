package io.github.ccxt.base;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

public class JsonHelper {
    private static final ObjectMapper mapper = new ObjectMapper().registerModule(jsNumberModule());

    /** Shared default-configured mapper; callers needing other features keep their own. */
    public static ObjectMapper mapper() {
        return mapper;
    }

    public static Object deserialize(String json) {
        if (json == null) {
            return null;
        }
        try {
            return mapper.readValue(json, new TypeReference<Object>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON: " + json, e);
        }
    }

    // Doubles and floats print as JavaScript JSON.stringify prints them when the value
    // is whole (10.0 -> 10, 1e21 -> 1e+21) or not finite (null); fractions keep Jackson's form.
    public static com.fasterxml.jackson.databind.module.SimpleModule jsNumberModule() {
        com.fasterxml.jackson.databind.module.SimpleModule m =
                new com.fasterxml.jackson.databind.module.SimpleModule("JsWholeNumbers");
        com.fasterxml.jackson.databind.JsonSerializer<Number> ser =
                new com.fasterxml.jackson.databind.JsonSerializer<Number>() {
                    @Override
                    public void serialize(Number value, com.fasterxml.jackson.core.JsonGenerator gen,
                                          com.fasterxml.jackson.databind.SerializerProvider provider)
                            throws java.io.IOException {
                        double d = value.doubleValue();
                        if (Double.isNaN(d) || Double.isInfinite(d)) {
                            gen.writeNull();
                        } else if (d != Math.rint(d)) {
                            if (value instanceof Float f) gen.writeNumber(f.floatValue()); else gen.writeNumber(d);
                        } else {
                            gen.writeNumber(jsWholeNumber(d));
                        }
                    }
                };
        m.addSerializer(Double.class, ser);
        m.addSerializer(Double.TYPE, ser);
        m.addSerializer(Float.class, ser);
        m.addSerializer(Float.TYPE, ser);
        return m;
    }

    /** JavaScript Number#toString of a finite whole double: plain below 1e21, else shortest digits with e+NN. */
    public static String jsWholeNumber(double d) {
        if (d == 0) return "0";
        java.math.BigDecimal shortest = new java.math.BigDecimal(Double.toString(d));
        if (Math.abs(d) < 1e21) return shortest.toBigInteger().toString();
        java.math.BigDecimal norm = shortest.stripTrailingZeros();
        String digits = norm.unscaledValue().abs().toString();
        int exp = digits.length() - 1 - norm.scale();
        String mant = digits.length() == 1 ? digits : digits.charAt(0) + "." + digits.substring(1);
        return (d < 0 ? "-" : "") + mant + "e+" + exp;
    }
}
