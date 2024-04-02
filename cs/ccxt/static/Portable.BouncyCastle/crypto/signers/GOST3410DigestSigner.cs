using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Signers
{
    public class Gost3410DigestSigner
        : ISigner
    {
        private readonly IDigest digest;
        private readonly IDsa dsaSigner;
        private readonly int size;
        private int halfSize;
        private bool forSigning;

        public Gost3410DigestSigner(IDsa signer, IDigest digest)
        {
            this.dsaSigner = signer;
            this.digest = digest;

            halfSize = digest.GetDigestSize();
            this.size = halfSize * 2;

        }

        public virtual string AlgorithmName
        {
            get { return digest.AlgorithmName + "with" + dsaSigner.AlgorithmName; }
        }

        public virtual void Init(bool forSigning, ICipherParameters parameters)
        {
            this.forSigning = forSigning;

            AsymmetricKeyParameter k;
            if (parameters is ParametersWithRandom)
            {
                k = (AsymmetricKeyParameter)((ParametersWithRandom)parameters).Parameters;
            }
            else
            {
                k = (AsymmetricKeyParameter)parameters;
            }

            if (forSigning && !k.IsPrivate)
            {
                throw new InvalidKeyException("Signing Requires Private Key.");
            }

            if (!forSigning && k.IsPrivate)
            {
                throw new InvalidKeyException("Verification Requires Public Key.");
            }


            Reset();

            dsaSigner.Init(forSigning, parameters);
        }

        public virtual void Update(byte input)
        {
            digest.Update(input);
        }

        public virtual void BlockUpdate(byte[] input, int inOff, int inLen)
        {
            digest.BlockUpdate(input, inOff, inLen);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void BlockUpdate(ReadOnlySpan<byte> input)
        {
            digest.BlockUpdate(input);
        }
#endif

        public virtual byte[] GenerateSignature()
        {
            if (!forSigning)
                throw new InvalidOperationException("GOST3410DigestSigner not initialised for signature generation.");

            byte[] hash = new byte[digest.GetDigestSize()];
            digest.DoFinal(hash, 0);

            try
            {
                BigInteger[] sig = dsaSigner.GenerateSignature(hash);
                byte[] sigBytes = new byte[size];

                // TODO Add methods to allow writing BigInteger to existing byte array?
                byte[] r = sig[0].ToByteArrayUnsigned();
                byte[] s = sig[1].ToByteArrayUnsigned();
                s.CopyTo(sigBytes, halfSize - s.Length);
                r.CopyTo(sigBytes, size - r.Length);
                return sigBytes;
            }
            catch (Exception e)
            {
                throw new SignatureException(e.Message, e);
            }
        }

        public virtual bool VerifySignature(byte[] signature)
        {
            if (forSigning)
                throw new InvalidOperationException("DSADigestSigner not initialised for verification");

            byte[] hash = new byte[digest.GetDigestSize()];
            digest.DoFinal(hash, 0);

            BigInteger R, S;
            try
            {
                R = new BigInteger(1, signature, halfSize, halfSize);
                S = new BigInteger(1, signature, 0, halfSize);
            }
            catch (Exception e)
            {
                throw new SignatureException("error decoding signature bytes.", e);
            }

            return dsaSigner.VerifySignature(hash, R, S);
        }

        public virtual void Reset()
        {
            digest.Reset();
        }
    }
}
