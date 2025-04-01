using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Signers
{
	public class DsaDigestSigner
		: ISigner
	{
        private readonly IDsa dsa;
        private readonly IDigest digest;
        private readonly IDsaEncoding encoding;
        private bool forSigning;

		public DsaDigestSigner(IDsa dsa, IDigest digest)
			: this(dsa, digest, StandardDsaEncoding.Instance)
		{
		}

        public DsaDigestSigner(IDsa dsa, IDigest digest, IDsaEncoding encoding)
        {
            this.dsa = dsa;
            this.digest = digest;
            this.encoding = encoding;
        }

		public virtual string AlgorithmName
		{
			get { return digest.AlgorithmName + "with" + dsa.AlgorithmName; }
		}

        public virtual void Init(bool forSigning, ICipherParameters parameters)
		{
			this.forSigning = forSigning;

			AsymmetricKeyParameter k;
			if (parameters is ParametersWithRandom withRandom)
			{
				k = (AsymmetricKeyParameter)withRandom.Parameters;
			}
			else
			{
				k = (AsymmetricKeyParameter)parameters;
			}

			if (forSigning && !k.IsPrivate)
				throw new InvalidKeyException("Signing Requires Private Key.");

			if (!forSigning && k.IsPrivate)
				throw new InvalidKeyException("Verification Requires Public Key.");

			Reset();

			dsa.Init(forSigning, parameters);
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
				throw new InvalidOperationException("DSADigestSigner not initialised for signature generation.");

			byte[] hash = new byte[digest.GetDigestSize()];
			digest.DoFinal(hash, 0);

            BigInteger[] sig = dsa.GenerateSignature(hash);

            try
            {
                return encoding.Encode(GetOrder(), sig[0], sig[1]);
            }
            catch (Exception)
            {
                throw new InvalidOperationException("unable to encode signature");
            }
		}

        public virtual bool VerifySignature(byte[] signature)
		{
			if (forSigning)
				throw new InvalidOperationException("DSADigestSigner not initialised for verification");

			byte[] hash = new byte[digest.GetDigestSize()];
			digest.DoFinal(hash, 0);

            try
            {
                BigInteger[] sig = encoding.Decode(GetOrder(), signature);

                return dsa.VerifySignature(hash, sig[0], sig[1]);
            }
            catch (Exception)
            {
                return false;
            }
		}

        public virtual void Reset()
		{
			digest.Reset();
		}

        protected virtual BigInteger GetOrder()
        {
            return dsa.Order;
        }
	}
}
