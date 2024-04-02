using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Iana;
using Org.BouncyCastle.Asn1.Misc;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Paddings;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Security
{
    /// <remarks>
    ///  Utility class for creating HMac object from their names/Oids
    /// </remarks>
    public static class MacUtilities
    {
        private static readonly IDictionary<string, string> Algorithms =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        static MacUtilities()
        {
            Algorithms[IanaObjectIdentifiers.HmacMD5.Id] = "HMAC-MD5";
            Algorithms[IanaObjectIdentifiers.HmacRipeMD160.Id] = "HMAC-RIPEMD160";
            Algorithms[IanaObjectIdentifiers.HmacSha1.Id] = "HMAC-SHA1";
            Algorithms[IanaObjectIdentifiers.HmacTiger.Id] = "HMAC-TIGER";

            Algorithms[PkcsObjectIdentifiers.IdHmacWithSha1.Id] = "HMAC-SHA1";
            Algorithms[MiscObjectIdentifiers.HMAC_SHA1.Id] = "HMAC-SHA1";
            Algorithms[PkcsObjectIdentifiers.IdHmacWithSha224.Id] = "HMAC-SHA224";
            Algorithms[PkcsObjectIdentifiers.IdHmacWithSha256.Id] = "HMAC-SHA256";
            Algorithms[PkcsObjectIdentifiers.IdHmacWithSha384.Id] = "HMAC-SHA384";
            Algorithms[PkcsObjectIdentifiers.IdHmacWithSha512.Id] = "HMAC-SHA512";

            Algorithms[NistObjectIdentifiers.IdHMacWithSha3_224.Id] = "HMAC-SHA3-224";
            Algorithms[NistObjectIdentifiers.IdHMacWithSha3_256.Id] = "HMAC-SHA3-256";
            Algorithms[NistObjectIdentifiers.IdHMacWithSha3_384.Id] = "HMAC-SHA3-384";
            Algorithms[NistObjectIdentifiers.IdHMacWithSha3_512.Id] = "HMAC-SHA3-512";

            Algorithms[RosstandartObjectIdentifiers.id_tc26_hmac_gost_3411_12_256.Id] = "HMAC-GOST3411-2012-256";
            Algorithms[RosstandartObjectIdentifiers.id_tc26_hmac_gost_3411_12_512.Id] = "HMAC-GOST3411-2012-512";

            // TODO AESMAC?

            Algorithms["DES"] = "DESMAC";
            Algorithms["DES/CFB8"] = "DESMAC/CFB8";
            Algorithms["DES64"] = "DESMAC64";
            Algorithms["DESEDE"] = "DESEDEMAC";
            Algorithms[PkcsObjectIdentifiers.DesEde3Cbc.Id] = "DESEDEMAC";
            Algorithms["DESEDE/CFB8"] = "DESEDEMAC/CFB8";
            Algorithms["DESISO9797MAC"] = "DESWITHISO9797";
            Algorithms["DESEDE64"] = "DESEDEMAC64";

            Algorithms["DESEDE64WITHISO7816-4PADDING"] = "DESEDEMAC64WITHISO7816-4PADDING";
            Algorithms["DESEDEISO9797ALG1MACWITHISO7816-4PADDING"] = "DESEDEMAC64WITHISO7816-4PADDING";
            Algorithms["DESEDEISO9797ALG1WITHISO7816-4PADDING"] = "DESEDEMAC64WITHISO7816-4PADDING";

            Algorithms["ISO9797ALG3"] = "ISO9797ALG3MAC";
            Algorithms["ISO9797ALG3MACWITHISO7816-4PADDING"] = "ISO9797ALG3WITHISO7816-4PADDING";

            Algorithms["SKIPJACK"] = "SKIPJACKMAC";
            Algorithms["SKIPJACK/CFB8"] = "SKIPJACKMAC/CFB8";
            Algorithms["IDEA"] = "IDEAMAC";
            Algorithms["IDEA/CFB8"] = "IDEAMAC/CFB8";
            Algorithms["RC2"] = "RC2MAC";
            Algorithms["RC2/CFB8"] = "RC2MAC/CFB8";
            Algorithms["RC5"] = "RC5MAC";
            Algorithms["RC5/CFB8"] = "RC5MAC/CFB8";
            Algorithms["GOST28147"] = "GOST28147MAC";
            Algorithms["VMPC"] = "VMPCMAC";
            Algorithms["VMPC-MAC"] = "VMPCMAC";
            Algorithms["SIPHASH"] = "SIPHASH-2-4";

            Algorithms["PBEWITHHMACSHA"] = "PBEWITHHMACSHA1";
            Algorithms["1.3.14.3.2.26"] = "PBEWITHHMACSHA1";
        }

        public static IMac GetMac(DerObjectIdentifier id)
        {
            return GetMac(id.Id);
        }

        public static IMac GetMac(string algorithm)
        {
            if (algorithm == null)
                throw new ArgumentNullException(nameof(algorithm));

            string mechanism = CollectionUtilities.GetValueOrKey(Algorithms, algorithm).ToUpperInvariant();

            if (Platform.StartsWith(mechanism, "PBEWITH"))
            {
                mechanism = mechanism.Substring("PBEWITH".Length);
            }

            if (Platform.StartsWith(mechanism, "HMAC"))
            {
                string digestName;
                if (Platform.StartsWith(mechanism, "HMAC-") || Platform.StartsWith(mechanism, "HMAC/"))
                {
                    digestName = mechanism.Substring(5);
                }
                else
                {
                    digestName = mechanism.Substring(4);
                }

                return new HMac(DigestUtilities.GetDigest(digestName));
            }

            if (mechanism == "AESCMAC")
            {
                return new CMac(AesUtilities.CreateEngine());
            }
            if (mechanism == "DESMAC")
            {
                return new CbcBlockCipherMac(new DesEngine());
            }
            if (mechanism == "DESMAC/CFB8")
            {
                return new CfbBlockCipherMac(new DesEngine());
            }
            if (mechanism == "DESMAC64")
            {
                return new CbcBlockCipherMac(new DesEngine(), 64);
            }
            if (mechanism == "DESEDECMAC")
            {
                return new CMac(new DesEdeEngine());
            }
            if (mechanism == "DESEDEMAC")
            {
                return new CbcBlockCipherMac(new DesEdeEngine());
            }
            if (mechanism == "DESEDEMAC/CFB8")
            {
                return new CfbBlockCipherMac(new DesEdeEngine());
            }
            if (mechanism == "DESEDEMAC64")
            {
                return new CbcBlockCipherMac(new DesEdeEngine(), 64);
            }
            if (mechanism == "DESEDEMAC64WITHISO7816-4PADDING")
            {
                return new CbcBlockCipherMac(new DesEdeEngine(), 64, new ISO7816d4Padding());
            }
            if (mechanism == "DESWITHISO9797"
                || mechanism == "ISO9797ALG3MAC")
            {
                return new ISO9797Alg3Mac(new DesEngine());
            }
            if (mechanism == "ISO9797ALG3WITHISO7816-4PADDING")
            {
                return new ISO9797Alg3Mac(new DesEngine(), new ISO7816d4Padding());
            }
            if (mechanism == "SKIPJACKMAC")
            {
                return new CbcBlockCipherMac(new SkipjackEngine());
            }
            if (mechanism == "SKIPJACKMAC/CFB8")
            {
                return new CfbBlockCipherMac(new SkipjackEngine());
            }
            if (mechanism == "IDEAMAC")
            {
                return new CbcBlockCipherMac(new IdeaEngine());
            }
            if (mechanism == "IDEAMAC/CFB8")
            {
                return new CfbBlockCipherMac(new IdeaEngine());
            }
            if (mechanism == "RC2MAC")
            {
                return new CbcBlockCipherMac(new RC2Engine());
            }
            if (mechanism == "RC2MAC/CFB8")
            {
                return new CfbBlockCipherMac(new RC2Engine());
            }
            if (mechanism == "RC5MAC")
            {
                return new CbcBlockCipherMac(new RC532Engine());
            }
            if (mechanism == "RC5MAC/CFB8")
            {
                return new CfbBlockCipherMac(new RC532Engine());
            }
            if (mechanism == "GOST28147MAC")
            {
                return new Gost28147Mac();
            }
            if (mechanism == "VMPCMAC")
            {
                return new VmpcMac();
            }
            if (mechanism == "SIPHASH-2-4")
            {
                return new SipHash();
            }
            throw new SecurityUtilityException("Mac " + mechanism + " not recognised.");
        }

        public static string GetAlgorithmName(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(Algorithms, oid.Id);
        }

        public static byte[] CalculateMac(string algorithm, ICipherParameters cp, byte[] input)
        {
            IMac mac = GetMac(algorithm);
            mac.Init(cp);
            mac.BlockUpdate(input, 0, input.Length);
            return DoFinal(mac);
        }

        public static byte[] DoFinal(IMac mac)
        {
            byte[] b = new byte[mac.GetMacSize()];
            mac.DoFinal(b, 0);
            return b;
        }

        public static byte[] DoFinal(IMac mac, byte[] input)
        {
            mac.BlockUpdate(input, 0, input.Length);
            return DoFinal(mac);
        }
    }
}
