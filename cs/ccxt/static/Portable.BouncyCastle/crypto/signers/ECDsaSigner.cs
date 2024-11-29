using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Signers
{
    /**
     * EC-DSA as described in X9.62
     */
    public class ECDsaSigner
        : IDsa
    {
        private static readonly BigInteger Eight = BigInteger.ValueOf(8);

        protected readonly IDsaKCalculator kCalculator;

        protected ECKeyParameters key = null;
        protected SecureRandom random = null;

        /**
         * Default configuration, random K values.
         */
        public ECDsaSigner()
        {
            this.kCalculator = new RandomDsaKCalculator();
        }

        /**
         * Configuration with an alternate, possibly deterministic calculator of K.
         *
         * @param kCalculator a K value calculator.
         */
        public ECDsaSigner(IDsaKCalculator kCalculator)
        {
            this.kCalculator = kCalculator;
        }

        public virtual string AlgorithmName
        {
            get { return "ECDSA"; }
        }

        public virtual void Init(bool forSigning, ICipherParameters parameters)
        {
            SecureRandom providedRandom = null;

            if (forSigning)
            {
                if (parameters is ParametersWithRandom)
                {
                    ParametersWithRandom rParam = (ParametersWithRandom)parameters;

                    providedRandom = rParam.Random;
                    parameters = rParam.Parameters;
                }

                if (!(parameters is ECPrivateKeyParameters))
                    throw new InvalidKeyException("EC private key required for signing");

                this.key = (ECPrivateKeyParameters)parameters;
            }
            else
            {
                if (!(parameters is ECPublicKeyParameters))
                    throw new InvalidKeyException("EC public key required for verification");

                this.key = (ECPublicKeyParameters)parameters;
            }

            this.random = InitSecureRandom(forSigning && !kCalculator.IsDeterministic, providedRandom);
        }

        public virtual BigInteger Order
        {
            get { return key.Parameters.N; }
        }

        // 5.3 pg 28
        /**
         * Generate a signature for the given message using the key we were
         * initialised with. For conventional DSA the message should be a SHA-1
         * hash of the message of interest.
         *
         * @param message the message that will be verified later.
         */
        public virtual BigInteger[] GenerateSignature(byte[] message)
        {
            ECDomainParameters ec = key.Parameters;
            BigInteger n = ec.N;
            BigInteger e = CalculateE(n, message);
            BigInteger d = ((ECPrivateKeyParameters)key).D;

            if (kCalculator.IsDeterministic)
            {
                kCalculator.Init(n, d, message);
            }
            else
            {
                kCalculator.Init(n, random);
            }

            BigInteger r, s;

            ECMultiplier basePointMultiplier = CreateBasePointMultiplier();

            // 5.3.2
            do // Generate s
            {
                BigInteger k;
                do // Generate r
                {
                    k = kCalculator.NextK();

                    ECPoint p = basePointMultiplier.Multiply(ec.G, k).Normalize();

                    // 5.3.3
                    r = p.AffineXCoord.ToBigInteger().Mod(n);
                }
                while (r.SignValue == 0);

                s = BigIntegers.ModOddInverse(n, k).Multiply(e.Add(d.Multiply(r))).Mod(n);
            }
            while (s.SignValue == 0);

            return new BigInteger[]{ r, s };
        }

        // 5.4 pg 29
        /**
         * return true if the value r and s represent a DSA signature for
         * the passed in message (for standard DSA the message should be
         * a SHA-1 hash of the real message to be verified).
         */
        public virtual bool VerifySignature(byte[] message, BigInteger r, BigInteger s)
        {
            BigInteger n = key.Parameters.N;

            // r and s should both in the range [1,n-1]
            if (r.SignValue < 1 || s.SignValue < 1
                || r.CompareTo(n) >= 0 || s.CompareTo(n) >= 0)
            {
                return false;
            }

            BigInteger e = CalculateE(n, message);
            BigInteger c = BigIntegers.ModOddInverseVar(n, s);

            BigInteger u1 = e.Multiply(c).Mod(n);
            BigInteger u2 = r.Multiply(c).Mod(n);

            ECPoint G = key.Parameters.G;
            ECPoint Q = ((ECPublicKeyParameters) key).Q;

            ECPoint point = ECAlgorithms.SumOfTwoMultiplies(G, u1, Q, u2);

            if (point.IsInfinity)
                return false;

            /*
             * If possible, avoid normalizing the point (to save a modular inversion in the curve field).
             * 
             * There are ~cofactor elements of the curve field that reduce (modulo the group order) to 'r'.
             * If the cofactor is known and small, we generate those possible field values and project each
             * of them to the same "denominator" (depending on the particular projective coordinates in use)
             * as the calculated point.X. If any of the projected values matches point.X, then we have:
             *     (point.X / Denominator mod p) mod n == r
             * as required, and verification succeeds.
             * 
             * Based on an original idea by Gregory Maxwell (https://github.com/gmaxwell), as implemented in
             * the libsecp256k1 project (https://github.com/bitcoin/secp256k1).
             */
            ECCurve curve = point.Curve;
            if (curve != null)
            {
                BigInteger cofactor = curve.Cofactor;
                if (cofactor != null && cofactor.CompareTo(Eight) <= 0)
                {
                    ECFieldElement D = GetDenominator(curve.CoordinateSystem, point);
                    if (D != null && !D.IsZero)
                    {
                        ECFieldElement X = point.XCoord;
                        while (curve.IsValidFieldElement(r))
                        {
                            ECFieldElement R = curve.FromBigInteger(r).Multiply(D);
                            if (R.Equals(X))
                            {
                                return true;
                            }
                            r = r.Add(n);
                        }
                        return false;
                    }
                }
            }

            BigInteger v = point.Normalize().AffineXCoord.ToBigInteger().Mod(n);
            return v.Equals(r);
        }

        protected virtual BigInteger CalculateE(BigInteger n, byte[] message)
        {
            int messageBitLength = message.Length * 8;
            BigInteger trunc = new BigInteger(1, message);

            if (n.BitLength < messageBitLength)
            {
                trunc = trunc.ShiftRight(messageBitLength - n.BitLength);
            }

            return trunc;
        }

        protected virtual ECMultiplier CreateBasePointMultiplier()
        {
            return new FixedPointCombMultiplier();
        }

        protected virtual ECFieldElement GetDenominator(int coordinateSystem, ECPoint p)
        {
            switch (coordinateSystem)
            {
                case ECCurve.COORD_HOMOGENEOUS:
                case ECCurve.COORD_LAMBDA_PROJECTIVE:
                case ECCurve.COORD_SKEWED:
                    return p.GetZCoord(0);
                case ECCurve.COORD_JACOBIAN:
                case ECCurve.COORD_JACOBIAN_CHUDNOVSKY:
                case ECCurve.COORD_JACOBIAN_MODIFIED:
                    return p.GetZCoord(0).Square();
                default:
                    return null;
            }
        }

        protected virtual SecureRandom InitSecureRandom(bool needed, SecureRandom provided)
        {
            return !needed ? null : (provided != null) ? provided : new SecureRandom();
        }
    }
}
