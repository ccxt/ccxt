using System;
using System.Collections.Generic;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Asn1.CryptoPro
{
    /// <summary>Registry of available named parameters for GOST 3410-94.</summary>
    public static class Gost3410NamedParameters
    {
        private static readonly Gost3410ParamSetParameters cryptoProA = new Gost3410ParamSetParameters(
            1024,
            new BigInteger("127021248288932417465907042777176443525787653508916535812817507265705031260985098497423188333483401180925999995120988934130659205614996724254121049274349357074920312769561451689224110579311248812610229678534638401693520013288995000362260684222750813532307004517341633685004541062586971416883686778842537820383"),
            new BigInteger("68363196144955700784444165611827252895102170888761442055095051287550314083023"),
            new BigInteger("100997906755055304772081815535925224869841082572053457874823515875577147990529272777244152852699298796483356699682842027972896052747173175480590485607134746852141928680912561502802222185647539190902656116367847270145019066794290930185446216399730872221732889830323194097355403213400972588322876850946740663962")
            //            validationAlgorithm {
            //                    algorithm
            //                        id-GostR3410-94-bBis,
            //                    parameters
            //                        GostR3410-94-ValidationBisParameters: {
            //                            x0      1376285941,
            //                            c       3996757427
            //                        }
            //                }

            );

        private static readonly Gost3410ParamSetParameters cryptoProB = new Gost3410ParamSetParameters(
            1024,
            new BigInteger("139454871199115825601409655107690713107041707059928031797758001454375765357722984094124368522288239833039114681648076688236921220737322672160740747771700911134550432053804647694904686120113087816240740184800477047157336662926249423571248823968542221753660143391485680840520336859458494803187341288580489525163"),
            new BigInteger("79885141663410976897627118935756323747307951916507639758300472692338873533959"),
            new BigInteger("42941826148615804143873447737955502392672345968607143066798112994089471231420027060385216699563848719957657284814898909770759462613437669456364882730370838934791080835932647976778601915343474400961034231316672578686920482194932878633360203384797092684342247621055760235016132614780652761028509445403338652341")
            //    validationAlgorithm {
            //            algorithm
            //                id-GostR3410-94-bBis,
            //            parameters
            //                GostR3410-94-ValidationBisParameters: {
            //                    x0      1536654555,
            //                    c       1855361757,
            //                    d       14408629386140014567655
            //4902939282056547857802241461782996702017713059974755104394739915140
            //6115284791024439062735788342744854120601660303926203867703556828005
            //8957203818114895398976594425537561271800850306
            //                }
            //        }
            //}
            );

        private static readonly Gost3410ParamSetParameters cryptoProXchA = new Gost3410ParamSetParameters(
            1024,
            new BigInteger("142011741597563481196368286022318089743276138395243738762872573441927459393512718973631166078467600360848946623567625795282774719212241929071046134208380636394084512691828894000571524625445295769349356752728956831541775441763139384457191755096847107846595662547942312293338483924514339614727760681880609734239"),
            new BigInteger("91771529896554605945588149018382750217296858393520724172743325725474374979801"),
            new BigInteger("133531813272720673433859519948319001217942375967847486899482359599369642528734712461590403327731821410328012529253871914788598993103310567744136196364803064721377826656898686468463277710150809401182608770201615324990468332931294920912776241137878030224355746606283971659376426832674269780880061631528163475887")
            );

        private static readonly Dictionary<string, DerObjectIdentifier> objIds =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<DerObjectIdentifier, Gost3410ParamSetParameters> parameters =
            new Dictionary<DerObjectIdentifier, Gost3410ParamSetParameters>();

        private static void DefineParameters(string name, DerObjectIdentifier oid,
            Gost3410ParamSetParameters parameterSet)
        {
            objIds.Add(name, oid);
            parameters.Add(oid, parameterSet);
        }

        static Gost3410NamedParameters()
        {
            DefineParameters("GostR3410-94-CryptoPro-A", CryptoProObjectIdentifiers.GostR3410x94CryptoProA, cryptoProA);
            DefineParameters("GostR3410-94-CryptoPro-B", CryptoProObjectIdentifiers.GostR3410x94CryptoProB, cryptoProB);
            DefineParameters("GostR3410-94-CryptoPro-XchA", CryptoProObjectIdentifiers.GostR3410x94CryptoProXchA,
                cryptoProXchA);
        }

        /// <summary>Look up the <see cref="Gost3410ParamSetParameters"/> for the parameter set with the given name.
        /// </summary>
        /// <param name="name">The name of the parameter set.</param>
        public static Gost3410ParamSetParameters GetByName(string name)
        {
            DerObjectIdentifier oid = GetOid(name);
            return oid == null ? null : GetByOid(oid);
        }

        /// <summary>Look up the <see cref="Gost3410ParamSetParameters"/> for the parameter set with the given
        /// <see cref="DerObjectIdentifier">OID</see>.</summary>
        /// <param name="oid">The <see cref="DerObjectIdentifier">OID</see> for the parameter set.</param>
        public static Gost3410ParamSetParameters GetByOid(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(parameters, oid);
        }

        /// <summary>Look up the <see cref="DerObjectIdentifier">OID</see> of the parameter set with the given name.
        /// </summary>
        /// <param name="name">The name of the parameter set.</param>
        public static DerObjectIdentifier GetOid(string name)
        {
            return CollectionUtilities.GetValueOrNull(objIds, name);
        }

        /// <summary>Enumerate the available parameter set names in this registry.</summary>
        public static IEnumerable<string> Names
        {
            get { return CollectionUtilities.Proxy(objIds.Keys); }
        }
    }
}
