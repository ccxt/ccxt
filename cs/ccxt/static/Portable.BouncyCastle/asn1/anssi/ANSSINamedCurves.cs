using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Asn1.Anssi
{
    /// <summary>Elliptic curve registry for ANSSI.</summary>
    public static class AnssiNamedCurves
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

        internal class Frp256v1Holder
            : X9ECParametersHolder
        {
            private Frp256v1Holder() {}

            internal static readonly X9ECParametersHolder Instance = new Frp256v1Holder();

            protected override ECCurve CreateCurve()
            {
                BigInteger p = FromHex("F1FD178C0B3AD58F10126DE8CE42435B3961ADBCABC8CA6DE8FCF353D86E9C03");
                BigInteger a = FromHex("F1FD178C0B3AD58F10126DE8CE42435B3961ADBCABC8CA6DE8FCF353D86E9C00");
                BigInteger b = FromHex("EE353FCA5428A9300D4ABA754A44C00FDFEC0C9AE4B1A1803075ED967B7BB73F");
                BigInteger n = FromHex("F1FD178C0B3AD58F10126DE8CE42435B53DC67E140D2BF941FFDD459C6D655E1");
                BigInteger h = BigInteger.One;

                return ConfigureCurve(new FpCurve(p, a, b, n, h, true));
            }

            protected override X9ECParameters CreateParameters()
            {
                byte[] S = null;
                ECCurve curve = Curve;

                X9ECPoint G = ConfigureBasepoint(curve,
                    "04B6B3D4C356C139EB31183D4749D423958C27D2DCAF98B70164C97A2DD98F5CFF6142E0F7C8B204911F9271F0F3ECEF8C2701C307E8E4C9E183115A1554062CFB");

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

        static AnssiNamedCurves()
        {
            DefineCurve("FRP256v1", AnssiObjectIdentifiers.FRP256v1, Frp256v1Holder.Instance);
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
