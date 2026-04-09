using System;

namespace Org.BouncyCastle.Crypto.Operators
{
    public class DefaultSignatureResult
        : IBlockResult
    {
        private readonly ISigner mSigner;

        public DefaultSignatureResult(ISigner signer)
        {
            this.mSigner = signer;
        }

        public byte[] Collect()
        {
            return mSigner.GenerateSignature();
        }

        public int Collect(byte[] sig, int sigOff)
        {
            byte[] signature = Collect();
            signature.CopyTo(sig, sigOff);
            return signature.Length;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int Collect(Span<byte> destination)
        {
            byte[] result = Collect();
            result.CopyTo(destination);
            return result.Length;
        }
#endif
    }
}
