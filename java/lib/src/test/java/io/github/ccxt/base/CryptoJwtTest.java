package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CryptoJwtTest {
    @Test
    void signsEs256WithStringAndEncodedPem() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair keys = generator.generateKeyPair();
        assertPemSignatures(keys, false, Map.of("alg", "ES256"), "SHA256withECDSAinP1363Format", 64);
    }

    @Test
    void signsRs256WithStringAndEncodedPem() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair keys = generator.generateKeyPair();
        assertPemSignatures(keys, true, Map.of(), "SHA256withRSA", 256);
    }

    private void assertPemSignatures(KeyPair keys, boolean isRsa, Map<String, Object> options,
            String algorithm, int signatureLength) throws Exception {
        String pem = "-----BEGIN PRIVATE KEY-----\n"
                + Base64.getEncoder().encodeToString(keys.getPrivate().getEncoded())
                + "\n-----END PRIVATE KEY-----";
        for (Object secret : new Object[] { pem, pem.getBytes(StandardCharsets.UTF_8) }) {
            String token = Crypto.Jwt(Map.of("sub", "test"), secret, "sha256", isRsa, options);
            String[] parts = token.split("\\.");
            assertEquals(3, parts.length);
            byte[] signature = Base64.getUrlDecoder().decode(parts[2]);
            assertEquals(signatureLength, signature.length);
            Signature verifier = Signature.getInstance(algorithm);
            verifier.initVerify(keys.getPublic());
            verifier.update((parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII));
            assertTrue(verifier.verify(signature));
        }
    }
}
