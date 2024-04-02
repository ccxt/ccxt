using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Asn1.TeleTrust
{
    /// <summary>Elliptic curve registry for curves defined in "ECC Brainpool Standard Curves and Curve Generation"
    /// http://www.ecc-brainpool.org/download/draft_pkix_additional_ecc_dp.txt .</summary>
    public static class TeleTrusTNamedCurves
    {
        private static X9ECPoint ConfigureBasepoint(ECCurve curve, string encoding)
        {
            X9ECPoint G = new X9ECPoint(curve, Hex.DecodeStrict(encoding));
            WNafUtilities.ConfigureBasepoint(G.Point);
            return G;
        }

        private static ECCurve ConfigureCurve(ECCurve curve)
        {
            return curve;
        }

        private static BigInteger FromHex(string hex)
        {
            return new BigInteger(1, Hex.DecodeStrict(hex));
        }

        internal class BrainpoolP160r1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP160r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP160r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("E95E4A5F737059DC60DF5991D45029409E60FC09");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("E95E4A5F737059DC60DFC7AD95B3D8139515620F"), // q
                    FromHex("340E7BE2A280EB74E2BE61BADA745D97E8F7C300"), // a
                    FromHex("1E589A8595423412134FAA2DBDEC95C8D8675E58"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "04BED5AF16EA3F6A4F62938C4631EB5AF7BDBCDBC31667CB477A1A8EC338F94741669C976316DA6321");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP160t1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP160t1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP160t1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("E95E4A5F737059DC60DF5991D45029409E60FC09");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    //FromHex("24DBFF5DEC9B986BBFE5295A29BFBAE45E0F5D0B"), // Z
                    FromHex("E95E4A5F737059DC60DFC7AD95B3D8139515620F"), // q
                    FromHex("E95E4A5F737059DC60DFC7AD95B3D8139515620C"), // a
                    FromHex("7A556B6DAE535B7B51ED2C4D7DAA7A0B5C55F380"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "04B199B13B9B34EFC1397E64BAEB05ACC265FF2378ADD6718B7C7C1961F0991B842443772152C9E0AD");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP192r1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP192r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP192r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("C302F41D932A36CDA7A3462F9E9E916B5BE8F1029AC4ACC1");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("C302F41D932A36CDA7A3463093D18DB78FCE476DE1A86297"), // q
                    FromHex("6A91174076B1E0E19C39C031FE8685C1CAE040E5C69A28EF"), // a
                    FromHex("469A28EF7C28CCA3DC721D044F4496BCCA7EF4146FBF25C9"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "04C0A0647EAAB6A48753B033C56CB0F0900A2F5C4853375FD614B690866ABD5BB88B5F4828C1490002E6773FA2FA299B8F");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP192t1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP192t1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP192t1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("C302F41D932A36CDA7A3462F9E9E916B5BE8F1029AC4ACC1");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    //FromHex("1B6F5CC8DB4DC7AF19458A9CB80DC2295E5EB9C3732104CB") // Z
                    FromHex("C302F41D932A36CDA7A3463093D18DB78FCE476DE1A86297"), // q
                    FromHex("C302F41D932A36CDA7A3463093D18DB78FCE476DE1A86294"), // a
                    FromHex("13D56FFAEC78681E68F9DEB43B35BEC2FB68542E27897B79"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "043AE9E58C82F63C30282E1FE7BBF43FA72C446AF6F4618129097E2C5667C2223A902AB5CA449D0084B7E5B3DE7CCC01C9");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP224r1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP224r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP224r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("D7C134AA264366862A18302575D0FB98D116BC4B6DDEBCA3A5A7939F");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("D7C134AA264366862A18302575D1D787B09F075797DA89F57EC8C0FF"), // q
                    FromHex("68A5E62CA9CE6C1C299803A6C1530B514E182AD8B0042A59CAD29F43"), // a
                    FromHex("2580F63CCFE44138870713B1A92369E33E2135D266DBB372386C400B"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "040D9029AD2C7E5CF4340823B2A87DC68C9E4CE3174C1E6EFDEE12C07D58AA56F772C0726F24C6B89E4ECDAC24354B9E99CAA3F6D3761402CD");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP224t1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP224t1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP224t1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("D7C134AA264366862A18302575D0FB98D116BC4B6DDEBCA3A5A7939F");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    //FromHex("2DF271E14427A346910CF7A2E6CFA7B3F484E5C2CCE1C8B730E28B3F") // Z
                    FromHex("D7C134AA264366862A18302575D1D787B09F075797DA89F57EC8C0FF"), // q
                    FromHex("D7C134AA264366862A18302575D1D787B09F075797DA89F57EC8C0FC"), // a
                    FromHex("4B337D934104CD7BEF271BF60CED1ED20DA14C08B3BB64F18A60888D"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "046AB1E344CE25FF3896424E7FFE14762ECB49F8928AC0C76029B4D5800374E9F5143E568CD23F3F4D7C0D4B1E41C8CC0D1C6ABD5F1A46DB4C");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP256r1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP256r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP256r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("A9FB57DBA1EEA9BC3E660A909D838D718C397AA3B561A6F7901E0E82974856A7");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("A9FB57DBA1EEA9BC3E660A909D838D726E3BF623D52620282013481D1F6E5377"), // q
                    FromHex("7D5A0975FC2C3057EEF67530417AFFE7FB8055C126DC5C6CE94A4B44F330B5D9"), // a
                    FromHex("26DC5C6CE94A4B44F330B5D9BBD77CBF958416295CF7E1CE6BCCDC18FF8C07B6"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "048BD2AEB9CB7E57CB2C4B482FFC81B7AFB9DE27E1E3BD23C23A4453BD9ACE3262547EF835C3DAC4FD97F8461A14611DC9C27745132DED8E545C1D54C72F046997");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP256t1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP256t1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP256t1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("A9FB57DBA1EEA9BC3E660A909D838D718C397AA3B561A6F7901E0E82974856A7");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    //FromHex("3E2D4BD9597B58639AE7AA669CAB9837CF5CF20A2C852D10F655668DFC150EF0") // Z
                    FromHex("A9FB57DBA1EEA9BC3E660A909D838D726E3BF623D52620282013481D1F6E5377"), // q
                    FromHex("A9FB57DBA1EEA9BC3E660A909D838D726E3BF623D52620282013481D1F6E5374"), // a
                    FromHex("662C61C430D84EA4FE66A7733D0B76B7BF93EBC4AF2F49256AE58101FEE92B04"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "04A3E8EB3CC1CFE7B7732213B23A656149AFA142C47AAFBC2B79A191562E1305F42D996C823439C56D7F7B22E14644417E69BCB6DE39D027001DABE8F35B25C9BE");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP320r1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP320r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP320r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("D35E472036BC4FB7E13C785ED201E065F98FCFA5B68F12A32D482EC7EE8658E98691555B44C59311");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("D35E472036BC4FB7E13C785ED201E065F98FCFA6F6F40DEF4F92B9EC7893EC28FCD412B1F1B32E27"), // q
                    FromHex("3EE30B568FBAB0F883CCEBD46D3F3BB8A2A73513F5EB79DA66190EB085FFA9F492F375A97D860EB4"), // a
                    FromHex("520883949DFDBC42D3AD198640688A6FE13F41349554B49ACC31DCCD884539816F5EB4AC8FB1F1A6"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0443BD7E9AFB53D8B85289BCC48EE5BFE6F20137D10A087EB6E7871E2A10A599C710AF8D0D39E2061114FDD05545EC1CC8AB4093247F77275E0743FFED117182EAA9C77877AAAC6AC7D35245D1692E8EE1");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP320t1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP320t1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP320t1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("D35E472036BC4FB7E13C785ED201E065F98FCFA5B68F12A32D482EC7EE8658E98691555B44C59311");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    //FromHex("15F75CAF668077F7E85B42EB01F0A81FF56ECD6191D55CB82B7D861458A18FEFC3E5AB7496F3C7B1") // Z
                    FromHex("D35E472036BC4FB7E13C785ED201E065F98FCFA6F6F40DEF4F92B9EC7893EC28FCD412B1F1B32E27"), // q
                    FromHex("D35E472036BC4FB7E13C785ED201E065F98FCFA6F6F40DEF4F92B9EC7893EC28FCD412B1F1B32E24"), // a
                    FromHex("A7F561E038EB1ED560B3D147DB782013064C19F27ED27C6780AAF77FB8A547CEB5B4FEF422340353"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "04925BE9FB01AFC6FB4D3E7D4990010F813408AB106C4F09CB7EE07868CC136FFF3357F624A21BED5263BA3A7A27483EBF6671DBEF7ABB30EBEE084E58A0B077AD42A5A0989D1EE71B1B9BC0455FB0D2C3");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP384r1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP384r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP384r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("8CB91E82A3386D280F5D6F7E50E641DF152F7109ED5456B31F166E6CAC0425A7CF3AB6AF6B7FC3103B883202E9046565");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("8CB91E82A3386D280F5D6F7E50E641DF152F7109ED5456B412B1DA197FB71123ACD3A729901D1A71874700133107EC53"), // q
                    FromHex("7BC382C63D8C150C3C72080ACE05AFA0C2BEA28E4FB22787139165EFBA91F90F8AA5814A503AD4EB04A8C7DD22CE2826"), // a
                    FromHex("04A8C7DD22CE28268B39B55416F0447C2FB77DE107DCD2A62E880EA53EEB62D57CB4390295DBC9943AB78696FA504C11"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "041D1C64F068CF45FFA2A63A81B7C13F6B8847A3E77EF14FE3DB7FCAFE0CBD10E8E826E03436D646AAEF87B2E247D4AF1E8ABE1D7520F9C2A45CB1EB8E95CFD55262B70B29FEEC5864E19C054FF99129280E4646217791811142820341263C5315");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP384t1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP384t1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP384t1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("8CB91E82A3386D280F5D6F7E50E641DF152F7109ED5456B31F166E6CAC0425A7CF3AB6AF6B7FC3103B883202E9046565");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    //FromHex("41DFE8DD399331F7166A66076734A89CD0D2BCDB7D068E44E1F378F41ECBAE97D2D63DBC87BCCDDCCC5DA39E8589291C") // Z
                    FromHex("8CB91E82A3386D280F5D6F7E50E641DF152F7109ED5456B412B1DA197FB71123ACD3A729901D1A71874700133107EC53"), // q
                    FromHex("8CB91E82A3386D280F5D6F7E50E641DF152F7109ED5456B412B1DA197FB71123ACD3A729901D1A71874700133107EC50"), // a
                    FromHex("7F519EADA7BDA81BD826DBA647910F8C4B9346ED8CCDC64E4B1ABD11756DCE1D2074AA263B88805CED70355A33B471EE"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0418DE98B02DB9A306F2AFCD7235F72A819B80AB12EBD653172476FECD462AABFFC4FF191B946A5F54D8D0AA2F418808CC25AB056962D30651A114AFD2755AD336747F93475B7A1FCA3B88F2B6A208CCFE469408584DC2B2912675BF5B9E582928");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP512r1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP512r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP512r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("AADD9DB8DBE9C48B3FD4E6AE33C9FC07CB308DB3B3C9D20ED6639CCA70330870553E5C414CA92619418661197FAC10471DB1D381085DDADDB58796829CA90069");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("AADD9DB8DBE9C48B3FD4E6AE33C9FC07CB308DB3B3C9D20ED6639CCA703308717D4D9B009BC66842AECDA12AE6A380E62881FF2F2D82C68528AA6056583A48F3"), // q
                    FromHex("7830A3318B603B89E2327145AC234CC594CBDD8D3DF91610A83441CAEA9863BC2DED5D5AA8253AA10A2EF1C98B9AC8B57F1117A72BF2C7B9E7C1AC4D77FC94CA"), // a
                    FromHex("3DF91610A83441CAEA9863BC2DED5D5AA8253AA10A2EF1C98B9AC8B57F1117A72BF2C7B9E7C1AC4D77FC94CADC083E67984050B75EBAE5DD2809BD638016F723"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0481AEE4BDD82ED9645A21322E9C4C6A9385ED9F70B5D916C1B43B62EEF4D0098EFF3B1F78E2D0D48D50D1687B93B97D5F7C6D5047406A5E688B352209BCB9F8227DDE385D566332ECC0EABFA9CF7822FDF209F70024A57B1AA000C55B881F8111B2DCDE494A5F485E5BCA4BD88A2763AED1CA2B2FA8F0540678CD1E0F3AD80892");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        internal class BrainpoolP512t1Holder
            : X9ECParametersHolder
        {
            private BrainpoolP512t1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new BrainpoolP512t1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("AADD9DB8DBE9C48B3FD4E6AE33C9FC07CB308DB3B3C9D20ED6639CCA70330870553E5C414CA92619418661197FAC10471DB1D381085DDADDB58796829CA90069");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    //FromHex("12EE58E6764838B69782136F0F2D3BA06E27695716054092E60A80BEDB212B64E585D90BCE13761F85C3F1D2A64E3BE8FEA2220F01EBA5EEB0F35DBD29D922AB") // Z
                    FromHex("AADD9DB8DBE9C48B3FD4E6AE33C9FC07CB308DB3B3C9D20ED6639CCA703308717D4D9B009BC66842AECDA12AE6A380E62881FF2F2D82C68528AA6056583A48F3"), // q
                    FromHex("AADD9DB8DBE9C48B3FD4E6AE33C9FC07CB308DB3B3C9D20ED6639CCA703308717D4D9B009BC66842AECDA12AE6A380E62881FF2F2D82C68528AA6056583A48F0"), // a
                    FromHex("7CBBBCF9441CFAB76E1890E46884EAE321F70C0BCB4981527897504BEC3E36A62BCDFA2304976540F6450085F2DAE145C22553B465763689180EA2571867423E"), // b
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "04640ECE5C12788717B9C1BA06CBC2A6FEBA85842458C56DDE9DB1758D39C0313D82BA51735CDB3EA499AA77A7D6943A64F7A3F25FE26F06B51BAA2696FA9035DA5B534BD595F5AF0FA2C892376C84ACE1BB4E3019B71634C01131159CAE03CEE9D9932184BEEF216BD71DF2DADF86A627306ECFF96DBB8BACE198B61E00F8B332");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor);
            }
        }

        private static readonly Dictionary<string, DerObjectIdentifier> objIds =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<DerObjectIdentifier, X9ECParametersHolder> curves =
            new Dictionary<DerObjectIdentifier, X9ECParametersHolder>();
        private static readonly Dictionary<DerObjectIdentifier, string> names =
            new Dictionary<DerObjectIdentifier, string>();

        private static void DefineCurve(string name, DerObjectIdentifier oid, X9ECParametersHolder holder)
        {
            objIds.Add(name, oid);
            names.Add(oid, name);
            curves.Add(oid, holder);
        }

        static TeleTrusTNamedCurves()
        {
            DefineCurve("brainpoolP160r1", TeleTrusTObjectIdentifiers.BrainpoolP160R1, BrainpoolP160r1Holder.Instance);
            DefineCurve("brainpoolP160t1", TeleTrusTObjectIdentifiers.BrainpoolP160T1, BrainpoolP160t1Holder.Instance);
            DefineCurve("brainpoolP192r1", TeleTrusTObjectIdentifiers.BrainpoolP192R1, BrainpoolP192r1Holder.Instance);
            DefineCurve("brainpoolP192t1", TeleTrusTObjectIdentifiers.BrainpoolP192T1, BrainpoolP192t1Holder.Instance);
            DefineCurve("brainpoolP224r1", TeleTrusTObjectIdentifiers.BrainpoolP224R1, BrainpoolP224r1Holder.Instance);
            DefineCurve("brainpoolP224t1", TeleTrusTObjectIdentifiers.BrainpoolP224T1, BrainpoolP224t1Holder.Instance);
            DefineCurve("brainpoolP256r1", TeleTrusTObjectIdentifiers.BrainpoolP256R1, BrainpoolP256r1Holder.Instance);
            DefineCurve("brainpoolP256t1", TeleTrusTObjectIdentifiers.BrainpoolP256T1, BrainpoolP256t1Holder.Instance);
            DefineCurve("brainpoolP320r1", TeleTrusTObjectIdentifiers.BrainpoolP320R1, BrainpoolP320r1Holder.Instance);
            DefineCurve("brainpoolP320t1", TeleTrusTObjectIdentifiers.BrainpoolP320T1, BrainpoolP320t1Holder.Instance);
            DefineCurve("brainpoolP384r1", TeleTrusTObjectIdentifiers.BrainpoolP384R1, BrainpoolP384r1Holder.Instance);
            DefineCurve("brainpoolP384t1", TeleTrusTObjectIdentifiers.BrainpoolP384T1, BrainpoolP384t1Holder.Instance);
            DefineCurve("brainpoolP512r1", TeleTrusTObjectIdentifiers.BrainpoolP512R1, BrainpoolP512r1Holder.Instance);
            DefineCurve("brainpoolP512t1", TeleTrusTObjectIdentifiers.BrainpoolP512T1, BrainpoolP512t1Holder.Instance);
        }

        /// <summary>Look up the <see cref="X9ECParameters"/> for the curve with the given name.</summary>
        /// <param name="name">The name of the curve.</param>
        public static X9ECParameters GetByName(string name)
        {
            DerObjectIdentifier oid = GetOid(name);
            return oid == null ? null : GetByOid(oid);
        }

        /// <summary>Look up an <see cref="X9ECParametersHolder"/> for the curve with the given name.</summary>
        /// <remarks>
        /// Allows accessing the <see cref="ECCurve">curve</see> without necessarily triggering the creation of the
        /// full <see cref="X9ECParameters"/>.
        /// </remarks>
        /// <param name="name">The name of the curve.</param>
        public static X9ECParametersHolder GetByNameLazy(string name)
        {
            DerObjectIdentifier oid = GetOid(name);
            return oid == null ? null : GetByOidLazy(oid);
        }

        /// <summary>Look up the <see cref="X9ECParameters"/> for the curve with the given
        /// <see cref="DerObjectIdentifier">OID</see>.</summary>
        /// <param name="oid">The <see cref="DerObjectIdentifier">OID</see> for the curve.</param>
        public static X9ECParameters GetByOid(DerObjectIdentifier oid)
        {
            return GetByOidLazy(oid)?.Parameters;
        }

        /// <summary>Look up an <see cref="X9ECParametersHolder"/> for the curve with the given
        /// <see cref="DerObjectIdentifier">OID</see>.</summary>
        /// <remarks>
        /// Allows accessing the <see cref="ECCurve">curve</see> without necessarily triggering the creation of the
        /// full <see cref="X9ECParameters"/>.
        /// </remarks>
        /// <param name="oid">The <see cref="DerObjectIdentifier">OID</see> for the curve.</param>
        public static X9ECParametersHolder GetByOidLazy(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(curves, oid);
        }

        /// <summary>Look up the name of the curve with the given <see cref="DerObjectIdentifier">OID</see>.</summary>
        /// <param name="oid">The <see cref="DerObjectIdentifier">OID</see> for the curve.</param>
        public static string GetName(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(names, oid);
        }

        /// <summary>Look up the <see cref="DerObjectIdentifier">OID</see> of the curve with the given name.</summary>
        /// <param name="name">The name of the curve.</param>
        public static DerObjectIdentifier GetOid(string name)
        {
            return CollectionUtilities.GetValueOrNull(objIds, name);
        }

        /// <summary>Enumerate the available curve names in this registry.</summary>
        public static IEnumerable<string> Names
        {
            get { return CollectionUtilities.Proxy(objIds.Keys); }
        }
    }
}
