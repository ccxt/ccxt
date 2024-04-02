using System;
using Org.BouncyCastle.Crypto;

using static Org.BouncyCastle.Pqc.Crypto.Lms.LM_OTS;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSContext
        : IDigest
    {
        private byte[] c;
        private LMOtsPrivateKey key;
        private LMSigParameters sigParams;
        private byte[][] path;
        private LMOtsPublicKey publicKey;
        private Object signature;

        private LMSSignedPubKey[] signedPubKeys;
        private volatile IDigest digest;

        public LMSContext(LMOtsPrivateKey key, LMSigParameters sigParams, IDigest digest, byte[] C, byte[][] path)
        {
            this.key = key;
            this.sigParams = sigParams;
            this.digest = digest;
            this.c = C;
            this.path = path;
            this.publicKey = null;
            this.signature = null;
        }

        public LMSContext(LMOtsPublicKey publicKey, Object signature, IDigest digest)
        {
            this.publicKey = publicKey;
            this.signature = signature;
            this.digest = digest;
            this.c = null;
            this.key = null;
            this.sigParams = null;
            this.path = null;
        }

        public byte[] C => c;

        public byte[] GetQ()
        {
            byte[] Q = new byte[MAX_HASH + 2];

            digest.DoFinal(Q, 0);
            
            digest = null;

            return Q;
        }

        internal byte[][] GetPath()
        {
            return path;
        }

        internal LMOtsPrivateKey GetPrivateKey()
        {
            return key;
        }

        public LMOtsPublicKey GetPublicKey()
        {
            return publicKey;
        }

        internal LMSigParameters GetSigParams()
        {
            return sigParams;
        }

        public Object GetSignature()
        {
            return signature;
        }

        internal LMSSignedPubKey[] GetSignedPubKeys()
        {
            return signedPubKeys;
        }

        internal LMSContext WithSignedPublicKeys(LMSSignedPubKey[] signedPubKeys)
        {
            this.signedPubKeys = signedPubKeys;

            return this;
        }

        public string AlgorithmName
        {
            get => digest.AlgorithmName;
        }

        public int GetDigestSize()
        {
            return digest.GetDigestSize();
        }

        public int GetByteLength()
        {
            return digest.GetByteLength();
        }

        public void Update(byte input)
        {
            digest.Update(input);
        }

        public void BlockUpdate(byte[] input, int inOff, int len)
        {
            digest.BlockUpdate(input, inOff, len);
        }

        public int DoFinal(byte[] output, int outOff)
        {
            return digest.DoFinal(output, outOff);
        }

        public void Reset()
        {
            digest.Reset();
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void BlockUpdate(ReadOnlySpan<byte> input)
        {
            digest.BlockUpdate(input);
        }

        public int DoFinal(Span<byte> output)
        {
            return digest.DoFinal(output);
        }
#endif
    }
}
