using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.OpenSsl
{
    internal sealed class PemUtilities
    {
        private enum PemBaseAlg { AES_128, AES_192, AES_256, BF, DES, DES_EDE, DES_EDE3, RC2, RC2_40, RC2_64 };
        private enum PemMode { CBC, CFB, ECB, OFB };

        static PemUtilities()
        {
            // Signal to obfuscation tools not to change enum constants
            ((PemBaseAlg)Enums.GetArbitraryValue(typeof(PemBaseAlg))).ToString();
            ((PemMode)Enums.GetArbitraryValue(typeof(PemMode))).ToString();
        }

        private static void ParseDekAlgName(
            string dekAlgName,
            out PemBaseAlg baseAlg,
            out PemMode mode)
        {
            try
            {
                mode = PemMode.ECB;

                if (dekAlgName == "DES-EDE" || dekAlgName == "DES-EDE3")
                {
                    baseAlg = (PemBaseAlg)Enums.GetEnumValue(typeof(PemBaseAlg), dekAlgName);
                    return;
                }

                int pos = dekAlgName.LastIndexOf('-');
                if (pos >= 0)
                {
                    baseAlg = (PemBaseAlg)Enums.GetEnumValue(typeof(PemBaseAlg), dekAlgName.Substring(0, pos));
                    mode = (PemMode)Enums.GetEnumValue(typeof(PemMode), dekAlgName.Substring(pos + 1));
                    return;
                }
            }
            catch (ArgumentException)
            {
            }

            throw new EncryptionException("Unknown DEK algorithm: " + dekAlgName);
        }
    }
}
