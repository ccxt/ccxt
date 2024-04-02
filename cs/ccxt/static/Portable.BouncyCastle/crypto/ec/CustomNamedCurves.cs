using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.GM;
using Org.BouncyCastle.Asn1.Sec;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Custom.GM;
using Org.BouncyCastle.Math.EC.Custom.Sec;
using Org.BouncyCastle.Math.EC.Endo;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Crypto.EC
{
    /// <summary>Elliptic curve registry for various customized curve implementations.</summary>
    public static class CustomNamedCurves
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

        private static ECCurve ConfigureCurveGlv(ECCurve c, GlvTypeBParameters p)
        {
            return c.Configure().SetEndomorphism(new GlvTypeBEndomorphism(c, p)).Create();
        }

        internal class SecP128R1Holder
            : X9ECParametersHolder
        {
            private SecP128R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP128R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP128R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("000E0D4D696E6768756151750CC03A4473D03679");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "04161FF7528B899B2D0C28607CA52C5B86CF5AC8395BAFEB13C02DA292DDED7A83"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecP160K1Holder
            : X9ECParametersHolder
        {
            private SecP160K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP160K1Holder();

            protected override ECCurve CreateCurve()
            {
                GlvTypeBParameters glv = new GlvTypeBParameters(
                    new BigInteger("9ba48cba5ebcb9b6bd33b92830b2a2e0e192f10a", 16),
                    new BigInteger("c39c6c3b3a36d7701b9c71a1f5804ae5d0003f4", 16),
                    new ScalarSplitParameters(
                        new BigInteger[]{
                            new BigInteger("9162fbe73984472a0a9e", 16),
                            new BigInteger("-96341f1138933bc2f505", 16) },
                        new BigInteger[]{
                            new BigInteger("127971af8721782ecffa3", 16),
                            new BigInteger("9162fbe73984472a0a9e", 16) },
                        new BigInteger("9162fbe73984472a0a9d0590", 16),
                        new BigInteger("96341f1138933bc2f503fd44", 16),
                        176));
                return ConfigureCurveGlv(new SecP160K1Curve(), glv);
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "043B4C382CE37AA192A4019E763036F4F5DD4D7EBB938CF935318FDCED6BC28286531733C3F03C4FEE"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecP160R1Holder
            : X9ECParametersHolder
        {
            private SecP160R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP160R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP160R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("1053CDE42C14D696E67687561517533BF3F83345");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "044A96B5688EF573284664698968C38BB913CBFC8223A628553168947D59DCC912042351377AC5FB32"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecP160R2Holder
            : X9ECParametersHolder
        {
            private SecP160R2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP160R2Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP160R2Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("B99B99B099B323E02709A4D696E6768756151751");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0452DCB034293A117E1F4FF11B30F7199D3144CE6DFEAFFEF2E331F296E071FA0DF9982CFEA7D43F2E"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecP192K1Holder
            : X9ECParametersHolder
        {
            private SecP192K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP192K1Holder();

            protected override ECCurve CreateCurve()
            {
                GlvTypeBParameters glv = new GlvTypeBParameters(
                    new BigInteger("bb85691939b869c1d087f601554b96b80cb4f55b35f433c2", 16),
                    new BigInteger("3d84f26c12238d7b4f3d516613c1759033b1a5800175d0b1", 16),
                    new ScalarSplitParameters(
                        new BigInteger[]{
                            new BigInteger("71169be7330b3038edb025f1", 16),
                            new BigInteger("-b3fb3400dec5c4adceb8655c", 16) },
                        new BigInteger[]{
                            new BigInteger("12511cfe811d0f4e6bc688b4d", 16),
                            new BigInteger("71169be7330b3038edb025f1", 16) },
                        new BigInteger("71169be7330b3038edb025f1d0f9", 16),
                        new BigInteger("b3fb3400dec5c4adceb8655d4c94", 16),
                        208));
                return ConfigureCurveGlv(new SecP192K1Curve(), glv);
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "04DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecP192R1Holder
            : X9ECParametersHolder
        {
            private SecP192R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP192R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP192R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("3045AE6FC8422F64ED579528D38120EAE12196D5");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "04188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF101207192B95FFC8DA78631011ED6B24CDD573F977A11E794811"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecP224K1Holder
            : X9ECParametersHolder
        {
            private SecP224K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP224K1Holder();

            protected override ECCurve CreateCurve()
            {
                GlvTypeBParameters glv = new GlvTypeBParameters(
                    new BigInteger("fe0e87005b4e83761908c5131d552a850b3f58b749c37cf5b84d6768", 16),
                    new BigInteger("60dcd2104c4cbc0be6eeefc2bdd610739ec34e317f9b33046c9e4788", 16),
                    new ScalarSplitParameters(
                        new BigInteger[]{
                            new BigInteger("6b8cf07d4ca75c88957d9d670591", 16),
                            new BigInteger("-b8adf1378a6eb73409fa6c9c637d", 16) },
                        new BigInteger[]{
                            new BigInteger("1243ae1b4d71613bc9f780a03690e", 16),
                            new BigInteger("6b8cf07d4ca75c88957d9d670591", 16) },
                        new BigInteger("6b8cf07d4ca75c88957d9d67059037a4", 16),
                        new BigInteger("b8adf1378a6eb73409fa6c9c637ba7f5", 16),
                        240));
                return ConfigureCurveGlv(new SecP224K1Curve(), glv);
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "04A1455B334DF099DF30FC28A169A467E9E47075A90F7E650EB6B7A45C7E089FED7FBA344282CAFBD6F7E319F7C0B0BD59E2CA4BDB556D61A5"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecP224R1Holder
            : X9ECParametersHolder
        {
            private SecP224R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP224R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP224R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("BD71344799D5C7FCDC45B59FA3B9AB8F6A948BC5");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "04B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecP256K1Holder
            : X9ECParametersHolder
        {
            private SecP256K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP256K1Holder();

            protected override ECCurve CreateCurve()
            {
                GlvTypeBParameters glv = new GlvTypeBParameters(
                    new BigInteger("7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee", 16),
                    new BigInteger("5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72", 16),
                    new ScalarSplitParameters(
                        new BigInteger[]{
                            new BigInteger("3086d221a7d46bcde86c90e49284eb15", 16),
                            new BigInteger("-e4437ed6010e88286f547fa90abfe4c3", 16) },
                        new BigInteger[]{
                            new BigInteger("114ca50f7a8e2f3f657c1108d9d44cfd8", 16),
                            new BigInteger("3086d221a7d46bcde86c90e49284eb15", 16) },
                        new BigInteger("3086d221a7d46bcde86c90e49284eb153dab", 16),
                        new BigInteger("e4437ed6010e88286f547fa90abfe4c42212", 16),
                        272));
                return ConfigureCurveGlv(new SecP256K1Curve(), glv);
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0479BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecP256R1Holder
            : X9ECParametersHolder
        {
            private SecP256R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP256R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP256R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("C49D360886E704936A6678E1139D26B7819F7E90");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "046B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C2964FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecP384R1Holder
            : X9ECParametersHolder
        {
            private SecP384R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP384R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP384R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("A335926AA319A27A1D00896A6773A4827ACDAC73");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7"
                    + "3617DE4A96262C6F5D9E98BF9292DC29F8F41DBD289A147CE9DA3113B5F0B8C00A60B1CE1D7E819D7A431D7C90EA0E5F");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecP521R1Holder
            : X9ECParametersHolder
        {
            private SecP521R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecP521R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecP521R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("D09E8800291CB85396CC6717393284AAA0DA64BA");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "00C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66"
                    + "011839296A789A3BC0045C8A5FB42C7D1BD998F54449579B446817AFBD17273E662C97EE72995EF42640C550B9013FAD0761353C7086A272C24088BE94769FD16650");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        }

        internal class SecT113R1Holder
            : X9ECParametersHolder
        {
            private SecT113R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT113R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT113R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("10E723AB14D696E6768756151756FEBF8FCB49A9");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "04009D73616F35F4AB1407D73562C10F00A52830277958EE84D1315ED31886"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT113R2Holder
            : X9ECParametersHolder
        {
            private SecT113R2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT113R2Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT113R2Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("10C0FB15760860DEF1EEF4D696E676875615175D");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0401A57A6A7B26CA5EF52FCDB816479700B3ADC94ED1FE674C06E695BABA1D"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT131R1Holder
            : X9ECParametersHolder
        {
            private SecT131R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT131R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT131R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("4D696E676875615175985BD3ADBADA21B43A97E2");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "040081BAF91FDF9833C40F9C181343638399078C6E7EA38C001F73C8134B1B4EF9E150"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT131R2Holder
            : X9ECParametersHolder
        {
            private SecT131R2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT131R2Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT131R2Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("985BD3ADBAD4D696E676875615175A21B43A97E3");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "040356DCD8F2F95031AD652D23951BB366A80648F06D867940A5366D9E265DE9EB240F"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT163K1Holder
            : X9ECParametersHolder
        {
            private SecT163K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT163K1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT163K1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0402FE13C0537BBC11ACAA07D793DE4E6D5E5C94EEE80289070FB05D38FF58321F2E800536D538CCDAA3D9"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT163R1Holder
            : X9ECParametersHolder
        {
            private SecT163R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT163R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT163R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("24B7B137C8A14D696E6768756151756FD0DA2E5C");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "040369979697AB43897789566789567F787A7876A65400435EDB42EFAFB2989D51FEFCE3C80988F41FF883"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT163R2Holder
            : X9ECParametersHolder
        {
            private SecT163R2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT163R2Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT163R2Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("85E25BFE5C86226CDB12016F7553F9D0E693A268");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0403F0EBA16286A2D57EA0991168D4994637E8343E3600D51FBC6C71A0094FA2CDD545B11C5C0C797324F1"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT193R1Holder
            : X9ECParametersHolder
        {
            private SecT193R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT193R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT193R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("103FAEC74D696E676875615175777FC5B191EF30");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0401F481BC5F0FF84A74AD6CDF6FDEF4BF6179625372D8C0C5E10025E399F2903712CCF3EA9E3A1AD17FB0B3201B6AF7CE1B05"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT193R2Holder
            : X9ECParametersHolder
        {
            private SecT193R2Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT193R2Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT193R2Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("10B7B4D696E676875615175137C8A16FD0DA2211");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0400D9B67D192E0367C803F39E1A7E82CA14A651350AAE617E8F01CE94335607C304AC29E7DEFBD9CA01F596F927224CDECF6C"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT233K1Holder
            : X9ECParametersHolder
        {
            private SecT233K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT233K1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT233K1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "04017232BA853A7E731AF129F22FF4149563A419C26BF50A4C9D6EEFAD612601DB537DECE819B7F70F555A67C427A8CD9BF18AEB9B56E0C11056FAE6A3"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT233R1Holder
            : X9ECParametersHolder
        {
            private SecT233R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT233R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT233R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("74D59FF07F6B413D0EA14B344B20A2DB049B50C3");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0400FAC9DFCBAC8313BB2139F1BB755FEF65BC391F8B36F8F8EB7371FD558B01006A08A41903350678E58528BEBF8A0BEFF867A7CA36716F7E01F81052"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT239K1Holder
            : X9ECParametersHolder
        {
            private SecT239K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT239K1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT239K1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0429A0B6A887A983E9730988A68727A8B2D126C44CC2CC7B2A6555193035DC76310804F12E549BDB011C103089E73510ACB275FC312A5DC6B76553F0CA"); 
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT283K1Holder
            : X9ECParametersHolder
        {
            private SecT283K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT283K1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT283K1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "0503213F78CA44883F1A3B8162F188E553CD265F23C1567A16876913B0C2AC2458492836"
                    + "01CCDA380F1C9E318D90F95D07E5426FE87E45C0E8184698E45962364E34116177DD2259");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT283R1Holder
            : X9ECParametersHolder
        {
            private SecT283R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT283R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT283R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("77E2B07370EB0F832A6DD5B62DFC88CD06BB84BE");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "05F939258DB7DD90E1934F8C70B0DFEC2EED25B8557EAC9C80E2E198F8CDBECD86B12053"
                    + "03676854FE24141CB98FE6D4B20D02B4516FF702350EDDB0826779C813F0DF45BE8112F4");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT409K1Holder
            : X9ECParametersHolder
        {
            private SecT409K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT409K1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT409K1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "0060F05F658F49C1AD3AB1890F7184210EFD0987E307C84C27ACCFB8F9F67CC2C460189EB5AAAA62EE222EB1B35540CFE9023746"
                    + "01E369050B7C4E42ACBA1DACBF04299C3460782F918EA427E6325165E9EA10E3DA5F6C42E9C55215AA9CA27A5863EC48D8E0286B");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT409R1Holder
            : X9ECParametersHolder
        {
            private SecT409R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT409R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT409R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("4099B5A457F9D69F79213D094C4BCD4D4262210B");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "015D4860D088DDB3496B0C6064756260441CDE4AF1771D4DB01FFE5B34E59703DC255A868A1180515603AEAB60794E54BB7996A7"
                    + "0061B1CFAB6BE5F32BBFA78324ED106A7636B9C5A7BD198D0158AA4F5488D08F38514F1FDF4B4F40D2181B3681C364BA0273C706");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT571K1Holder
            : X9ECParametersHolder
        {
            private SecT571K1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT571K1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT571K1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "026EB7A859923FBC82189631F8103FE4AC9CA2970012D5D46024804801841CA44370958493B205E647DA304DB4CEB08CBBD1BA39494776FB988B47174DCA88C7E2945283A01C8972"
                    + "0349DC807F4FBF374F4AEADE3BCA95314DD58CEC9F307A54FFC61EFC006D8A2C9D4979C0AC44AEA74FBEBBB9F772AEDCB620B01A7BA7AF1B320430C8591984F601CD4C143EF1C7A3");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SecT571R1Holder
            : X9ECParametersHolder
        {
            private SecT571R1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SecT571R1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SecT571R1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = Hex.DecodeStrict("2AA058F73A0E33AB486B0F610410C53A7F132310");
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve, "04"
                    + "0303001D34B856296C16C0D40D3CD7750A93D1D2955FA80AA5F40FC8DB7B2ABDBDE53950F4C0D293CDD711A35B67FB1499AE60038614F1394ABFA3B4C850D927E1E7769C8EEC2D19"
                    + "037BF27342DA639B6DCCFFFEB73D69D78C6C27A6009CBBCA1980F8533921E8A684423E43BAB08A576291AF8F461BB2A8B3531D2F0485C19B16E2F1516E23DD3C1A4827AF1B8AC15B");
                return new X9ECParameters(curve, G, curve.Order, curve.Cofactor, S);
            }
        };

        internal class SM2P256V1Holder
            : X9ECParametersHolder
        {
            private SM2P256V1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SM2P256V1Holder();

            protected override ECCurve CreateCurve()
            {
                return ConfigureCurve(new SM2P256V1Curve());
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;
                X9ECPoint G = ConfigureBasepoint(curve,
                    "0432C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0"); 
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

        private static void DefineCurveAlias(string name, DerObjectIdentifier oid)
        {
            if (!curves.ContainsKey(oid))
                throw new InvalidOperationException();

            objIds.Add(name, oid);
        }

        static CustomNamedCurves()
        {
            //DefineCurve("secp112r1", SecObjectIdentifiers.SecP112r1, SecP112R1Holder.Instance);
            //DefineCurve("secp112r2", SecObjectIdentifiers.SecP112r2, SecP112R2Holder.Instance);
            DefineCurve("secp128r1", SecObjectIdentifiers.SecP128r1, SecP128R1Holder.Instance);
            //DefineCurve("secp128r2", SecObjectIdentifiers.SecP128r2, SecP128R2Holder.Instance);
            DefineCurve("secp160k1", SecObjectIdentifiers.SecP160k1, SecP160K1Holder.Instance);
            DefineCurve("secp160r1", SecObjectIdentifiers.SecP160r1, SecP160R1Holder.Instance);
            DefineCurve("secp160r2", SecObjectIdentifiers.SecP160r2, SecP160R2Holder.Instance);
            DefineCurve("secp192k1", SecObjectIdentifiers.SecP192k1, SecP192K1Holder.Instance);
            DefineCurve("secp192r1", SecObjectIdentifiers.SecP192r1, SecP192R1Holder.Instance);
            DefineCurve("secp224k1", SecObjectIdentifiers.SecP224k1, SecP224K1Holder.Instance);
            DefineCurve("secp224r1", SecObjectIdentifiers.SecP224r1, SecP224R1Holder.Instance);
            DefineCurve("secp256k1", SecObjectIdentifiers.SecP256k1, SecP256K1Holder.Instance);
            DefineCurve("secp256r1", SecObjectIdentifiers.SecP256r1, SecP256R1Holder.Instance);
            DefineCurve("secp384r1", SecObjectIdentifiers.SecP384r1, SecP384R1Holder.Instance);
            DefineCurve("secp521r1", SecObjectIdentifiers.SecP521r1, SecP521R1Holder.Instance);

            DefineCurve("sect113r1", SecObjectIdentifiers.SecT113r1, SecT113R1Holder.Instance);
            DefineCurve("sect113r2", SecObjectIdentifiers.SecT113r2, SecT113R2Holder.Instance);
            DefineCurve("sect131r1", SecObjectIdentifiers.SecT131r1, SecT131R1Holder.Instance);
            DefineCurve("sect131r2", SecObjectIdentifiers.SecT131r2, SecT131R2Holder.Instance);
            DefineCurve("sect163k1", SecObjectIdentifiers.SecT163k1, SecT163K1Holder.Instance);
            DefineCurve("sect163r1", SecObjectIdentifiers.SecT163r1, SecT163R1Holder.Instance);
            DefineCurve("sect163r2", SecObjectIdentifiers.SecT163r2, SecT163R2Holder.Instance);
            DefineCurve("sect193r1", SecObjectIdentifiers.SecT193r1, SecT193R1Holder.Instance);
            DefineCurve("sect193r2", SecObjectIdentifiers.SecT193r2, SecT193R2Holder.Instance);
            DefineCurve("sect233k1", SecObjectIdentifiers.SecT233k1, SecT233K1Holder.Instance);
            DefineCurve("sect233r1", SecObjectIdentifiers.SecT233r1, SecT233R1Holder.Instance);
            DefineCurve("sect239k1", SecObjectIdentifiers.SecT239k1, SecT239K1Holder.Instance);
            DefineCurve("sect283k1", SecObjectIdentifiers.SecT283k1, SecT283K1Holder.Instance);
            DefineCurve("sect283r1", SecObjectIdentifiers.SecT283r1, SecT283R1Holder.Instance);
            DefineCurve("sect409k1", SecObjectIdentifiers.SecT409k1, SecT409K1Holder.Instance);
            DefineCurve("sect409r1", SecObjectIdentifiers.SecT409r1, SecT409R1Holder.Instance);
            DefineCurve("sect571k1", SecObjectIdentifiers.SecT571k1, SecT571K1Holder.Instance);
            DefineCurve("sect571r1", SecObjectIdentifiers.SecT571r1, SecT571R1Holder.Instance);

            DefineCurve("sm2p256v1", GMObjectIdentifiers.sm2p256v1, SM2P256V1Holder.Instance);

            DefineCurveAlias("B-163", SecObjectIdentifiers.SecT163r2);
            DefineCurveAlias("B-233", SecObjectIdentifiers.SecT233r1);
            DefineCurveAlias("B-283", SecObjectIdentifiers.SecT283r1);
            DefineCurveAlias("B-409", SecObjectIdentifiers.SecT409r1);
            DefineCurveAlias("B-571", SecObjectIdentifiers.SecT571r1);

            DefineCurveAlias("K-163", SecObjectIdentifiers.SecT163k1);
            DefineCurveAlias("K-233", SecObjectIdentifiers.SecT233k1);
            DefineCurveAlias("K-283", SecObjectIdentifiers.SecT283k1);
            DefineCurveAlias("K-409", SecObjectIdentifiers.SecT409k1);
            DefineCurveAlias("K-571", SecObjectIdentifiers.SecT571k1);

            DefineCurveAlias("P-192", SecObjectIdentifiers.SecP192r1);
            DefineCurveAlias("P-224", SecObjectIdentifiers.SecP224r1);
            DefineCurveAlias("P-256", SecObjectIdentifiers.SecP256r1);
            DefineCurveAlias("P-384", SecObjectIdentifiers.SecP384r1);
            DefineCurveAlias("P-521", SecObjectIdentifiers.SecP521r1);
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
