using System;

namespace Org.BouncyCastle.Asn1.Nsri
{
    public sealed class NsriObjectIdentifiers
    {
        public static readonly DerObjectIdentifier nsri = new DerObjectIdentifier("1.2.410.200046");

        public static readonly DerObjectIdentifier id_algorithm = nsri.Branch("1");

        public static readonly DerObjectIdentifier id_sea = id_algorithm.Branch("1");
        public static readonly DerObjectIdentifier id_pad = id_algorithm.Branch("2");

        public static readonly DerObjectIdentifier id_pad_null = id_algorithm.Branch("0");
        public static readonly DerObjectIdentifier id_pad_1 = id_algorithm.Branch("1");

        public static readonly DerObjectIdentifier id_aria128_ecb = id_sea.Branch("1");
        public static readonly DerObjectIdentifier id_aria128_cbc = id_sea.Branch("2");
        public static readonly DerObjectIdentifier id_aria128_cfb = id_sea.Branch("3");
        public static readonly DerObjectIdentifier id_aria128_ofb = id_sea.Branch("4");
        public static readonly DerObjectIdentifier id_aria128_ctr = id_sea.Branch("5");

        public static readonly DerObjectIdentifier id_aria192_ecb = id_sea.Branch("6");
        public static readonly DerObjectIdentifier id_aria192_cbc = id_sea.Branch("7");
        public static readonly DerObjectIdentifier id_aria192_cfb = id_sea.Branch("8");
        public static readonly DerObjectIdentifier id_aria192_ofb = id_sea.Branch("9");
        public static readonly DerObjectIdentifier id_aria192_ctr = id_sea.Branch("10");

        public static readonly DerObjectIdentifier id_aria256_ecb = id_sea.Branch("11");
        public static readonly DerObjectIdentifier id_aria256_cbc = id_sea.Branch("12");
        public static readonly DerObjectIdentifier id_aria256_cfb = id_sea.Branch("13");
        public static readonly DerObjectIdentifier id_aria256_ofb = id_sea.Branch("14");
        public static readonly DerObjectIdentifier id_aria256_ctr = id_sea.Branch("15");

        public static readonly DerObjectIdentifier id_aria128_cmac = id_sea.Branch("21");
        public static readonly DerObjectIdentifier id_aria192_cmac = id_sea.Branch("22");
        public static readonly DerObjectIdentifier id_aria256_cmac = id_sea.Branch("23");

        public static readonly DerObjectIdentifier id_aria128_ocb2 = id_sea.Branch("31");
        public static readonly DerObjectIdentifier id_aria192_ocb2 = id_sea.Branch("32");
        public static readonly DerObjectIdentifier id_aria256_ocb2 = id_sea.Branch("33");

        public static readonly DerObjectIdentifier id_aria128_gcm = id_sea.Branch("34");
        public static readonly DerObjectIdentifier id_aria192_gcm = id_sea.Branch("35");
        public static readonly DerObjectIdentifier id_aria256_gcm = id_sea.Branch("36");

        public static readonly DerObjectIdentifier id_aria128_ccm = id_sea.Branch("37");
        public static readonly DerObjectIdentifier id_aria192_ccm = id_sea.Branch("38");
        public static readonly DerObjectIdentifier id_aria256_ccm = id_sea.Branch("39");

        public static readonly DerObjectIdentifier id_aria128_kw = id_sea.Branch("40");
        public static readonly DerObjectIdentifier id_aria192_kw = id_sea.Branch("41");
        public static readonly DerObjectIdentifier id_aria256_kw = id_sea.Branch("42");

        public static readonly DerObjectIdentifier id_aria128_kwp = id_sea.Branch("43");
        public static readonly DerObjectIdentifier id_aria192_kwp = id_sea.Branch("44");
        public static readonly DerObjectIdentifier id_aria256_kwp = id_sea.Branch("45");
    }
}
