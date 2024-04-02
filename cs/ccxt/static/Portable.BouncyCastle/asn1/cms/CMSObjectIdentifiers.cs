using Org.BouncyCastle.Asn1.Pkcs;

namespace Org.BouncyCastle.Asn1.Cms
{
    public abstract class CmsObjectIdentifiers
    {
        public static readonly DerObjectIdentifier Data = PkcsObjectIdentifiers.Data;
        public static readonly DerObjectIdentifier SignedData = PkcsObjectIdentifiers.SignedData;
        public static readonly DerObjectIdentifier EnvelopedData = PkcsObjectIdentifiers.EnvelopedData;
        public static readonly DerObjectIdentifier SignedAndEnvelopedData = PkcsObjectIdentifiers.SignedAndEnvelopedData;
        public static readonly DerObjectIdentifier DigestedData = PkcsObjectIdentifiers.DigestedData;
        public static readonly DerObjectIdentifier EncryptedData = PkcsObjectIdentifiers.EncryptedData;
        public static readonly DerObjectIdentifier AuthenticatedData = PkcsObjectIdentifiers.IdCTAuthData;
        public static readonly DerObjectIdentifier CompressedData = PkcsObjectIdentifiers.IdCTCompressedData;
        public static readonly DerObjectIdentifier AuthEnvelopedData = PkcsObjectIdentifiers.IdCTAuthEnvelopedData;
        public static readonly DerObjectIdentifier timestampedData = PkcsObjectIdentifiers.IdCTTimestampedData;

        /**
         * The other Revocation Info arc
         * id-ri OBJECT IDENTIFIER ::= { iso(1) identified-organization(3)
         *                                   dod(6) internet(1) security(5) mechanisms(5) pkix(7) ri(16) }
         */
        public static readonly DerObjectIdentifier id_ri = new DerObjectIdentifier("1.3.6.1.5.5.7.16");

        public static readonly DerObjectIdentifier id_ri_ocsp_response = id_ri.Branch("2");
        public static readonly DerObjectIdentifier id_ri_scvp = id_ri.Branch("4");
    }
}
