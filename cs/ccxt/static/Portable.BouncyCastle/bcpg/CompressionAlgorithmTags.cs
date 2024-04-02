namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Basic tags for compression algorithms.</remarks>
	public enum CompressionAlgorithmTag
	{
		Uncompressed = 0,	// Uncompressed
		Zip = 1,			// ZIP (RFC 1951)
		ZLib = 2,			// ZLIB (RFC 1950)
		BZip2 = 3,			// BZ2
	}
}
