using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Ocsp
{
	internal class OcspUtilities
	{
		private static readonly Dictionary<string, DerObjectIdentifier> Algorithms =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<DerObjectIdentifier, string> Oids =
            new Dictionary<DerObjectIdentifier, string>();
		private static readonly HashSet<DerObjectIdentifier> NoParams = new HashSet<DerObjectIdentifier>();

		static OcspUtilities()
		{
            Algorithms.Add("MD2WITHRSAENCRYPTION", PkcsObjectIdentifiers.MD2WithRsaEncryption);
            Algorithms.Add("MD2WITHRSA", PkcsObjectIdentifiers.MD2WithRsaEncryption);
            Algorithms.Add("MD5WITHRSAENCRYPTION", PkcsObjectIdentifiers.MD5WithRsaEncryption);
            Algorithms.Add("MD5WITHRSA", PkcsObjectIdentifiers.MD5WithRsaEncryption);
            Algorithms.Add("SHA1WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            Algorithms.Add("SHA-1WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            Algorithms.Add("SHA1WITHRSA", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            Algorithms.Add("SHA-1WITHRSA", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            Algorithms.Add("SHA224WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            Algorithms.Add("SHA-224WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            Algorithms.Add("SHA224WITHRSA", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            Algorithms.Add("SHA-224WITHRSA", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            Algorithms.Add("SHA256WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            Algorithms.Add("SHA-256WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            Algorithms.Add("SHA256WITHRSA", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            Algorithms.Add("SHA-256WITHRSA", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            Algorithms.Add("SHA384WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            Algorithms.Add("SHA-384WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            Algorithms.Add("SHA384WITHRSA", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            Algorithms.Add("SHA-384WITHRSA", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            Algorithms.Add("SHA512WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            Algorithms.Add("SHA-512WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            Algorithms.Add("SHA512WITHRSA", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            Algorithms.Add("SHA-512WITHRSA", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            Algorithms.Add("SHA512(224)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            Algorithms.Add("SHA-512(224)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            Algorithms.Add("SHA512(224)WITHRSA", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            Algorithms.Add("SHA-512(224)WITHRSA", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            Algorithms.Add("SHA512(256)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            Algorithms.Add("SHA-512(256)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            Algorithms.Add("SHA512(256)WITHRSA", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            Algorithms.Add("SHA-512(256)WITHRSA", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            Algorithms.Add("RIPEMD160WITHRSAENCRYPTION", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160);
            Algorithms.Add("RIPEMD160WITHRSA", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160);
            Algorithms.Add("RIPEMD128WITHRSAENCRYPTION", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128);
            Algorithms.Add("RIPEMD128WITHRSA", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128);
            Algorithms.Add("RIPEMD256WITHRSAENCRYPTION", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256);
            Algorithms.Add("RIPEMD256WITHRSA", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256);
            Algorithms.Add("SHA1WITHDSA", X9ObjectIdentifiers.IdDsaWithSha1);
            Algorithms.Add("DSAWITHSHA1", X9ObjectIdentifiers.IdDsaWithSha1);
            Algorithms.Add("SHA224WITHDSA", NistObjectIdentifiers.DsaWithSha224);
            Algorithms.Add("SHA256WITHDSA", NistObjectIdentifiers.DsaWithSha256);
            Algorithms.Add("SHA1WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha1);
            Algorithms.Add("ECDSAWITHSHA1", X9ObjectIdentifiers.ECDsaWithSha1);
            Algorithms.Add("SHA224WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha224);
            Algorithms.Add("SHA256WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha256);
            Algorithms.Add("SHA384WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha384);
            Algorithms.Add("SHA512WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha512);
            Algorithms.Add("GOST3411WITHGOST3410", CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94);
            Algorithms.Add("GOST3411WITHGOST3410-94", CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94);

            Oids.Add(PkcsObjectIdentifiers.MD2WithRsaEncryption, "MD2WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.MD5WithRsaEncryption, "MD5WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.Sha1WithRsaEncryption, "SHA1WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.Sha224WithRsaEncryption, "SHA224WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.Sha256WithRsaEncryption, "SHA256WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.Sha384WithRsaEncryption, "SHA384WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.Sha512WithRsaEncryption, "SHA512WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.Sha512_224WithRSAEncryption, "SHA512(224)WITHRSA");
            Oids.Add(PkcsObjectIdentifiers.Sha512_256WithRSAEncryption, "SHA512(256)WITHRSA");
            Oids.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160, "RIPEMD160WITHRSA");
            Oids.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128, "RIPEMD128WITHRSA");
            Oids.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256, "RIPEMD256WITHRSA");
            Oids.Add(X9ObjectIdentifiers.IdDsaWithSha1, "SHA1WITHDSA");
            Oids.Add(NistObjectIdentifiers.DsaWithSha224, "SHA224WITHDSA");
            Oids.Add(NistObjectIdentifiers.DsaWithSha256, "SHA256WITHDSA");
            Oids.Add(X9ObjectIdentifiers.ECDsaWithSha1, "SHA1WITHECDSA");
            Oids.Add(X9ObjectIdentifiers.ECDsaWithSha224, "SHA224WITHECDSA");
            Oids.Add(X9ObjectIdentifiers.ECDsaWithSha256, "SHA256WITHECDSA");
            Oids.Add(X9ObjectIdentifiers.ECDsaWithSha384, "SHA384WITHECDSA");
            Oids.Add(X9ObjectIdentifiers.ECDsaWithSha512, "SHA512WITHECDSA");
            Oids.Add(CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94, "GOST3411WITHGOST3410");
            Oids.Add(OiwObjectIdentifiers.MD5WithRsa, "MD5WITHRSA");
            Oids.Add(OiwObjectIdentifiers.Sha1WithRsa, "SHA1WITHRSA");
            Oids.Add(OiwObjectIdentifiers.DsaWithSha1, "SHA1WITHDSA");

            //
            // According to RFC 3279, the ASN.1 encoding SHALL (id-dsa-with-sha1) or MUST (ecdsa-with-SHA*) omit the parameters field.
            // The parameters field SHALL be NULL for RSA based signature algorithms.
            //
            NoParams.Add(X9ObjectIdentifiers.ECDsaWithSha1);
            NoParams.Add(X9ObjectIdentifiers.ECDsaWithSha224);
            NoParams.Add(X9ObjectIdentifiers.ECDsaWithSha256);
            NoParams.Add(X9ObjectIdentifiers.ECDsaWithSha384);
            NoParams.Add(X9ObjectIdentifiers.ECDsaWithSha512);
            NoParams.Add(X9ObjectIdentifiers.IdDsaWithSha1);
            NoParams.Add(OiwObjectIdentifiers.DsaWithSha1);
            NoParams.Add(NistObjectIdentifiers.DsaWithSha224);
            NoParams.Add(NistObjectIdentifiers.DsaWithSha256);
		}

		internal static DerObjectIdentifier GetAlgorithmOid(string algorithmName)
		{
            if (Algorithms.TryGetValue(algorithmName, out var oid))
                return oid;

			return new DerObjectIdentifier(algorithmName);
		}

		internal static string GetAlgorithmName(DerObjectIdentifier oid)
		{
            if (Oids.TryGetValue(oid, out var algorithmName))
                return algorithmName;

			return oid.Id;
		}

		internal static AlgorithmIdentifier GetSigAlgID(DerObjectIdentifier sigOid)
		{
            if (NoParams.Contains(sigOid))
                return new AlgorithmIdentifier(sigOid);

			return new AlgorithmIdentifier(sigOid, DerNull.Instance);
		}

		internal static IEnumerable<string> AlgNames
		{
            get { return CollectionUtilities.Proxy(Algorithms.Keys); }
		}
	}
}
