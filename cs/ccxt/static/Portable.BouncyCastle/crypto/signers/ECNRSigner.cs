using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Signers
{
    /**
     * EC-NR as described in IEEE 1363-2000
     */
    public class ECNRSigner
        : IDsa
    {
        private bool			forSigning;
        private ECKeyParameters	key;
        private SecureRandom	random;

        public virtual string AlgorithmName
        {
            get { return "ECNR"; }
        }

        public virtual void Init(
            bool				forSigning,
            ICipherParameters	parameters)
        {
            this.forSigning = forSigning;

            if (forSigning)
            {
                if (parameters is ParametersWithRandom)
                {
                    ParametersWithRandom rParam = (ParametersWithRandom) parameters;

                    this.random = rParam.Random;
                    parameters = rParam.Parameters;
                }
                else
                {
                    this.random = new SecureRandom();
                }

                if (!(parameters is ECPrivateKeyParameters))
                    throw new InvalidKeyException("EC private key required for signing");

                this.key = (ECPrivateKeyParameters) parameters;
            }
            else
            {
                if (!(parameters is ECPublicKeyParameters))
                    throw new InvalidKeyException("EC public key required for verification");

                this.key = (ECPublicKeyParameters) parameters;
            }
        }

        public virtual BigInteger Order
        {
            get { return key.Parameters.N; }
        }

        // Section 7.2.5 ECSP-NR, pg 34
        /**
         * generate a signature for the given message using the key we were
         * initialised with.  Generally, the order of the curve should be at
         * least as long as the hash of the message of interest, and with
         * ECNR it *must* be at least as long.
         *
         * @param digest  the digest to be signed.
         * @exception DataLengthException if the digest is longer than the key allows
         */
        public virtual BigInteger[] GenerateSignature(
            byte[] message)
        {
            if (!this.forSigning)
            {
                // not properly initilaized... deal with it
                throw new InvalidOperationException("not initialised for signing");
            }

            BigInteger n = Order;
            int nBitLength = n.BitLength;

            BigInteger e = new BigInteger(1, message);
            int eBitLength = e.BitLength;

            ECPrivateKeyParameters  privKey = (ECPrivateKeyParameters)key;

            if (eBitLength > nBitLength)
            {
                throw new DataLengthException("input too large for ECNR key.");
            }

            BigInteger r = null;
            BigInteger s = null;

            AsymmetricCipherKeyPair tempPair;
            do // generate r
            {
                // generate another, but very temporary, key pair using
                // the same EC parameters
                ECKeyPairGenerator keyGen = new ECKeyPairGenerator();

                keyGen.Init(new ECKeyGenerationParameters(privKey.Parameters, this.random));

                tempPair = keyGen.GenerateKeyPair();

                //    BigInteger Vx = tempPair.getPublic().getW().getAffineX();
                ECPublicKeyParameters V = (ECPublicKeyParameters) tempPair.Public; // get temp's public key
                BigInteger Vx = V.Q.AffineXCoord.ToBigInteger(); // get the point's x coordinate

                r = Vx.Add(e).Mod(n);
            }
            while (r.SignValue == 0);

            // generate s
            BigInteger x = privKey.D;                // private key value
            BigInteger u = ((ECPrivateKeyParameters) tempPair.Private).D; // temp's private key value
            s = u.Subtract(r.Multiply(x)).Mod(n);

            return new BigInteger[]{ r, s };
        }

        // Section 7.2.6 ECVP-NR, pg 35
        /**
         * return true if the value r and s represent a signature for the
         * message passed in. Generally, the order of the curve should be at
         * least as long as the hash of the message of interest, and with
         * ECNR, it *must* be at least as long.  But just in case the signer
         * applied mod(n) to the longer digest, this implementation will
         * apply mod(n) during verification.
         *
         * @param digest  the digest to be verified.
         * @param r       the r value of the signature.
         * @param s       the s value of the signature.
         * @exception DataLengthException if the digest is longer than the key allows
         */
        public virtual bool VerifySignature(
            byte[]		message,
            BigInteger	r,
            BigInteger	s)
        {
            if (this.forSigning)
            {
                // not properly initilaized... deal with it
                throw new InvalidOperationException("not initialised for verifying");
            }

            ECPublicKeyParameters pubKey = (ECPublicKeyParameters)key;
            BigInteger n = pubKey.Parameters.N;
            int nBitLength = n.BitLength;

            BigInteger e = new BigInteger(1, message);
            int eBitLength = e.BitLength;

            if (eBitLength > nBitLength)
            {
                throw new DataLengthException("input too large for ECNR key.");
            }

            // r in the range [1,n-1]
            if (r.CompareTo(BigInteger.One) < 0 || r.CompareTo(n) >= 0)
            {
                return false;
            }

            // s in the range [0,n-1]           NB: ECNR spec says 0
            if (s.CompareTo(BigInteger.Zero) < 0 || s.CompareTo(n) >= 0)
            {
                return false;
            }

            // compute P = sG + rW

            ECPoint G = pubKey.Parameters.G;
            ECPoint W = pubKey.Q;
            // calculate P using Bouncy math
            ECPoint P = ECAlgorithms.SumOfTwoMultiplies(G, s, W, r).Normalize();

            if (P.IsInfinity)
                return false;

            BigInteger x = P.AffineXCoord.ToBigInteger();
            BigInteger t = r.Subtract(x).Mod(n);

            return t.Equals(e);
        }
    }
}
