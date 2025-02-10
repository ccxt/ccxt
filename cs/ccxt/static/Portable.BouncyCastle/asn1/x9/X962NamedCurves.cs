using System;
using System.Collections.Generic;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Asn1.X9
{
    /// <summary>Elliptic curve registry for the curves defined in X.962 EC-DSA.</summary>
    public static class X962NamedCurves
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

        internal class Prime192v1Holder
            : X9ECParametersHolder
        {
            private Prime192v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Prime192v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("ffffffffffffffffffffffff99def836146bc9b1b4d22831");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF"),
                    FromHex("fffffffffffffffffffffffffffffffefffffffffffffffc"),
                    FromHex("64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1"),
                    n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("3045AE6FC8422f64ED579528D38120EAE12196D5");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "03188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class Prime192v2Holder
            : X9ECParametersHolder
        {
            private Prime192v2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Prime192v2Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("fffffffffffffffffffffffe5fb1a724dc80418648d8dd31");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF"),
                    FromHex("fffffffffffffffffffffffffffffffefffffffffffffffc"),
                    FromHex("cc22d6dfb95c6b25e49c0d6364a4e5980c393aa21668d953"),
                    n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("31a92ee2029fd10d901b113e990710f0d21ac6b6");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "03eea2bae7e1497842f2de7769cfe9c989c072ad696f48034a");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class Prime192v3Holder
            : X9ECParametersHolder
        {
            private Prime192v3Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Prime192v3Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("ffffffffffffffffffffffff7a62d031c83f4294f640ec13");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    FromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF"),
                    FromHex("fffffffffffffffffffffffffffffffefffffffffffffffc"),
                    FromHex("22123dc2395a05caa7423daeccc94760a7d462256bd56916"),
                    n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("c469684435deb378c4b65ca9591e2a5763059a2e");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "027d29778100c65a1da1783716588dce2b8b4aee8e228f1896");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class Prime239v1Holder
            : X9ECParametersHolder
        {
            private Prime239v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Prime239v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("7fffffffffffffffffffffff7fffff9e5e9a9f5d9071fbd1522688909d0b");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    new BigInteger("883423532389192164791648750360308885314476597252960362792450860609699839"),
                    FromHex("7fffffffffffffffffffffff7fffffffffff8000000000007ffffffffffc"),
                    FromHex("6b016c3bdcf18941d0d654921475ca71a9db2fb27d1d37796185c2942c0a"),
                    n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("e43bb460f0b80cc0c0b075798e948060f8321b7d");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "020ffa963cdca8816ccc33b8642bedf905c3d358573d3f27fbbd3b3cb9aaaf");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class Prime239v2Holder
            : X9ECParametersHolder
        {
            private Prime239v2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Prime239v2Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("7fffffffffffffffffffffff800000cfa7e8594377d414c03821bc582063");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    new BigInteger("883423532389192164791648750360308885314476597252960362792450860609699839"),
                    FromHex("7fffffffffffffffffffffff7fffffffffff8000000000007ffffffffffc"),
                    FromHex("617fab6832576cbbfed50d99f0249c3fee58b94ba0038c7ae84c8c832f2c"),
                    n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("e8b4011604095303ca3b8099982be09fcb9ae616");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0238af09d98727705120c921bb5e9e26296a3cdcf2f35757a0eafd87b830e7");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class Prime239v3Holder
            : X9ECParametersHolder
        {
            private Prime239v3Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Prime239v3Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("7fffffffffffffffffffffff7fffff975deb41b3a6057c3c432146526551");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    new BigInteger("883423532389192164791648750360308885314476597252960362792450860609699839"),
                    FromHex("7fffffffffffffffffffffff7fffffffffff8000000000007ffffffffffc"),
                    FromHex("255705fa2a306654b1f4cb03d6a750a30c250102d4988717d9ba15ab6d3e"),
                    n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("7d7374168ffe3471b60a857686a19475d3bfa2ff");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "036768ae8e18bb92cfcf005c949aa2c6d94853d0e660bbf854b1c9505fe95a");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class Prime256v1Holder
            : X9ECParametersHolder
        {
            private Prime256v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Prime256v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(
                    new BigInteger("115792089210356248762697446949407573530086143415290314195533631308867097853951"),
                    FromHex("ffffffff00000001000000000000000000000000fffffffffffffffffffffffc"),
                    FromHex("5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"),
                    n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("c49d360886e704936a6678e1139d26b7819f7e90");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "036b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb163v1Holder
            : X9ECParametersHolder
        {
            private C2pnb163v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb163v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("0400000000000000000001E60FC8821CC74DAEAFC1");
                BigInteger h = BigInteger.Two;

                return ConfigureCurve(new F2mCurve(
                    163,
                    1, 2, 8,
                    FromHex("072546B5435234A422E0789675F432C89435DE5242"),
                    FromHex("00C9517D06D5240D3CFF38C74B20B6CD4D6F9DD4D9"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("D2C0FB15760860DEF1EEF4D696E6768756151754");
                ECCurve curve = Curve;
    
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0307AF69989546103D79329FCC3D74880F33BBE803CB");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb163v2Holder
            : X9ECParametersHolder
        {
            private C2pnb163v2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb163v2Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("03FFFFFFFFFFFFFFFFFFFDF64DE1151ADBB78F10A7");
                BigInteger h = BigInteger.Two;

                return ConfigureCurve(new F2mCurve(
                    163,
                    1, 2, 8,
                    FromHex("0108B39E77C4B108BED981ED0E890E117C511CF072"),
                    FromHex("0667ACEB38AF4E488C407433FFAE4F1C811638DF20"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "030024266E4EB5106D0A964D92C4860E2671DB9B6CC5");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb163v3Holder
            : X9ECParametersHolder
        {
            private C2pnb163v3Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb163v3Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("03FFFFFFFFFFFFFFFFFFFE1AEE140F110AFF961309");
                BigInteger h = BigInteger.Two;

                return ConfigureCurve(new F2mCurve(
                    163,
                    1, 2, 8,
                    FromHex("07A526C63D3E25A256A007699F5447E32AE456B50E"),
                    FromHex("03F7061798EB99E238FD6F1BF95B48FEEB4854252B"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0202F9F87B7C574D0BDECF8A22E6524775F98CDEBDCB");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb176w1Holder
            : X9ECParametersHolder
        {
            private C2pnb176w1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb176w1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("010092537397ECA4F6145799D62B0A19CE06FE26AD");
                BigInteger h = BigInteger.ValueOf(0xFF6E);

                return ConfigureCurve(new F2mCurve(
                    176,
                    1, 2, 43,
                    FromHex("E4E6DB2995065C407D9D39B8D0967B96704BA8E9C90B"),
                    FromHex("5DDA470ABE6414DE8EC133AE28E9BBD7FCEC0AE0FFF2"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "038D16C2866798B600F9F08BB4A8E860F3298CE04A5798");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb191v1Holder
            : X9ECParametersHolder
        {
            private C2tnb191v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb191v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("40000000000000000000000004A20E90C39067C893BBB9A5");
                BigInteger h = BigInteger.Two;

                return ConfigureCurve(new F2mCurve(
                    191,
                    9,
                    FromHex("2866537B676752636A68F56554E12640276B649EF7526267"),
                    FromHex("2E45EF571F00786F67B0081B9495A3D95462F5DE0AA185EC"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("4E13CA542744D696E67687561517552F279A8C84");
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0236B3DAF8A23206F9C4F299D7B21A9C369137F2C84AE1AA0D");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb191v2Holder
            : X9ECParametersHolder
        {
            private C2tnb191v2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb191v2Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("20000000000000000000000050508CB89F652824E06B8173");
                BigInteger h = BigInteger.ValueOf(4);

                return ConfigureCurve(new F2mCurve(
                    191,
                    9,
                    FromHex("401028774D7777C7B7666D1366EA432071274F89FF01E718"),
                    FromHex("0620048D28BCBD03B6249C99182B7C8CD19700C362C46A01"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "023809B2B7CC1B28CC5A87926AAD83FD28789E81E2C9E3BF10");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb191v3Holder
            : X9ECParametersHolder
        {
            private C2tnb191v3Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb191v3Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("155555555555555555555555610C0B196812BFB6288A3EA3");
                BigInteger h = BigInteger.ValueOf(6);

                return ConfigureCurve(new F2mCurve(
                    191,
                    9,
                    FromHex("6C01074756099122221056911C77D77E77A777E7E7E77FCB"),
                    FromHex("71FE1AF926CF847989EFEF8DB459F66394D90F32AD3F15E8"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "03375D4CE24FDE434489DE8746E71786015009E66E38A926DD");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb208w1Holder
            : X9ECParametersHolder
        {
            private C2pnb208w1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb208w1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("0101BAF95C9723C57B6C21DA2EFF2D5ED588BDD5717E212F9D");
                BigInteger h = BigInteger.ValueOf(0xFE48);

                return ConfigureCurve(new F2mCurve(
                    208,
                    1, 2, 83,
                    BigInteger.Zero,
                    FromHex("C8619ED45A62E6212E1160349E2BFA844439FAFC2A3FD1638F9E"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0289FDFBE4ABE193DF9559ECF07AC0CE78554E2784EB8C1ED1A57A");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb239v1Holder
            : X9ECParametersHolder
        {
            private C2tnb239v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb239v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("2000000000000000000000000000000F4D42FFE1492A4993F1CAD666E447");
                BigInteger h = BigInteger.ValueOf(4);

                return ConfigureCurve(new F2mCurve(
                    239,
                    36,
                    FromHex("32010857077C5431123A46B808906756F543423E8D27877578125778AC76"),
                    FromHex("790408F2EEDAF392B012EDEFB3392F30F4327C0CA3F31FC383C422AA8C16"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0257927098FA932E7C0A96D3FD5B706EF7E5F5C156E16B7E7C86038552E91D");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb239v2Holder
            : X9ECParametersHolder
        {
            private C2tnb239v2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb239v2Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("1555555555555555555555555555553C6F2885259C31E3FCDF154624522D");
                BigInteger h = BigInteger.ValueOf(6);

                return ConfigureCurve(new F2mCurve(
                    239,
                    36,
                    FromHex("4230017757A767FAE42398569B746325D45313AF0766266479B75654E65F"),
                    FromHex("5037EA654196CFF0CD82B2C14A2FCF2E3FF8775285B545722F03EACDB74B"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0228F9D04E900069C8DC47A08534FE76D2B900B7D7EF31F5709F200C4CA205");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb239v3Holder
            : X9ECParametersHolder
        {
            private C2tnb239v3Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb239v3Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("0CCCCCCCCCCCCCCCCCCCCCCCCCCCCCAC4912D2D9DF903EF9888B8A0E4CFF");
                BigInteger h = BigInteger.ValueOf(10);

                return ConfigureCurve(new F2mCurve(
                    239,
                    36,
                    FromHex("01238774666A67766D6676F778E676B66999176666E687666D8766C66A9F"),
                    FromHex("6A941977BA9F6A435199ACFC51067ED587F519C5ECB541B8E44111DE1D40"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "0370F6E9D04D289C4E89913CE3530BFDE903977D42B146D539BF1BDE4E9C92");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb272w1Holder
            : X9ECParametersHolder
        {
            private C2pnb272w1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb272w1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("0100FAF51354E0E39E4892DF6E319C72C8161603FA45AA7B998A167B8F1E629521");
                BigInteger h = BigInteger.ValueOf(0xFF06);

                return ConfigureCurve(new F2mCurve(
                    272,
                    1, 3, 56,
                    FromHex("91A091F03B5FBA4AB2CCF49C4EDD220FB028712D42BE752B2C40094DBACDB586FB20"),
                    FromHex("7167EFC92BB2E3CE7C8AAAFF34E12A9C557003D7C73A6FAF003F99F6CC8482E540F7"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "026108BABB2CEEBCF787058A056CBE0CFE622D7723A289E08A07AE13EF0D10D171DD8D");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb304w1Holder
            : X9ECParametersHolder
        {
            private C2pnb304w1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb304w1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("0101D556572AABAC800101D556572AABAC8001022D5C91DD173F8FB561DA6899164443051D");
                BigInteger h = BigInteger.ValueOf(0xFE2E);

                return ConfigureCurve(new F2mCurve(
                    304,
                    1, 2, 11,
                    FromHex("FD0D693149A118F651E6DCE6802085377E5F882D1B510B44160074C1288078365A0396C8E681"),
                    FromHex("BDDB97E555A50A908E43B01C798EA5DAA6788F1EA2794EFCF57166B8C14039601E55827340BE"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "02197B07845E9BE2D96ADB0F5F3C7F2CFFBD7A3EB8B6FEC35C7FD67F26DDF6285A644F740A2614");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb359v1Holder
            : X9ECParametersHolder
        {
            private C2tnb359v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb359v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("01AF286BCA1AF286BCA1AF286BCA1AF286BCA1AF286BC9FB8F6B85C556892C20A7EB964FE7719E74F490758D3B");
                BigInteger h = BigInteger.ValueOf(0x4C);

                return ConfigureCurve(new F2mCurve(
                    359,
                    68,
                    FromHex("5667676A654B20754F356EA92017D946567C46675556F19556A04616B567D223A5E05656FB549016A96656A557"),
                    FromHex("2472E2D0197C49363F1FE7F5B6DB075D52B6947D135D8CA445805D39BC345626089687742B6329E70680231988"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "033C258EF3047767E7EDE0F1FDAA79DAEE3841366A132E163ACED4ED2401DF9C6BDCDE98E8E707C07A2239B1B097");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2pnb368w1Holder
            : X9ECParametersHolder
        {
            private C2pnb368w1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2pnb368w1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("010090512DA9AF72B08349D98A5DD4C7B0532ECA51CE03E2D10F3B7AC579BD87E909AE40A6F131E9CFCE5BD967");
                BigInteger h = BigInteger.ValueOf(0xFF70);

                return ConfigureCurve(new F2mCurve(
                    368,
                    1, 2, 85,
                    FromHex("E0D2EE25095206F5E2A4F9ED229F1F256E79A0E2B455970D8D0D865BD94778C576D62F0AB7519CCD2A1A906AE30D"),
                    FromHex("FC1217D4320A90452C760A58EDCD30C8DD069B3C34453837A34ED50CB54917E1C2112D84D164F444F8F74786046A"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "021085E2755381DCCCE3C1557AFA10C2F0C0C2825646C5B34A394CBCFA8BC16B22E7E789E927BE216F02E1FB136A5F");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class C2tnb431r1Holder
            : X9ECParametersHolder
        {
            private C2tnb431r1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new C2tnb431r1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger n = FromHex("0340340340340340340340340340340340340340340340340340340323C313FAB50589703B5EC68D3587FEC60D161CC149C1AD4A91");
                BigInteger h = BigInteger.ValueOf(0x2760);

                return ConfigureCurve(new F2mCurve(
                    431,
                    120,
                    FromHex("1A827EF00DD6FC0E234CAF046C6A5D8A85395B236CC4AD2CF32A0CADBDC9DDF620B0EB9906D0957F6C6FEACD615468DF104DE296CD8F"),
                    FromHex("10D9B4A3D9047D8B154359ABFB1B7F5485B04CEB868237DDC9DEDA982A679A5A919B626D4E50A8DD731B107A9962381FB5D807BF2618"),
                    n, h));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "02120FC05D3C67A99DE161D2F4092622FECA701BE4F50F4758714E8A87BBF2A658EF8C21E7C5EFE965361F6C2999C0C247B0DBD70CE6B7");

                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
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

        static X962NamedCurves()
        {
            DefineCurve("prime192v1", X9ObjectIdentifiers.Prime192v1, Prime192v1Holder.Instance);
            DefineCurve("prime192v2", X9ObjectIdentifiers.Prime192v2, Prime192v2Holder.Instance);
            DefineCurve("prime192v3", X9ObjectIdentifiers.Prime192v3, Prime192v3Holder.Instance);
            DefineCurve("prime239v1", X9ObjectIdentifiers.Prime239v1, Prime239v1Holder.Instance);
            DefineCurve("prime239v2", X9ObjectIdentifiers.Prime239v2, Prime239v2Holder.Instance);
            DefineCurve("prime239v3", X9ObjectIdentifiers.Prime239v3, Prime239v3Holder.Instance);
            DefineCurve("prime256v1", X9ObjectIdentifiers.Prime256v1, Prime256v1Holder.Instance);
            DefineCurve("c2pnb163v1", X9ObjectIdentifiers.C2Pnb163v1, C2pnb163v1Holder.Instance);
            DefineCurve("c2pnb163v2", X9ObjectIdentifiers.C2Pnb163v2, C2pnb163v2Holder.Instance);
            DefineCurve("c2pnb163v3", X9ObjectIdentifiers.C2Pnb163v3, C2pnb163v3Holder.Instance);
            DefineCurve("c2pnb176w1", X9ObjectIdentifiers.C2Pnb176w1, C2pnb176w1Holder.Instance);
            DefineCurve("c2tnb191v1", X9ObjectIdentifiers.C2Tnb191v1, C2tnb191v1Holder.Instance);
            DefineCurve("c2tnb191v2", X9ObjectIdentifiers.C2Tnb191v2, C2tnb191v2Holder.Instance);
            DefineCurve("c2tnb191v3", X9ObjectIdentifiers.C2Tnb191v3, C2tnb191v3Holder.Instance);
            DefineCurve("c2pnb208w1", X9ObjectIdentifiers.C2Pnb208w1, C2pnb208w1Holder.Instance);
            DefineCurve("c2tnb239v1", X9ObjectIdentifiers.C2Tnb239v1, C2tnb239v1Holder.Instance);
            DefineCurve("c2tnb239v2", X9ObjectIdentifiers.C2Tnb239v2, C2tnb239v2Holder.Instance);
            DefineCurve("c2tnb239v3", X9ObjectIdentifiers.C2Tnb239v3, C2tnb239v3Holder.Instance);
            DefineCurve("c2pnb272w1", X9ObjectIdentifiers.C2Pnb272w1, C2pnb272w1Holder.Instance);
            DefineCurve("c2pnb304w1", X9ObjectIdentifiers.C2Pnb304w1, C2pnb304w1Holder.Instance);
            DefineCurve("c2tnb359v1", X9ObjectIdentifiers.C2Tnb359v1, C2tnb359v1Holder.Instance);
            DefineCurve("c2pnb368w1", X9ObjectIdentifiers.C2Pnb368w1, C2pnb368w1Holder.Instance);
            DefineCurve("c2tnb431r1", X9ObjectIdentifiers.C2Tnb431r1, C2tnb431r1Holder.Instance);
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
