using System;

namespace Org.BouncyCastle.Crypto.Modes.Gcm
{
	public interface IGcmExponentiator
	{
		void Init(byte[] x);
		void ExponentiateX(long pow, byte[] output);
	}
}
