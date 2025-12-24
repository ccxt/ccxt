package io.github.ccxt.base;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.zip.CRC32;
import java.util.zip.InflaterInputStream;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

// import org.bouncycastle.asn1.sec.SECNamedCurves;
// import org.bouncycastle.asn1.x9.X9ECParameters;
// import org.bouncycastle.crypto.digests.SHA256Digest;
// import org.bouncycastle.crypto.params.ECDomainParameters;
// import org.bouncycastle.crypto.params.ECPrivateKeyParameters;
// import org.bouncycastle.crypto.signers.ECDSASigner;
// import org.bouncycastle.crypto.signers.HMacDSAKCalculator;
// import org.bouncycastle.math.ec.ECAlgorithms;
// import org.bouncycastle.math.ec.ECPoint;
// import org.bouncycastle.math.ec.custom.sec.SecP256K1Curve;
// import org.bouncycastle.util.BigIntegers;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

import org.bouncycastle.jcajce.provider.digest.Keccak;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

/**
 * All methods are public static, parameters are Object where appropriate.
 */
@SuppressWarnings("unchecked")
public final class Crypto {

    private Crypto() {}

    // Ensure BC provider once
    static {
        // if (Security.getProvider("BC") == null) {
        //     Security.addProvider(new BouncyCastleProvider());
        // }
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

        if (digest == null) {
            digest = "hex"; // default
        }

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
        // throw new UnsupportedOperationException("Keccak not implemented");
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
            // byte[] rs = Hex.decode(rHex + sHex);
            throw new UnsupportedOperationException("ES256 signing not implemented");
            // signatureB64Url = Base64ToBase64Url(BinaryToBase64(rs), true);
        } else if ("Ed".equals(algoType)) {
            // Ed25519
            String base64Sig = toString(Eddsa(token, secret, ed25519()));
            signatureB64Url = Base64ToBase64Url(base64Sig, true);
        } else {
            // HMAC HS256/384/512
            String bin = toString(Hmac(token, secret, algorithm, "binary"));
            // Hmac(...,"binary") above returns byte[] in C#, here we returned hex/base64.
            // So call Hmac again but fetch raw bytes:
            byte[] sig = hmacRaw(alg, token, secret);
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
        if (pem == null) throw new IllegalArgumentException("pem is null");

        String p = pem.trim();
        // Strip UTF-8 BOM if present
        if (!p.isEmpty() && p.charAt(0) == '\uFEFF') p = p.substring(1);

        byte[] der;

        // Raw base64 support (assume it's PKCS#8 DER)
        if (!p.contains("-----BEGIN")) {
            der = Base64.getMimeDecoder().decode(p);
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
        }

        if (p.contains("-----BEGIN PRIVATE KEY-----")) {
            // PKCS#8
            der = decodePemBody(p, "-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----");
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
        }

        if (p.contains("-----BEGIN RSA PRIVATE KEY-----")) {
            // PKCS#1 -> wrap into PKCS#8
            byte[] pkcs1 = decodePemBody(p, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----");
            byte[] pkcs8 = wrapPkcs1RsaToPkcs8(pkcs1);
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(pkcs8));
        }

        throw new IllegalArgumentException("Unsupported PEM type (expected PKCS#8 or PKCS#1 RSA private key).");
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

        if (curveName.equals("p256")) {
            // web3j does not support P-256 compact signatures / recovery id (v)
            throw new UnsupportedOperationException("web3j-only implementation supports secp256k1 only (p256 not supported)");
        }

        byte[] msg = toBytes(request);
        BigInteger privKey = toPrivateKey(secret);

        if (hash != null) {
            // msg = (byte[])Hash(msg, hash, "binary");
            // for now assume sha256 check it later
            if (hash != "sha256") {
                throw new IllegalArgumentException("Only sha256 is supported for now");
            }
            msg = sha256(msg);
        } else {

            // convert msg from hex to binary
            msg = hexToBytes(toString(request));
        }

        ECKeyPair keyPair = ECKeyPair.create(privKey);

        Sign.SignatureData sig = Sign.signMessage(msg, keyPair, false);

        int vOut = sig.getV()[0] & 0xFF;
        int recoveryV = vOut - 27;
        Map<String, Object> out = new HashMap<>();
        out.put("r", Numeric.toHexString(sig.getR()).replaceAll("0x", "")   );
        out.put("s", Numeric.toHexString(sig.getS()).replaceAll("0x", "")   );
        out.put("v", recoveryV);
        return out;
    }

    private static String bytesToHex(byte[] bytes) {
        char[] hexArray = "0123456789abcdef".toCharArray();
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }


    private static byte[] sha256(byte[] msg) {
        try {
            var md = java.security.MessageDigest.getInstance("SHA-256");
            return md.digest(msg);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static byte[] toBytes(Object request) {
        Object v = (request);
        if (v == null) return new byte[0];
        if (v instanceof byte[] b) return b;
        if (v instanceof String s) return s.getBytes(StandardCharsets.UTF_8);
        return String.valueOf(v).getBytes(StandardCharsets.UTF_8);
    }

    private static BigInteger toPrivateKey(Object secret) {
        Object v = (secret);
        if (v instanceof BigInteger bi) return bi;
        if (v instanceof byte[] b) return new BigInteger(1, b);
        if (v instanceof String s) {
            String t = s.trim();
            if (t.startsWith("0x")) return new BigInteger(t.substring(2), 16);
            if (t.matches("^[0-9a-fA-F]+$")) return new BigInteger(t, 16);
            if (t.matches("^[0-9]+$")) return new BigInteger(t, 10);
        }
        throw new IllegalArgumentException("Unsupported secret type: " + (v == null ? "null" : v.getClass().getName()));
    }

    private static KeyPair ecKeyPairFromRaw(String curveStdName, byte[] privBytes) throws Exception {
        // var params = ECNamedCurveTable.getParameterSpec(curveStdName);
        // KeyFactory kf = KeyFactory.getInstance("EC", "BC");
        // ECParameterSpec jSpec = new ECParameterSpec(
        //         params.getCurve(), params.getG(), params.getN(), params.getH(), params.getSeed()
        // );
        // ECPrivateKeySpec privSpec = new ECPrivateKeySpec(new java.math.BigInteger(1, privBytes), jSpec);
        // PrivateKey priv = kf.generatePrivate(privSpec);

        // // Derive public key Q = d*G
        // ECPoint Q = params.getG().multiply(new java.math.BigInteger(1, privBytes)).normalize();
        // ECPublicKeySpec pubSpec = new ECPublicKeySpec(
        //         new java.security.spec.ECPoint(Q.getAffineXCoord().toBigInteger(), Q.getAffineYCoord().toBigInteger()),
        //         jSpec
        // );
        // PublicKey pub = kf.generatePublic(pubSpec);
        // return new KeyPair(pub, priv);
        throw new UnsupportedOperationException("ECDSA key pair generation not implemented");
    }

    private static String leftPadHex(String s, int len) {
        if (s.length() >= len) return s;
        StringBuilder sb = new StringBuilder(len);
        for (int i = s.length(); i < len; i++) sb.append('0');
        sb.append(s);
        return sb.toString();
    }

    private static byte[] hexToBytes(String hex) {
        // return Hex.decode(hex.replaceFirst("^0x", ""));
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                                 + Character.digit(hex.charAt(i+1), 16));
        }
        return data;
    }

    public static String ByteArrayToString(byte[] ba) {
        return binaryToHex(ba).toUpperCase(Locale.ROOT);
    }

    // ====================================================
    // EdDSA (Ed25519)
    // ====================================================

    public static Object Eddsa(Object request, Object secret, Object alg) {
        // // alg kept for parity; only ed25519 supported here
        // byte[] msg = (request instanceof String) ? toUtf8(request) : (byte[]) request;

        // Ed25519Signer signer = new Ed25519Signer();
        // Ed25519PrivateKeyParameters priv;
        // if (secret instanceof String s) {
        //     // accept raw base64 PEM body or full PEM
        //     String pem = s.startsWith("-----BEGIN") ? s : "-----BEGIN PRIVATE KEY-----\n" + s + "\n-----END PRIVATE KEY-----";
        //     try (PEMParser parser = new PEMParser(new StringReader(pem))) {
        //         Object obj = parser.readObject();
        //         if (obj instanceof PEMKeyPair pkp) {
        //             PrivateKeyInfo pki = pkp.getPrivateKeyInfo();
        //             byte[] keyBytes = pki.parsePrivateKey().toASN1Primitive().getEncoded();
        //             // Ed25519PrivateKeyParameters expects 32-byte seed; try to extract
        //             // BouncyCastle encodes PKCS#8 – rely on constructor parsing:
        //             priv = new Ed25519PrivateKeyParameters(pki.parsePrivateKey().toASN1Primitive().getEncoded(), 0);
        //         } else if (obj instanceof PrivateKeyInfo pki) {
        //             priv = new Ed25519PrivateKeyParameters(pki.parsePrivateKey().toASN1Primitive().getEncoded(), 0);
        //         } else {
        //             throw new IllegalArgumentException("Unsupported Ed25519 PEM");
        //         }
        //     } catch (IOException e) {
        //         throw new RuntimeException(e);
        //     }
        // } else {
        //     priv = new Ed25519PrivateKeyParameters((byte[]) secret, 0);
        // }

        // signer.init(true, priv);
        // signer.update(msg, 0, msg.length);
        // byte[] sig = signer.generateSignature();
        // return Base64.getEncoder().encodeToString(sig);
//        throw new UnsupportedOperationException("Ed25519 signing not implemented");
        byte[] res = {}; // dummy for now implement it later todo
        return "";
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

    private static byte[] decodePemBody(String pem, String begin, String end) {
        int i = pem.indexOf(begin);
        int j = pem.indexOf(end);
        if (i < 0 || j < 0 || j <= i) {
            throw new IllegalArgumentException("Invalid PEM: missing " + begin + " / " + end);
        }
        String base64 = pem.substring(i + begin.length(), j).replaceAll("\\s+", "");
        return Base64.getMimeDecoder().decode(base64);
    }

    /**
     * Build PKCS#8 PrivateKeyInfo DER for RSA:
     *
     * PrivateKeyInfo ::= SEQUENCE {
     *   version                   INTEGER (0),
     *   privateKeyAlgorithm       AlgorithmIdentifier (rsaEncryption OID + NULL),
     *   privateKey                OCTET STRING (PKCS#1 RSAPrivateKey DER)
     * }
     */
    private static byte[] wrapPkcs1RsaToPkcs8(byte[] pkcs1Der) {
        // AlgorithmIdentifier for rsaEncryption: OID 1.2.840.113549.1.1.1 + NULL
        // DER: 30 0D 06 09 2A 86 48 86 F7 0D 01 01 01 05 00
        byte[] algId = new byte[] {
                0x30, 0x0D,
                0x06, 0x09,
                0x2A, (byte)0x86, 0x48, (byte)0x86, (byte)0xF7, 0x0D, 0x01, 0x01, 0x01,
                0x05, 0x00
        };

        byte[] version = new byte[] { 0x02, 0x01, 0x00 }; // INTEGER 0

        byte[] privateKeyOctetString = derOctetString(pkcs1Der);

        byte[] seqContent = concat(version, algId, privateKeyOctetString);
        return derSequence(seqContent);
    }

    private static byte[] derSequence(byte[] content) {
        return derWrap((byte) 0x30, content);
    }

    private static byte[] derOctetString(byte[] content) {
        return derWrap((byte) 0x04, content);
    }

    private static byte[] derWrap(byte tag, byte[] content) {
        byte[] len = derLength(content.length);
        byte[] out = new byte[1 + len.length + content.length];
        out[0] = tag;
        System.arraycopy(len, 0, out, 1, len.length);
        System.arraycopy(content, 0, out, 1 + len.length, content.length);
        return out;
    }

    private static byte[] derLength(int length) {
        if (length < 0) throw new IllegalArgumentException("Negative length");
        if (length < 128) {
            return new byte[] { (byte) length };
        }
        int tmp = length;
        int numBytes = 0;
        while (tmp > 0) {
            tmp >>= 8;
            numBytes++;
        }
        byte[] out = new byte[1 + numBytes];
        out[0] = (byte) (0x80 | numBytes);
        for (int i = numBytes; i > 0; i--) {
            out[i] = (byte) (length & 0xFF);
            length >>= 8;
        }
        return out;
    }

    private static byte[] concat(byte[]... parts) {
        int n = 0;
        for (byte[] p : parts) n += p.length;
        byte[] out = new byte[n];
        int off = 0;
        for (byte[] p : parts) {
            System.arraycopy(p, 0, out, off, p.length);
            off += p.length;
        }
        return out;
    }
}
