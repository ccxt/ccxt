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
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Crypto.Operators
{
	internal class X509Utilities
	{
        private static readonly IDictionary<string, DerObjectIdentifier> m_algorithms =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);
        private static readonly IDictionary<string, Asn1Encodable> m_exParams =
            new Dictionary<string, Asn1Encodable>(StringComparer.OrdinalIgnoreCase);
        private static readonly HashSet<DerObjectIdentifier> noParams = new HashSet<DerObjectIdentifier>();

		static X509Utilities()
		{
		    m_algorithms.Add("MD2WITHRSAENCRYPTION", PkcsObjectIdentifiers.MD2WithRsaEncryption);
			m_algorithms.Add("MD2WITHRSA", PkcsObjectIdentifiers.MD2WithRsaEncryption);
			m_algorithms.Add("MD5WITHRSAENCRYPTION", PkcsObjectIdentifiers.MD5WithRsaEncryption);
			m_algorithms.Add("MD5WITHRSA", PkcsObjectIdentifiers.MD5WithRsaEncryption);
			m_algorithms.Add("SHA1WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            m_algorithms.Add("SHA-1WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            m_algorithms.Add("SHA1WITHRSA", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            m_algorithms.Add("SHA-1WITHRSA", PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            m_algorithms.Add("SHA224WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            m_algorithms.Add("SHA-224WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            m_algorithms.Add("SHA224WITHRSA", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            m_algorithms.Add("SHA-224WITHRSA", PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            m_algorithms.Add("SHA256WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            m_algorithms.Add("SHA-256WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            m_algorithms.Add("SHA256WITHRSA", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            m_algorithms.Add("SHA-256WITHRSA", PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            m_algorithms.Add("SHA384WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            m_algorithms.Add("SHA-384WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            m_algorithms.Add("SHA384WITHRSA", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            m_algorithms.Add("SHA-384WITHRSA", PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            m_algorithms.Add("SHA512WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            m_algorithms.Add("SHA-512WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            m_algorithms.Add("SHA512WITHRSA", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            m_algorithms.Add("SHA-512WITHRSA", PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            m_algorithms.Add("SHA512(224)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            m_algorithms.Add("SHA-512(224)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            m_algorithms.Add("SHA512(224)WITHRSA", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            m_algorithms.Add("SHA-512(224)WITHRSA", PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            m_algorithms.Add("SHA512(256)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            m_algorithms.Add("SHA-512(256)WITHRSAENCRYPTION", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            m_algorithms.Add("SHA512(256)WITHRSA", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            m_algorithms.Add("SHA-512(256)WITHRSA", PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            m_algorithms.Add("SHA3-224WITHRSAENCRYPTION", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224);
            m_algorithms.Add("SHA3-256WITHRSAENCRYPTION", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256);
            m_algorithms.Add("SHA3-384WITHRSAENCRYPTION", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384);
            m_algorithms.Add("SHA3-512WITHRSAENCRYPTION", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512);
            m_algorithms.Add("SHA3-224WITHRSA", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224);
            m_algorithms.Add("SHA3-256WITHRSA", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256);
            m_algorithms.Add("SHA3-384WITHRSA", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384);
            m_algorithms.Add("SHA3-512WITHRSA", NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512);
            m_algorithms.Add("SHA1WITHRSAANDMGF1", PkcsObjectIdentifiers.IdRsassaPss);
			m_algorithms.Add("SHA224WITHRSAANDMGF1", PkcsObjectIdentifiers.IdRsassaPss);
			m_algorithms.Add("SHA256WITHRSAANDMGF1", PkcsObjectIdentifiers.IdRsassaPss);
			m_algorithms.Add("SHA384WITHRSAANDMGF1", PkcsObjectIdentifiers.IdRsassaPss);
			m_algorithms.Add("SHA512WITHRSAANDMGF1", PkcsObjectIdentifiers.IdRsassaPss);
			m_algorithms.Add("RIPEMD160WITHRSAENCRYPTION", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160);
			m_algorithms.Add("RIPEMD160WITHRSA", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160);
			m_algorithms.Add("RIPEMD128WITHRSAENCRYPTION", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128);
			m_algorithms.Add("RIPEMD128WITHRSA", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128);
			m_algorithms.Add("RIPEMD256WITHRSAENCRYPTION", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256);
			m_algorithms.Add("RIPEMD256WITHRSA", TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256);
			m_algorithms.Add("SHA1WITHDSA", X9ObjectIdentifiers.IdDsaWithSha1);
			m_algorithms.Add("DSAWITHSHA1", X9ObjectIdentifiers.IdDsaWithSha1);
			m_algorithms.Add("SHA224WITHDSA", NistObjectIdentifiers.DsaWithSha224);
			m_algorithms.Add("SHA256WITHDSA", NistObjectIdentifiers.DsaWithSha256);
			m_algorithms.Add("SHA384WITHDSA", NistObjectIdentifiers.DsaWithSha384);
			m_algorithms.Add("SHA512WITHDSA", NistObjectIdentifiers.DsaWithSha512);
			m_algorithms.Add("SHA1WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha1);
			m_algorithms.Add("ECDSAWITHSHA1", X9ObjectIdentifiers.ECDsaWithSha1);
			m_algorithms.Add("SHA224WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha224);
			m_algorithms.Add("SHA256WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha256);
			m_algorithms.Add("SHA384WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha384);
			m_algorithms.Add("SHA512WITHECDSA", X9ObjectIdentifiers.ECDsaWithSha512);
			m_algorithms.Add("GOST3411WITHGOST3410", CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94);
			m_algorithms.Add("GOST3411WITHGOST3410-94", CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94);
			m_algorithms.Add("GOST3411WITHECGOST3410", CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001);
			m_algorithms.Add("GOST3411WITHECGOST3410-2001", CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001);
			m_algorithms.Add("GOST3411WITHGOST3410-2001", CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001);

			//
			// According to RFC 3279, the ASN.1 encoding SHALL (id-dsa-with-sha1) or MUST (ecdsa-with-SHA*) omit the parameters field.
			// The parameters field SHALL be NULL for RSA based signature algorithms.
			//
			noParams.Add(X9ObjectIdentifiers.ECDsaWithSha1);
			noParams.Add(X9ObjectIdentifiers.ECDsaWithSha224);
			noParams.Add(X9ObjectIdentifiers.ECDsaWithSha256);
			noParams.Add(X9ObjectIdentifiers.ECDsaWithSha384);
			noParams.Add(X9ObjectIdentifiers.ECDsaWithSha512);
			noParams.Add(X9ObjectIdentifiers.IdDsaWithSha1);
            noParams.Add(OiwObjectIdentifiers.DsaWithSha1); 
            noParams.Add(NistObjectIdentifiers.DsaWithSha224);
			noParams.Add(NistObjectIdentifiers.DsaWithSha256);
			noParams.Add(NistObjectIdentifiers.DsaWithSha384);
			noParams.Add(NistObjectIdentifiers.DsaWithSha512);

			//
			// RFC 4491
			//
			noParams.Add(CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94);
			noParams.Add(CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001);

			//
			// explicit params
			//
			AlgorithmIdentifier sha1AlgId = new AlgorithmIdentifier(OiwObjectIdentifiers.IdSha1, DerNull.Instance);
            m_exParams.Add("SHA1WITHRSAANDMGF1", CreatePssParams(sha1AlgId, 20));

			AlgorithmIdentifier sha224AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha224, DerNull.Instance);
            m_exParams.Add("SHA224WITHRSAANDMGF1", CreatePssParams(sha224AlgId, 28));

			AlgorithmIdentifier sha256AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha256, DerNull.Instance);
            m_exParams.Add("SHA256WITHRSAANDMGF1", CreatePssParams(sha256AlgId, 32));

			AlgorithmIdentifier sha384AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha384, DerNull.Instance);
            m_exParams.Add("SHA384WITHRSAANDMGF1", CreatePssParams(sha384AlgId, 48));

			AlgorithmIdentifier sha512AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha512, DerNull.Instance);
            m_exParams.Add("SHA512WITHRSAANDMGF1", CreatePssParams(sha512AlgId, 64));
		}

        /**
		 * Return the digest algorithm using one of the standard JCA string
		 * representations rather than the algorithm identifier (if possible).
		 */
        private static string GetDigestAlgName(
            DerObjectIdentifier digestAlgOID)
        {
            if (PkcsObjectIdentifiers.MD5.Equals(digestAlgOID))
            {
                return "MD5";
            }
            else if (OiwObjectIdentifiers.IdSha1.Equals(digestAlgOID))
            {
                return "SHA1";
            }
            else if (NistObjectIdentifiers.IdSha224.Equals(digestAlgOID))
            {
                return "SHA224";
            }
            else if (NistObjectIdentifiers.IdSha256.Equals(digestAlgOID))
            {
                return "SHA256";
            }
            else if (NistObjectIdentifiers.IdSha384.Equals(digestAlgOID))
            {
                return "SHA384";
            }
            else if (NistObjectIdentifiers.IdSha512.Equals(digestAlgOID))
            {
                return "SHA512";
            }
            else if (NistObjectIdentifiers.IdSha512_224.Equals(digestAlgOID))
            {
                return "SHA512(224)";
            }
            else if (NistObjectIdentifiers.IdSha512_256.Equals(digestAlgOID))
            {
                return "SHA512(256)";
            }
            else if (TeleTrusTObjectIdentifiers.RipeMD128.Equals(digestAlgOID))
            {
                return "RIPEMD128";
            }
            else if (TeleTrusTObjectIdentifiers.RipeMD160.Equals(digestAlgOID))
            {
                return "RIPEMD160";
            }
            else if (TeleTrusTObjectIdentifiers.RipeMD256.Equals(digestAlgOID))
            {
                return "RIPEMD256";
            }
            else if (CryptoProObjectIdentifiers.GostR3411.Equals(digestAlgOID))
            {
                return "GOST3411";
            }
            else
            {
                return digestAlgOID.Id;
            }
        }

        internal static string GetSignatureName(AlgorithmIdentifier sigAlgId)
        {
            Asn1Encodable parameters = sigAlgId.Parameters;

            if (parameters != null && !DerNull.Instance.Equals(parameters))
            {
                if (sigAlgId.Algorithm.Equals(PkcsObjectIdentifiers.IdRsassaPss))
                {
                    RsassaPssParameters rsaParams = RsassaPssParameters.GetInstance(parameters);

                    return GetDigestAlgName(rsaParams.HashAlgorithm.Algorithm) + "withRSAandMGF1";
                }
                if (sigAlgId.Algorithm.Equals(X9ObjectIdentifiers.ECDsaWithSha2))
                {
                    Asn1Sequence ecDsaParams = Asn1Sequence.GetInstance(parameters);

                    return GetDigestAlgName((DerObjectIdentifier)ecDsaParams[0]) + "withECDSA";
                }
            }

            return sigAlgId.Algorithm.Id;
        }

        private static RsassaPssParameters CreatePssParams(
			AlgorithmIdentifier	hashAlgId,
			int					saltSize)
		{
			return new RsassaPssParameters(
				hashAlgId,
				new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, hashAlgId),
				new DerInteger(saltSize),
				new DerInteger(1));
		}

		internal static DerObjectIdentifier GetAlgorithmOid(string algorithmName)
		{
            if (m_algorithms.TryGetValue(algorithmName, out var oid))
                return oid;

			return new DerObjectIdentifier(algorithmName);
		}

		internal static AlgorithmIdentifier GetSigAlgID(DerObjectIdentifier sigOid, string algorithmName)
		{
			if (noParams.Contains(sigOid))
				return new AlgorithmIdentifier(sigOid);

            if (m_exParams.TryGetValue(algorithmName, out var explicitParameters))
                return new AlgorithmIdentifier(sigOid, explicitParameters);

			return new AlgorithmIdentifier(sigOid, DerNull.Instance);
		}

		internal static IEnumerable<string> GetAlgNames()
		{
			return CollectionUtilities.Proxy(m_algorithms.Keys);
		}
	}



    /// <summary>
    /// Calculator factory class for signature generation in ASN.1 based profiles that use an AlgorithmIdentifier to preserve
    /// signature algorithm details.
    /// </summary>
	public class Asn1SignatureFactory
        : ISignatureFactory
	{
		private readonly AlgorithmIdentifier algID;
        private readonly string algorithm;
        private readonly AsymmetricKeyParameter privateKey;
        private readonly SecureRandom random;

        /// <summary>
        /// Base constructor.
        /// </summary>
        /// <param name="algorithm">The name of the signature algorithm to use.</param>
        /// <param name="privateKey">The private key to be used in the signing operation.</param>
		public Asn1SignatureFactory (string algorithm, AsymmetricKeyParameter privateKey)
            : this(algorithm, privateKey, null)
		{
		}

        /// <summary>
        /// Constructor which also specifies a source of randomness to be used if one is required.
        /// </summary>
        /// <param name="algorithm">The name of the signature algorithm to use.</param>
        /// <param name="privateKey">The private key to be used in the signing operation.</param>
        /// <param name="random">The source of randomness to be used in signature calculation.</param>
		public Asn1SignatureFactory(string algorithm, AsymmetricKeyParameter privateKey, SecureRandom random)
		{
            if (algorithm == null)
                throw new ArgumentNullException("algorithm");
            if (privateKey == null)
                throw new ArgumentNullException("privateKey");
            if (!privateKey.IsPrivate)
                throw new ArgumentException("Key for signing must be private", "privateKey");

			DerObjectIdentifier sigOid = X509Utilities.GetAlgorithmOid(algorithm);

            this.algorithm = algorithm;
            this.privateKey = privateKey;
            this.random = random;
			this.algID = X509Utilities.GetSigAlgID(sigOid, algorithm);
		}

		public object AlgorithmDetails
		{
			get { return this.algID; }
		}

        public IStreamCalculator CreateCalculator()
        {
            ISigner signer = SignerUtilities.InitSigner(algorithm, true, privateKey, random);

            return new DefaultSignatureCalculator(signer);
        }

        /// <summary>
        /// Allows enumeration of the signature names supported by the verifier provider.
        /// </summary>
        public static IEnumerable<string> SignatureAlgNames
        {
            get { return X509Utilities.GetAlgNames(); }
        }
    }

    /// <summary>
    /// Verifier class for signature verification in ASN.1 based profiles that use an AlgorithmIdentifier to preserve
    /// signature algorithm details.
    /// </summary>
    public class Asn1VerifierFactory
        : IVerifierFactory
	{
		private readonly AlgorithmIdentifier algID;
        private readonly AsymmetricKeyParameter publicKey;

        /// <summary>
        /// Base constructor.
        /// </summary>
        /// <param name="algorithm">The name of the signature algorithm to use.</param>
        /// <param name="publicKey">The public key to be used in the verification operation.</param>
        public Asn1VerifierFactory(string algorithm, AsymmetricKeyParameter publicKey)
		{
            if (algorithm == null)
                throw new ArgumentNullException("algorithm");
            if (publicKey == null)
                throw new ArgumentNullException("publicKey");
            if (publicKey.IsPrivate)
                throw new ArgumentException("Key for verifying must be public", "publicKey");

			DerObjectIdentifier sigOid = X509Utilities.GetAlgorithmOid(algorithm);

            this.publicKey = publicKey;
			this.algID = X509Utilities.GetSigAlgID(sigOid, algorithm);
		}

		public Asn1VerifierFactory(AlgorithmIdentifier algorithm, AsymmetricKeyParameter publicKey)
		{
            this.publicKey = publicKey;
			this.algID = algorithm;
		}

		public object AlgorithmDetails
		{
			get { return this.algID; }
		}

        public IStreamCalculator CreateCalculator()
        {       
           
            ISigner verifier = SignerUtilities.InitSigner(X509Utilities.GetSignatureName(algID), false, publicKey, null);

            return new DefaultVerifierCalculator(verifier);
        }
    }

    /// <summary>
    /// Provider class which supports dynamic creation of signature verifiers.
    /// </summary>
	public class Asn1VerifierFactoryProvider: IVerifierFactoryProvider
	{
		private readonly AsymmetricKeyParameter publicKey;

        /// <summary>
        /// Base constructor - specify the public key to be used in verification.
        /// </summary>
        /// <param name="publicKey">The public key to be used in creating verifiers provided by this object.</param>
		public Asn1VerifierFactoryProvider(AsymmetricKeyParameter publicKey)
		{
			this.publicKey = publicKey;
		}

		public IVerifierFactory CreateVerifierFactory(object algorithmDetails)
		{
            return new Asn1VerifierFactory((AlgorithmIdentifier)algorithmDetails, publicKey);
		}

		/// <summary>
		/// Allows enumeration of the signature names supported by the verifier provider.
		/// </summary>
		public IEnumerable<string> SignatureAlgNames
		{
			get { return X509Utilities.GetAlgNames(); }
		}
	}
}

