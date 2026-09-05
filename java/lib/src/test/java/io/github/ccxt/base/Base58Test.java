package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import io.github.ccxt.Exchange;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;

/**
 * Pins {@code BaseExchange.binaryToBase58} / {@code base58ToBinary} to the TS source of
 * truth ({@code ts/src/base/functions/encode.ts}: {@code binaryToBase58 = base58.encode},
 * bitcoin alphabet, via {@code @scure/base}). Vectors are the ones asserted by
 * {@code ts/src/test/base/test.binaryToBase58.ts} and {@code test.base58ToBinary.ts}.
 *
 * <p>Regression guard: the Java helper used to return hex instead of base58, which broke
 * pacifica request signing ({@code signatureBase58 = this.binaryToBase58(signatureBinary)})
 * and shipped silently because the transpiled base58 tests were not wired into the Java suite.
 */
class Base58Test {

    private static final String[][] VECTORS = {
        { "hello", "Cn8eVZg" },
        { "hello world", "StV1DL6CwTryKyV" },
        { "test", "3yZe7d" },
        { "a", "2g" },
        { "ab", "8Qq" },
        { "abc", "ZiCa" },
        { "{\"key\":\"value\"}", "4SoiMiEYtTt5tPdi81Fik" },
    };

    private static Exchange exchange() {
        return new Exchange(new HashMap<String, Object>() {{ put("id", "sampleexchange"); }});
    }

    @Test
    void binaryToBase58MatchesTsVectors() {
        Exchange ex = exchange();
        for (String[] v : VECTORS) {
            byte[] bin = v[0].getBytes(StandardCharsets.UTF_8);
            assertEquals(v[1], ex.binaryToBase58(bin), "binaryToBase58(" + v[0] + ")");
        }
    }

    @Test
    void base58ToBinaryRoundTripsTsVectors() {
        Exchange ex = exchange();
        for (String[] v : VECTORS) {
            byte[] bin = Exchange.base58ToBinary(v[1]);
            assertArrayEquals(v[0].getBytes(StandardCharsets.UTF_8), bin, "base58ToBinary(" + v[1] + ")");
            assertEquals(v[1], ex.binaryToBase58(bin), "round trip " + v[1]);
        }
    }

    @Test
    void leadingZeroBytesEncodeAsOnes() {
        // bitcoin base58: each leading 0x00 byte maps to a literal '1' (and back)
        Exchange ex = exchange();
        byte[] lz = new byte[] { 0, 0, 1, 2 };
        assertEquals("115T", ex.binaryToBase58(lz));
        assertArrayEquals(lz, Exchange.base58ToBinary("115T"));
        assertEquals("1", ex.binaryToBase58(new byte[] { 0 }));
        assertArrayEquals(new byte[] { 0 }, Exchange.base58ToBinary("1"));
        assertEquals("", ex.binaryToBase58(new byte[0]));
    }

    @Test
    void solanaStyle64ByteSignatureRoundTrips() {
        // pacifica signs with ed25519 (64-byte signature) and sends it base58-encoded
        byte[] sig = new byte[64];
        for (int i = 0; i < sig.length; i++) {
            sig[i] = (byte) (i * 7 + 3);
        }
        Exchange ex = exchange();
        Object encoded = ex.binaryToBase58(sig);
        assertTrue(encoded instanceof String);
        String s = (String) encoded;
        assertFalse(s.matches("^[0-9a-f]+$") && s.length() == 128, "must not be hex");
        assertTrue(s.matches("^[1-9A-HJ-NP-Za-km-z]+$"), "bitcoin alphabet only, got " + s);
        assertArrayEquals(sig, Exchange.base58ToBinary(s));
    }
}
