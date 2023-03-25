using System.Text;
using System.Security.Cryptography;

namespace Main;


public partial class Exchange
{

    public string sha1() => "sha1";
    public string sha256() => "sha256";
    public string sha384() => "sha384";
    public string sha512() => "sha512";
    public string md5() => "md5";
    public string ed25519() => "ed25519";
    public string keccak() => "keccak";
    public string hmac(object request2, object secret2, Delegate algorithm2 = null, string digest = "hex")
    {
        var request = request2 as String;
        var secretBytes = secret2 as byte[];
        // var secretBytes = Encoding.UTF8.GetBytes(secret);

        var algorithm = "md5";
        if (algorithm2 != null)
        {
            algorithm = algorithm2.DynamicInvoke() as String;
        }

        var signature = new Byte[] { };
        switch (algorithm)
        {
            case "sha256":
                signature = SignHMACSHA256(request, secretBytes);
                break;
            case "sha512":
                signature = SignHMACSHA512(request, secretBytes);
                break;
            case "sha384":
                signature = SignHMACSHA384(request, secretBytes);
                break;
        }

        return digest == "hex" ? binaryToHex(signature) : binaryToBase64(signature);
    }

    public string hash(object request2, object algorithm2 = null, object digest2 = null)
    {
        var request = request2 as String;
        var algorithm = algorithm2 as String;
        digest2 ??= "hex";
        var digest = digest2 as String;
        var signature = new Byte[] { };
        switch (algorithm)
        {
            case "sha256":
                signature = SignSHA256(request);
                break;
            case "sha512":
                signature = SignSHA512(request);
                break;
            case "sha384":
                signature = SignSHA384(request);
                break;
        }

        return digest == "hex" ? binaryToHex(signature) : binaryToBase64(signature);
    }

    public string encode(object data)
    {
        return (string)data; // stub for python
    }

    public string decode(object data)
    {
        return (string)data; // stub for python
    }

    public string jwt(object data, object secret, object alg = null, bool isRsa = false)
    {
        alg ??= "HS256";
        return (string)data; // stub for python
    }

    public static byte[] SignSHA256Bytes(string data)
    {
        using var encryptor = SHA256.Create();
        return encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
    }

    public static byte[] SignSHA256(string data)
    {
        using var encryptor = SHA256.Create();
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static byte[] SignSHA384(string data)
    {
        using var encryptor = SHA384.Create();
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static byte[] SignSHA512(string data)
    {
        using var encryptor = SHA512.Create();
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static byte[] SignMD5(string data)
    {
        using var encryptor = MD5.Create();
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static byte[] SignHMACSHA256(string data, byte[] secret)
    {
        using var encryptor = new HMACSHA256(secret);
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static byte[] SignHMACSHA384(string data, byte[] secret)
    {
        using var encryptor = new HMACSHA384(secret);
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static byte[] SignHMACSHA512(string data, byte[] secret)
    {
        using var encryptor = new HMACSHA512(secret);
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static string binaryToHex(byte[] buff)
    {
        var result = string.Empty;
        foreach (var t in buff)
            result += t.ToString("X2");
        // return result;
        return result.ToLower();// check this
    }

    public string binaryToBase16(object buff2)
    {
        var buff = (byte[])buff2;
        return binaryToHex(buff);
    }

    public static string binaryToBase64(byte[] buff)
    {
        return Convert.ToBase64String(buff);
    }

    public byte[] stringToBinary(string buff)
    {
        return Encoding.UTF8.GetBytes(buff);
    }

    public string stringToBase64(object pt)
    {
        var plainText = (string)pt;
        var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
        return System.Convert.ToBase64String(plainTextBytes);
    }

    public string base64ToBinary(object pt)
    {
        // check this
        var plainText = (string)pt;
        var base64EncodedBytes = System.Convert.FromBase64String(plainText);
        return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
    }

    public string base58ToBinary(object str)
    {
        return (string)str; // stub
    }

    public object binaryConcat(object a, object b)
    {
        return (string)a + (string)b; // stub
    }

    public object binaryConcatArray(object a)
    {
        return (string)a; // stub
    }

    public object numberToBE(object n, object padding = null)
    {
        // implement number to big endian
        return (string)n; // stub
    }

    // public object binaryToBase16(object buff)
    // {
    //     return (string)buff; // stub
    // }

    public string rsa(object request, object secret, object alg = null)
    {
        alg ??= "RS256";
        return String.Empty;
        // stub

    }

    public string ecdsa(object request, object secret, object alg = null)
    {
        alg ??= "ES256";
        return String.Empty;
        // stub
    }

    public object base16ToBinary(object str)
    {
        return (string)str; // stub
    }

    public object remove0xPrefix(object str)
    {
        return (string)str; // stub
    }

    public object signMessageString(object str, object privateKey = null)
    {
        return (string)str; // stub
    }

    public ObjectDisposedException eddsa(object request, object secret, object alg = null)
    {
        alg ??= "EdDSA";
        return null;
        // stub
    }
}
