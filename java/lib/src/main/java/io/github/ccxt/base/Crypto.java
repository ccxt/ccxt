package io.github.ccxt.base;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.PSSParameterSpec;
import java.security.spec.MGF1ParameterSpec;
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

import java.math.BigInteger;
import java.util.HashMap;

import org.bouncycastle.asn1.x9.X9ECParameters;
import org.bouncycastle.asn1.x9.X9IntegerConverter;
import org.bouncycastle.crypto.digests.SHA256Digest;
import org.bouncycastle.crypto.ec.CustomNamedCurves;
import org.bouncycastle.crypto.params.ECDomainParameters;
import org.bouncycastle.crypto.params.ECPrivateKeyParameters;
import org.bouncycastle.crypto.signers.ECDSASigner;
import org.bouncycastle.crypto.signers.HMacDSAKCalculator;
import org.bouncycastle.jcajce.provider.digest.Keccak;
import org.bouncycastle.math.ec.ECAlgorithms;
import org.bouncycastle.math.ec.ECPoint;
import org.bouncycastle.math.ec.FixedPointCombMultiplier;

/**
 * All methods are public static, parameters are Object where appropriate.
 */
@SuppressWarnings("unchecked")
public final class Crypto {

    private Crypto() {}

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

        // If the caller already passed raw bytes, hash those directly.
        // Otherwise treat the value as a string and hash its UTF-8 encoding.
        byte[] input = (request2 instanceof byte[]) ? (byte[]) request2 : toUtf8(request2);

        byte[] signature;
        switch (algorithm) {
            case "sha256": signature = digestBytes("SHA-256", input); break;
            case "sha512": signature = digestBytes("SHA-512", input); break;
            case "sha384": signature = digestBytes("SHA-384", input); break;
            case "sha1":   signature = digestBytes("SHA-1",   input); break;
            case "md5":    signature = digestBytes("MD5",     input); break;
            case "keccak":
            case "sha3":   signature = keccakDigest(input); break;
            default:       throw new IllegalArgumentException("Unsupported hash algo: " + algorithm);
        }

        if ("binary".equals(digest)) return signature;
        return "hex".equals(digest) ? binaryToHex(signature) : BinaryToBase64(signature);
    }

    private static byte[] digestBytes(String algo, byte[] data) {
        try {
            MessageDigest md = MessageDigest.getInstance(algo);
            return md.digest(data);
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
            byte[] sig = rsaSign(token, toString(secret), algorithm, "pkcs1");
            signatureB64Url = Base64ToBase64Url(BinaryToBase64(sig), true);
        } else if ("ES".equals(algoType)) {
            // ES256: sign over P-256 -> r||s then base64url
            byte[] rs = es256Sign(token, toString(secret));
            signatureB64Url = Base64ToBase64Url(BinaryToBase64(rs), true);
        } else if ("Ed".equals(algoType)) {
            // Ed25519
            String base64Sig = toString(Eddsa(token, secret, ed25519()));
            signatureB64Url = Base64ToBase64Url(base64Sig, true);
        } else {
            // HMAC HS256/384/512
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
    // RSA (PKCS#1 v1.5) signing with PEM private key
    // ====================================================

    public static String Rsa(Object data, Object publicKeyPem, Object hash) {
        return Rsa(data, publicKeyPem, hash, "pkcs1");
    }

    public static String Rsa(Object data, Object publicKeyPem, Object hash, Object padding) {
        byte[] sig = rsaSign(toString(data), toString(publicKeyPem), (hash == null ? "md5" : toString(hash)), (padding == null ? "pkcs1" : toString(padding)));
        return BinaryToBase64(sig);
    }

    private static byte[] rsaSign(String data, String pemPrivateKey, String hashAlgo, String padding) {
        try {
            PrivateKey key = readRSAPrivateKeyFromPem(pemPrivateKey);
            if ("pss".equals(padding)) {
                String mdName;
                MGF1ParameterSpec mgf;
                int saltLen;
                switch (hashAlgo) {
                    case "sha1"   -> { mdName = "SHA-1";   mgf = MGF1ParameterSpec.SHA1;   saltLen = 20; }
                    case "sha256" -> { mdName = "SHA-256"; mgf = MGF1ParameterSpec.SHA256; saltLen = 32; }
                    case "sha384" -> { mdName = "SHA-384"; mgf = MGF1ParameterSpec.SHA384; saltLen = 48; }
                    case "sha512" -> { mdName = "SHA-512"; mgf = MGF1ParameterSpec.SHA512; saltLen = 64; }
                    default       -> throw new IllegalArgumentException("Invalid PSS hash algorithm name: " + hashAlgo);
                }
                Signature sig = Signature.getInstance("RSASSA-PSS");
                sig.setParameter(new PSSParameterSpec(mdName, "MGF1", mgf, saltLen, 1));
                sig.initSign(key);
                sig.update(toUtf8(data));
                return sig.sign();
            }
            String jce = switch (hashAlgo) {
                case "sha1"   -> "SHA1withRSA";
                case "sha256" -> "SHA256withRSA";
                case "sha384" -> "SHA384withRSA";
                case "sha512" -> "SHA512withRSA";
                case "md5"    -> "MD5withRSA";
                default       -> throw new IllegalArgumentException("Invalid hash algorithm name: " + hashAlgo);
            };
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
    // ES256 JWT signing (P-256 ECDSA)
    // Returns raw 64-byte r||s (IEEE P1363 format)
    // ====================================================

    static byte[] es256Sign(String token, String pem) {
        try {
            PrivateKey key = ecP256PrivateKeyFromPem(pem);
            Signature sig = Signature.getInstance("SHA256withECDSAinP1363Format");
            sig.initSign(key);
            sig.update(token.getBytes(StandardCharsets.US_ASCII));
            return sig.sign();
        } catch (Exception e) {
            throw new RuntimeException("ES256 signing failed: " + e.getMessage(), e);
        }
    }

    private static PrivateKey ecP256PrivateKeyFromPem(String pem) throws Exception {
        if (pem == null) throw new IllegalArgumentException("pem is null");
        String p = pem.trim();
        if (!p.isEmpty() && p.charAt(0) == '\uFEFF') p = p.substring(1);

        byte[] pkcs8;
        if (!p.contains("-----BEGIN")) {
            // raw base64 PKCS#8
            pkcs8 = Base64.getMimeDecoder().decode(p);
        } else if (p.contains("-----BEGIN PRIVATE KEY-----")) {
            pkcs8 = decodePemBody(p, "-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----");
        } else if (p.contains("-----BEGIN EC PRIVATE KEY-----")) {
            // SEC1 -> wrap into PKCS#8 with P-256 OID
            byte[] sec1 = decodePemBody(p, "-----BEGIN EC PRIVATE KEY-----", "-----END EC PRIVATE KEY-----");
            pkcs8 = wrapSec1EcP256ToPkcs8(sec1);
        } else {
            throw new IllegalArgumentException("Unsupported PEM type (expected PKCS#8 or SEC1 EC private key).");
        }
        return KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(pkcs8));
    }

    /**
     * Wrap a SEC1 ECPrivateKey DER (RFC 5915) into PKCS#8 PrivateKeyInfo with the
     * prime256v1 (P-256) named-curve AlgorithmIdentifier.
     */
    private static byte[] wrapSec1EcP256ToPkcs8(byte[] sec1Der) {
        // AlgorithmIdentifier: SEQUENCE { OID id-ecPublicKey (1.2.840.10045.2.1),
        //                                 OID prime256v1   (1.2.840.10045.3.1.7) }
        byte[] algId = new byte[] {
                0x30, 0x13,
                0x06, 0x07, 0x2A, (byte)0x86, 0x48, (byte)0xCE, 0x3D, 0x02, 0x01,
                0x06, 0x08, 0x2A, (byte)0x86, 0x48, (byte)0xCE, 0x3D, 0x03, 0x01, 0x07
        };
        byte[] version = new byte[] { 0x02, 0x01, 0x00 };
        byte[] privateKeyOctetString = derOctetString(sec1Der);
        byte[] seqContent = concat(version, algId, privateKeyOctetString);
        return derSequence(seqContent);
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
            // P-256 compact signatures / recovery id (v) are not implemented (0 callers in ccxt)
            throw new UnsupportedOperationException("ecdsa supports secp256k1 only (p256 not supported)");
        }

        byte[] msg = toBytes(request);
        BigInteger privKey = toPrivateKey(secret);

        if (hash != null) {
            // msg = (byte[])Hash(msg, hash, "binary");
            // for now assume sha256 check it later
            if (!"sha256".equals(hash)) {
                throw new IllegalArgumentException("Only sha256 is supported for now");
            }
            msg = sha256(msg);
        } else {

            // convert msg from hex to binary
            msg = hexToBytes(toString(request));
        }

        BigInteger[] sig = secp256k1SignRecoverable(msg, privKey);

        Map<String, Object> out = new HashMap<>();
        // web3j emitted Numeric.toHexString(32-byte padded r/s) minus the 0x prefix, i.e. 64 lowercase hex chars
        out.put("r", leftPadHex(sig[0].toString(16), 64));
        out.put("s", leftPadHex(sig[1].toString(16), 64));
        out.put("v", sig[2].intValue());
        return out;
    }

    // ====================================================
    // secp256k1 via BouncyCastle lightweight API (replaces org.web3j:crypto)
    //
    // web3j's Sign.signMessage(msg, keyPair, false) was exactly:
    //   ECDSASigner(HMacDSAKCalculator(SHA256Digest))  -> RFC 6979 deterministic k
    //   ECDSASignature.toCanonicalised()               -> low-s (s <= n/2)
    //   recId = first i in 0..3 with recover(i, sig, msg) == pubkey
    // The recId is computed here from the R point directly (parity of R.y, plus 2 when
    // R.x >= n) and flipped when s is negated for low-s. This is the closed form of the
    // recovery loop and yields the same value; a recovery round-trip guards it below.
    // ====================================================

    private static final X9ECParameters SECP256K1_X9 = CustomNamedCurves.getByName("secp256k1");
    private static final ECDomainParameters SECP256K1 = new ECDomainParameters(
            SECP256K1_X9.getCurve(), SECP256K1_X9.getG(), SECP256K1_X9.getN(), SECP256K1_X9.getH());
    private static final BigInteger SECP256K1_HALF_N = SECP256K1.getN().shiftRight(1);

    /** Returns { r, s, recId } with RFC 6979 k, low-s canonical form and recId in 0..3. */
    public static BigInteger[] secp256k1SignRecoverable(byte[] msgHash, BigInteger privKey) {
        BigInteger n = SECP256K1.getN();
        ECDSASigner signer = new ECDSASigner(new HMacDSAKCalculator(new SHA256Digest()));
        signer.init(true, new ECPrivateKeyParameters(privKey, SECP256K1));
        BigInteger[] rs = signer.generateSignature(msgHash);
        BigInteger r = rs[0];
        BigInteger s = rs[1];
        if (s.compareTo(SECP256K1_HALF_N) > 0) {
            s = n.subtract(s);
        }
        // recover the public key for each candidate recId; the first match is web3j's choice
        ECPoint q = secp256k1PublicPoint(privKey);
        int recId = -1;
        for (int i = 0; i < 4; i++) {
            ECPoint k = secp256k1Recover(i, r, s, msgHash);
            if (k != null && k.equals(q)) {
                recId = i;
                break;
            }
        }
        if (recId == -1) {
            throw new RuntimeException("Could not construct a recoverable key. Are your credentials valid?");
        }
        return new BigInteger[] { r, s, BigInteger.valueOf(recId) };
    }

    /** Q = d * G (mirrors web3j Sign.publicPointFromPrivate incl. the bitLength > n reduction). */
    static ECPoint secp256k1PublicPoint(BigInteger privKey) {
        BigInteger n = SECP256K1.getN();
        if (privKey.bitLength() > n.bitLength()) {
            privKey = privKey.mod(n);
        }
        return new FixedPointCombMultiplier().multiply(SECP256K1.getG(), privKey).normalize();
    }

    /** Public key as 64 raw bytes (X || Y) — web3j Sign.publicKeyFromPrivate returned this as a BigInteger. */
    static byte[] secp256k1PublicKeyBytes(BigInteger privKey) {
        byte[] encoded = secp256k1PublicPoint(privKey).getEncoded(false); // 0x04 || X || Y
        return java.util.Arrays.copyOfRange(encoded, 1, encoded.length);
    }

    /** SEC 1 §4.1.6 public key recovery, as in web3j Sign.recoverFromSignature; null when the candidate is invalid. */
    private static ECPoint secp256k1Recover(int recId, BigInteger r, BigInteger s, byte[] msgHash) {
        BigInteger n = SECP256K1.getN();
        BigInteger i = BigInteger.valueOf((long) recId / 2);
        BigInteger x = r.add(i.multiply(n));
        BigInteger prime = SECP256K1.getCurve().getField().getCharacteristic(); // == SecP256K1Curve.q
        if (x.compareTo(prime) >= 0) {
            return null;
        }
        X9IntegerConverter x9 = new X9IntegerConverter();
        byte[] compEnc = x9.integerToBytes(x, 1 + x9.getByteLength(SECP256K1.getCurve()));
        compEnc[0] = (byte) ((recId & 1) == 1 ? 0x03 : 0x02);
        ECPoint R = SECP256K1.getCurve().decodePoint(compEnc);
        if (!R.multiply(n).isInfinity()) {
            return null;
        }
        BigInteger e = new BigInteger(1, msgHash);
        BigInteger eInv = BigInteger.ZERO.subtract(e).mod(n);
        BigInteger rInv = r.modInverse(n);
        BigInteger srInv = rInv.multiply(s).mod(n);
        BigInteger eInvrInv = rInv.multiply(eInv).mod(n);
        return ECAlgorithms.sumOfTwoMultiplies(SECP256K1.getG(), eInvrInv, R, srInv).normalize();
    }

    /** keccak256(X || Y)[12..32] as 40 lowercase hex chars, no 0x — mirrors web3j Keys.getAddress. */
    public static String secp256k1EthAddress(BigInteger privKey) {
        byte[] hash = keccakDigest(secp256k1PublicKeyBytes(privKey));
        return binaryToHex(java.util.Arrays.copyOfRange(hash, 12, hash.length));
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

    // ====================================================
    // EdDSA (Ed25519)
    // ====================================================

    public static Object Eddsa(Object request, Object secret, Object alg) {
        try {
            byte[] msg = (request instanceof String) ? toUtf8(request) : (byte[]) request;
            byte[] seed = extractEd25519Seed(secret);

            // Build PKCS#8 DER encoding for the 32-byte Ed25519 seed.
            // PKCS#8 wraps the raw seed in ASN.1: SEQUENCE { SEQUENCE { OID 1.3.101.112 }, OCTET STRING { OCTET STRING { seed } } }
            byte[] pkcs8 = new byte[48];
            byte[] prefix = {
                0x30, 0x2e,                   // SEQUENCE (46 bytes)
                0x02, 0x01, 0x00,             // INTEGER 0 (version)
                0x30, 0x05,                   // SEQUENCE (5 bytes)
                0x06, 0x03, 0x2b, 0x65, 0x70, // OID 1.3.101.112 (Ed25519)
                0x04, 0x22,                   // OCTET STRING (34 bytes)
                0x04, 0x20                    // OCTET STRING (32 bytes) - the seed
            };
            System.arraycopy(prefix, 0, pkcs8, 0, prefix.length);
            System.arraycopy(seed, 0, pkcs8, prefix.length, 32);

            java.security.KeyFactory kf = java.security.KeyFactory.getInstance("Ed25519");
            java.security.PrivateKey privateKey = kf.generatePrivate(new java.security.spec.PKCS8EncodedKeySpec(pkcs8));

            java.security.Signature sig = java.security.Signature.getInstance("Ed25519");
            sig.initSign(privateKey);
            sig.update(msg);
            byte[] signature = sig.sign();
            return Base64.getEncoder().encodeToString(signature);
        } catch (Exception e) {
            throw new RuntimeException("Ed25519 signing failed: " + e.getMessage(), e);
        }
    }

    /**
     * Extract the 32-byte Ed25519 seed from various secret formats:
     * - byte[] of exactly 32 bytes: used directly
     * - byte[] longer than 32: take last 32 bytes (common PEM/PKCS#8 format)
     * - String: base64 decode, then take last 32 bytes (matches TS: Base64.unarmor(secret).slice(16))
     */
    private static byte[] extractEd25519Seed(Object secret) {
        byte[] raw;
        if (secret instanceof byte[] b) {
            raw = b;
        } else if (secret instanceof String s) {
            // Accept PEM-armored PKCS#8 (the common shape: -----BEGIN PRIVATE KEY-----\n...base64...\n-----END PRIVATE KEY-----)
            // alongside raw base64. Without the PEM branch the literal hyphens in the
            // armor lines trip Base64.getDecoder() with "Illegal base64 character 2d".
            if (s.contains("-----BEGIN PRIVATE KEY-----")) {
                raw = decodePemBody(s, "-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----");
            } else if (s.contains("-----BEGIN EC PRIVATE KEY-----")) {
                raw = decodePemBody(s, "-----BEGIN EC PRIVATE KEY-----", "-----END EC PRIVATE KEY-----");
            } else if (s.contains("-----BEGIN RSA PRIVATE KEY-----")) {
                raw = decodePemBody(s, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----");
            } else {
                // Plain base64; tolerate optional whitespace/newlines callers may have left in.
                raw = Base64.getMimeDecoder().decode(s);
            }
        } else if (secret instanceof java.util.List<?> list) {
            // arraySlice returns List<Byte> — convert to byte[]
            raw = new byte[list.size()];
            for (int i = 0; i < list.size(); i++) {
                Object elem = list.get(i);
                if (elem instanceof Number n) raw[i] = n.byteValue();
            }
        } else {
            throw new IllegalArgumentException("Ed25519 secret must be byte[], base64 String, or List<Byte>, got: " + secret.getClass().getName());
        }
        if (raw.length == 32) {
            return raw;
        }
        if (raw.length > 32) {
            // Extract last 32 bytes (seed portion of PKCS#8 or PEM-decoded key)
            byte[] seed = new byte[32];
            System.arraycopy(raw, raw.length - 32, seed, 0, 32);
            return seed;
        }
        throw new IllegalArgumentException("Ed25519 secret too short: " + raw.length + " bytes (need 32)");
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

    // ----------------- convenience instance-like wrappers -----------------

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


    public static String ethGetAddressFromPrivateKey(Object privateKey) {
        BigInteger priv = toPrivateKeyBigInt(privateKey);

        // Returns 40 hex chars, no 0x, lower-case
        String addressNoPrefix = secp256k1EthAddress(priv);

        return "0x" + addressNoPrefix;
    }

    private static BigInteger toPrivateKeyBigInt(Object privateKey) {
        if (privateKey == null) {
            throw new IllegalArgumentException("privateKey is null");
        }

        if (privateKey instanceof BigInteger bi) {
            return bi;
        }

        if (privateKey instanceof byte[] bytes) {
            if (bytes.length != 32) {
                throw new IllegalArgumentException("privateKey byte[] must be 32 bytes. Got: " + bytes.length);
            }
            return new BigInteger(1, bytes);
        }

        // Treat everything else as string
        String s = String.valueOf(privateKey).trim();
        if (s.startsWith("0x") || s.startsWith("0X")) {
            s = s.substring(2);
        }

        if (s.isEmpty()) {
            throw new IllegalArgumentException("privateKey is empty");
        }

        // If you want to allow shorter hex keys, you can left-pad to 64 chars:
        // s = Numeric.toHexStringNoPrefixZeroPadded(new BigInteger(s, 16), 64);

        if (s.length() != 64) {
            throw new IllegalArgumentException("privateKey hex must be 64 chars (32 bytes). Got: " + s.length());
        }

        // Safe parse (unsigned)
        return new BigInteger(s, 16);
    }

    // Optional: if you want checksummed output (EIP-55)
    public static String ethGetChecksumAddressFromPrivateKey(Object privateKey) {
        BigInteger priv = toPrivateKeyBigInt(privateKey);
        String lower = secp256k1EthAddress(priv);
        // EIP-55: uppercase hex digit i when nibble i of keccak256(lowercase address) >= 8
        String hash = binaryToHex(keccakDigest(lower.getBytes(StandardCharsets.US_ASCII)));
        StringBuilder sb = new StringBuilder("0x");
        for (int i = 0; i < lower.length(); i++) {
            char c = lower.charAt(i);
            sb.append(Character.digit(hash.charAt(i), 16) >= 8 ? Character.toUpperCase(c) : c);
        }
        return sb.toString();
    }
}
