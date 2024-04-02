using System;

using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Crypto.Signers
{
    /// <summary>The SM2 Digital Signature algorithm.</summary>
    public class SM2Signer
        : ISigner
    {
        private readonly IDsaKCalculator kCalculator = new RandomDsaKCalculator();
        private readonly IDigest digest;
        private readonly IDsaEncoding encoding;

        private ECDomainParameters ecParams;
        private ECPoint pubPoint;
        private ECKeyParameters ecKey;
        private byte[] z;

        public SM2Signer()
            : this(StandardDsaEncoding.Instance, new SM3Digest())
        {
        }

        public SM2Signer(IDigest digest)
            : this(StandardDsaEncoding.Instance, digest)
        {
        }

        public SM2Signer(IDsaEncoding encoding)
            : this(encoding, new SM3Digest())
        {
        }

        public SM2Signer(IDsaEncoding encoding, IDigest digest)
        {
            this.encoding = encoding;
            this.digest = digest;
        }

        public virtual string AlgorithmName
        {
            get { return "SM2Sign"; }
        }

        public virtual void Init(bool forSigning, ICipherParameters parameters)
        {
            ICipherParameters baseParam;
            byte[] userID;

            if (parameters is ParametersWithID)
            {
                baseParam = ((ParametersWithID)parameters).Parameters;
                userID = ((ParametersWithID)parameters).GetID();

                if (userID.Length >= 8192)
                    throw new ArgumentException("SM2 user ID must be less than 2^16 bits long");
            }
            else
            {
                baseParam = parameters;
                // the default value, string value is "1234567812345678"
                userID = Hex.DecodeStrict("31323334353637383132333435363738");
            }

            if (forSigning)
            {
                if (baseParam is ParametersWithRandom)
                {
                    ParametersWithRandom rParam = (ParametersWithRandom)baseParam;

                    ecKey = (ECKeyParameters)rParam.Parameters;
                    ecParams = ecKey.Parameters;
                    kCalculator.Init(ecParams.N, rParam.Random);
                }
                else
                {
                    ecKey = (ECKeyParameters)baseParam;
                    ecParams = ecKey.Parameters;
                    kCalculator.Init(ecParams.N, new SecureRandom());
                }
                pubPoint = CreateBasePointMultiplier().Multiply(ecParams.G, ((ECPrivateKeyParameters)ecKey).D).Normalize();
            }
            else
            {
                ecKey = (ECKeyParameters)baseParam;
                ecParams = ecKey.Parameters;
                pubPoint = ((ECPublicKeyParameters)ecKey).Q;
            }

            digest.Reset();
            z = GetZ(userID);

            digest.BlockUpdate(z, 0, z.Length);
        }

        public virtual void Update(byte b)
        {
            digest.Update(b);
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

        public virtual bool VerifySignature(byte[] signature)
        {
            try
            {
                BigInteger[] rs = encoding.Decode(ecParams.N, signature);

                return VerifySignature(rs[0], rs[1]);
            }
            catch (Exception)
            {
            }

            return false;
        }

        public virtual void Reset()
        {
            if (z != null)
            {
                digest.Reset();
                digest.BlockUpdate(z, 0, z.Length);
            }
        }

        public virtual byte[] GenerateSignature()
        {
            byte[] eHash = DigestUtilities.DoFinal(digest);

            BigInteger n = ecParams.N;
            BigInteger e = CalculateE(n, eHash);
            BigInteger d = ((ECPrivateKeyParameters)ecKey).D;

            BigInteger r, s;

            ECMultiplier basePointMultiplier = CreateBasePointMultiplier();

            // 5.2.1 Draft RFC:  SM2 Public Key Algorithms
            do // generate s
            {
                BigInteger k;
                do // generate r
                {
                    // A3
                    k = kCalculator.NextK();

                    // A4
                    ECPoint p = basePointMultiplier.Multiply(ecParams.G, k).Normalize();

                    // A5
                    r = e.Add(p.AffineXCoord.ToBigInteger()).Mod(n);
                }
                while (r.SignValue == 0 || r.Add(k).Equals(n));

                // A6
                BigInteger dPlus1ModN = BigIntegers.ModOddInverse(n, d.Add(BigIntegers.One));

                s = k.Subtract(r.Multiply(d)).Mod(n);
                s = dPlus1ModN.Multiply(s).Mod(n);
            }
            while (s.SignValue == 0);

            // A7
            try
            {
                return encoding.Encode(ecParams.N, r, s);
            }
            catch (Exception ex)
            {
                throw new CryptoException("unable to encode signature: " + ex.Message, ex);
            }
        }

        private bool VerifySignature(BigInteger r, BigInteger s)
        {
            BigInteger n = ecParams.N;

            // 5.3.1 Draft RFC:  SM2 Public Key Algorithms
            // B1
            if (r.CompareTo(BigInteger.One) < 0 || r.CompareTo(n) >= 0)
                return false;

            // B2
            if (s.CompareTo(BigInteger.One) < 0 || s.CompareTo(n) >= 0)
                return false;

            // B3
            byte[] eHash = DigestUtilities.DoFinal(digest);

            // B4
            BigInteger e = CalculateE(n, eHash);

            // B5
            BigInteger t = r.Add(s).Mod(n);
            if (t.SignValue == 0)
                return false;

            // B6
            ECPoint q = ((ECPublicKeyParameters)ecKey).Q;
            ECPoint x1y1 = ECAlgorithms.SumOfTwoMultiplies(ecParams.G, s, q, t).Normalize();
            if (x1y1.IsInfinity)
                return false;

            // B7
            return r.Equals(e.Add(x1y1.AffineXCoord.ToBigInteger()).Mod(n));
        }

        private byte[] GetZ(byte[] userID)
        {
            AddUserID(digest, userID);

            AddFieldElement(digest, ecParams.Curve.A);
            AddFieldElement(digest, ecParams.Curve.B);
            AddFieldElement(digest, ecParams.G.AffineXCoord);
            AddFieldElement(digest, ecParams.G.AffineYCoord);
            AddFieldElement(digest, pubPoint.AffineXCoord);
            AddFieldElement(digest, pubPoint.AffineYCoord);

            return DigestUtilities.DoFinal(digest);
        }

        private void AddUserID(IDigest digest, byte[] userID)
        {
            int len = userID.Length * 8;
            digest.Update((byte)(len >> 8));
            digest.Update((byte)len);
            digest.BlockUpdate(userID, 0, userID.Length);
        }

        private void AddFieldElement(IDigest digest, ECFieldElement v)
        {
            byte[] p = v.GetEncoded();
            digest.BlockUpdate(p, 0, p.Length);
        }

        protected virtual BigInteger CalculateE(BigInteger n, byte[] message)
        {
            // TODO Should hashes larger than the order be truncated as with ECDSA?
            return new BigInteger(1, message);
        }

        protected virtual ECMultiplier CreateBasePointMultiplier()
        {
            return new FixedPointCombMultiplier();
        }
    }
}
