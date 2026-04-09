using System;
using System.IO;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math.EC.Rfc8032;

namespace Org.BouncyCastle.Crypto.Signers
{
    public class Ed25519Signer
        : ISigner
    {
        private readonly Buffer buffer = new Buffer();

        private bool forSigning;
        private Ed25519PrivateKeyParameters privateKey;
        private Ed25519PublicKeyParameters publicKey;

        public Ed25519Signer()
        {
        }

        public virtual string AlgorithmName
        {
            get { return "Ed25519"; }
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
            buffer.WriteByte(b);
        }

        public virtual void BlockUpdate(byte[] buf, int off, int len)
        {
            buffer.Write(buf, off, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            buffer.Write(input);
        }
#endif

        public virtual byte[] GenerateSignature()
        {
            if (!forSigning || null == privateKey)
                throw new InvalidOperationException("Ed25519Signer not initialised for signature generation.");

            return buffer.GenerateSignature(privateKey);
        }

        public virtual bool VerifySignature(byte[] signature)
        {
            if (forSigning || null == publicKey)
                throw new InvalidOperationException("Ed25519Signer not initialised for verification");

            return buffer.VerifySignature(publicKey, signature);
        }

        public virtual void Reset()
        {
            buffer.Reset();
        }

        private class Buffer : MemoryStream
        {
            internal byte[] GenerateSignature(Ed25519PrivateKeyParameters privateKey)
            {
                lock (this)
                {
                    byte[] buf = GetBuffer();
                    int count = Convert.ToInt32(Length);

                    byte[] signature = new byte[Ed25519PrivateKeyParameters.SignatureSize];
                    privateKey.Sign(Ed25519.Algorithm.Ed25519, null, buf, 0, count, signature, 0);
                    Reset();
                    return signature;
                }
            }

            internal bool VerifySignature(Ed25519PublicKeyParameters publicKey, byte[] signature)
            {
                if (Ed25519.SignatureSize != signature.Length)
                {
                    Reset();
                    return false;
                }

                lock (this)
                {
                    byte[] buf = GetBuffer();
                    int count = Convert.ToInt32(Length);

                    byte[] pk = publicKey.GetEncoded();
                    bool result = Ed25519.Verify(signature, 0, pk, 0, buf, 0, count);
                    Reset();
                    return result;
                }
            }

            internal void Reset()
            {
                lock (this)
                {
                    int count = Convert.ToInt32(Length);
                    Array.Clear(GetBuffer(), 0, count);
                    SetLength(0);
                }
            }
        }
    }
}
