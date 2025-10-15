package io.github.ccxt.base;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.*;
import java.util.*;
import java.util.zip.CRC32;
import java.util.zip.InflaterInputStream;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.bouncycastle.asn1.ASN1Primitive;
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.math.ec.ECPoint;
import org.bouncycastle.openssl.PEMKeyPair;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.util.encoders.Hex;
import org.bouncycastle.jcajce.provider.digest.Keccak;

/**
 * Java port of the C# crypto helpers.
 * All methods are public static, parameters are Object where appropriate.
 */
@SuppressWarnings("unchecked")
public final class crypto {

    private crypto() {}

    // Ensure BC provider once
    static {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    // ---------- algorithm-name helpers ----------
    public static String sha1()     { return "sha1"; }
    public static String sha256()   { return "sha256"; }
    public static String sha384()   { return "sha384"; }
    public static String sha512()   { return "sha512"; }
    public static String md5()      { return "md5"; }
    public static String ed25519()  { return "ed25519"; }
    public static String keccak()   { return "keccak"; }
    public static String secp256k1(){ return "secp256k1"; }
    public static String p256()     { return "p256"; }

    // ---------- small utils ----------
    private static String toString(Object o) { return String.valueOf(o); }
    private static byte[] toUtf8(Object o) { return toString(o).getBytes(StandardCharsets.UTF_8); }

    public static String binaryToHex(byte[] data) {
        StringBuilder sb = new StringBuilder(data.length * 2);
        for (byte b : data) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    public static String BinaryToBase64(byte[] buff) {
        return Base64.getEncoder().encodeToString(buff);
    }

    public static byte[] Base64ToBinary(Object s) {
        return Base64.getDecoder().decode(toString(s));
    }

    public static String Base64ToBase64Url(String base64, boolean stripPadding) {
        String s = base64.replace('+', '-').replace('/', '_');
        return stripPadding ? s.replaceAll("=+$", "") : s;
    }

    public static String Base64urlEncode(Object value) {
        final String b64 = (value instanceof byte[])
                ? BinaryToBase64((byte[]) value)
                : BinaryToBase64(toUtf8(value));
        return Base64ToBase64Url(b64, true);
    }

    private static final ObjectMapper M = new ObjectMapper();
    private static String json(Object o) {
        if (o == null) return null;
        if (o instanceof Throwable t) {
            Map<String,Object> err = new LinkedHashMap<>();
            err.put("name", t.getClass().getSimpleName());
            try { return M.writeValueAsString(err); } catch (JsonProcessingException e) { return "{\"name\":\"" + err.get("name") + "\"}"; }
        }
        try { return M.writeValueAsString(o); } catch (JsonProcessingException e) { throw new RuntimeException(e); }
    }

    // ====================================================
    // HMAC
    // ====================================================

    public static String Hmac(Object request2, Object secret2, Object algorithm2, String digest) {
        byte[] request = (request2 instanceof String) ? toUtf8(request2) : (byte[]) request2;
        byte[] secret  = (secret2  instanceof String) ? toUtf8(secret2)  : (byte[]) secret2;

        String algo = "md5";
        if (algorithm2 != null) {
            algo = toString(algorithm2); // pass "sha256"/"sha512"/"sha384"/"md5"
        }

        byte[] sig;
        switch (algo) {
            case "sha256": sig = hmac("HmacSHA256", request, secret); break;
            case "sha512": sig = hmac("HmacSHA512", request, secret); break;
            case "sha384": sig = hmac("HmacSHA384", request, secret); break;
            case "md5":    sig = hmac("HmacMD5",    request, secret); break;
            default:       throw new IllegalArgumentException("Unsupported HMAC algo: " + algo);
        }
        return "hex".equals(digest) ? binaryToHex(sig) : BinaryToBase64(sig);
    }

    private static byte[] hmac(String jceName, byte[] data, byte[] key) {
        try {
            Mac mac = Mac.getInstance(jceName);
            mac.init(new SecretKeySpec(key, jceName));
            return mac.doFinal(data);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException(e);
        }
    }

    public static String hmac(Object request2, Object secret2, Object algorithm2, String digest) {
        return Hmac(request2, secret2, algorithm2, digest);
    }

    // ====================================================
    // Hash
    // ====================================================

    public static Object Hash(Object request2, Object hash, Object digest2) {
        String algorithm = (hash == null) ? null : toString(hash);
        String digest = (digest2 == null) ? "hex" : toString(digest2);

        byte[] signature;
        switch (algorithm) {
            case "sha256": signature = shaDigest("SHA-256", toString(request2)); break;
            case "sha512": signature = shaDigest("SHA-512", toString(request2)); break;
            case "sha384": signature = shaDigest("SHA-384", toString(request2)); break;
            case "sha1":   signature = shaDigest("SHA-1",   toString(request2)); break;
            case "md5":    signature = md5Digest(toString(request2)); break;
            case "keccak":
            case "sha3":   signature = keccakDigest(toUtf8(request2)); break;
            default:       throw new IllegalArgumentException("Unsupported hash algo: " + algorithm);
        }

        if ("binary".equals(digest)) return signature;
        return "hex".equals(digest) ? binaryToHex(signature) : BinaryToBase64(signature);
    }

    private static byte[] shaDigest(String algo, String data) {
        try {
            MessageDigest md = MessageDigest.getInstance(algo);
            return md.digest(toUtf8(data));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private static byte[] md5Digest(String data) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            return md.digest(toUtf8(data));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private static byte[] keccakDigest(byte[] data) {
        Keccak.Digest256 k = new Keccak.Digest256();
        k.update(data, 0, data.length);
        return k.digest();
    }

    // ====================================================
    // JWT (HS / RS / ES256 / Ed25519)
    // ====================================================

    public static String Jwt(Object data, Object secret, Object hash, boolean isRsa, Object options2) {
        Map<String, Object> options = (options2 instanceof Map) ? (Map<String, Object>) options2 : new LinkedHashMap<>();
        String algorithm = (hash == null) ? null : toString(hash); // e.g., "sha256", "sha384", "sha512"
        if (algorithm == null) throw new IllegalArgumentException("JWT requires hash algorithm name");

        String alg = (isRsa ? "RS" : "HS") + algorithm.substring(3).toUpperCase(Locale.ROOT);
        if (options.containsKey("alg")) {
            alg = toString(options.get("alg"));
        }

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", alg);
        header.put("typ", "JWT");
        header.putAll(options);

        // Move iat from header to payload if present (to mimic C# logic)
        if (header.containsKey("iat") && data instanceof Map<?, ?>) {
            ((Map<String, Object>) data).put("iat", header.get("iat"));
            header.remove("iat");
        }

        String encodedHeader = Base64urlEncode(json(header));
        String encodedPayload = Base64urlEncode(json(data));
        String token = encodedHeader + "." + encodedPayload;

        String algoType = alg.substring(0, 2); // HS / RS / ES / Ed
        String signatureB64Url;

        if (isRsa) {
            // RSxxx with private key PEM
            byte[] sig = rsaSign(token, toString(secret), algorithm);
            signatureB64Url = Base64ToBase64Url(BinaryToBase64(sig), true);
        } else if ("ES".equals(algoType)) {
            // ES256: sign over P-256 -> r|s then base64url(r||s)
            Map<String, Object> ec = Ecdsa(token, secret, p256(), hash);
            String rHex = toString(ec.get("r"));
            String sHex = toString(ec.get("s"));
            byte[] rs = Hex.decode(rHex + sHex);
            signatureB64Url = Base64ToBase64Url(BinaryToBase64(rs), true);
        } else if ("Ed".equals(algoType)) {
            // Ed25519
            String base64Sig = toString(Eddsa(token, secret, ed25519()));
            signatureB64Url = Base64ToBase64Url(base64Sig, true);
        } else {
            // HMAC HS256/384/512
            String bin = toString(Hmac(token, secret, algorithm, "binary"));
            // Hmac(...,"binary") above returns byte[] in C#, here we returned hex/base64.
            // So call Hmac again but fetch raw bytes:
            byte[] sig = hmacRaw("HS" + algorithm.substring(2), token, secret);
            signatureB64Url = Base64ToBase64Url(BinaryToBase64(sig), true);
        }

        return token + "." + signatureB64Url;
    }

    private static byte[] hmacRaw(String hsName, String data, Object secret) {
        // hsName = HS256/HS384/HS512
        String jce = switch (hsName) {
            case "HS256" -> "HmacSHA256";
            case "HS384" -> "HmacSHA384";
            case "HS512" -> "HmacSHA512";
            default -> throw new IllegalArgumentException("Unsupported HS algorithm: " + hsName);
        };
        return hmac(jce, toUtf8(data), (secret instanceof String) ? toUtf8(secret) : (byte[]) secret);
    }

    // ====================================================
    // Raw sign helpers
    // ====================================================

    public static byte[] SignSHA256Bytes(String data) { return shaDigest("SHA-256", data); }
    public static byte[] SignSHA256(String data)      { return shaDigest("SHA-256", data); }
    public static byte[] SignSHA1(String data)        { return shaDigest("SHA-1",   data); }
    public static byte[] SignSHA384(String data)      { return shaDigest("SHA-384", data); }
    public static byte[] SignSHA512(String data)      { return shaDigest("SHA-512", data); }
    public static byte[] SignMD5(String data)         { return md5Digest(data); }

    public static byte[] SignKeccak(Object data) {
        byte[] msg = (data instanceof String) ? toUtf8(data) : (byte[]) data;
        return keccakDigest(msg);
    }

    public static byte[] SignHMACSHA256(String data, byte[] secret) { return hmac("HmacSHA256", toUtf8(data), secret); }
    public static byte[] SignHMACSHA256(byte[] data, byte[] secret) { return hmac("HmacSHA256", data, secret); }

    public static byte[] SignHMACSHA384(String data, byte[] secret) { return hmac("HmacSHA384", toUtf8(data), secret); }
    public static byte[] SignHMACSHA384(byte[] data, byte[] secret) { return hmac("HmacSHA384", data, secret); }

    public static byte[] SignHMACSHA512(String data, byte[] secret) { return hmac("HmacSHA512", toUtf8(data), secret); }
    public static byte[] SignHMACSHA512(byte[] data, byte[] secret) { return hmac("HmacSHA512", data, secret); }

    public static byte[] SignHMACMD5(String data, byte[] secret)    { return hmac("HmacMD5",    toUtf8(data), secret); }
    public static byte[] SignHMACMD5(byte[] data, byte[] secret)    { return hmac("HmacMD5",    data, secret); }

    // ====================================================
    // RSA (PKCS#1 v1.5) signing with PEM private key
    // ====================================================

    public static String Rsa(Object data, Object publicKeyPem, Object hash) {
        byte[] sig = rsaSign(toString(data), toString(publicKeyPem), (hash == null ? "md5" : toString(hash)));
        return BinaryToBase64(sig);
    }

    private static byte[] rsaSign(String data, String pemPrivateKey, String hashAlgo) {
        String jce = switch (hashAlgo) {
            case "sha1"   -> "SHA1withRSA";
            case "sha256" -> "SHA256withRSA";
            case "sha384" -> "SHA384withRSA";
            case "sha512" -> "SHA512withRSA";
            case "md5"    -> "MD5withRSA";
            default       -> throw new IllegalArgumentException("Invalid hash algorithm name: " + hashAlgo);
        };

        try {
            PrivateKey key = readRSAPrivateKeyFromPem(pemPrivateKey);
            Signature sig = Signature.getInstance(jce);
            sig.initSign(key);
            sig.update(toUtf8(data));
            return sig.sign();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static PrivateKey readRSAPrivateKeyFromPem(String pem) throws Exception {
        if (!pem.contains("-----BEGIN")) {
            // supports raw base64 body like C# code path
            pem = "-----BEGIN PRIVATE KEY-----\n" + pem + "\n-----END PRIVATE KEY-----";
        }
        try (PEMParser parser = new PEMParser(new StringReader(pem))) {
            Object o = parser.readObject();
            if (o instanceof PEMKeyPair kp) {
                PrivateKeyInfo pki = kp.getPrivateKeyInfo();
                return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(pki.getEncoded()));
            }
            if (o instanceof PrivateKeyInfo pki) {
                return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(pki.getEncoded()));
            }
            throw new IllegalArgumentException("Unsupported RSA PEM contents");
        }
    }

    // ====================================================
    // ECDSA (secp256k1 or P-256)
    // Returns { r: hex, s: hex, v: int }
    // ====================================================

    public static Map<String, Object> Ecdsa(Object request, Object secret, Object curve, Object hash) {
        String curveName = (curve == null) ? "secp256k1" : toString(curve);
        if (!curveName.equals("secp256k1") && !curveName.equals("p256")) {
            throw new IllegalArgumentException("Only secp256k1 and p256 are supported");
        }

        String hashName = (hash == null) ? null : toString(hash);
        byte[] msgHash;

        // secret: hex string of private key (like C# using Hex.HexToBytes)
        byte[] secKey = hexToBytes(toString(secret));

        if (hashName != null) {
            msgHash = (byte[]) Hash(toString(request), hashName, "binary"); // returns byte[]
        } else {
            msgHash = hexToBytes(toString(request));
        }

        try {
            Signature signer;
            KeyPair kp;

            if (curveName.equals("p256")) {
                // ES256
                kp = ecKeyPairFromRaw("secp256r1", secKey); // P-256
                signer = Signature.getInstance("NONEwithECDSA", "BC");
            } else {
                // secp256k1
                kp = ecKeyPairFromRaw("secp256k1", secKey);
                signer = Signature.getInstance("NONEwithECDSA", "BC");
            }

            signer.initSign(kp.getPrivate());
            signer.update(msgHash);
            byte[] der = signer.sign();

            // DER -> r,s
            // BouncyCastle util to parse DER:
            // A quick parser:
            java.security.Signature sigParser = signer; // not used
            // Use org.bouncycastle for parsing:
            org.bouncycastle.asn1.ASN1Sequence seq = (org.bouncycastle.asn1.ASN1Sequence) ASN1Primitive.fromByteArray(der);
            java.math.BigInteger r = ((org.bouncycastle.asn1.ASN1Integer) seq.getObjectAt(0)).getValue();
            java.math.BigInteger s = ((org.bouncycastle.asn1.ASN1Integer) seq.getObjectAt(1)).getValue();

            // return 32-byte hex for r and s
            String rHex = leftPadHex(r.toString(16), 64);
            String sHex = leftPadHex(s.toString(16), 64);

            Map<String, Object> out = new LinkedHashMap<>();
            out.put("r", rHex);
            out.put("s", sHex);
            out.put("v", 0); // recovery id not computed here
            return out;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static KeyPair ecKeyPairFromRaw(String curveStdName, byte[] privBytes) throws Exception {
        var params = ECNamedCurveTable.getParameterSpec(curveStdName);
        KeyFactory kf = KeyFactory.getInstance("EC", "BC");
        ECParameterSpec jSpec = new ECParameterSpec(
                params.getCurve(), params.getG(), params.getN(), params.getH(), params.getSeed()
        );
        ECPrivateKeySpec privSpec = new ECPrivateKeySpec(new java.math.BigInteger(1, privBytes), jSpec);
        PrivateKey priv = kf.generatePrivate(privSpec);

        // Derive public key Q = d*G
        ECPoint Q = params.getG().multiply(new java.math.BigInteger(1, privBytes)).normalize();
        ECPublicKeySpec pubSpec = new ECPublicKeySpec(
                new java.security.spec.ECPoint(Q.getAffineXCoord().toBigInteger(), Q.getAffineYCoord().toBigInteger()),
                jSpec
        );
        PublicKey pub = kf.generatePublic(pubSpec);
        return new KeyPair(pub, priv);
    }

    private static String leftPadHex(String s, int len) {
        if (s.length() >= len) return s;
        StringBuilder sb = new StringBuilder(len);
        for (int i = s.length(); i < len; i++) sb.append('0');
        sb.append(s);
        return sb.toString();
    }

    private static byte[] hexToBytes(String hex) {
        return Hex.decode(hex.replaceFirst("^0x", ""));
    }

    public static String ByteArrayToString(byte[] ba) {
        return binaryToHex(ba).toUpperCase(Locale.ROOT);
    }

    // ====================================================
    // EdDSA (Ed25519)
    // ====================================================

    public static Object Eddsa(Object request, Object secret, Object alg) {
        // alg kept for parity; only ed25519 supported here
        byte[] msg = (request instanceof String) ? toUtf8(request) : (byte[]) request;

        Ed25519Signer signer = new Ed25519Signer();
        Ed25519PrivateKeyParameters priv;
        if (secret instanceof String s) {
            // accept raw base64 PEM body or full PEM
            String pem = s.startsWith("-----BEGIN") ? s : "-----BEGIN PRIVATE KEY-----\n" + s + "\n-----END PRIVATE KEY-----";
            try (PEMParser parser = new PEMParser(new StringReader(pem))) {
                Object obj = parser.readObject();
                if (obj instanceof PEMKeyPair pkp) {
                    PrivateKeyInfo pki = pkp.getPrivateKeyInfo();
                    byte[] keyBytes = pki.parsePrivateKey().toASN1Primitive().getEncoded();
                    // Ed25519PrivateKeyParameters expects 32-byte seed; try to extract
                    // BouncyCastle encodes PKCS#8 – rely on constructor parsing:
                    priv = new Ed25519PrivateKeyParameters(pki.parsePrivateKey().toASN1Primitive().getEncoded(), 0);
                } else if (obj instanceof PrivateKeyInfo pki) {
                    priv = new Ed25519PrivateKeyParameters(pki.parsePrivateKey().toASN1Primitive().getEncoded(), 0);
                } else {
                    throw new IllegalArgumentException("Unsupported Ed25519 PEM");
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        } else {
            priv = new Ed25519PrivateKeyParameters((byte[]) secret, 0);
        }

        signer.init(true, priv);
        signer.update(msg, 0, msg.length);
        byte[] sig = signer.generateSignature();
        return Base64.getEncoder().encodeToString(sig);
    }

    // ====================================================
    // CRC32
    // ====================================================

    public static Long Crc32(Object str, Object signed2) {
        boolean signed = (signed2 instanceof Boolean) ? (Boolean) signed2 : false;
        CRC32 crc = new CRC32();
        crc.update(toString(str).getBytes(StandardCharsets.UTF_8));
        long value = crc.getValue(); // unsigned 32-bit
        return signed ? (long) (int) (value) : value;
    }

    // ====================================================
    // Inflate (raw DEFLATE in UTF-8 bytes)
    // ====================================================

    public static Object inflate(Object data) {
        byte[] input = toUtf8(data);
        try (ByteArrayInputStream bais = new ByteArrayInputStream(input);
             InflaterInputStream inflater = new InflaterInputStream(bais);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[4096];
            int n;
            while ((n = inflater.read(buf)) >= 0) baos.write(buf, 0, n);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static String ToHex(byte[] value, boolean prefix) {
        return (prefix ? "0x" : "") + binaryToHex(value);
    }

    // ====================================================
    // Stubs / unimplemented
    // ====================================================

    public static Object axolotl(Object a, Object b, Object c) {
        return ""; // to be implemented
    }

    // ----------------- convenience instance-like wrappers -----------------

    public static String hmac(Object request2, Object secret2, Object algorithm2, String digest, boolean dummy) {
        return Hmac(request2, secret2, algorithm2, digest);
    }

    public static Object hash(Object request2, Object algorithm2, Object digest2) {
        return Hash(request2, algorithm2, digest2);
    }

    public static String rsa(Object request, Object secret, Object alg) {
        return Rsa(request, secret, alg);
    }
}
