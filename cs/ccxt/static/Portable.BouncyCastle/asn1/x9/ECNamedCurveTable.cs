using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1.Anssi;
// using Org.BouncyCastle.Asn1.CryptoPro;
// using Org.BouncyCastle.Asn1.GM;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Sec;
// using Org.BouncyCastle.Asn1.TeleTrust;

namespace Org.BouncyCastle.Asn1.X9
{
    /// <summary>A unified elliptic curve registry of the various standard-specific registries.</summary>
    public class ECNamedCurveTable
    {
        /// <summary>Look up the <see cref="X9ECParameters"/> for the curve with the given name.</summary>
        /// <param name="name">The name of the curve.</param>
        public static X9ECParameters GetByName(string name)
        {
            X9ECParameters ecP = X962NamedCurves.GetByName(name);
            if (ecP == null)
            {
                ecP = SecNamedCurves.GetByName(name);
            }
            if (ecP == null)
            {
                ecP = NistNamedCurves.GetByName(name);
            }
            if (ecP == null)
            {
                // ecP = TeleTrusTNamedCurves.GetByName(name);
            }
            if (ecP == null)
            {
                ecP = AnssiNamedCurves.GetByName(name);
            }
            // if (ecP == null)
            // {
            //     ecP = ECGost3410NamedCurves.GetByName(name);
            // }
            // if (ecP == null)
            // {
            //     ecP = GMNamedCurves.GetByName(name);
            // }
            return ecP;
        }

        /// <summary>Look up an <see cref="X9ECParametersHolder"/> for the curve with the given name.</summary>
        /// <remarks>
        /// Allows accessing the <see cref="Math.EC.ECCurve">curve</see> without necessarily triggering the creation of
        /// the full <see cref="X9ECParameters"/>.
        /// </remarks>
        /// <param name="name">The name of the curve.</param>
        public static X9ECParametersHolder GetByNameLazy(string name)
        {
            X9ECParametersHolder holder = X962NamedCurves.GetByNameLazy(name);
            if (null == holder)
            {
                holder = SecNamedCurves.GetByNameLazy(name);
            }
            if (null == holder)
            {
                holder = NistNamedCurves.GetByNameLazy(name);
            }
            if (null == holder)
            {
                // holder = TeleTrusTNamedCurves.GetByNameLazy(name);
            }
            if (null == holder)
            {
                holder = AnssiNamedCurves.GetByNameLazy(name);
            }
            // if (null == holder)
            // {
            //     holder = ECGost3410NamedCurves.GetByNameLazy(name);
            // }
            // if (null == holder)
            // {
            //     holder = GMNamedCurves.GetByNameLazy(name);
            // }
            return holder;
        }

        /// <summary>Look up the <see cref="X9ECParameters"/> for the curve with the given
        /// <see cref="DerObjectIdentifier">OID</see>.</summary>
        /// <param name="oid">The <see cref="DerObjectIdentifier">OID</see> for the curve.</param>
        public static X9ECParameters GetByOid(DerObjectIdentifier oid)
        {
            X9ECParameters ecP = X962NamedCurves.GetByOid(oid);
            if (ecP == null)
            {
                ecP = SecNamedCurves.GetByOid(oid);
            }

            // NOTE: All the NIST curves are currently from SEC, so no point in redundant OID lookup

            if (ecP == null)
            {
                // ecP = TeleTrusTNamedCurves.GetByOid(oid);
            }
            if (ecP == null)
            {
                ecP = AnssiNamedCurves.GetByOid(oid);
            }
            // if (ecP == null)
            // {
            //     ecP = ECGost3410NamedCurves.GetByOid(oid);
            // }
            // if (ecP == null)
            // {
            //     ecP = GMNamedCurves.GetByOid(oid);
            // }
            return ecP;
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
            X9ECParametersHolder holder = X962NamedCurves.GetByOidLazy(oid);
            if (null == holder)
            {
                holder = SecNamedCurves.GetByOidLazy(oid);
            }

            // NOTE: All the NIST curves are currently from SEC, so no point in redundant OID lookup

            if (null == holder)
            {
                // holder = TeleTrusTNamedCurves.GetByOidLazy(oid);
            }
            if (null == holder)
            {
                holder = AnssiNamedCurves.GetByOidLazy(oid);
            }
            // if (null == holder)
            // {
            //     holder = ECGost3410NamedCurves.GetByOidLazy(oid);
            // }
            // if (null == holder)
            // {
            //     holder = GMNamedCurves.GetByOidLazy(oid);
            // }
            return holder;
        }

        /// <summary>Look up the name of the curve with the given <see cref="DerObjectIdentifier">OID</see>.</summary>
        /// <param name="oid">The <see cref="DerObjectIdentifier">OID</see> for the curve.</param>
        public static string GetName(DerObjectIdentifier oid)
        {
            string name = X962NamedCurves.GetName(oid);
            if (name == null)
            {
                name = SecNamedCurves.GetName(oid);
            }
            if (name == null)
            {
                name = NistNamedCurves.GetName(oid);
            }
            if (name == null)
            {
                // name = TeleTrusTNamedCurves.GetName(oid);
            }
            if (name == null)
            {
                name = AnssiNamedCurves.GetName(oid);
            }
            // if (name == null)
            // {
            //     name = ECGost3410NamedCurves.GetName(oid);
            // }
            // if (name == null)
            // {
            //     name = GMNamedCurves.GetName(oid);
            // }
            return name;
        }

        /// <summary>Look up the <see cref="DerObjectIdentifier">OID</see> of the curve with the given name.</summary>
        /// <param name="name">The name of the curve.</param>
        public static DerObjectIdentifier GetOid(string name)
        {
            DerObjectIdentifier oid = X962NamedCurves.GetOid(name);
            if (oid == null)
            {
                oid = SecNamedCurves.GetOid(name);
            }
            if (oid == null)
            {
                oid = NistNamedCurves.GetOid(name);
            }
            if (oid == null)
            {
                // oid = TeleTrusTNamedCurves.GetOid(name);
            }
            if (oid == null)
            {
                oid = AnssiNamedCurves.GetOid(name);
            }
            // if (oid == null)
            // {
            //     oid = ECGost3410NamedCurves.GetOid(name);
            // }
            // if (oid == null)
            // {
            //     oid = GMNamedCurves.GetOid(name);
            // }
            return oid;
        }

        /// <summary>Enumerate the available curve names in all the registries.</summary>
        public static IEnumerable<string> Names
        {
            get
            {
                var result = new List<string>();
                result.AddRange(X962NamedCurves.Names);
                result.AddRange(SecNamedCurves.Names);
                result.AddRange(NistNamedCurves.Names);
                // result.AddRange(TeleTrusTNamedCurves.Names);
                result.AddRange(AnssiNamedCurves.Names);
                // result.AddRange(ECGost3410NamedCurves.Names);
                // result.AddRange(GMNamedCurves.Names);
                return result;
            }
        }
    }
}
