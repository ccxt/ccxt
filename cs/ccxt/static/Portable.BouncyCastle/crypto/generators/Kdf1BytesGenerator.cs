using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Generators
{
	/**
	 * KFD2 generator for derived keys and ivs as defined by IEEE P1363a/ISO 18033
	 * <br/>
	 * This implementation is based on IEEE P1363/ISO 18033.
	 */
	public class Kdf1BytesGenerator
		: BaseKdfBytesGenerator
	{
		/**
		 * Construct a KDF1 byte generator.
		 *
		 * @param digest the digest to be used as the source of derived keys.
		 */
		public Kdf1BytesGenerator(IDigest digest)
			: base(0, digest)
		{
		}
	}
}
