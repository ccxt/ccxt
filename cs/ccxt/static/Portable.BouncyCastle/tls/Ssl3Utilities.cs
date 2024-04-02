using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    internal abstract class Ssl3Utilities
    {
        private static readonly byte[] SSL_CLIENT = {0x43, 0x4C, 0x4E, 0x54};
        private static readonly byte[] SSL_SERVER = {0x53, 0x52, 0x56, 0x52};

        private const byte IPAD_BYTE = (byte)0x36;
        private const byte OPAD_BYTE = (byte)0x5C;

        private static readonly byte[] IPAD = GenPad(IPAD_BYTE, 48);
        private static readonly byte[] OPAD = GenPad(OPAD_BYTE, 48);

        internal static byte[] CalculateVerifyData(TlsHandshakeHash handshakeHash, bool isServer)
        {
            TlsHash prf = handshakeHash.ForkPrfHash();
            byte[] sslSender = isServer ? SSL_SERVER : SSL_CLIENT;
            prf.Update(sslSender, 0, sslSender.Length);
            return prf.CalculateHash();
        }

        internal static void CompleteCombinedHash(TlsContext context, TlsHash md5, TlsHash sha1)
        {
            TlsSecret masterSecret = context.SecurityParameters.MasterSecret;
            byte[] master_secret = context.Crypto.AdoptSecret(masterSecret).Extract();

            CompleteHash(master_secret, md5, 48);
            CompleteHash(master_secret, sha1, 40);
        }

        private static void CompleteHash(byte[] master_secret, TlsHash hash, int padLength)
        {
            hash.Update(master_secret, 0, master_secret.Length);
            hash.Update(IPAD, 0, padLength);

            byte[] tmp = hash.CalculateHash();

            hash.Update(master_secret, 0, master_secret.Length);
            hash.Update(OPAD, 0, padLength);
            hash.Update(tmp, 0, tmp.Length);
        }

        private static byte[] GenPad(byte b, int count)
        {
            byte[] padding = new byte[count];
            Arrays.Fill(padding, b);
            return padding;
        }

        /// <exception cref="IOException"/>
        internal static byte[] ReadEncryptedPms(Stream input)
        {
            return Streams.ReadAll(input);
        }

        /// <exception cref="IOException"/>
        internal static void WriteEncryptedPms(byte[] encryptedPms, Stream output)
        {
            output.Write(encryptedPms, 0, encryptedPms.Length);
        }
    }
}
