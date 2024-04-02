using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>The cipher for TLS_NULL_WITH_NULL_NULL.</summary>
    public sealed class TlsNullNullCipher
        : TlsCipher
    {
        public static readonly TlsNullNullCipher Instance = new TlsNullNullCipher();

        public int GetCiphertextDecodeLimit(int plaintextLimit)
        {
            return plaintextLimit;
        }

        public int GetCiphertextEncodeLimit(int plaintextLength, int plaintextLimit)
        {
            return plaintextLength;
        }

        public int GetPlaintextLimit(int ciphertextLimit)
        {
            return ciphertextLimit;
        }

        public TlsEncodeResult EncodePlaintext(long seqNo, short contentType, ProtocolVersion recordVersion,
            int headerAllocation, byte[] plaintext, int offset, int len)
        {
            byte[] result = new byte[headerAllocation + len];
            Array.Copy(plaintext, offset, result, headerAllocation, len);
            return new TlsEncodeResult(result, 0, result.Length, contentType);
        }

        public TlsDecodeResult DecodeCiphertext(long seqNo, short recordType, ProtocolVersion recordVersion,
            byte[] ciphertext, int offset, int len)
        {
            return new TlsDecodeResult(ciphertext, offset, len, recordType);
        }

        public void RekeyDecoder()
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public void RekeyEncoder()
        {
            throw new TlsFatalAlert(AlertDescription.internal_error);
        }

        public bool UsesOpaqueRecordType
        {
            get { return false; }
        }
    }
}
