using System.Collections.Generic;

using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.GM;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Tsp
{
	/**
	 * Recognised hash algorithms for the time stamp protocol.
	 */
	public static class TspAlgorithms
	{
		public static readonly string MD5 = PkcsObjectIdentifiers.MD5.Id;

		public static readonly string Sha1 = OiwObjectIdentifiers.IdSha1.Id;

		public static readonly string Sha224 = NistObjectIdentifiers.IdSha224.Id;
		public static readonly string Sha256 = NistObjectIdentifiers.IdSha256.Id;
		public static readonly string Sha384 = NistObjectIdentifiers.IdSha384.Id;
		public static readonly string Sha512 = NistObjectIdentifiers.IdSha512.Id;

		public static readonly string RipeMD128 = TeleTrusTObjectIdentifiers.RipeMD128.Id;
		public static readonly string RipeMD160 = TeleTrusTObjectIdentifiers.RipeMD160.Id;
		public static readonly string RipeMD256 = TeleTrusTObjectIdentifiers.RipeMD256.Id;

		public static readonly string Gost3411 = CryptoProObjectIdentifiers.GostR3411.Id;
        public static readonly string Gost3411_2012_256 = RosstandartObjectIdentifiers.id_tc26_gost_3411_12_256.Id;
        public static readonly string Gost3411_2012_512 = RosstandartObjectIdentifiers.id_tc26_gost_3411_12_512.Id;

        public static readonly string SM3 = GMObjectIdentifiers.sm3.Id;

		public static readonly IList<string> Allowed;

		static TspAlgorithms()
		{
			Allowed = CollectionUtilities.ReadOnly(new List<string>()
			{
				Gost3411, Gost3411_2012_256, Gost3411_2012_512, MD5, RipeMD128, RipeMD160, RipeMD256, Sha1, Sha224,
				Sha256, Sha384, Sha512, SM3
			});
		}
	}
}
