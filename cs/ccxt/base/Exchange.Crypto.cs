using System.Text;
using System.Security.Cryptography;
using System.IO.Compression;
using Cryptography.ECDSA;
using Nethereum.Util;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Crypto.Signers;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace ccxt;

public partial class Exchange
{

    public static string sha1() => "sha1";
    public static string sha256() => "sha256";
    public static string sha384() => "sha384";
    public static string sha512() => "sha512";
    public static string md5() => "md5";
    public static string ed25519() => "ed25519";
    public static string keccak() => "keccak";
    public static string secp256k1() => "secp256k1";

    public static string p256() => "p256";

    public static string Hmac(object request2, object secret2, Delegate algorithm2 = null, string digest = "hex")
    {
        Byte[] request;
        if (request2 is String)
        {
            request = Encoding.UTF8.GetBytes((string)request2);
        }
        else
        {
            request = request2 as Byte[];
        }

        Byte[] secretBytes;
        if (secret2 is String)
        {
            secretBytes = Encoding.UTF8.GetBytes((string)secret2);
        }
        else
        {
            secretBytes = secret2 as Byte[];
        }
        // var secretBytes = Encoding.ASCII.GetBytes((string)secret2);

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
            case "md5":
                signature = SignHMACMD5(request, secretBytes);
                break;
        }

        return digest == "hex" ? binaryToHex(signature) : Exchange.BinaryToBase64(signature);
    }

    public string hmac(object request2, object secret2, Delegate algorithm2 = null, string digest = "hex") => Hmac(request2, secret2, algorithm2, digest);

    public object hash(object request2, Delegate algorithm2 = null, object digest2 = null) => Hash(request2, algorithm2, digest2);

    public static object Hash(object request2, Delegate hash = null, object digest2 = null)
    {
        var request = request2 as String;
        var algorithm = hash.DynamicInvoke() as string;
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
            case "sha1":
                signature = SignSHA1(request);
                break;
            case "md5":
                signature = SignMD5(request);
                break;
            case "keccak":
                signature = SignKeccak(request2);
                break;
            case "sha3":
                signature = SignKeccak(request);
                break;
        }
        if (digest == "binary")
        {
            return signature;
        }
        return digest == "hex" ? binaryToHex(signature) : Exchange.BinaryToBase64(signature);
    }

    private static byte[] HashBytes(object request2, Delegate hash = null)
    {
        var request = request2 as String;
        var algorithm = hash.DynamicInvoke() as string;
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
            case "sha1":
                signature = SignSHA1(request);
                break;
            case "md5":
                signature = SignMD5(request);
                break;
        }
        return signature;
    }


    public string jwt(object data, object secret, Delegate alg = null, bool isRsa = false, object options = null) => Jwt(data, secret, alg, isRsa, options);

    public static string Jwt(object data, object secret, Delegate hash = null, bool isRsa = false, object options2 = null)
    {
        var options = (options2 != null) ? options2 as Dictionary<string, object> : new Dictionary<string, object>();
        var algorithm = hash.DynamicInvoke() as string;
        var alg = (isRsa ? "RS" : "HS") + algorithm.Substring(3).ToUpper();
        if (options.ContainsKey("alg"))
        {
            alg = options["alg"] as string;
        }
        var header = Exchange.Extend(new Dictionary<string, object> {
            {"alg" , alg},
            {"typ", "JWT"}
        }, options);

        if (header.ContainsKey("iat"))
        {
            (data as Dictionary<string, object>)["iat"] = header["iat"];
            header.Remove("iat");
        }
        var stringHeader = Exchange.Json(header);
        var encodedHeader = Exchange.Base64urlEncode(stringHeader);
        var encodedData = Exchange.Base64urlEncode(Exchange.Json(data));
        var token = encodedHeader + "." + encodedData;
        string signature = null;
        var algoType = alg.Substring(0, 2);
        if (isRsa)
        {
            signature = Exchange.Base64urlEncode(Exchange.Base64ToBinary(Exchange.Rsa(token, secret, hash) as object));
        }
        else if (algoType == "ES")
        {
            var ec = Ecdsa(token, secret, p256, hash) as Dictionary<string, object>;
            var r = ec["r"] as string;
            var s = ec["s"] as string;
            signature = Exchange.Base64urlEncode(Exchange.ConvertHexStringToByteArray(r + s));
        }
        else
        {
            signature = Exchange.Base64urlEncode(Exchange.Base64ToBinary(Exchange.Hmac(token, secret, hash, "binary") as object));
        }
        var res = token + "." + signature;
        return res;
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

    public static byte[] SignSHA1(string data)
    {
        using var encryptor = SHA1.Create();
        var resultBytes = encryptor.ComputeHash(Encoding.UTF8.GetBytes(data));
        return resultBytes;
    }

    public static byte[] SignKeccak(object data2)
    {
        byte[] msg;
        if (data2 is string)
        {
            msg = Encoding.UTF8.GetBytes((string)data2);
        }
        else
        {
            msg = data2 as byte[];
        }
        Sha3Keccack keccack = new Sha3Keccack();
        var hash = keccack.CalculateHash(msg);
        return hash;
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
        return SignHMACSHA256(Encoding.UTF8.GetBytes(data), secret);
    }
    public static byte[] SignHMACSHA256(byte[] data, byte[] secret)
    {
        using var encryptor = new HMACSHA256(secret);
        var resultBytes = encryptor.ComputeHash(data);
        return resultBytes;
    }

    public static byte[] SignHMACSHA384(string data, byte[] secret)
    {
        return SignHMACSHA384(Encoding.UTF8.GetBytes(data), secret);
    }

    public static byte[] SignHMACSHA384(byte[] data, byte[] secret)
    {
        using var encryptor = new HMACSHA384(secret);
        var resultBytes = encryptor.ComputeHash(data);
        return resultBytes;
    }

    public static byte[] SignHMACSHA512(string data, byte[] secret)
    {
        return SignHMACSHA512(Encoding.UTF8.GetBytes(data), secret);
    }

    public static byte[] SignHMACSHA512(byte[] data, byte[] secret)
    {
        using var encryptor = new HMACSHA512(secret);
        var resultBytes = encryptor.ComputeHash(data);
        return resultBytes;
    }

    public static byte[] SignHMACMD5(string data, byte[] secret)
    {
        return SignHMACMD5(Encoding.UTF8.GetBytes(data), secret);
    }

    public static byte[] SignHMACMD5(byte[] data, byte[] secret)
    {
        using var encryptor = new HMACMD5(secret);
        var resultBytes = encryptor.ComputeHash(data);
        return resultBytes;
    }

    public string rsa(object request, object secret, Delegate alg = null) => Rsa(request, secret, alg);

    public static string Rsa(object data, object publicKey, Delegate hash = null)
    {
        var pk = ((string)publicKey);
        var pkParts = pk.Split(new[] { ((string)"\n") }, StringSplitOptions.None).ToList();
        pkParts.RemoveAt(0);
        pkParts.RemoveAt(pkParts.Count - 1);
        var newPk = string.Join("", pkParts);
        byte[] Data = Encoding.UTF8.GetBytes((string)data);
        byte[] privatekey;
        privatekey = Convert.FromBase64String(newPk);
        // https://gist.github.com/GaiaAnn/29071961482462ff5334a121bd103166
        RSACryptoServiceProvider rsa = DecodeRSAPrivateKey(privatekey);
        object sh;
        var algorithm = "md5";
        if (hash != null)
        {
            algorithm = hash.DynamicInvoke() as String;
        }

        if (algorithm == "sha1")
        {
            sh = new SHA1CryptoServiceProvider();
        }
        else if (algorithm == "sha256")
        {
            sh = new SHA256CryptoServiceProvider();
        }
        else if (algorithm == "sha384")
        {
            sh = new SHA384CryptoServiceProvider();
        }
        else if (algorithm == "sha512")
        {
            sh = new SHA512CryptoServiceProvider();
        }
        else if (algorithm == "md5")
        {
            sh = new MD5CryptoServiceProvider();
        }
        else
        {
            throw new ArgumentException("Invalid hash algorithm name");
        }
        byte[] signData = rsa.SignData(Data, sh);

        return Convert.ToBase64String(signData);
    }

    // private static byte[] hashData(string data, string algorithm)
    // {
    //     var sha = stringToHashAlgorithmName(algorithm);
    //     sh
    //     return sha.Hash(Encoding.UTF8.GetBytes(data));
    // }

    private static HashAlgorithmName stringToHashAlgorithmName(string hashAlgorithmName)
    {
        switch (hashAlgorithmName)
        {
            case "sha256":
                return HashAlgorithmName.SHA256;
            case "sha384":
                return HashAlgorithmName.SHA384;
            case "sha512":
                return HashAlgorithmName.SHA512;
            case "sha1":
                return HashAlgorithmName.SHA1;
            case "md5":
                return HashAlgorithmName.MD5;
            default:
                throw new ArgumentException("Invalid hash algorithm name");
        }
    }

    public static byte[] StringToByteArray(string hex)
    {
        return Enumerable.Range(0, hex.Length)
                         .Where(x => x % 2 == 0)
                         .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                         .ToArray();
    }

    public object ecdsa(object request, object secret, Delegate alg = null, Delegate hash = null) => Ecdsa(request, secret, alg, hash);

    public static object Ecdsa(object request, object secret, Delegate curve = null, Delegate hash = null)
    {
        var curveName = "secp256k1";
        if (curve != null)
        {
            curveName = curve.DynamicInvoke() as String;
        }
        if (curveName != "secp256k1" && curveName != "p256")
        {
            throw new ArgumentException("Only secp256k1 and p256 curves are supported supported");
        }

        var hashName = (hash != null) ? hash.DynamicInvoke() as string : null;
        byte[] msgHash;

        var seckey = Hex.HexToBytes(secret.ToString());

        byte[] sig;
        int recoveryId;
        if (curveName == "secp256k1")
        {
            if (hashName != null)
            {
                msgHash = HashBytes(request, hash);
            }
            else
            {
                msgHash = Hex.HexToBytes((string)request);
            }
            sig = Secp256K1Manager.SignCompact(msgHash, seckey, out recoveryId);
        }
        else
        {
            sig = SignP256(request, secret as string, hashName, out recoveryId); // handle strings only for testing
        }

        var rBytes = sig.Take(32).ToArray();
        var sBytes = sig.Skip(32).Take((32)).ToArray();

        var r = ToHex(rBytes);
        var s = ToHex(sBytes);


        return new Dictionary<string, object>() {
            { "r", r },
            { "s", s },
            { "v", recoveryId },
        };
    }

    public static string ByteArrayToString(byte[] ba)
    {
        return BitConverter.ToString(ba).Replace("-", "");
    }

    private static ECCurve stringToCurve(string curve)
    {
        switch (curve)
        {
            case "secp256k1":
                return ECCurve.NamedCurves.nistP256;
            case "secp256r1":
                return ECCurve.NamedCurves.nistP256;
            case "secp384r1":
                return ECCurve.NamedCurves.nistP384;
            case "secp521r1":
                return ECCurve.NamedCurves.nistP521;
            default:
                throw new ArgumentException("Invalid curve name");
        }
    }

    public object signMessageString(object str, object privateKey = null)
    {
        return (string)str; // stub
    }

    public object eddsa(object request, object secret, object alg = null)
    {
        alg ??= "ed25519";
        byte[] msg;
        if (request is string)
        {
            msg = Encoding.UTF8.GetBytes((string)request);
        }
        else
        {
            msg = request as byte[];
        }
        var signer = new Ed25519Signer();
        var privateKey = (secret is string) ? ReadEDDSAPrivateKeyFromPem(secret as string) : new Ed25519PrivateKeyParameters(secret as byte[]);
        signer.Init(true, privateKey);
        signer.BlockUpdate(msg, 0, msg.Length);
        byte[] signature = signer.GenerateSignature();
        var base64Sig = Convert.ToBase64String(signature);
        return base64Sig;
    }

    public Int64 crc32(object str, object signed2 = null) => Crc32(str, signed2);

    public static Int64 Crc32(object str, object signed2 = null)
    {
        var signed = (signed2 == null) ? false : (bool)signed2;
        // var data = Encoding.UTF8.GetBytes((string)str);
        var crc = CalculateCrc32((string)str, signed);
        return crc;
    }

    public static Int64 CalculateCrc32(string data, bool signed, int? bound = null)
    {
        // https://gist.github.com/martin31821/6a4736521043233bf7cdc05aa785149d
        var s_generator = 0xEDB88320;
        var m_checksumTable = Enumerable.Range(0, 256).Select(i =>
        {
            var tableEntry = (uint)i;
            for (var j = 0; j < 8; ++j)
            {
                tableEntry = ((tableEntry & 1) != 0)
                    ? (s_generator ^ (tableEntry >> 1))
                    : (tableEntry >> 1);
            }
            return tableEntry;
        }).ToArray();


        var arrayOfBytes = Encoding.ASCII.GetBytes(data);
        var result = ~arrayOfBytes.Aggregate(0xFFFFFFFF, (checksumRegister, currentByte) =>
                      (m_checksumTable[(checksumRegister & 0xFF) ^ Convert.ToByte(currentByte)] ^ (checksumRegister >> 8)));
        return (!signed) ? Convert.ToInt64(result) : Convert.ToInt64((int)result);
    }

    private static RSACryptoServiceProvider DecodeRSAPrivateKey(byte[] privkey)
    {
        byte[] MODULUS, E, D, P, Q, DP, DQ, IQ;

        // ---------  Set up stream to decode the asn.1 encoded RSA private key  ------
        MemoryStream mem = new MemoryStream(privkey);
        BinaryReader binr = new BinaryReader(mem);    //wrap Memory Stream with BinaryReader for easy reading
        byte bt = 0;
        ushort twobytes = 0;
        int elems = 0;
        try
        {
            twobytes = binr.ReadUInt16();
            if (twobytes == 0x8130) //data read as little endian order (actual data order for Sequence is 30 81)
                binr.ReadByte();    //advance 1 byte
            else if (twobytes == 0x8230)
                binr.ReadInt16();   //advance 2 bytes
            else
                return null;

            twobytes = binr.ReadUInt16();
            if (twobytes != 0x0102) //version number
                return null;
            bt = binr.ReadByte();
            if (bt != 0x00)
                return null;


            //------  all private key components are Integer sequences ----
            elems = GetIntegerSize(binr);
            MODULUS = binr.ReadBytes(elems);

            elems = GetIntegerSize(binr);
            E = binr.ReadBytes(elems);

            elems = GetIntegerSize(binr);
            D = binr.ReadBytes(elems);

            elems = GetIntegerSize(binr);
            P = binr.ReadBytes(elems);

            elems = GetIntegerSize(binr);
            Q = binr.ReadBytes(elems);

            elems = GetIntegerSize(binr);
            DP = binr.ReadBytes(elems);

            elems = GetIntegerSize(binr);
            DQ = binr.ReadBytes(elems);

            elems = GetIntegerSize(binr);
            IQ = binr.ReadBytes(elems);

            // ------- create RSACryptoServiceProvider instance and initialize with public key -----
            RSACryptoServiceProvider RSA = new RSACryptoServiceProvider();
            RSAParameters RSAparams = new RSAParameters();
            RSAparams.Modulus = MODULUS;
            RSAparams.Exponent = E;
            RSAparams.D = D;
            RSAparams.P = P;
            RSAparams.Q = Q;
            RSAparams.DP = DP;
            RSAparams.DQ = DQ;
            RSAparams.InverseQ = IQ;
            RSA.ImportParameters(RSAparams);
            return RSA;
        }
        catch (Exception)
        {
            return null;
        }
        finally { binr.Close(); }
    }

    private static int GetIntegerSize(BinaryReader binr)
    {
        byte bt = 0;
        byte lowbyte = 0x00;
        byte highbyte = 0x00;
        int count = 0;
        bt = binr.ReadByte();
        if (bt != 0x02)     //expect integer
            return 0;
        bt = binr.ReadByte();

        if (bt == 0x81)
            count = binr.ReadByte();    // data size in next byte
        else
            if (bt == 0x82)
        {
            highbyte = binr.ReadByte(); // data size in next 2 bytes
            lowbyte = binr.ReadByte();
            byte[] modint = { lowbyte, highbyte, 0x00, 0x00 };
            count = BitConverter.ToInt32(modint, 0);
        }
        else
        {
            count = bt;     // we already have the data size
        }



        while (binr.ReadByte() == 0x00)
        {   //remove high order zeros in data
            count -= 1;
        }
        binr.BaseStream.Seek(-1, SeekOrigin.Current);       //last ReadByte wasn't a removed zero, so back up a byte
        return count;
    }

    public object axolotl(object a, object b, object c)
    {
        return ""; // to be implemented
    }

    public static object inflate(object data)
    {
        var compressedMessage = Encoding.UTF8.GetBytes((string)data);
        using (var compressedStream = new MemoryStream(compressedMessage))
        using (var deflateStream = new DeflateStream(compressedStream, CompressionMode.Decompress))
        using (var resultStream = new MemoryStream())
        {
            deflateStream.CopyTo(resultStream);
            return resultStream.ToArray();
        }
    }

    public static string ToHex(byte[] value, bool prefix = false)
    {
        var strPrex = prefix ? "0x" : "";
        return strPrex + string.Concat(value.Select(b => b.ToString("x2")).ToArray());
    }


    public static byte[] SignP256(object msg, string pemPrivateKey, string hashName, out int recoveryId)
    {

        string algoDelegate() => hashName as string;
        var curveParams = NistNamedCurves.GetByName("P-256");
        var rawBytes = Encoding.UTF8.GetBytes((string)msg);
        var ecPrivateKeyParameters = ReadPemPrivateKey(pemPrivateKey, curveParams);
        ECDsa ecdsa = ConvertToECDsa(ecPrivateKeyParameters);
        byte[] signature = ecdsa.SignData(rawBytes, HashAlgorithmName.SHA256);

        var hashed = HashBytes(msg, algoDelegate);
        var signer = new ECDsaSigner();

        recoveryId = 0; // check this later;
        var r = signature.Take(32).ToArray();
        var s = signature.Skip(32).ToArray();
        return signature;
    }
    private static ECPrivateKeyParameters ReadPemPrivateKey(string pemContents, Org.BouncyCastle.Asn1.X9.X9ECParameters curveParameters)
    {
        using (TextReader textReader = new StringReader(pemContents))
        {
            PemReader pemReader = new PemReader(textReader);
            object pemObject = pemReader.ReadObject();

            // Handling AsymmetricCipherKeyPair
            if (pemObject is Org.BouncyCastle.Crypto.AsymmetricCipherKeyPair keyPair)
            {
                // return keyPair.Private as ECPrivateKeyParameters;
                var privateKeyParameters = keyPair.Private as ECPrivateKeyParameters;
                return new ECPrivateKeyParameters(privateKeyParameters.D, new ECDomainParameters(curveParameters.Curve, curveParameters.G, curveParameters.N, curveParameters.H, curveParameters.GetSeed()));
            }
            else
            {
                throw new InvalidCastException("The PEM file does not contain an EC private key in an expected format.");
            }
        }
    }

    private static ECPublicKeyParameters ReadPemPublicKey(string pemContents, Org.BouncyCastle.Asn1.X9.X9ECParameters curveParameters)
    {
        using (TextReader textReader = new StringReader(pemContents))
        {
            PemReader pemReader = new PemReader(textReader);
            object pemObject = pemReader.ReadObject();

            // Handling AsymmetricCipherKeyPair
            if (pemObject is Org.BouncyCastle.Crypto.AsymmetricCipherKeyPair keyPair)
            {
                // return keyPair.Private as ECPrivateKeyParameters;
                var privateKeyParameters = keyPair.Public as ECPublicKeyParameters;
                return new ECPublicKeyParameters(privateKeyParameters.Q, new ECDomainParameters(curveParameters.Curve, curveParameters.G, curveParameters.N, curveParameters.H, curveParameters.GetSeed()));
            }
            else
            {
                throw new InvalidCastException("The PEM file does not contain an EC private key in an expected format.");
            }
        }
    }

    private static Ed25519PrivateKeyParameters ReadEDDSAPrivateKeyFromPem(string pemString)
    {
        if (!pemString.StartsWith("-----BEGIN"))
        {
            pemString = "-----BEGIN PRIVATE KEY-----\n" + pemString + "\n-----END PRIVATE KEY-----";
        }
        using (TextReader reader = new StringReader(pemString))
        {
            PemReader pemReader = new PemReader(reader);
            object pemObject = pemReader.ReadObject();
            if (pemObject is Org.BouncyCastle.Crypto.AsymmetricCipherKeyPair)
            {
                return ((Org.BouncyCastle.Crypto.AsymmetricCipherKeyPair)pemObject).Private as Ed25519PrivateKeyParameters;
            }
            else if (pemObject is Ed25519PrivateKeyParameters)
            {
                return (Ed25519PrivateKeyParameters)pemObject;
            }
            else
            {
                throw new InvalidCastException("The PEM does not contain a valid Ed25519 private key.");
            }
        }
    }


    private static ECDsa ConvertToECDsa(ECPrivateKeyParameters privateKeyParameters)
    {
        // Use BouncyCastle to convert to .NET's ECDsa
        var q = privateKeyParameters.Parameters.G.Multiply(privateKeyParameters.D);
        var domainParameters = privateKeyParameters.Parameters;
        var curve = domainParameters.Curve;
        var point = curve.DecodePoint(domainParameters.G.GetEncoded()).Normalize();

        ECDsa ecdsa = ECDsa.Create(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256, // Ensure this matches your key's curve
            D = privateKeyParameters.D.ToByteArrayUnsigned(),
            Q = new ECPoint
            {
                X = point.AffineXCoord.GetEncoded(),
                Y = point.AffineYCoord.GetEncoded()
            }
        });

        return ecdsa;
    }

    public static ECDsa ConvertToECDsa(ECPublicKeyParameters publicKeyParameters)
    {
        // Extract the public key point
        var q = publicKeyParameters.Q;

        // Convert BouncyCastle's BigIntegers to byte arrays
        var x = q.AffineXCoord.GetEncoded();
        var y = q.AffineYCoord.GetEncoded();

        // Create an ECDsa instance and initialize it with the public key parameters
        ECDsa ecdsa = ECDsa.Create();
        ecdsa.ImportParameters(new ECParameters
        {
            Curve = ECCurve.NamedCurves.nistP256, // Ensure this matches your actual curve
            Q = new ECPoint
            {
                X = x,
                Y = y
            }
        });

        return ecdsa;
    }
}