package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

/**
 * Pins the secp256k1 signing contract of {@link Crypto#Ecdsa} after the org.web3j:crypto
 * → direct BouncyCastle swap. Every expected value below was produced by the previous
 * web3j path ({@code Sign.signMessage(msg, ECKeyPair.create(d), false)}, v - 27) and
 * cross-checked against 3000 random (key, hash) pairs with 0 mismatches.
 *
 * <p>Hard requirements guarded here: RFC 6979 deterministic k (same input → same r/s),
 * low-s canonical form (s ≤ n/2), and the recovery id {@code v} in {0, 1}.
 */
class Secp256k1EcdsaTest {

    private static final String KEY = "1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a";
    private static final BigInteger HALF_N = new BigInteger("7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0", 16);

    private static byte[] sha256(String s) throws Exception {
        return MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void sha256PathMatchesWeb3jVector() {
        Map<String, Object> sig = Crypto.Ecdsa("hello", KEY, "secp256k1", "sha256");
        assertEquals("151d487f07cd968ccf360400143f03ef1db270228e749bb2be32a7bcb01f6f5e", sig.get("r"));
        assertEquals("1b16c09a716493621835d4f705d86ec44fd7a8f468bbcf6e855d2a42fb5ea645", sig.get("s"));
        assertEquals(0, sig.get("v"));
    }

    @Test
    void rawHexPathMatchesWeb3jVector() throws Exception {
        String hash = Crypto.binaryToHex(sha256("raw"));
        Map<String, Object> sig = Crypto.Ecdsa(hash, "0x" + KEY, "secp256k1", null);
        assertEquals("94374fb3904998ef5568dd3f0c867b39106b540f8ff9252a75034eb724265dfd", sig.get("r"));
        assertEquals(1, sig.get("v"));
    }

    @Test
    void rfc6979KnownAnswer() throws Exception {
        // d = 1, sha256("Satoshi Nakamoto") — the classic RFC 6979 secp256k1 KAT
        String hash = Crypto.binaryToHex(sha256("Satoshi Nakamoto"));
        String d1 = "0000000000000000000000000000000000000000000000000000000000000001";
        Map<String, Object> sig = Crypto.Ecdsa(hash, d1, "secp256k1", null);
        assertEquals("934b1ea10a4b3c1757e2b0c017d0b6143ce3c9a7e6a4a49860d7a6ab210ee3d8", sig.get("r"));
        assertEquals("2442ce9d2b916064108014783e923ec36b49743e2ffa1c4496f01a512aafd9e5", sig.get("s"));
        assertEquals(1, sig.get("v"));
    }

    @Test
    void deterministicAndLowS() {
        String[] msgs = { "", "a", "The quick brown fox", "{\"a\":1}", "x".repeat(1000) };
        for (String m : msgs) {
            Map<String, Object> a = Crypto.Ecdsa(m, KEY, "secp256k1", "sha256");
            Map<String, Object> b = Crypto.Ecdsa(m, KEY, "secp256k1", "sha256");
            assertEquals(a, b, "RFC 6979 must be deterministic for " + m);
            assertEquals(64, ((String) a.get("r")).length());
            assertEquals(64, ((String) a.get("s")).length());
            assertTrue(new BigInteger((String) a.get("s"), 16).compareTo(HALF_N) <= 0, "low-s for " + m);
            int v = (Integer) a.get("v");
            assertTrue(v == 0 || v == 1, "v in {0,1} for " + m);
        }
    }

    @Test
    void ethAddressMatchesWeb3j() {
        assertEquals("0xef4b70013a5d27da61d71ad716fe1294f748d152", Crypto.ethGetAddressFromPrivateKey(KEY));
        assertEquals("0xef4b70013a5d27da61d71ad716fe1294f748d152", Crypto.ethGetAddressFromPrivateKey("0x" + KEY));
        String checksummed = Crypto.ethGetChecksumAddressFromPrivateKey(KEY);
        assertEquals("0xef4b70013a5d27da61d71ad716fe1294f748d152", checksummed.toLowerCase());
        assertNotEquals(checksummed, checksummed.toLowerCase(), "EIP-55 must mix case");
    }
}
