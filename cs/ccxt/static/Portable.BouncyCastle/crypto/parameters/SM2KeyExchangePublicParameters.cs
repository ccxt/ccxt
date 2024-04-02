using System;

using Org.BouncyCastle.Math.EC;

namespace Org.BouncyCastle.Crypto.Parameters
{
    /// <summary>Public parameters for an SM2 key exchange.</summary>
    /// <remarks>In this case the ephemeralPublicKey provides the random point used in the algorithm.</remarks>
    public class SM2KeyExchangePublicParameters
        : ICipherParameters
    {
        private readonly ECPublicKeyParameters mStaticPublicKey;
        private readonly ECPublicKeyParameters mEphemeralPublicKey;

        public SM2KeyExchangePublicParameters(
            ECPublicKeyParameters staticPublicKey,
            ECPublicKeyParameters ephemeralPublicKey)
        {
            if (staticPublicKey == null)
                throw new ArgumentNullException("staticPublicKey");
            if (ephemeralPublicKey == null)
                throw new ArgumentNullException("ephemeralPublicKey");
            if (!staticPublicKey.Parameters.Equals(ephemeralPublicKey.Parameters))
                throw new ArgumentException("Static and ephemeral public keys have different domain parameters");

            this.mStaticPublicKey = staticPublicKey;
            this.mEphemeralPublicKey = ephemeralPublicKey;
        }

        public virtual ECPublicKeyParameters StaticPublicKey
        {
            get { return mStaticPublicKey; }
        }

        public virtual ECPublicKeyParameters EphemeralPublicKey
        {
            get { return mEphemeralPublicKey; }
        }
    }
}
