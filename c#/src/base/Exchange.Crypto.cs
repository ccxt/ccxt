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
        var secretBytes = Encoding.ASCII.GetBytes((string)secret2);

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
