using System;

namespace Org.BouncyCastle.Crypto.Parameters
{
	public class MqvPublicParameters
		: ICipherParameters
	{
		private readonly ECPublicKeyParameters staticPublicKey;
		private readonly ECPublicKeyParameters ephemeralPublicKey;

        public MqvPublicParameters(
			ECPublicKeyParameters	staticPublicKey,
			ECPublicKeyParameters	ephemeralPublicKey)
		{
            if (staticPublicKey == null)
                throw new ArgumentNullException("staticPublicKey");
            if (ephemeralPublicKey == null)
                throw new ArgumentNullException("ephemeralPublicKey");
            if (!staticPublicKey.Parameters.Equals(ephemeralPublicKey.Parameters))
                throw new ArgumentException("Static and ephemeral public keys have different domain parameters");

            this.staticPublicKey = staticPublicKey;
			this.ephemeralPublicKey = ephemeralPublicKey;
        }

        public virtual ECPublicKeyParameters StaticPublicKey
		{
			get { return staticPublicKey; }
		}

		public virtual ECPublicKeyParameters EphemeralPublicKey
		{
			get { return ephemeralPublicKey; }
		}
	}
}
