using System;

namespace Org.BouncyCastle.Asn1.Rosstandart
{
	public abstract class RosstandartObjectIdentifiers
    {
        public static readonly DerObjectIdentifier rosstandart = new DerObjectIdentifier("1.2.643.7");

        public static readonly DerObjectIdentifier id_tc26 = rosstandart.Branch("1");

        public static readonly DerObjectIdentifier id_tc26_gost_3411_12_256 = id_tc26.Branch("1.2.2");

        public static readonly DerObjectIdentifier id_tc26_gost_3411_12_512 = id_tc26.Branch("1.2.3");

        public static readonly DerObjectIdentifier id_tc26_hmac_gost_3411_12_256 = id_tc26.Branch("1.4.1");

        public static readonly DerObjectIdentifier id_tc26_hmac_gost_3411_12_512 = id_tc26.Branch("1.4.2");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_256 = id_tc26.Branch("1.1.1");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_512 = id_tc26.Branch("1.1.2");

        public static readonly DerObjectIdentifier id_tc26_signwithdigest_gost_3410_12_256 = id_tc26.Branch("1.3.2");

        public static readonly DerObjectIdentifier id_tc26_signwithdigest_gost_3410_12_512 = id_tc26.Branch("1.3.3");

        public static readonly DerObjectIdentifier id_tc26_agreement = id_tc26.Branch("1.6");

        public static readonly DerObjectIdentifier id_tc26_agreement_gost_3410_12_256 = id_tc26_agreement.Branch("1");

        public static readonly DerObjectIdentifier id_tc26_agreement_gost_3410_12_512 = id_tc26_agreement.Branch("2");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_256_paramSet = id_tc26.Branch("2.1.1");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_256_paramSetA = id_tc26_gost_3410_12_256_paramSet.Branch("1");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_512_paramSet = id_tc26.Branch("2.1.2");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_512_paramSetA = id_tc26_gost_3410_12_512_paramSet.Branch("1");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_512_paramSetB = id_tc26_gost_3410_12_512_paramSet.Branch("2");

        public static readonly DerObjectIdentifier id_tc26_gost_3410_12_512_paramSetC = id_tc26_gost_3410_12_512_paramSet.Branch("3");

        public static readonly DerObjectIdentifier id_tc26_gost_28147_param_Z = id_tc26.Branch("2.5.1.1");
    }
}
