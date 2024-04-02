using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Agreement
{
    /**
     * P1363 7.2.1 ECSVDP-DH
     *
     * ECSVDP-DH is Elliptic Curve Secret Value Derivation Primitive,
     * Diffie-Hellman version. It is based on the work of [DH76], [Mil86],
     * and [Kob87]. This primitive derives a shared secret value from one
     * party's private key and another party's public key, where both have
     * the same set of EC domain parameters. If two parties correctly
     * execute this primitive, they will produce the same output. This
     * primitive can be invoked by a scheme to derive a shared secret key;
     * specifically, it may be used with the schemes ECKAS-DH1 and
     * DL/ECKAS-DH2. It assumes that the input keys are valid (see also
     * Section 7.2.2).
     */
    public class ECDHBasicAgreement
        : IBasicAgreement
    {
        protected internal ECPrivateKeyParameters privKey;

        public virtual void Init(
            ICipherParameters parameters)
        {
            if (parameters is ParametersWithRandom)
            {
                parameters = ((ParametersWithRandom)parameters).Parameters;
            }

            this.privKey = (ECPrivateKeyParameters)parameters;
        }

        public virtual int GetFieldSize()
        {
            return (privKey.Parameters.Curve.FieldSize + 7) / 8;
        }

        public virtual BigInteger CalculateAgreement(
            ICipherParameters pubKey)
        {
            ECPublicKeyParameters pub = (ECPublicKeyParameters)pubKey;
            ECDomainParameters dp = privKey.Parameters;
            if (!dp.Equals(pub.Parameters))
                throw new InvalidOperationException("ECDH public key has wrong domain parameters");

            BigInteger d = privKey.D;

            // Always perform calculations on the exact curve specified by our private key's parameters
            ECPoint Q = ECAlgorithms.CleanPoint(dp.Curve, pub.Q);
            if (Q.IsInfinity)
                throw new InvalidOperationException("Infinity is not a valid public key for ECDH");

            BigInteger h = dp.H;
            if (!h.Equals(BigInteger.One))
            {
                d = dp.HInv.Multiply(d).Mod(dp.N);
                Q = ECAlgorithms.ReferenceMultiply(Q, h);
            }

            ECPoint P = Q.Multiply(d).Normalize();
            if (P.IsInfinity)
                throw new InvalidOperationException("Infinity is not a valid agreement value for ECDH");

            return P.AffineXCoord.ToBigInteger();
        }
    }
}
