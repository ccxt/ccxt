using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public abstract class TlsSrpUtilities
    {
        /// <exception cref="IOException"/>
        public static void AddSrpExtension(IDictionary<int, byte[]> extensions, byte[] identity)
        {
            extensions[ExtensionType.srp] = CreateSrpExtension(identity);
        }

        /// <exception cref="IOException"/>
        public static byte[] GetSrpExtension(IDictionary<int, byte[]> extensions)
        {
            byte[] extensionData = TlsUtilities.GetExtensionData(extensions, ExtensionType.srp);
            return extensionData == null ? null : ReadSrpExtension(extensionData);
        }

        /// <exception cref="IOException"/>
        public static byte[] CreateSrpExtension(byte[] identity)
        {
            if (identity == null)
                throw new TlsFatalAlert(AlertDescription.internal_error);

            return TlsUtilities.EncodeOpaque8(identity);
        }

        /// <exception cref="IOException"/>
        public static byte[] ReadSrpExtension(byte[] extensionData)
        {
            if (extensionData == null)
                throw new ArgumentNullException("extensionData");

            return TlsUtilities.DecodeOpaque8(extensionData, 1);
        }

        /// <exception cref="IOException"/>
        public static BigInteger ReadSrpParameter(Stream input)
        {
            return new BigInteger(1, TlsUtilities.ReadOpaque16(input, 1));
        }

        /// <exception cref="IOException"/>
        public static void WriteSrpParameter(BigInteger x, Stream output)
        {
            TlsUtilities.WriteOpaque16(BigIntegers.AsUnsignedByteArray(x), output);
        }

        public static bool IsSrpCipherSuite(int cipherSuite)
        {
            switch (TlsUtilities.GetKeyExchangeAlgorithm(cipherSuite))
            {
            case KeyExchangeAlgorithm.SRP:
            case KeyExchangeAlgorithm.SRP_DSS:
            case KeyExchangeAlgorithm.SRP_RSA:
                return true;

            default:
                return false;
            }
        }
    }
}
