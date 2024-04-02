using System;

namespace Org.BouncyCastle.Asn1.GM
{
	public abstract class GMObjectIdentifiers
	{
        public static readonly DerObjectIdentifier sm_scheme = new DerObjectIdentifier("1.2.156.10197.1");

        public static readonly DerObjectIdentifier sm6_ecb = sm_scheme.Branch("101.1");
        public static readonly DerObjectIdentifier sm6_cbc = sm_scheme.Branch("101.2");
        public static readonly DerObjectIdentifier sm6_ofb128 = sm_scheme.Branch("101.3");
        public static readonly DerObjectIdentifier sm6_cfb128 = sm_scheme.Branch("101.4");

        public static readonly DerObjectIdentifier sm1_ecb = sm_scheme.Branch("102.1");
        public static readonly DerObjectIdentifier sm1_cbc = sm_scheme.Branch("102.2");
        public static readonly DerObjectIdentifier sm1_ofb128 = sm_scheme.Branch("102.3");
        public static readonly DerObjectIdentifier sm1_cfb128 = sm_scheme.Branch("102.4");
        public static readonly DerObjectIdentifier sm1_cfb1 = sm_scheme.Branch("102.5");
        public static readonly DerObjectIdentifier sm1_cfb8 = sm_scheme.Branch("102.6");

        public static readonly DerObjectIdentifier ssf33_ecb = sm_scheme.Branch("103.1");
        public static readonly DerObjectIdentifier ssf33_cbc = sm_scheme.Branch("103.2");
        public static readonly DerObjectIdentifier ssf33_ofb128 = sm_scheme.Branch("103.3");
        public static readonly DerObjectIdentifier ssf33_cfb128 = sm_scheme.Branch("103.4");
        public static readonly DerObjectIdentifier ssf33_cfb1 = sm_scheme.Branch("103.5");
        public static readonly DerObjectIdentifier ssf33_cfb8 = sm_scheme.Branch("103.6");

        public static readonly DerObjectIdentifier sms4_ecb = sm_scheme.Branch("104.1");
        public static readonly DerObjectIdentifier sms4_cbc = sm_scheme.Branch("104.2");
        public static readonly DerObjectIdentifier sms4_ofb128 = sm_scheme.Branch("104.3");
        public static readonly DerObjectIdentifier sms4_cfb128 = sm_scheme.Branch("104.4");
        public static readonly DerObjectIdentifier sms4_cfb1 = sm_scheme.Branch("104.5");
        public static readonly DerObjectIdentifier sms4_cfb8 = sm_scheme.Branch("104.6");
        public static readonly DerObjectIdentifier sms4_ctr = sm_scheme.Branch("104.7");
        public static readonly DerObjectIdentifier sms4_gcm = sm_scheme.Branch("104.8");
        public static readonly DerObjectIdentifier sms4_ccm = sm_scheme.Branch("104.9");
        public static readonly DerObjectIdentifier sms4_xts = sm_scheme.Branch("104.10");
        public static readonly DerObjectIdentifier sms4_wrap = sm_scheme.Branch("104.11");
        public static readonly DerObjectIdentifier sms4_wrap_pad = sm_scheme.Branch("104.12");
        public static readonly DerObjectIdentifier sms4_ocb = sm_scheme.Branch("104.100");

        public static readonly DerObjectIdentifier sm5 = sm_scheme.Branch("201");

        public static readonly DerObjectIdentifier sm2p256v1 = sm_scheme.Branch("301");
        public static readonly DerObjectIdentifier sm2sign = sm_scheme.Branch("301.1");
        public static readonly DerObjectIdentifier sm2exchange = sm_scheme.Branch("301.2");
        public static readonly DerObjectIdentifier sm2encrypt = sm_scheme.Branch("301.3");

        public static readonly DerObjectIdentifier wapip192v1 = sm_scheme.Branch("301.101");

        public static readonly DerObjectIdentifier sm2encrypt_recommendedParameters = sm2encrypt.Branch("1");
        public static readonly DerObjectIdentifier sm2encrypt_specifiedParameters = sm2encrypt.Branch("2");
        public static readonly DerObjectIdentifier sm2encrypt_with_sm3 = sm2encrypt.Branch("2.1");
        public static readonly DerObjectIdentifier sm2encrypt_with_sha1 = sm2encrypt.Branch("2.2");
        public static readonly DerObjectIdentifier sm2encrypt_with_sha224 = sm2encrypt.Branch("2.3");
        public static readonly DerObjectIdentifier sm2encrypt_with_sha256 = sm2encrypt.Branch("2.4");
        public static readonly DerObjectIdentifier sm2encrypt_with_sha384 = sm2encrypt.Branch("2.5");
        public static readonly DerObjectIdentifier sm2encrypt_with_sha512 = sm2encrypt.Branch("2.6");
        public static readonly DerObjectIdentifier sm2encrypt_with_rmd160 = sm2encrypt.Branch("2.7");
        public static readonly DerObjectIdentifier sm2encrypt_with_whirlpool = sm2encrypt.Branch("2.8");
        public static readonly DerObjectIdentifier sm2encrypt_with_blake2b512 = sm2encrypt.Branch("2.9");
        public static readonly DerObjectIdentifier sm2encrypt_with_blake2s256 = sm2encrypt.Branch("2.10");
        public static readonly DerObjectIdentifier sm2encrypt_with_md5 = sm2encrypt.Branch("2.11");

        public static readonly DerObjectIdentifier id_sm9PublicKey = sm_scheme.Branch("302");
        public static readonly DerObjectIdentifier sm9sign = sm_scheme.Branch("302.1");
        public static readonly DerObjectIdentifier sm9keyagreement = sm_scheme.Branch("302.2");
        public static readonly DerObjectIdentifier sm9encrypt = sm_scheme.Branch("302.3");

        public static readonly DerObjectIdentifier sm3 = sm_scheme.Branch("401");

        public static readonly DerObjectIdentifier hmac_sm3 = sm3.Branch("2");

        public static readonly DerObjectIdentifier sm2sign_with_sm3 = sm_scheme.Branch("501");
        public static readonly DerObjectIdentifier sm2sign_with_sha1 = sm_scheme.Branch("502");
        public static readonly DerObjectIdentifier sm2sign_with_sha256 = sm_scheme.Branch("503");
        public static readonly DerObjectIdentifier sm2sign_with_sha512 = sm_scheme.Branch("504");
        public static readonly DerObjectIdentifier sm2sign_with_sha224 = sm_scheme.Branch("505");
        public static readonly DerObjectIdentifier sm2sign_with_sha384 = sm_scheme.Branch("506");
        public static readonly DerObjectIdentifier sm2sign_with_rmd160 = sm_scheme.Branch("507");
        public static readonly DerObjectIdentifier sm2sign_with_whirlpool = sm_scheme.Branch("520");
        public static readonly DerObjectIdentifier sm2sign_with_blake2b512 = sm_scheme.Branch("521");
        public static readonly DerObjectIdentifier sm2sign_with_blake2s256 = sm_scheme.Branch("522");
	}
}