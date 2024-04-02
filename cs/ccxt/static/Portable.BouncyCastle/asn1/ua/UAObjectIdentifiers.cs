namespace Org.BouncyCastle.Asn1.UA
{
    /**
     * Ukrainian object identifiers
     * <p/>
     * {iso(1) member-body(2) Ukraine(804) root(2) security(1) cryptography(1) pki(1)}
     * <p/>
     * { ...  pki-alg(1) pki-alg-sym(3) Dstu4145WithGost34311(1) PB(1)}
     * <p/>
     * DSTU4145 in polynomial basis has 2 oids, one for little-endian representation and one for big-endian
     */
    public abstract class UAObjectIdentifiers
    {
        /** Base OID: 1.2.804.2.1.1.1 */
        public static readonly DerObjectIdentifier UaOid = new DerObjectIdentifier("1.2.804.2.1.1.1");

        /** DSTU4145 Little Endian presentation.  OID: 1.2.804.2.1.1.1.1.3.1.1 */
        public static readonly DerObjectIdentifier dstu4145le = UaOid.Branch("1.3.1.1");
        /** DSTU4145 Big Endian presentation.  OID: 1.2.804.2.1.1.1.1.3.1.1.1 */
        public static readonly DerObjectIdentifier dstu4145be = UaOid.Branch("1.3.1.1.1.1");
    
        /** DSTU7564 256-bit digest presentation. */
        public static readonly DerObjectIdentifier dstu7564digest_256 = UaOid.Branch("1.2.2.1");
        /** DSTU7564 384-bit digest presentation. */
        public static readonly DerObjectIdentifier dstu7564digest_384 = UaOid.Branch("1.2.2.2");
        /** DSTU7564 512-bit digest presentation. */
        public static readonly DerObjectIdentifier dstu7564digest_512 = UaOid.Branch("1.2.2.3");

        /** DSTU7564 256-bit mac presentation. */
        public static readonly DerObjectIdentifier dstu7564mac_256 = UaOid.Branch("1.2.2.4");
        /** DSTU7564 384-bit mac presentation. */
        public static readonly DerObjectIdentifier dstu7564mac_384 = UaOid.Branch("1.2.2.5");
        /** DSTU7564 512-bit mac presentation. */
        public static readonly DerObjectIdentifier dstu7564mac_512 = UaOid.Branch("1.2.2.6");


        /** DSTU7624 in ECB mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ecb_128 = UaOid.Branch("1.1.3.1.1");
        /** DSTU7624 in ECB mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ecb_256 = UaOid.Branch("1.1.3.1.2");
        /** DSTU7624 in ECB mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ecb_512 = UaOid.Branch("1.1.3.1.3");

        /** DSTU7624 in CTR mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ctr_128 = UaOid.Branch("1.1.3.2.1");
        /** DSTU7624 in CTR mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ctr_256 = UaOid.Branch("1.1.3.2.2");
        /** DSTU7624 in CTR mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ctr_512 = UaOid.Branch("1.1.3.2.3");

        /** DSTU7624 in CFB mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cfb_128 = UaOid.Branch("1.1.3.3.1");
        /** DSTU7624 in CFB mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cfb_256 = UaOid.Branch("1.1.3.3.2");
        /** DSTU7624 in CFB mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cfb_512 = UaOid.Branch("1.1.3.3.3");

        /** DSTU7624 in MAC mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cmac_128 = UaOid.Branch("1.1.3.4.1");
        /** DSTU7624 in MAC mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cmac_256 = UaOid.Branch("1.1.3.4.2");
        /** DSTU7624 in MAC mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cmac_512 = UaOid.Branch("1.1.3.4.3");

        /** DSTU7624 in CBC mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cbc_128 = UaOid.Branch("1.1.3.5.1");
        /** DSTU7624 in CBC mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cbc_256 = UaOid.Branch("1.1.3.5.2");
        /** DSTU7624 in CBC mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624cbc_512 = UaOid.Branch("1.1.3.5.3");

        /** DSTU7624 in OFB mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ofb_128 = UaOid.Branch("1.1.3.6.1");
        /** DSTU7624 in OFB mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ofb_256 = UaOid.Branch("1.1.3.6.2");
        /** DSTU7624 in OFB mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ofb_512 = UaOid.Branch("1.1.3.6.3");

        /** DSTU7624 in GMAC (GCM witout encryption) mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624gmac_128 = UaOid.Branch("1.1.3.7.1");
        /** DSTU7624 in GMAC (GCM witout encryption) mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624gmac_256 = UaOid.Branch("1.1.3.7.2");
        /** DSTU7624 in GMAC (GCM witout encryption) mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624gmac_512 = UaOid.Branch("1.1.3.7.3");

        /** DSTU7624 in CCM mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ccm_128 = UaOid.Branch("1.1.3.8.1");
        /** DSTU7624 in CCM mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ccm_256 = UaOid.Branch("1.1.3.8.2");
        /** DSTU7624 in CCM mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624ccm_512 = UaOid.Branch("1.1.3.8.3");

        /** DSTU7624 in XTS mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624xts_128 = UaOid.Branch("1.1.3.9.1");
        /** DSTU7624 in XTS mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624xts_256 = UaOid.Branch("1.1.3.9.2");
        /** DSTU7624 in XTS mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624xts_512 = UaOid.Branch("1.1.3.9.3");

        /** DSTU7624 in key wrap (KW) mode with 128 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624kw_128 = UaOid.Branch("1.1.3.10.1");
        /** DSTU7624 in key wrap (KW) mode with 256 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624kw_256 = UaOid.Branch("1.1.3.10.2");
        /** DSTU7624 in key wrap (KW) mode with 512 bit block/key presentation */
        public static readonly DerObjectIdentifier dstu7624kw_512 = UaOid.Branch("1.1.3.10.3");
    }
}
