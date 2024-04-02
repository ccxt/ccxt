using System;

using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Multiplier;

namespace Org.BouncyCastle.Crypto.Parameters
{
    /// <summary>Private parameters for an SM2 key exchange.</summary>
    /// <remarks>The ephemeralPrivateKey is used to calculate the random point used in the algorithm.</remarks>
    public class SM2KeyExchangePrivateParameters
        : ICipherParameters
    {
        private readonly bool mInitiator;
        private readonly ECPrivateKeyParameters mStaticPrivateKey;
        private readonly ECPoint mStaticPublicPoint;
        private readonly ECPrivateKeyParameters mEphemeralPrivateKey;
        private readonly ECPoint mEphemeralPublicPoint;

        public SM2KeyExchangePrivateParameters(
            bool initiator,
            ECPrivateKeyParameters staticPrivateKey,
            ECPrivateKeyParameters ephemeralPrivateKey)
        {
            if (staticPrivateKey == null)
                throw new ArgumentNullException("staticPrivateKey");
            if (ephemeralPrivateKey == null)
                throw new ArgumentNullException("ephemeralPrivateKey");

            ECDomainParameters parameters = staticPrivateKey.Parameters;
            if (!parameters.Equals(ephemeralPrivateKey.Parameters))
                throw new ArgumentException("Static and ephemeral private keys have different domain parameters");

            ECMultiplier m = new FixedPointCombMultiplier();

            this.mInitiator = initiator;
            this.mStaticPrivateKey = staticPrivateKey;
            this.mStaticPublicPoint = m.Multiply(parameters.G, staticPrivateKey.D).Normalize(); 
            this.mEphemeralPrivateKey = ephemeralPrivateKey;
            this.mEphemeralPublicPoint = m.Multiply(parameters.G, ephemeralPrivateKey.D).Normalize();
        }

        public virtual bool IsInitiator
        {
            get { return mInitiator; }
        }

        public virtual ECPrivateKeyParameters StaticPrivateKey
        {
            get { return mStaticPrivateKey; }
        }

        public virtual ECPoint StaticPublicPoint
        {
            get { return mStaticPublicPoint; }
        }

        public virtual ECPrivateKeyParameters EphemeralPrivateKey
        {
            get { return mEphemeralPrivateKey; }
        }

        public virtual ECPoint EphemeralPublicPoint
        {
            get { return mEphemeralPublicPoint; }
        }
    }
}
