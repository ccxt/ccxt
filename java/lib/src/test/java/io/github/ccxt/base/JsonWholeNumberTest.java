package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

/** Functions.json prints numbers as JavaScript JSON.stringify does (expected strings are node output). */
class JsonWholeNumberTest {

    private static String j(Object o) {
        return Functions.json(o);
    }

    @Test
    void wholeDoublesPrintWithoutFraction() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", 10.0);
        body.put("neg", -3.0);
        body.put("zero", 0.0);
        body.put("negZero", -0.0);
        body.put("f", 2.0f);
        assertEquals("{\"amount\":10,\"neg\":-3,\"zero\":0,\"negZero\":0,\"f\":2}", j(body));
        assertEquals("[9007199254740991,9007199254740992]", j(new ArrayList<Object>(Arrays.asList(9007199254740991.0, 9007199254740992.0))));
    }

    @Test
    void largeAndNonFiniteMatchJavaScript() {
        assertEquals("123456789012345680000", j(123456789012345678901.0));
        assertEquals("100000000000000000000", j(1e20));
        assertEquals("1e+21", j(1e21));
        assertEquals("-1.5e+300", j(-1.5e300));
        assertEquals("1.7976931348623157e+308", j(Double.MAX_VALUE));
        assertEquals("[null,null,null]", j(new ArrayList<Object>(Arrays.asList(Double.NaN, Double.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY))));
    }

    @Test
    void fractionsAndOtherKindsUnchanged() {
        assertEquals("[0.5,1.25,-0.1,0.1,10,\"10.0\",null]",
                j(new ArrayList<Object>(Arrays.asList(0.5, 1.25, -0.1, 0.1f, 10L, "10.0", null))));
    }
}
