using System;

namespace Org.BouncyCastle.Asn1.Bsi
{
    /// <remarks>See https://www.bsi.bund.de/cae/servlet/contentblob/471398/publicationFile/30615/BSI-TR-03111_pdf.pdf</remarks>
    public abstract class BsiObjectIdentifiers
    {
        public static readonly DerObjectIdentifier bsi_de = new DerObjectIdentifier("0.4.0.127.0.7");

        /* 0.4.0.127.0.7.1.1 */
        public static readonly DerObjectIdentifier id_ecc = bsi_de.Branch("1.1");
    
        /* 0.4.0.127.0.7.1.1.4.1 */
        public static readonly DerObjectIdentifier ecdsa_plain_signatures = id_ecc.Branch("4.1");
    
        /* 0.4.0.127.0.7.1.1.4.1.1 */
        public static readonly DerObjectIdentifier ecdsa_plain_SHA1 = ecdsa_plain_signatures.Branch("1");

        /* 0.4.0.127.0.7.1.1.4.1.2 */
        public static readonly DerObjectIdentifier ecdsa_plain_SHA224 = ecdsa_plain_signatures.Branch("2");

        /* 0.4.0.127.0.7.1.1.4.1.3 */
        public static readonly DerObjectIdentifier ecdsa_plain_SHA256 = ecdsa_plain_signatures.Branch("3");

        /* 0.4.0.127.0.7.1.1.4.1.4 */
        public static readonly DerObjectIdentifier ecdsa_plain_SHA384 = ecdsa_plain_signatures.Branch("4");

        /* 0.4.0.127.0.7.1.1.4.1.5 */
        public static readonly DerObjectIdentifier ecdsa_plain_SHA512 = ecdsa_plain_signatures.Branch("5");

        /* 0.4.0.127.0.7.1.1.4.1.6 */
        public static readonly DerObjectIdentifier ecdsa_plain_RIPEMD160 = ecdsa_plain_signatures.Branch("6");

	    /** 0.4.0.127.0.7.1 */
	    public static readonly DerObjectIdentifier algorithm = bsi_de.Branch("1");

	    public static readonly DerObjectIdentifier ecka_eg = id_ecc.Branch("5.1");

	    /** ElGamal Elliptic Curve Key Agreement and Key Derivation according to X963 OID: 0.4.0.127.0.7.1.1.5.1.1 */
	    public static readonly DerObjectIdentifier ecka_eg_X963kdf = ecka_eg.Branch("1");

	    /** ElGamal Elliptic Curve Key Agreement and Key Derivation according to X963
	     * with hash function SHA-1
	     * OID: 0.4.0.127.0.7.1.1.5.1.1.1 */
	    public static readonly DerObjectIdentifier ecka_eg_X963kdf_SHA1 = ecka_eg_X963kdf.Branch("1");

	    /** ElGamal Elliptic Curve Key Agreement and Key Derivation according to X963
	     * with hash function SHA224
	     * OID: 0.4.0.127.0.7.1.1.5.1.1.2 */
	    public static readonly DerObjectIdentifier ecka_eg_X963kdf_SHA224 = ecka_eg_X963kdf.Branch("2");

	    /** ElGamal Elliptic Curve Key Agreement and Key Derivation according to X963
	     * with hash function SHA256
	     * OID: 0.4.0.127.0.7.1.1.5.1.1.3 */
	    public static readonly DerObjectIdentifier ecka_eg_X963kdf_SHA256 = ecka_eg_X963kdf.Branch("3");

	    /** ElGamal Elliptic Curve Key Agreement and Key Derivation according to X963
	     * with hash function SHA384
	     * OID: 0.4.0.127.0.7.1.1.5.1.1.4 */
	    public static readonly DerObjectIdentifier ecka_eg_X963kdf_SHA384 = ecka_eg_X963kdf.Branch("4");

	    /** ElGamal Elliptic Curve Key Agreement and Key Derivation according to X963
	     * with hash function SHA512
	     * OID: 0.4.0.127.0.7.1.1.5.1.1.5 */
	    public static readonly DerObjectIdentifier ecka_eg_X963kdf_SHA512 = ecka_eg_X963kdf.Branch("5");

	    /** ElGamal Elliptic Curve Key Agreement and Key Derivation according to X963
	     * with hash function RIPEMD160
	     * OID: 0.4.0.127.0.7.1.1.5.1.1.6 */
	    public static readonly DerObjectIdentifier ecka_eg_X963kdf_RIPEMD160 = ecka_eg_X963kdf.Branch("6");

	    /**
	     * 	Key Derivation Function for Session Keys
	     */
	    public static readonly DerObjectIdentifier ecka_eg_SessionKDF = ecka_eg.Branch("2");

	    public static readonly DerObjectIdentifier ecka_eg_SessionKDF_3DES    = ecka_eg_SessionKDF.Branch("1");
	    public static readonly DerObjectIdentifier ecka_eg_SessionKDF_AES128  = ecka_eg_SessionKDF.Branch("2");
	    public static readonly DerObjectIdentifier ecka_eg_SessionKDF_AES192  = ecka_eg_SessionKDF.Branch("3");
	    public static readonly DerObjectIdentifier ecka_eg_SessionKDF_AES256  = ecka_eg_SessionKDF.Branch("4");

	    /* AES encryption (CBC) and authentication (CMAC)
	     * OID: 0.4.0.127.0.7.1.x */
	    //TODO: replace "1" with correct OID
	    //public static readonly DerObjectIdentifier aes_cbc_cmac = algorithm.Branch("1");

	    /* AES encryption (CBC) and authentication (CMAC) with 128 bit
	     * OID: 0.4.0.127.0.7.1.x.y1 */
	    //TODO:  replace "1" with correct OID
	    //public static readonly DerObjectIdentifier id_aes128_CBC_CMAC = aes_cbc_cmac.Branch("1");

        /* AES encryption (CBC) and authentication (CMAC) with 192 bit
	     * OID: 0.4.0.127.0.7.1.x.y2 */
	    //TODO:  replace "1" with correct OID
	    //public static readonly DerObjectIdentifier id_aes192_CBC_CMAC = aes_cbc_cmac.Branch("1");

	    /* AES encryption (CBC) and authentication (CMAC) with 256 bit
	     * OID: 0.4.0.127.0.7.1.x.y3 */
	    //TODO:  replace "1" with correct OID
	    //public static readonly DerObjectIdentifier id_aes256_CBC_CMAC = aes_cbc_cmac.Branch("1");
    }
}
