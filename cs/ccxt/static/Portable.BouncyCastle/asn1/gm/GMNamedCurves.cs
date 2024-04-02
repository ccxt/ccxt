using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Asn1.GM
{
    /// <summary>Elliptic curve registry for GM.</summary>
    public static class GMNamedCurves
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

        internal class SM2P256V1Holder
            : X9ECParametersHolder
        {
            private SM2P256V1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new SM2P256V1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger p = FromHex("FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF");
                BigInteger a = FromHex("FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC");
                BigInteger b = FromHex("28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93");
                BigInteger n = FromHex("FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(p, a, b, n, h, true));
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

        internal class WapiP192V1Holder
            : X9ECParametersHolder
        {
            private WapiP192V1Holder() { }

            internal static readonly X9ECParametersHolder Instance = new WapiP192V1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger p = FromHex("BDB6F4FE3E8B1D9E0DA8C0D46F4C318CEFE4AFE3B6B8551F");
                BigInteger a = FromHex("BB8E5E8FBC115E139FE6A814FE48AAA6F0ADA1AA5DF91985");
                BigInteger b = FromHex("1854BEBDC31B21B7AEFC80AB0ECD10D5B1B3308E6DBF11C1");
                BigInteger n = FromHex("BDB6F4FE3E8B1D9E0DA8C0D40FC962195DFAE76F56564677");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(p, a, b, n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "044AD5F7048DE709AD51236DE65E4D4B482C836DC6E410664002BB3A02D4AAADACAE24817A4CA3A1B014B5270432DB27D2");

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

        static GMNamedCurves()
        {
            DefineCurve("wapip192v1", GMObjectIdentifiers.wapip192v1, WapiP192V1Holder.Instance);
            DefineCurve("sm2p256v1", GMObjectIdentifiers.sm2p256v1, SM2P256V1Holder.Instance);
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
