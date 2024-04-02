using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.BC;
using Org.BouncyCastle.Asn1.Bsi;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.Eac;
using Org.BouncyCastle.Asn1.GM;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
    public class DefaultSignatureAlgorithmIdentifierFinder
    {
        private static readonly IDictionary<string, DerObjectIdentifier> m_algorithms =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);
        private static readonly HashSet<DerObjectIdentifier> noParams = new HashSet<DerObjectIdentifier>();
        private static readonly IDictionary<string, Asn1Encodable> m_params =
            new Dictionary<string, Asn1Encodable>(StringComparer.OrdinalIgnoreCase);
        private static readonly HashSet<DerObjectIdentifier> pkcs15RsaEncryption = new HashSet<DerObjectIdentifier>();
        private static readonly IDictionary<DerObjectIdentifier, DerObjectIdentifier> m_digestOids =
            new Dictionary<DerObjectIdentifier, DerObjectIdentifier>();

        //private static readonly DerObjectIdentifier ENCRYPTION_RSA = PkcsObjectIdentifiers.RsaEncryption;
        //private static readonly DerObjectIdentifier ENCRYPTION_DSA = X9ObjectIdentifiers.IdDsaWithSha1;
        //private static readonly DerObjectIdentifier ENCRYPTION_ECDSA = X9ObjectIdentifiers.ECDsaWithSha1;
        //private static readonly DerObjectIdentifier ENCRYPTION_RSA_PSS = PkcsObjectIdentifiers.IdRsassaPss;
        //private static readonly DerObjectIdentifier ENCRYPTION_GOST3410 = CryptoProObjectIdentifiers.GostR3410x94;
        //private static readonly DerObjectIdentifier ENCRYPTION_ECGOST3410 = CryptoProObjectIdentifiers.GostR3410x2001;
        //private static readonly DerObjectIdentifier ENCRYPTION_ECGOST3410_2012_256 = RosstandartObjectIdentifiers.id_tc26_gost_3410_12_256;
        //private static readonly DerObjectIdentifier ENCRYPTION_ECGOST3410_2012_512 = RosstandartObjectIdentifiers.id_tc26_gost_3410_12_512;

        static DefaultSignatureAlgorithmIdentifierFinder()
        {
            m_algorithms["MD2WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.MD2WithRsaEncryption;
            m_algorithms["MD2WITHRSA"] = PkcsObjectIdentifiers.MD2WithRsaEncryption;
            m_algorithms["MD5WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.MD5WithRsaEncryption;
            m_algorithms["MD5WITHRSA"] = PkcsObjectIdentifiers.MD5WithRsaEncryption;
            m_algorithms["SHA1WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha1WithRsaEncryption;
            m_algorithms["SHA-1WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha1WithRsaEncryption;
            m_algorithms["SHA1WITHRSA"] = PkcsObjectIdentifiers.Sha1WithRsaEncryption;
            m_algorithms["SHA-1WITHRSA"] = PkcsObjectIdentifiers.Sha1WithRsaEncryption;
            m_algorithms["SHA224WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha224WithRsaEncryption;
            m_algorithms["SHA-224WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha224WithRsaEncryption;
            m_algorithms["SHA224WITHRSA"] = PkcsObjectIdentifiers.Sha224WithRsaEncryption;
            m_algorithms["SHA-224WITHRSA"] = PkcsObjectIdentifiers.Sha224WithRsaEncryption;
            m_algorithms["SHA256WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha256WithRsaEncryption;
            m_algorithms["SHA-256WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha256WithRsaEncryption;
            m_algorithms["SHA256WITHRSA"] = PkcsObjectIdentifiers.Sha256WithRsaEncryption;
            m_algorithms["SHA-256WITHRSA"] = PkcsObjectIdentifiers.Sha256WithRsaEncryption;
            m_algorithms["SHA384WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha384WithRsaEncryption;
            m_algorithms["SHA-384WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha384WithRsaEncryption;
            m_algorithms["SHA384WITHRSA"] = PkcsObjectIdentifiers.Sha384WithRsaEncryption;
            m_algorithms["SHA-384WITHRSA"] = PkcsObjectIdentifiers.Sha384WithRsaEncryption;
            m_algorithms["SHA512WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha512WithRsaEncryption;
            m_algorithms["SHA-512WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha512WithRsaEncryption;
            m_algorithms["SHA512WITHRSA"] = PkcsObjectIdentifiers.Sha512WithRsaEncryption;
            m_algorithms["SHA-512WITHRSA"] = PkcsObjectIdentifiers.Sha512WithRsaEncryption;
            m_algorithms["SHA512(224)WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha512_224WithRSAEncryption;
            m_algorithms["SHA-512(224)WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha512_224WithRSAEncryption;
            m_algorithms["SHA512(224)WITHRSA"] = PkcsObjectIdentifiers.Sha512_224WithRSAEncryption;
            m_algorithms["SHA-512(224)WITHRSA"] = PkcsObjectIdentifiers.Sha512_224WithRSAEncryption;
            m_algorithms["SHA512(256)WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha512_256WithRSAEncryption;
            m_algorithms["SHA-512(256)WITHRSAENCRYPTION"] = PkcsObjectIdentifiers.Sha512_256WithRSAEncryption;
            m_algorithms["SHA512(256)WITHRSA"] = PkcsObjectIdentifiers.Sha512_256WithRSAEncryption;
            m_algorithms["SHA-512(256)WITHRSA"] = PkcsObjectIdentifiers.Sha512_256WithRSAEncryption;
            m_algorithms["SHA1WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA224WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA256WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA384WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA512WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA3-224WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA3-256WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA3-384WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["SHA3-512WITHRSAANDMGF1"] = PkcsObjectIdentifiers.IdRsassaPss;
            m_algorithms["RIPEMD160WITHRSAENCRYPTION"] = TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160;
            m_algorithms["RIPEMD160WITHRSA"] = TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160;
            m_algorithms["RIPEMD128WITHRSAENCRYPTION"] = TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128;
            m_algorithms["RIPEMD128WITHRSA"] = TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128;
            m_algorithms["RIPEMD256WITHRSAENCRYPTION"] = TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256;
            m_algorithms["RIPEMD256WITHRSA"] = TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256;
            m_algorithms["SHA1WITHDSA"] = X9ObjectIdentifiers.IdDsaWithSha1;
            m_algorithms["SHA-1WITHDSA"] = X9ObjectIdentifiers.IdDsaWithSha1;
            m_algorithms["DSAWITHSHA1"] = X9ObjectIdentifiers.IdDsaWithSha1;
            m_algorithms["SHA224WITHDSA"] = NistObjectIdentifiers.DsaWithSha224;
            m_algorithms["SHA256WITHDSA"] = NistObjectIdentifiers.DsaWithSha256;
            m_algorithms["SHA384WITHDSA"] = NistObjectIdentifiers.DsaWithSha384;
            m_algorithms["SHA512WITHDSA"] = NistObjectIdentifiers.DsaWithSha512;
            m_algorithms["SHA3-224WITHDSA"] = NistObjectIdentifiers.IdDsaWithSha3_224;
            m_algorithms["SHA3-256WITHDSA"] = NistObjectIdentifiers.IdDsaWithSha3_256;
            m_algorithms["SHA3-384WITHDSA"] = NistObjectIdentifiers.IdDsaWithSha3_384;
            m_algorithms["SHA3-512WITHDSA"] = NistObjectIdentifiers.IdDsaWithSha3_512;
            m_algorithms["SHA3-224WITHECDSA"] = NistObjectIdentifiers.IdEcdsaWithSha3_224;
            m_algorithms["SHA3-256WITHECDSA"] = NistObjectIdentifiers.IdEcdsaWithSha3_256;
            m_algorithms["SHA3-384WITHECDSA"] = NistObjectIdentifiers.IdEcdsaWithSha3_384;
            m_algorithms["SHA3-512WITHECDSA"] = NistObjectIdentifiers.IdEcdsaWithSha3_512;
            m_algorithms["SHA3-224WITHRSA"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224;
            m_algorithms["SHA3-256WITHRSA"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256;
            m_algorithms["SHA3-384WITHRSA"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384;
            m_algorithms["SHA3-512WITHRSA"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512;
            m_algorithms["SHA3-224WITHRSAENCRYPTION"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224;
            m_algorithms["SHA3-256WITHRSAENCRYPTION"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256;
            m_algorithms["SHA3-384WITHRSAENCRYPTION"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384;
            m_algorithms["SHA3-512WITHRSAENCRYPTION"] = NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512;
            m_algorithms["SHA1WITHECDSA"] = X9ObjectIdentifiers.ECDsaWithSha1;
            m_algorithms["ECDSAWITHSHA1"] = X9ObjectIdentifiers.ECDsaWithSha1;
            m_algorithms["SHA224WITHECDSA"] = X9ObjectIdentifiers.ECDsaWithSha224;
            m_algorithms["SHA256WITHECDSA"] = X9ObjectIdentifiers.ECDsaWithSha256;
            m_algorithms["SHA384WITHECDSA"] = X9ObjectIdentifiers.ECDsaWithSha384;
            m_algorithms["SHA512WITHECDSA"] = X9ObjectIdentifiers.ECDsaWithSha512;


            m_algorithms["GOST3411WITHGOST3410"] = CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94;
            m_algorithms["GOST3411WITHGOST3410-94"] = CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94;
            m_algorithms["GOST3411WITHECGOST3410"] = CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001;
            m_algorithms["GOST3411WITHECGOST3410-2001"] = CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001;
            m_algorithms["GOST3411WITHGOST3410-2001"] = CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001;
            m_algorithms["GOST3411WITHECGOST3410-2012-256"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_256;
            m_algorithms["GOST3411WITHECGOST3410-2012-512"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_512;
            m_algorithms["GOST3411WITHGOST3410-2012-256"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_256;
            m_algorithms["GOST3411WITHGOST3410-2012-512"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_512;
            m_algorithms["GOST3411-2012-256WITHECGOST3410-2012-256"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_256;
            m_algorithms["GOST3411-2012-512WITHECGOST3410-2012-512"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_512;
            m_algorithms["GOST3411-2012-256WITHGOST3410-2012-256"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_256;
            m_algorithms["GOST3411-2012-512WITHGOST3410-2012-512"] = RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_512;
            m_algorithms["SHA1WITHPLAIN-ECDSA"] = BsiObjectIdentifiers.ecdsa_plain_SHA1;
            m_algorithms["SHA224WITHPLAIN-ECDSA"] = BsiObjectIdentifiers.ecdsa_plain_SHA224;
            m_algorithms["SHA256WITHPLAIN-ECDSA"] = BsiObjectIdentifiers.ecdsa_plain_SHA256;
            m_algorithms["SHA384WITHPLAIN-ECDSA"] = BsiObjectIdentifiers.ecdsa_plain_SHA384;
            m_algorithms["SHA512WITHPLAIN-ECDSA"] = BsiObjectIdentifiers.ecdsa_plain_SHA512;
            m_algorithms["RIPEMD160WITHPLAIN-ECDSA"] = BsiObjectIdentifiers.ecdsa_plain_RIPEMD160;
            m_algorithms["SHA1WITHCVC-ECDSA"] = EacObjectIdentifiers.id_TA_ECDSA_SHA_1;
            m_algorithms["SHA224WITHCVC-ECDSA"] = EacObjectIdentifiers.id_TA_ECDSA_SHA_224;
            m_algorithms["SHA256WITHCVC-ECDSA"] = EacObjectIdentifiers.id_TA_ECDSA_SHA_256;
            m_algorithms["SHA384WITHCVC-ECDSA"] = EacObjectIdentifiers.id_TA_ECDSA_SHA_384;
            m_algorithms["SHA512WITHCVC-ECDSA"] = EacObjectIdentifiers.id_TA_ECDSA_SHA_512;
            m_algorithms["SHA3-512WITHSPHINCS256"] = BCObjectIdentifiers.sphincs256_with_SHA3_512;
            m_algorithms["SHA512WITHSPHINCS256"] = BCObjectIdentifiers.sphincs256_with_SHA512;

            m_algorithms["SHA256WITHSM2"] = GMObjectIdentifiers.sm2sign_with_sha256;
            m_algorithms["SM3WITHSM2"] = GMObjectIdentifiers.sm2sign_with_sm3;

            m_algorithms["SHA256WITHXMSS"] = BCObjectIdentifiers.xmss_with_SHA256;
            m_algorithms["SHA512WITHXMSS"] = BCObjectIdentifiers.xmss_with_SHA512;
            m_algorithms["SHAKE128WITHXMSS"] = BCObjectIdentifiers.xmss_with_SHAKE128;
            m_algorithms["SHAKE256WITHXMSS"] = BCObjectIdentifiers.xmss_with_SHAKE256;

            m_algorithms["SHA256WITHXMSSMT"] = BCObjectIdentifiers.xmss_mt_with_SHA256;
            m_algorithms["SHA512WITHXMSSMT"] = BCObjectIdentifiers.xmss_mt_with_SHA512;
            m_algorithms["SHAKE128WITHXMSSMT"] = BCObjectIdentifiers.xmss_mt_with_SHAKE128;
            m_algorithms["SHAKE256WITHXMSSMT"] = BCObjectIdentifiers.xmss_mt_with_SHAKE256;


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
            noParams.Add(NistObjectIdentifiers.DsaWithSha224);
            noParams.Add(NistObjectIdentifiers.DsaWithSha256);
            noParams.Add(NistObjectIdentifiers.DsaWithSha384);
            noParams.Add(NistObjectIdentifiers.DsaWithSha512);
            noParams.Add(NistObjectIdentifiers.IdDsaWithSha3_224);
            noParams.Add(NistObjectIdentifiers.IdDsaWithSha3_256);
            noParams.Add(NistObjectIdentifiers.IdDsaWithSha3_384);
            noParams.Add(NistObjectIdentifiers.IdDsaWithSha3_512);
            noParams.Add(NistObjectIdentifiers.IdEcdsaWithSha3_224);
            noParams.Add(NistObjectIdentifiers.IdEcdsaWithSha3_256);
            noParams.Add(NistObjectIdentifiers.IdEcdsaWithSha3_384);
            noParams.Add(NistObjectIdentifiers.IdEcdsaWithSha3_512);


            //
            // RFC 4491
            //
            noParams.Add(CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94);
            noParams.Add(CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001);
            noParams.Add(RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_256);
            noParams.Add(RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_512);

            //
            // SPHINCS-256
            //
            noParams.Add(BCObjectIdentifiers.sphincs256_with_SHA512);
            noParams.Add(BCObjectIdentifiers.sphincs256_with_SHA3_512);

            //
            // XMSS
            //
            noParams.Add(BCObjectIdentifiers.xmss_with_SHA256);
            noParams.Add(BCObjectIdentifiers.xmss_with_SHA512);
            noParams.Add(BCObjectIdentifiers.xmss_with_SHAKE128);
            noParams.Add(BCObjectIdentifiers.xmss_with_SHAKE256);
            noParams.Add(BCObjectIdentifiers.xmss_mt_with_SHA256);
            noParams.Add(BCObjectIdentifiers.xmss_mt_with_SHA512);
            noParams.Add(BCObjectIdentifiers.xmss_mt_with_SHAKE128);
            noParams.Add(BCObjectIdentifiers.xmss_mt_with_SHAKE256);

            //
            // SM2
            //
            noParams.Add(GMObjectIdentifiers.sm2sign_with_sha256);
            noParams.Add(GMObjectIdentifiers.sm2sign_with_sm3);

            //
            // PKCS 1.5 encrypted  algorithms
            //
            pkcs15RsaEncryption.Add(PkcsObjectIdentifiers.Sha1WithRsaEncryption);
            pkcs15RsaEncryption.Add(PkcsObjectIdentifiers.Sha224WithRsaEncryption);
            pkcs15RsaEncryption.Add(PkcsObjectIdentifiers.Sha256WithRsaEncryption);
            pkcs15RsaEncryption.Add(PkcsObjectIdentifiers.Sha384WithRsaEncryption);
            pkcs15RsaEncryption.Add(PkcsObjectIdentifiers.Sha512WithRsaEncryption);
            pkcs15RsaEncryption.Add(PkcsObjectIdentifiers.Sha512_224WithRSAEncryption);
            pkcs15RsaEncryption.Add(PkcsObjectIdentifiers.Sha512_256WithRSAEncryption);
            pkcs15RsaEncryption.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128);
            pkcs15RsaEncryption.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160);
            pkcs15RsaEncryption.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256);
            pkcs15RsaEncryption.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224);
            pkcs15RsaEncryption.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256);
            pkcs15RsaEncryption.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384);
            pkcs15RsaEncryption.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512);

            //
            // explicit params
            //
            AlgorithmIdentifier sha1AlgId = new AlgorithmIdentifier(OiwObjectIdentifiers.IdSha1, DerNull.Instance);
            m_params["SHA1WITHRSAANDMGF1"] = CreatePssParams(sha1AlgId, 20);

            AlgorithmIdentifier sha224AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha224, DerNull.Instance);
            m_params["SHA224WITHRSAANDMGF1"] = CreatePssParams(sha224AlgId, 28);

            AlgorithmIdentifier sha256AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha256, DerNull.Instance);
            m_params["SHA256WITHRSAANDMGF1"] = CreatePssParams(sha256AlgId, 32);

            AlgorithmIdentifier sha384AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha384, DerNull.Instance);
            m_params["SHA384WITHRSAANDMGF1"] = CreatePssParams(sha384AlgId, 48);

            AlgorithmIdentifier sha512AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha512, DerNull.Instance);
            m_params["SHA512WITHRSAANDMGF1"] = CreatePssParams(sha512AlgId, 64);

            AlgorithmIdentifier sha3_224AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha3_224, DerNull.Instance);
            m_params["SHA3-224WITHRSAANDMGF1"] = CreatePssParams(sha3_224AlgId, 28);

            AlgorithmIdentifier sha3_256AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha3_256, DerNull.Instance);
            m_params["SHA3-256WITHRSAANDMGF1"] = CreatePssParams(sha3_256AlgId, 32);

            AlgorithmIdentifier sha3_384AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha3_384, DerNull.Instance);
            m_params["SHA3-384WITHRSAANDMGF1"] = CreatePssParams(sha3_384AlgId, 48);

            AlgorithmIdentifier sha3_512AlgId = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha3_512, DerNull.Instance);
            m_params["SHA3-512WITHRSAANDMGF1"] = CreatePssParams(sha3_512AlgId, 64);

            //
            // digests
            //
            m_digestOids[PkcsObjectIdentifiers.Sha224WithRsaEncryption] = NistObjectIdentifiers.IdSha224;
            m_digestOids[PkcsObjectIdentifiers.Sha256WithRsaEncryption] = NistObjectIdentifiers.IdSha256;
            m_digestOids[PkcsObjectIdentifiers.Sha384WithRsaEncryption] = NistObjectIdentifiers.IdSha384;
            m_digestOids[PkcsObjectIdentifiers.Sha512WithRsaEncryption] = NistObjectIdentifiers.IdSha512;
            m_digestOids[PkcsObjectIdentifiers.Sha512_224WithRSAEncryption] = NistObjectIdentifiers.IdSha512_224;
            m_digestOids[PkcsObjectIdentifiers.Sha512_256WithRSAEncryption] = NistObjectIdentifiers.IdSha512_256;
            m_digestOids[NistObjectIdentifiers.DsaWithSha224] = NistObjectIdentifiers.IdSha224;
            m_digestOids[NistObjectIdentifiers.DsaWithSha256] = NistObjectIdentifiers.IdSha256;
            m_digestOids[NistObjectIdentifiers.DsaWithSha384] = NistObjectIdentifiers.IdSha384;
            m_digestOids[NistObjectIdentifiers.DsaWithSha512] = NistObjectIdentifiers.IdSha512;
            m_digestOids[NistObjectIdentifiers.IdDsaWithSha3_224] = NistObjectIdentifiers.IdSha3_224;
            m_digestOids[NistObjectIdentifiers.IdDsaWithSha3_256] = NistObjectIdentifiers.IdSha3_256;
            m_digestOids[NistObjectIdentifiers.IdDsaWithSha3_384] = NistObjectIdentifiers.IdSha3_384;
            m_digestOids[NistObjectIdentifiers.IdDsaWithSha3_512] = NistObjectIdentifiers.IdSha3_512;
            m_digestOids[NistObjectIdentifiers.IdEcdsaWithSha3_224] = NistObjectIdentifiers.IdSha3_224;
            m_digestOids[NistObjectIdentifiers.IdEcdsaWithSha3_256] = NistObjectIdentifiers.IdSha3_256;
            m_digestOids[NistObjectIdentifiers.IdEcdsaWithSha3_384] = NistObjectIdentifiers.IdSha3_384;
            m_digestOids[NistObjectIdentifiers.IdEcdsaWithSha3_512] = NistObjectIdentifiers.IdSha3_512;
            m_digestOids[NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224] = NistObjectIdentifiers.IdSha3_224;
            m_digestOids[NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256] = NistObjectIdentifiers.IdSha3_256;
            m_digestOids[NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384] = NistObjectIdentifiers.IdSha3_384;
            m_digestOids[NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512] = NistObjectIdentifiers.IdSha3_512;

            m_digestOids[PkcsObjectIdentifiers.MD2WithRsaEncryption] = PkcsObjectIdentifiers.MD2;
            m_digestOids[PkcsObjectIdentifiers.MD4WithRsaEncryption] = PkcsObjectIdentifiers.MD4;
            m_digestOids[PkcsObjectIdentifiers.MD5WithRsaEncryption] = PkcsObjectIdentifiers.MD5;
            m_digestOids[PkcsObjectIdentifiers.Sha1WithRsaEncryption] = OiwObjectIdentifiers.IdSha1;
            m_digestOids[TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128] = TeleTrusTObjectIdentifiers.RipeMD128;
            m_digestOids[TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160] = TeleTrusTObjectIdentifiers.RipeMD160;
            m_digestOids[TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256] = TeleTrusTObjectIdentifiers.RipeMD256;
            m_digestOids[CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94] = CryptoProObjectIdentifiers.GostR3411;
            m_digestOids[CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001] = CryptoProObjectIdentifiers.GostR3411;
            m_digestOids[RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_256] = RosstandartObjectIdentifiers.id_tc26_gost_3411_12_256;
            m_digestOids[RosstandartObjectIdentifiers.id_tc26_signwithdigest_gost_3410_12_512] = RosstandartObjectIdentifiers.id_tc26_gost_3411_12_512;

            m_digestOids[GMObjectIdentifiers.sm2sign_with_sha256] = NistObjectIdentifiers.IdSha256;
            m_digestOids[GMObjectIdentifiers.sm2sign_with_sm3] = GMObjectIdentifiers.sm3;
        }

        private static AlgorithmIdentifier Generate(string signatureAlgorithm)
        {
            AlgorithmIdentifier sigAlgId;
            //AlgorithmIdentifier encAlgId;
            //AlgorithmIdentifier digAlgId;

            if (!m_algorithms.TryGetValue(signatureAlgorithm, out var sigOid))
                throw new ArgumentException("Unknown signature type requested: " + signatureAlgorithm);

            if (noParams.Contains(sigOid))
            {
                sigAlgId = new AlgorithmIdentifier(sigOid);
            }
            else if (m_params.TryGetValue(signatureAlgorithm, out var explicitParameters))
            {
                sigAlgId = new AlgorithmIdentifier(sigOid, explicitParameters);
            }
            else
            {
                sigAlgId = new AlgorithmIdentifier(sigOid, DerNull.Instance);
            }

            //if (pkcs15RsaEncryption.Contains(sigOid))
            //{
            //    encAlgId = new AlgorithmIdentifier(PkcsObjectIdentifiers.RsaEncryption, DerNull.Instance);
            //}
            //else
            //{
            //    encAlgId = sigAlgId;
            //}

            //if (sigAlgId.Algorithm.Equals(PkcsObjectIdentifiers.IdRsassaPss))
            //{
            //    digAlgId = ((RsassaPssParameters)sigAlgId.Parameters).HashAlgorithm;
            //}
            //else
            //{
            //    digAlgId = new AlgorithmIdentifier(m_digestOids[sigOid], DerNull.Instance);
            //}

            return sigAlgId;
        }

        private static RsassaPssParameters CreatePssParams(AlgorithmIdentifier hashAlgId, int saltSize)
        {
            return new RsassaPssParameters(
                hashAlgId,
                new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, hashAlgId),
                new DerInteger(saltSize),
                new DerInteger(1));
        }

        public AlgorithmIdentifier Find(string sigAlgName)
        {
            return Generate(sigAlgName);
        }
    }

    public class DefaultDigestAlgorithmIdentifierFinder
    {
        private static readonly IDictionary<DerObjectIdentifier, DerObjectIdentifier> m_digestOids =
            new Dictionary<DerObjectIdentifier, DerObjectIdentifier>();
        private static readonly IDictionary<string, DerObjectIdentifier> m_digestNameToOids =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);

        static DefaultDigestAlgorithmIdentifierFinder()
        {
            //
            // digests
            //
            m_digestOids.Add(OiwObjectIdentifiers.MD4WithRsaEncryption, PkcsObjectIdentifiers.MD4);
            m_digestOids.Add(OiwObjectIdentifiers.MD4WithRsa, PkcsObjectIdentifiers.MD4);
            m_digestOids.Add(OiwObjectIdentifiers.MD5WithRsa, PkcsObjectIdentifiers.MD5);
            m_digestOids.Add(OiwObjectIdentifiers.Sha1WithRsa, OiwObjectIdentifiers.IdSha1);
            m_digestOids.Add(OiwObjectIdentifiers.DsaWithSha1, OiwObjectIdentifiers.IdSha1);

            m_digestOids.Add(PkcsObjectIdentifiers.Sha224WithRsaEncryption, NistObjectIdentifiers.IdSha224);
            m_digestOids.Add(PkcsObjectIdentifiers.Sha256WithRsaEncryption, NistObjectIdentifiers.IdSha256);
            m_digestOids.Add(PkcsObjectIdentifiers.Sha384WithRsaEncryption, NistObjectIdentifiers.IdSha384);
            m_digestOids.Add(PkcsObjectIdentifiers.Sha512WithRsaEncryption, NistObjectIdentifiers.IdSha512);
            m_digestOids.Add(PkcsObjectIdentifiers.Sha512_224WithRSAEncryption, NistObjectIdentifiers.IdSha512_224);
            m_digestOids.Add(PkcsObjectIdentifiers.Sha512_256WithRSAEncryption, NistObjectIdentifiers.IdSha512_256);

            m_digestOids.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224, NistObjectIdentifiers.IdSha3_224);
            m_digestOids.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256, NistObjectIdentifiers.IdSha3_256);
            m_digestOids.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384, NistObjectIdentifiers.IdSha3_384);
            m_digestOids.Add(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512, NistObjectIdentifiers.IdSha3_512);

            m_digestOids.Add(PkcsObjectIdentifiers.MD2WithRsaEncryption, PkcsObjectIdentifiers.MD2);
            m_digestOids.Add(PkcsObjectIdentifiers.MD4WithRsaEncryption, PkcsObjectIdentifiers.MD4);
            m_digestOids.Add(PkcsObjectIdentifiers.MD5WithRsaEncryption, PkcsObjectIdentifiers.MD5);
            m_digestOids.Add(PkcsObjectIdentifiers.Sha1WithRsaEncryption, OiwObjectIdentifiers.IdSha1);

            m_digestOids.Add(X9ObjectIdentifiers.ECDsaWithSha1, OiwObjectIdentifiers.IdSha1);
            m_digestOids.Add(X9ObjectIdentifiers.ECDsaWithSha224, NistObjectIdentifiers.IdSha224);
            m_digestOids.Add(X9ObjectIdentifiers.ECDsaWithSha256, NistObjectIdentifiers.IdSha256);
            m_digestOids.Add(X9ObjectIdentifiers.ECDsaWithSha384, NistObjectIdentifiers.IdSha384);
            m_digestOids.Add(X9ObjectIdentifiers.ECDsaWithSha512, NistObjectIdentifiers.IdSha512);
            m_digestOids.Add(X9ObjectIdentifiers.IdDsaWithSha1, OiwObjectIdentifiers.IdSha1);

            m_digestOids.Add(NistObjectIdentifiers.DsaWithSha224, NistObjectIdentifiers.IdSha224);
            m_digestOids.Add(NistObjectIdentifiers.DsaWithSha256, NistObjectIdentifiers.IdSha256);
            m_digestOids.Add(NistObjectIdentifiers.DsaWithSha384, NistObjectIdentifiers.IdSha384);
            m_digestOids.Add(NistObjectIdentifiers.DsaWithSha512, NistObjectIdentifiers.IdSha512);

            m_digestOids.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD128, TeleTrusTObjectIdentifiers.RipeMD128);
            m_digestOids.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD160, TeleTrusTObjectIdentifiers.RipeMD160);
            m_digestOids.Add(TeleTrusTObjectIdentifiers.RsaSignatureWithRipeMD256, TeleTrusTObjectIdentifiers.RipeMD256);

            m_digestOids.Add(CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x94, CryptoProObjectIdentifiers.GostR3411);
            m_digestOids.Add(CryptoProObjectIdentifiers.GostR3411x94WithGostR3410x2001, CryptoProObjectIdentifiers.GostR3411);

            m_digestNameToOids.Add("SHA-1", OiwObjectIdentifiers.IdSha1);
            m_digestNameToOids.Add("SHA-224", NistObjectIdentifiers.IdSha224);
            m_digestNameToOids.Add("SHA-256", NistObjectIdentifiers.IdSha256);
            m_digestNameToOids.Add("SHA-384", NistObjectIdentifiers.IdSha384);
            m_digestNameToOids.Add("SHA-512", NistObjectIdentifiers.IdSha512);
            m_digestNameToOids.Add("SHA-512/224", NistObjectIdentifiers.IdSha512_224);
            m_digestNameToOids.Add("SHA-512(224)", NistObjectIdentifiers.IdSha512_224);
            m_digestNameToOids.Add("SHA-512/256", NistObjectIdentifiers.IdSha512_256);
            m_digestNameToOids.Add("SHA-512(256)", NistObjectIdentifiers.IdSha512_256);

            m_digestNameToOids.Add("SHA1", OiwObjectIdentifiers.IdSha1);
            m_digestNameToOids.Add("SHA224", NistObjectIdentifiers.IdSha224);
            m_digestNameToOids.Add("SHA256", NistObjectIdentifiers.IdSha256);
            m_digestNameToOids.Add("SHA384", NistObjectIdentifiers.IdSha384);
            m_digestNameToOids.Add("SHA512", NistObjectIdentifiers.IdSha512);
            m_digestNameToOids.Add("SHA512/224", NistObjectIdentifiers.IdSha512_224);
            m_digestNameToOids.Add("SHA512(224)", NistObjectIdentifiers.IdSha512_224);
            m_digestNameToOids.Add("SHA512/256", NistObjectIdentifiers.IdSha512_256);
            m_digestNameToOids.Add("SHA512(256)", NistObjectIdentifiers.IdSha512_256);

            m_digestNameToOids.Add("SHA3-224", NistObjectIdentifiers.IdSha3_224);
            m_digestNameToOids.Add("SHA3-256", NistObjectIdentifiers.IdSha3_256);
            m_digestNameToOids.Add("SHA3-384", NistObjectIdentifiers.IdSha3_384);
            m_digestNameToOids.Add("SHA3-512", NistObjectIdentifiers.IdSha3_512);

            m_digestNameToOids.Add("SHAKE-128", NistObjectIdentifiers.IdShake128);
            m_digestNameToOids.Add("SHAKE-256", NistObjectIdentifiers.IdShake256);

            m_digestNameToOids.Add("GOST3411", CryptoProObjectIdentifiers.GostR3411);

            m_digestNameToOids.Add("MD2", PkcsObjectIdentifiers.MD2);
            m_digestNameToOids.Add("MD4", PkcsObjectIdentifiers.MD4);
            m_digestNameToOids.Add("MD5", PkcsObjectIdentifiers.MD5);

            m_digestNameToOids.Add("RIPEMD128", TeleTrusTObjectIdentifiers.RipeMD128);
            m_digestNameToOids.Add("RIPEMD160", TeleTrusTObjectIdentifiers.RipeMD160);
            m_digestNameToOids.Add("RIPEMD256", TeleTrusTObjectIdentifiers.RipeMD256);
        }

        public AlgorithmIdentifier Find(AlgorithmIdentifier sigAlgId)
        {
            AlgorithmIdentifier digAlgId;

            if (sigAlgId.Algorithm.Equals(PkcsObjectIdentifiers.IdRsassaPss))
            {
                digAlgId = RsassaPssParameters.GetInstance(sigAlgId.Parameters).HashAlgorithm;
            }
            else
            {
                digAlgId = new AlgorithmIdentifier(m_digestOids[sigAlgId.Algorithm], DerNull.Instance);
            }

            return digAlgId;
        }

        public AlgorithmIdentifier Find(string digAlgName)
        {
            return new AlgorithmIdentifier(m_digestNameToOids[digAlgName], DerNull.Instance);
        }
    }

    public class CmsSignedGenerator
    {
        /**
        * Default type for the signed data.
        */
        public static readonly string Data = CmsObjectIdentifiers.Data.Id;

        public static readonly string DigestSha1 = OiwObjectIdentifiers.IdSha1.Id;
        public static readonly string DigestSha224 = NistObjectIdentifiers.IdSha224.Id;
        public static readonly string DigestSha256 = NistObjectIdentifiers.IdSha256.Id;
        public static readonly string DigestSha384 = NistObjectIdentifiers.IdSha384.Id;
        public static readonly string DigestSha512 = NistObjectIdentifiers.IdSha512.Id;
        public static readonly string DigestSha512_224 = NistObjectIdentifiers.IdSha512_224.Id;
        public static readonly string DigestSha512_256 = NistObjectIdentifiers.IdSha512_256.Id;
        public static readonly string DigestMD5 = PkcsObjectIdentifiers.MD5.Id;
        public static readonly string DigestGost3411 = CryptoProObjectIdentifiers.GostR3411.Id;
        public static readonly string DigestRipeMD128 = TeleTrusTObjectIdentifiers.RipeMD128.Id;
        public static readonly string DigestRipeMD160 = TeleTrusTObjectIdentifiers.RipeMD160.Id;
        public static readonly string DigestRipeMD256 = TeleTrusTObjectIdentifiers.RipeMD256.Id;

        public static readonly string EncryptionRsa = PkcsObjectIdentifiers.RsaEncryption.Id;
        public static readonly string EncryptionDsa = X9ObjectIdentifiers.IdDsaWithSha1.Id;
        public static readonly string EncryptionECDsa = X9ObjectIdentifiers.ECDsaWithSha1.Id;
        public static readonly string EncryptionRsaPss = PkcsObjectIdentifiers.IdRsassaPss.Id;
        public static readonly string EncryptionGost3410 = CryptoProObjectIdentifiers.GostR3410x94.Id;
        public static readonly string EncryptionECGost3410 = CryptoProObjectIdentifiers.GostR3410x2001.Id;

        internal List<Asn1Encodable> _certs = new List<Asn1Encodable>();
        internal List<Asn1Encodable> _crls = new List<Asn1Encodable>();
        internal IList<SignerInformation> _signers = new List<SignerInformation>();
        internal IDictionary<string, byte[]> m_digests =
            new Dictionary<string, byte[]>(StringComparer.OrdinalIgnoreCase);
        internal bool _useDerForCerts = false;
        internal bool _useDerForCrls = false;

        protected readonly SecureRandom rand;

        protected CmsSignedGenerator()
            : this(new SecureRandom())
        {
        }

        /// <summary>Constructor allowing specific source of randomness</summary>
        /// <param name="rand">Instance of <c>SecureRandom</c> to use.</param>
        protected CmsSignedGenerator(
            SecureRandom rand)
        {
            this.rand = rand;
        }

        internal protected virtual IDictionary<CmsAttributeTableParameter, object> GetBaseParameters(
            DerObjectIdentifier contentType, AlgorithmIdentifier digAlgId, byte[] hash)
        {
            var param = new Dictionary<CmsAttributeTableParameter, object>();

            if (contentType != null)
            {
                param[CmsAttributeTableParameter.ContentType] = contentType;
            }

            param[CmsAttributeTableParameter.DigestAlgorithmIdentifier] = digAlgId;
            param[CmsAttributeTableParameter.Digest] = hash.Clone();

            return param;
        }

        internal protected virtual Asn1Set GetAttributeSet(
            Asn1.Cms.AttributeTable attr)
        {
            return attr == null
                ? null
                : new DerSet(attr.ToAsn1EncodableVector());
        }

        public void AddAttributeCertificate(X509V2AttributeCertificate attrCert)
        {
            _certs.Add(new DerTaggedObject(false, 2, attrCert.AttributeCertificate));
        }

        public void AddAttributeCertificates(IStore<X509V2AttributeCertificate> attrCertStore)
        {
            _certs.AddRange(CmsUtilities.GetAttributeCertificatesFromStore(attrCertStore));
        }

        public void AddCertificate(X509Certificate cert)
        {
            _certs.Add(cert.CertificateStructure);
        }

        public void AddCertificates(IStore<X509Certificate> certStore)
        {
            _certs.AddRange(CmsUtilities.GetCertificatesFromStore(certStore));
        }

        public void AddCrl(X509Crl crl)
        {
            _crls.Add(crl.CertificateList);
        }

        public void AddCrls(IStore<X509Crl> crlStore)
        {
            _crls.AddRange(CmsUtilities.GetCrlsFromStore(crlStore));
        }

        /**
		 * Add a store of precalculated signers to the generator.
		 *
		 * @param signerStore store of signers
		 */
        public void AddSigners(SignerInformationStore signerStore)
        {
            foreach (SignerInformation o in signerStore.GetSigners())
            {
                _signers.Add(o);
                AddSignerCallback(o);
            }
        }

        /**
		 * Return a map of oids and byte arrays representing the digests calculated on the content during
		 * the last generate.
		 *
		 * @return a map of oids (as string objects) and byte[] representing digests.
		 */
        public IDictionary<string, byte[]> GetGeneratedDigests()
        {
            return new Dictionary<string, byte[]>(m_digests, StringComparer.OrdinalIgnoreCase);
        }

        public bool UseDerForCerts
        {
            get { return _useDerForCerts; }
            set { this._useDerForCerts = value; }
        }

        public bool UseDerForCrls
        {
            get { return _useDerForCrls; }
            set { this._useDerForCrls = value; }
        }

        internal virtual void AddSignerCallback(
            SignerInformation si)
        {
        }

        internal static SignerIdentifier GetSignerIdentifier(X509Certificate cert)
        {
            return new SignerIdentifier(CmsUtilities.GetIssuerAndSerialNumber(cert));
        }

        internal static SignerIdentifier GetSignerIdentifier(byte[] subjectKeyIdentifier)
        {
            return new SignerIdentifier(new DerOctetString(subjectKeyIdentifier));
        }
    }
}
