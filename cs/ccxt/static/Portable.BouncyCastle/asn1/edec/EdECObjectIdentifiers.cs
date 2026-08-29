using System;

namespace Org.BouncyCastle.Asn1.EdEC
{
    /**
     * Edwards Elliptic Curve Object Identifiers (RFC 8410)
     */
    public abstract class EdECObjectIdentifiers
    {
        public static readonly DerObjectIdentifier id_edwards_curve_algs = new DerObjectIdentifier("1.3.101");

        public static readonly DerObjectIdentifier id_X25519 = id_edwards_curve_algs.Branch("110");
        public static readonly DerObjectIdentifier id_X448 = id_edwards_curve_algs.Branch("111");
        public static readonly DerObjectIdentifier id_Ed25519 = id_edwards_curve_algs.Branch("112");
        public static readonly DerObjectIdentifier id_Ed448 = id_edwards_curve_algs.Branch("113");
    }
}
