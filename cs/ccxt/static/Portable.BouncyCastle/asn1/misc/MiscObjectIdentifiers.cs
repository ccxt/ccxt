namespace Org.BouncyCastle.Asn1.Misc
{
    public abstract class MiscObjectIdentifiers
    {
        //
        // Netscape
        //       iso/itu(2) joint-assign(16) us(840) uscompany(1) Netscape(113730) cert-extensions(1) }
        //
        public static readonly DerObjectIdentifier Netscape                = new DerObjectIdentifier("2.16.840.1.113730.1");
        public static readonly DerObjectIdentifier NetscapeCertType        = Netscape.Branch("1");
        public static readonly DerObjectIdentifier NetscapeBaseUrl         = Netscape.Branch("2");
        public static readonly DerObjectIdentifier NetscapeRevocationUrl   = Netscape.Branch("3");
        public static readonly DerObjectIdentifier NetscapeCARevocationUrl = Netscape.Branch("4");
        public static readonly DerObjectIdentifier NetscapeRenewalUrl      = Netscape.Branch("7");
        public static readonly DerObjectIdentifier NetscapeCAPolicyUrl     = Netscape.Branch("8");
        public static readonly DerObjectIdentifier NetscapeSslServerName   = Netscape.Branch("12");
        public static readonly DerObjectIdentifier NetscapeCertComment     = Netscape.Branch("13");

        //
        // Verisign
        //       iso/itu(2) joint-assign(16) us(840) uscompany(1) verisign(113733) cert-extensions(1) }
        //
        public static readonly DerObjectIdentifier Verisign = new DerObjectIdentifier("2.16.840.1.113733.1");

        //
        // CZAG - country, zip, age, and gender
        //
        public static readonly DerObjectIdentifier VerisignCzagExtension          = Verisign.Branch("6.3");

        public static readonly DerObjectIdentifier VerisignPrivate_6_9            = Verisign.Branch("6.9");
        public static readonly DerObjectIdentifier VerisignOnSiteJurisdictionHash = Verisign.Branch("6.11");
        public static readonly DerObjectIdentifier VerisignBitString_6_13         = Verisign.Branch("6.13");

        // D&B D-U-N-S number
        public static readonly DerObjectIdentifier VerisignDnbDunsNumber          = Verisign.Branch("6.15");

        public static readonly DerObjectIdentifier VerisignIssStrongCrypto        = Verisign.Branch("8.1");

        //
        // Novell
        //       iso/itu(2) country(16) us(840) organization(1) novell(113719)
        //
        public static readonly string				Novell					= "2.16.840.1.113719";
        public static readonly DerObjectIdentifier NovellSecurityAttribs	= new DerObjectIdentifier(Novell + ".1.9.4.1");

        //
        // Entrust
        //       iso(1) member-body(16) us(840) nortelnetworks(113533) entrust(7)
        //
        public static readonly string				Entrust					= "1.2.840.113533.7";
        public static readonly DerObjectIdentifier EntrustVersionExtension = new DerObjectIdentifier(Entrust + ".65.0");

        public static readonly DerObjectIdentifier cast5CBC = new DerObjectIdentifier(Entrust+ ".66.10");

        //
        // HMAC-SHA1       hMAC-SHA1 OBJECT IDENTIFIER ::= { iso(1) identified-organization(3)
        //       dod(6) internet(1) security(5) mechanisms(5) 8 1 2 }
        //
        public static readonly DerObjectIdentifier HMAC_SHA1 = new DerObjectIdentifier("1.3.6.1.5.5.8.1.2");

        //
        // Ascom
        //
        public static readonly DerObjectIdentifier as_sys_sec_alg_ideaCBC = new DerObjectIdentifier("1.3.6.1.4.1.188.7.1.1.2");

        //
        // Peter Gutmann's Cryptlib
        //
        public static readonly DerObjectIdentifier cryptlib = new DerObjectIdentifier("1.3.6.1.4.1.3029");

        public static readonly DerObjectIdentifier cryptlib_algorithm = cryptlib.Branch("1");
        public static readonly DerObjectIdentifier cryptlib_algorithm_blowfish_ECB = cryptlib_algorithm.Branch("1.1");
        public static readonly DerObjectIdentifier cryptlib_algorithm_blowfish_CBC = cryptlib_algorithm.Branch("1.2");
        public static readonly DerObjectIdentifier cryptlib_algorithm_blowfish_CFB = cryptlib_algorithm.Branch("1.3");
        public static readonly DerObjectIdentifier cryptlib_algorithm_blowfish_OFB = cryptlib_algorithm.Branch("1.4");

        //
        // Blake2b
        //
        public static readonly DerObjectIdentifier blake2 = new DerObjectIdentifier("1.3.6.1.4.1.1722.12.2");

        public static readonly DerObjectIdentifier id_blake2b160 = blake2.Branch("1.5");
        public static readonly DerObjectIdentifier id_blake2b256 = blake2.Branch("1.8");
        public static readonly DerObjectIdentifier id_blake2b384 = blake2.Branch("1.12");
        public static readonly DerObjectIdentifier id_blake2b512 = blake2.Branch("1.16");

        public static readonly DerObjectIdentifier id_blake2s128 = blake2.Branch("2.4");
        public static readonly DerObjectIdentifier id_blake2s160 = blake2.Branch("2.5");
        public static readonly DerObjectIdentifier id_blake2s224 = blake2.Branch("2.7");
        public static readonly DerObjectIdentifier id_blake2s256 = blake2.Branch("2.8");

        //
        // Scrypt
        public static readonly DerObjectIdentifier id_scrypt = new DerObjectIdentifier("1.3.6.1.4.1.11591.4.11");

        public static readonly DerObjectIdentifier id_oracle_pkcs12_trusted_key_usage = new DerObjectIdentifier("2.16.840.1.113894.746875.1.1");
    }
}
