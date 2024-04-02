using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1.Sec;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Asn1.Nist
{
    /// <summary>Elliptic curve registry for NIST curves.</summary>
    public static class NistNamedCurves
    {
        private static readonly Dictionary<string, DerObjectIdentifier> objIds =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<DerObjectIdentifier, string> names =
            new Dictionary<DerObjectIdentifier, string>();

        private static void DefineCurveAlias(string name, DerObjectIdentifier oid)
        {
            if (SecNamedCurves.GetByOidLazy(oid) == null)
                throw new InvalidOperationException();

            objIds.Add(name, oid);
            names.Add(oid, name);
        }

        static NistNamedCurves()
        {
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
        /// Allows accessing the <see cref="Math.EC.ECCurve">curve</see> without necessarily triggering the creation of
        /// the full <see cref="X9ECParameters"/>.
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
        /// Allows accessing the <see cref="Math.EC.ECCurve">curve</see> without necessarily triggering the creation of
        /// the full <see cref="X9ECParameters"/>.
        /// </remarks>
        /// <param name="oid">The <see cref="DerObjectIdentifier">OID</see> for the curve.</param>
        public static X9ECParametersHolder GetByOidLazy(DerObjectIdentifier oid)
        {
            return names.ContainsKey(oid) ? SecNamedCurves.GetByOidLazy(oid) : null;
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
