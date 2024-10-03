using System;
using System.IO;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math.EC.Rfc8032;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Signers
{
    public class Ed25519phSigner
        : ISigner
    {
        private readonly IDigest prehash = Ed25519.CreatePrehash();
        private readonly byte[] context;

        private bool forSigning;
        private Ed25519PrivateKeyParameters privateKey;
        private Ed25519PublicKeyParameters publicKey;

        public Ed25519phSigner(byte[] context)
        {
            this.context = Arrays.Clone(context);
        }

        public virtual string AlgorithmName
        {
            get { return "Ed25519ph"; }
        }

        public virtual void Init(bool forSigning, ICipherParameters parameters)
        {
            this.forSigning = forSigning;

            if (forSigning)
            {
                this.privateKey = (Ed25519PrivateKeyParameters)parameters;
                this.publicKey = null;
            }
            else
            {
                this.privateKey = null;
                this.publicKey = (Ed25519PublicKeyParameters)parameters;
            }

            Reset();
        }

        public virtual void Update(byte b)
        {
            prehash.Update(b);
        }

        public virtual void BlockUpdate(byte[] buf, int off, int len)
        {
            prehash.BlockUpdate(buf, off, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            prehash.BlockUpdate(input);
        }
#endif

        public virtual byte[] GenerateSignature()
        {
            if (!forSigning || null == privateKey)
                throw new InvalidOperationException("Ed25519phSigner not initialised for signature generation.");

            byte[] msg = new byte[Ed25519.PrehashSize];
            if (Ed25519.PrehashSize != prehash.DoFinal(msg, 0))
                throw new InvalidOperationException("Prehash digest failed");

            byte[] signature = new byte[Ed25519PrivateKeyParameters.SignatureSize];
            privateKey.Sign(Ed25519.Algorithm.Ed25519ph, context, msg, 0, Ed25519.PrehashSize, signature, 0);
            return signature;
        }

        public virtual bool VerifySignature(byte[] signature)
        {
            if (forSigning || null == publicKey)
                throw new InvalidOperationException("Ed25519phSigner not initialised for verification");
            if (Ed25519.SignatureSize != signature.Length)
            {
                prehash.Reset();
                return false;
            }

            byte[] pk = publicKey.GetEncoded();
            return Ed25519.VerifyPrehash(signature, 0, pk, 0, context, prehash);
        }

        public void Reset()
        {
            prehash.Reset();
        }
    }
}
