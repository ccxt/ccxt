using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Generators
{
	/**
	 * KDF2 generator for derived keys and ivs as defined by IEEE P1363a/ISO 18033
	 * <br/>
	 * This implementation is based on IEEE P1363/ISO 18033.
	 */
	public class Kdf2BytesGenerator
		: BaseKdfBytesGenerator
	{
		/**
		* Construct a KDF2 bytes generator. Generates key material
		* according to IEEE P1363 or ISO 18033 depending on the initialisation.
		*
		* @param digest the digest to be used as the source of derived keys.
		*/
		public Kdf2BytesGenerator(IDigest digest)
			: base(1, digest)
		{
		}
	}
}
