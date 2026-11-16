package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.Exchange;
import java.security.MessageDigest;
import java.util.*;
import org.junit.jupiter.api.Test;

/** Pins packb bytes (generic path and hyperliquid schema ordering) so the msgpack encoder swap is byte-identical. */
class MsgpackPackbTest {

    private static List<Object> longs(int n) { List<Object> l = new ArrayList<>(); for (long i = 0; i < n; i++) l.add(i); return l; }
    private static Map<String, Object> kmap(int n) { Map<String, Object> m = new LinkedHashMap<>(); for (long i = 0; i < n; i++) m.put("k" + i, i); return m; }
    private static Map<String, Object> map(Object... kv) { return fill(new LinkedHashMap<>(), kv); }
    private static Map<String, Object> lm(Object... kv) { return fill(new LinkedHashMap<>(), kv); }
    private static Map<String, Object> hm(Object... kv) { return fill(new HashMap<>(), kv); }
    private static Map<String, Object> fill(Map<String, Object> m, Object[] kv) { for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]); return m; }

    private static String render(Object packed) throws Exception {
        byte[] b = (byte[]) packed;
        if (b.length <= 600) return Exchange.binaryToBase16(b);
        return "len=" + b.length + " sha256=" + Exchange.binaryToBase16(MessageDigest.getInstance("SHA-256").digest(b));
    }

    private static void check(Exchange ex, Object[][] cases) throws Exception {
        List<String> failures = new ArrayList<>();
        for (Object[] c : cases) {
            String got = render(ex.packb(c[1]));
            if (!c[2].equals(got)) failures.add(c[0] + ": expected " + c[2] + " got " + got);
        }
        assertTrue(failures.isEmpty(), String.join("\n", failures));
    }

    @Test
    void genericValues() throws Exception {
        Object[][] cases = {
            { "nil", null, "c0" },
            { "true", true, "c3" },
            { "false", false, "c2" },
            { "long 0", 0L, "00" },
            { "long 1", 1L, "01" },
            { "long 127", 127L, "7f" },
            { "long 128", 128L, "cc80" },
            { "long 255", 255L, "ccff" },
            { "long 256", 256L, "cd0100" },
            { "long 65535", 65535L, "cdffff" },
            { "long 65536", 65536L, "ce00010000" },
            { "long 4294967295", 4294967295L, "ceffffffff" },
            { "long 4294967296", 4294967296L, "cf0000000100000000" },
            { "long 1700000000000", 1700000000000L, "cf0000018bcfe56800" },
            { "long 9007199254740991", 9007199254740991L, "cf001fffffffffffff" },
            { "long 9223372036854775807", 9223372036854775807L, "cf7fffffffffffffff" },
            { "long -1", -1L, "ff" },
            { "long -32", -32L, "e0" },
            { "long -33", -33L, "d0df" },
            { "long -128", -128L, "d080" },
            { "long -129", -129L, "d1ff7f" },
            { "long -32768", -32768L, "d18000" },
            { "long -32769", -32769L, "d2ffff7fff" },
            { "long -2147483648", -2147483648L, "d280000000" },
            { "long -2147483649", -2147483649L, "d3ffffffff7fffffff" },
            { "long -1700000000000", -1700000000000L, "d3fffffe74301a9800" },
            { "long -9223372036854775808", Long.MIN_VALUE, "d38000000000000000" },
            { "int 0", Integer.valueOf(0), "00" },
            { "int 127", Integer.valueOf(127), "7f" },
            { "int 128", Integer.valueOf(128), "cc80" },
            { "int 255", Integer.valueOf(255), "ccff" },
            { "int 256", Integer.valueOf(256), "cd0100" },
            { "int 65535", Integer.valueOf(65535), "cdffff" },
            { "int 65536", Integer.valueOf(65536), "ce00010000" },
            { "int 2147483647", Integer.valueOf(2147483647), "ce7fffffff" },
            { "int -1", Integer.valueOf(-1), "ff" },
            { "int -32", Integer.valueOf(-32), "e0" },
            { "int -33", Integer.valueOf(-33), "d0df" },
            { "int -128", Integer.valueOf(-128), "d080" },
            { "int -129", Integer.valueOf(-129), "d1ff7f" },
            { "int -32768", Integer.valueOf(-32768), "d18000" },
            { "int -32769", Integer.valueOf(-32769), "d2ffff7fff" },
            { "int -2147483648", Integer.MIN_VALUE, "d280000000" },
            { "byte -128", Byte.valueOf((byte) -128), "d080" },
            { "byte -33", Byte.valueOf((byte) -33), "d0df" },
            { "byte -32", Byte.valueOf((byte) -32), "e0" },
            { "byte 0", Byte.valueOf((byte) 0), "00" },
            { "byte 127", Byte.valueOf((byte) 127), "7f" },
            { "short -32768", Short.valueOf((short) -32768), "d18000" },
            { "short -129", Short.valueOf((short) -129), "d1ff7f" },
            { "short -33", Short.valueOf((short) -33), "d0df" },
            { "short -32", Short.valueOf((short) -32), "e0" },
            { "short 127", Short.valueOf((short) 127), "7f" },
            { "short 128", Short.valueOf((short) 128), "cc80" },
            { "short 255", Short.valueOf((short) 255), "ccff" },
            { "short 256", Short.valueOf((short) 256), "cd0100" },
            { "short 32767", Short.valueOf((short) 32767), "cd7fff" },
            { "bigint 9223372036854775808", new java.math.BigInteger("9223372036854775808"), "cf8000000000000000" },
            { "bigint 18446744073709551615", new java.math.BigInteger("18446744073709551615"), "cfffffffffffffffff" },
            { "bigint 5", new java.math.BigInteger("5"), "05" },
            { "bigint -5", new java.math.BigInteger("-5"), "fb" },
            { "double 1.5", Double.valueOf(1.5), "cb3ff8000000000000" },
            { "double 0.1", Double.valueOf(0.1), "cb3fb999999999999a" },
            { "double -2.25", Double.valueOf(-2.25), "cbc002000000000000" },
            { "double 0.0", Double.valueOf(0.0), "cb0000000000000000" },
            { "float 0.1", Float.valueOf(0.1f), "ca3dcccccd" },
            { "str len 0", "a".repeat(0), "a0" },
            { "str len 1", "a".repeat(1), "a161" },
            { "str len 31", "a".repeat(31), "bf61616161616161616161616161616161616161616161616161616161616161" },
            { "str len 32", "a".repeat(32), "d9206161616161616161616161616161616161616161616161616161616161616161" },
            { "str len 255", "a".repeat(255), "d9ff616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161" },
            { "str len 256", "a".repeat(256), "da010061616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161" },
            { "str len 65535", "a".repeat(65535), "len=65538 sha256=ae606c3d6aaca8b43b24feb4aae3e5ab4088edb6d99d254d366f00e08f287c3d" },
            { "str len 65536", "a".repeat(65536), "len=65541 sha256=5f97d047d40a13f57389f8c7817f5afd69fe1e7739a305850eb23c5adb54674a" },
            { "str utf8", "h\u00e9llo \u20ac\ud834\udd1e", "ae68c3a96c6c6f20e282acf09d849e" },
            { "str utf8 85x3 bytes=255", "\u20ac".repeat(85), "d9ffe282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ac" },
            { "str utf8 86x3 bytes=258", "\u20ac".repeat(86), "da0102e282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ace282ac" },
            { "str utf8 21846x3 bytes=65538", "\u20ac".repeat(21846), "len=65543 sha256=77cb06df9ac508ca7848f254c60a113c7052f7fb395bad9b05218d1894592b73" },
            { "bin len 0", new byte[0], "c400" },
            { "bin len 255", new byte[255], "c4ff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
            { "bin len 256", new byte[256], "c5010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
            { "bin len 65536", new byte[65536], "len=65541 sha256=cf990bb92911b49d07d55d9fdfada1614badc215275c9c32379770d1ff1342d5" },
            { "array len 0", longs(0), "90" },
            { "array len 15", longs(15), "9f000102030405060708090a0b0c0d0e" },
            { "array len 16", longs(16), "dc0010000102030405060708090a0b0c0d0e0f" },
            { "array len 65535", longs(65535), "len=196224 sha256=8c336eb0f76e5433623ce52adf0fa4704a7410cacd206d5442c835b7bd294f04" },
            { "array len 65536", longs(65536), "len=196229 sha256=659da62605120aecab3feb7ceb9f912947719200e22ea46c7705c99cb10cacfa" },
            { "map len 0", kmap(0), "80" },
            { "map len 15", kmap(15), "8fa26b3000a26b3101a26b3202a26b3303a26b3404a26b3505a26b3606a26b3707a26b3808a26b3909a36b31300aa36b31310ba36b31320ca36b31330da36b31340e" },
            { "map len 16", kmap(16), "de0010a26b3000a26b3101a26b3202a26b3303a26b3404a26b3505a26b3606a26b3707a26b3808a26b3909a36b31300aa36b31310ba36b31320ca36b31330da36b31340ea36b31350f" },
            { "nested", map("a", List.of(1L, map("b", null, "c", List.of(true, "x"))), "d", map()), "82a161920182a162c0a16392c3a178a16480" },
            { "array mixed", Arrays.asList("op", 1L, "0xabc", List.of(1700000000000L, "x"), null, false), "96a26f7001a5307861626392cf0000018bcfe56800a178c0c2" },
            { "fallback toString", new StringBuilder("sb"), "a27362" },
            { "polymarket createOrders", List.of("createOrders", List.of(Arrays.asList(12L, true, "0.55", "10", "GTC", false, false, "0xc1"))), "92ac6372656174654f726465727391980cc3a4302e3535a23130a3475443c2c2a430786331" },
            { "polymarket cancelOrders", List.of("cancelOrders", List.of(1L, 4294967296L)), "92ac63616e63656c4f72646572739201cf0000000100000000" },
            { "polymarket autoCancel", List.of("autoCancel", List.of(1700000000000L)), "92aa6175746f43616e63656c91cf0000018bcfe56800" }
        };
        check(new Exchange(new HashMap<String, Object>() {{ put("id", "sampleexchange"); }}), cases);
    }

    @Test
    void hyperliquidActions() throws Exception {
        Object[][] cases = {
            { "hyperliquid order", hm("grouping", "na", "builder", hm("f", 10L, "b", "0x6530512a6c89c7cfcebc3ba7fcd9ada5f30827a6"), "orders", List.of(hm("c", "0x1234567890abcdef1234567890abcdef", "t", hm("limit", hm("tif", "Gtc")), "r", false, "s", "0.2", "p", "1100.5", "b", true, "a", 4L)), "type", "order"), "84a474797065a56f72646572a66f72646572739187a16104a162c3a170a6313130302e35a173a3302e32a172c2a17481a56c696d697481a3746966a3477463a163d92230783132333435363738393061626364656631323334353637383930616263646566a867726f7570696e67a26e61a76275696c64657282a162d92a307836353330353132613663383963376366636562633362613766636439616461356633303832376136a1660a" },
            { "hyperliquid trigger order", hm("grouping", "normalTpsl", "orders", List.of(hm("t", hm("trigger", hm("tpsl", "sl", "triggerPx", "1900", "isMarket", true)), "r", true, "s", "1", "p", "0", "b", false, "a", 10005L)), "type", "order"), "83a474797065a56f72646572a66f72646572739186a161cd2715a162c2a170a130a173a131a172c3a17481a77472696767657283a869734d61726b6574c3a9747269676765725078a431393030a47470736ca2736ca867726f7570696e67aa6e6f726d616c5470736c" },
            { "hyperliquid cancel", hm("cancels", List.of(hm("o", 123456789012L, "a", 0L)), "type", "cancel"), "82a474797065a663616e63656ca763616e63656c739182a16100a16fcf0000001cbe991a14" },
            { "hyperliquid cancel fast", hm("f", true, "cancels", List.of(hm("o", 1L, "a", 0L)), "type", "cancel"), "83a474797065a663616e63656ca763616e63656c739182a16100a16f01a166c3" },
            { "hyperliquid cancelByCloid", hm("cancels", List.of(hm("cloid", "0x1234567890abcdef1234567890abcdef", "asset", 3L)), "type", "cancelByCloid"), "82a474797065ad63616e63656c4279436c6f6964a763616e63656c739182a5617373657403a5636c6f6964d92230783132333435363738393061626364656631323334353637383930616263646566" },
            { "hyperliquid batchModify", hm("modifies", List.of(hm("order", hm("t", hm("limit", hm("tif", "Alo")), "r", false, "s", "0.01", "p", "2000", "b", true, "a", 1L), "oid", 70000L)), "type", "batchModify"), "82a474797065ab62617463684d6f64696679a86d6f6469666965739182a36f6964ce00011170a56f7264657286a16101a162c3a170a432303030a173a4302e3031a172c2a17481a56c696d697481a3746966a3416c6f" },
            { "hyperliquid updateLeverage", hm("leverage", 20L, "isCross", true, "asset", 1L, "type", "updateLeverage"), "84a474797065ae7570646174654c65766572616765a5617373657401a7697343726f7373c3a86c6576657261676514" },
            { "hyperliquid updateIsolatedMargin", hm("ntli", -5000000L, "isBuy", true, "asset", 1L, "type", "updateIsolatedMargin"), "83a474797065b475706461746549736f6c617465644d617267696ea5617373657401a56973427579c3" },
            { "hyperliquid vaultTransfer", hm("usd", 5000000L, "isDeposit", true, "vaultAddress", "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303", "type", "vaultTransfer"), "84a474797065ad7661756c745472616e73666572ac7661756c7441646472657373d92a307864666332346230373762633134323561643164656137356263623666383135386531306466333033a969734465706f736974c3a3757364ce004c4b40" },
            { "hyperliquid scheduleCancel", hm("time", 1700000000000L, "type", "scheduleCancel"), "82a474797065ae7363686564756c6543616e63656ca474696d65cf0000018bcfe56800" },
            { "hyperliquid twapOrder", hm("twap", hm("t", false, "m", 30L, "r", false, "s", "1", "b", true, "a", 0L), "type", "twapOrder"), "82a474797065a9747761704f72646572a47477617086a16100a162c3a173a131a172c2a16d1ea174c2" },
            { "hyperliquid usdSend", hm("type", "usdSend", "time", 1700000000000L, "amount", "1", "destination", "0xabc", "signatureChainId", "0x66eee", "hyperliquidChain", "Mainnet"), "86b068797065726c6971756964436861696ea74d61696e6e6574b07369676e6174757265436861696e4964a730783636656565ab64657374696e6174696f6ea53078616263a6616d6f756e74a131a474696d65cf0000018bcfe56800a474797065a775736453656e64" },
            { "hyperliquid unknown type keeps order", lm("type", "noSchema", "z", 1L, "a", 2L), "83a474797065a86e6f536368656d61a17a01a16102" }
        };
        check(new Exchange(new HashMap<String, Object>() {{ put("id", "hyperliquid"); }}), cases);
    }

    @Test
    void bigIntegerAbove64BitsThrows() {
        Exchange ex = new Exchange(new HashMap<String, Object>() {{ put("id", "sampleexchange"); }});
        assertThrows(IllegalArgumentException.class, () -> ex.packb(java.math.BigInteger.ONE.shiftLeft(64)));
        assertThrows(IllegalArgumentException.class, () -> ex.packb(java.math.BigInteger.ONE.shiftLeft(63).negate().subtract(java.math.BigInteger.ONE)));
    }
}
