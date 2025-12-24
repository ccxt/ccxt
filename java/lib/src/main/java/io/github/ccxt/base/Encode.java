package io.github.ccxt.base;



import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@SuppressWarnings("unchecked")
public final class Encode {

    private Encode() {}

    // ----------------------------
    // base16 / hex
    // ----------------------------

    public static Object base16ToBinary(Object str2) {
        String s = (String) str2;
        return convertHexStringToByteArray(s);
    }

    public static byte[] convertHexStringToByteArray(String hexString) {
        if (hexString.length() % 2 != 0) {
            throw new IllegalArgumentException("The hex string must have an even number of characters.");
        }
        int n = hexString.length() / 2;
        byte[] out = new byte[n];
        for (int i = 0; i < n; i++) {
            int hi = Character.digit(hexString.charAt(i * 2), 16);
            int lo = Character.digit(hexString.charAt(i * 2 + 1), 16);
            if (hi < 0 || lo < 0) throw new IllegalArgumentException("Invalid hex: " + hexString);
            out[i] = (byte) ((hi << 4) + lo);
        }
        return out;
    }

    public static Object remove0xPrefix(Object str2) {
        String s = (String) str2;
        if (s.startsWith("0x")) return s.substring(2);
        return s;
    }

    // ----------------------------
    // base64
    // ----------------------------

    public static String stringToBase64(Object pt) { return StringToBase64(pt); }
    public static String StringToBase64(Object pt) {
        String plain = (String) pt;
        return Base64.getEncoder().encodeToString(plain.getBytes(StandardCharsets.UTF_8));
    }

    public static byte[] base64ToBinary(Object pt) { return Base64ToBinary(pt); }
    public static byte[] Base64ToBinary(Object pt) {
        String s = (String) pt;
        return Base64.getDecoder().decode(s);
    }

    public static String binaryToBase64(byte[] buff) { return BinaryToBase64(buff); }
    public static String BinaryToBase64(byte[] buff) {
        return Base64.getEncoder().encodeToString(buff);
    }

    public static byte[] stringToBinary(String buff) { return StringToBinary(buff); }
    public static byte[] StringToBinary(String buff) {
        return buff.getBytes(StandardCharsets.UTF_8);
    }

    public static String Base64ToBase64Url(String base64, boolean stripPadding) {
        String base64Url = base64.replace('+', '-').replace('/', '_');
        if (stripPadding) base64Url = trimRight(base64Url, '=');
        return base64Url;
    }

    private static String trimRight(String s, char ch) {
        int i = s.length();
        while (i > 0 && s.charAt(i - 1) == ch) i--;
        return (i == s.length()) ? s : s.substring(0, i);
    }

    public static String urlencodeBase64(Object s) { return Base64urlEncode(s); }
    public static String Base64urlEncode(Object s) {
        String str = (s instanceof String)
                ? StringToBase64(s)
                : BinaryToBase64((byte[]) s);
        return trimRight(str, '=').replace('+', '-').replace('/', '_');
    }

    // ----------------------------
    // base58
    // ----------------------------

    public static byte[] base58ToBinary(Object pt) { return Base58ToBinary(pt); }
    public static byte[] Base58ToBinary(Object pt) {
        String s = (String) pt;
        return base58Decode(s);
    }

    // Simple Base58 (Bitcoin alphabet) decoder
    private static final String B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    private static final int[] B58_INDEX = new int[128];
    static {
        Arrays.fill(B58_INDEX, -1);
        for (int i = 0; i < B58_ALPHABET.length(); i++) {
            B58_INDEX[B58_ALPHABET.charAt(i)] = i;
        }
    }
    private static byte[] base58Decode(String input) {
        if (input == null || input.isEmpty()) return new byte[0];

        // Count leading zeros
        int zeros = 0;
        while (zeros < input.length() && input.charAt(zeros) == '1') zeros++;

        // Base58 -> base256
        byte[] b256 = new byte[input.length() * 733 / 1000 + 1];
        int length = 0;
        for (int i = zeros; i < input.length(); i++) {
            int ch = input.charAt(i);
            if (ch >= 128 || B58_INDEX[ch] == -1) throw new IllegalArgumentException("Invalid Base58 char: " + (char) ch);
            int carry = B58_INDEX[ch];
            int j = b256.length - 1;
            for (int k = b256.length - 1; k >= b256.length - length; k--, j--) {
                carry += (b256[k] & 0xFF) * 58;
                b256[k] = (byte) (carry & 0xFF);
                carry >>= 8;
            }
            while (carry > 0) {
                b256[j--] = (byte) (carry & 0xFF);
                carry >>= 8;
                length++;
            }
        }

        // Skip leading zeros in b256
        int idx = b256.length - length;
        while (idx < b256.length && b256[idx] == 0) { idx++; }

        // Result = zeros + the rest
        byte[] res = new byte[zeros + (b256.length - idx)];
        Arrays.fill(res, 0, zeros, (byte) 0);
        System.arraycopy(b256, idx, res, zeros, res.length - zeros);
        return res;
    }

    // ----------------------------
    // binary concat
    // ----------------------------

    public static Object binaryConcat(Object... parts) {
        ArrayList<Byte> out = new ArrayList<>();
        for (Object part : parts) {
            if (part instanceof String s) {
                byte[] bytes = s.getBytes(StandardCharsets.US_ASCII);
                for (byte b : bytes) out.add(b);
            } else if (part instanceof byte[] arr) {
                for (byte b : arr) out.add(b);
            } else {
                throw new IllegalArgumentException("BinaryConcat: Unsupported type, only String and byte[] are allowed.");
            }
        }
        byte[] res = new byte[out.size()];
        for (int i = 0; i < out.size(); i++) res[i] = out.get(i);
        return res;
    }

    public static Object binaryConcatArray(Object arrays2) {
        List<Object> arrays = (List<Object>) arrays2;

        int total = 0;
        List<byte[]> asBytes = new ArrayList<>(arrays.size());
        for (Object item : arrays) {
            byte[] bytesItem = (item instanceof String s)
                    ? s.getBytes(StandardCharsets.US_ASCII)
                    : (byte[]) item;
            asBytes.add(bytesItem);
            total += bytesItem.length;
        }

        byte[] result = new byte[total];
        int offset = 0;
        for (byte[] arr : asBytes) {
            System.arraycopy(arr, 0, result, offset, arr.length);
            offset += arr.length;
        }
        return result;
    }

    // ----------------------------
    // numbers / endian
    // ----------------------------

    public static Object numberToBE(Object n2, Object size2) {
        long n = Long.parseLong(String.valueOf(n2));
        int size = (size2 == null) ? 0 : Integer.parseInt(String.valueOf(size2));
        byte[] bytes = new byte[8];
        for (int i = 7; i >= 0; i--) {
            bytes[i] = (byte) (n & 0xFF);
            n >>= 8;
        }
        if (size <= 0 || size >= 8) return bytes;
        return Arrays.copyOfRange(bytes, 8 - size, 8);
    }

    public static String binaryToHex(byte[] buff) {
        StringBuilder sb = new StringBuilder(buff.length * 2);
        for (byte b : buff) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    public static String binaryToBase16(Object buff2) {
        byte[] buff = (byte[]) buff2;
        return binaryToHex(buff);
    }

    // NOTE: the original C# returned hex here as well; we keep the same behavior.
    public static String binaryToBase58(Object buff2) {
        byte[] buff = (byte[]) buff2;
        return binaryToHex(buff);
    }

    public static String intToBase16(Object number) {
        long n = Long.parseLong(String.valueOf(number));
        return Long.toHexString(n);
    }

    // ----------------------------
    // encode/decode (stubs, like C#)
    // ----------------------------

    public static String encode(Object data) {
        return (String) data;
    }

    public static String decode(Object data) {
        return (String) data;
    }

    // ----------------------------
    // msgpack stub
    // ----------------------------

    public static Object packb(Object data) {
        // MiniMessagePack not available here; make it explicit.
        throw new UnsupportedOperationException("packb: MessagePack encoder not available in this runtime.");
    }

    // ----------------------------
    // url/raw encode helpers
    // ----------------------------

    public static String rawencode(Object parameters1, Object sort) {
        Map<String, Object> parameters = (Map<String, Object>) parameters1;
        List<String> keys = new ArrayList<>(parameters.keySet());
        List<Object> out = new ArrayList<>();
        for (String key : keys) {
            Object value = parameters.get(key);
            if (value instanceof Boolean b) {
                value = String.valueOf(b).toLowerCase(Locale.ROOT);
            } else if (value instanceof Double) {
                value = BigDecimal.valueOf((Double) value).stripTrailingZeros().toPlainString(); // avoid scientific notation
            }
            out.add(key + "=" + String.valueOf(value));
        }
        return String.join("&", out.stream().map(String::valueOf).toArray(String[]::new));
    }

    public static String urlencodeWithArrayRepeat(Object parameters) {
        Map<String, Object> params = (Map<String, Object>) parameters;
        List<String> keys = new ArrayList<>(params.keySet());
        List<String> out = new ArrayList<>();
        for (String key : keys) {
            Object value = params.get(key);
            if (value instanceof List<?> list) {
                for (Object item : list) {
                    out.add(key + "=" + String.valueOf(item));
                }
            } else {
                out.add(key + "=" + String.valueOf(value));
            }
        }
        return String.join("&", out);
    }

    public static String urlencodeNested(Object parameters) {
        Map<String, Object> params = (Map<String, Object>) parameters;
        List<String> keys = new ArrayList<>(params.keySet());
        List<String> parts = new ArrayList<>();

        for (String key : keys) {
            Object value = params.get(key);
            if (value instanceof Map<?, ?> m) {
                Map<String, Object> inner = (Map<String, Object>) m;
                for (String k2 : inner.keySet()) {
                    Object v2 = inner.get(k2);
                    String finalValue = String.valueOf(v2);
                    if (v2 instanceof Boolean) {
                        finalValue = finalValue.toLowerCase(Locale.ROOT);
                    }
                    // keep brackets like the C# HttpUtility output (don’t encode '[' and ']')
                    String composedKey = key + "[" + k2 + "]";
                    parts.add(encodeURIComponent(composedKey) + "=" + encodeURIComponent(finalValue));
                }
            } else {
                parts.add(encodeURIComponent(key) + "=" + encodeURIComponent(String.valueOf(value)));
            }
        }
        return String.join("&", parts);
    }

    public static String urlencode(Object parameters2, boolean... sortParams) {
        boolean sort = (sortParams.length > 0) ? sortParams[0] : false;
        Map<String, Object> parameters = (Map<String, Object>) parameters2;

        List<String> keys = new ArrayList<>(parameters.keySet());
        if (sort) Collections.sort(keys);

        List<String> query = new ArrayList<>();
        for (String key : keys) {
            Object value = parameters.get(key);
            String encodedKey = urlEncode(key);
            String finalValue = String.valueOf(value);
            if (value instanceof Boolean) {
                finalValue = finalValue.toLowerCase(Locale.ROOT);
            } else if (value instanceof Double) {
                finalValue =  BigDecimal
                        .valueOf((Double) value)
                        .stripTrailingZeros()
                        .toPlainString();
            }
            String encodedValue = urlEncode(finalValue);
            if ("timestamp".equalsIgnoreCase(key)) {
                // C# uppercases the percent-escapes for timestamp
                encodedValue = encodedValue.toUpperCase(Locale.ROOT);
            }
            query.add(encodedKey + "=" + encodedValue);
        }
        return String.join("&", query);
    }

    // RFC3986-ish encodeURIComponent (unreserved: A-Z a-z 0-9 - _ . ~)
    public static String encodeURIComponent(Object str2) {
        String str = (String) str2;
        String unreserved = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~[]"; // keep [ ] like C# output
        StringBuilder result = new StringBuilder(str.length() * 3);
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            if (unreserved.indexOf(ch) != -1) {
                result.append(ch);
            } else {
                result.append('%');
                result.append(String.format("%02X", (int) ch));
            }
        }
        return result.toString();
    }

    private static String urlEncode(String s) {
        try {
            // Use standard form-urlencode then fix spaces to %20 (URLEncoder uses '+')
            String enc = URLEncoder.encode(s, "UTF-8");
            return enc.replace("+", "%20");
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}