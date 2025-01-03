using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Asn1.X509
{
    public class X509Extensions
        : Asn1Encodable
    {
		/**
		 * Subject Directory Attributes
		 */
		public static readonly DerObjectIdentifier SubjectDirectoryAttributes = new DerObjectIdentifier("2.5.29.9");

		/**
         * Subject Key Identifier
         */
        public static readonly DerObjectIdentifier SubjectKeyIdentifier = new DerObjectIdentifier("2.5.29.14");

		/**
         * Key Usage
         */
        public static readonly DerObjectIdentifier KeyUsage = new DerObjectIdentifier("2.5.29.15");

		/**
         * Private Key Usage Period
         */
        public static readonly DerObjectIdentifier PrivateKeyUsagePeriod = new DerObjectIdentifier("2.5.29.16");

		/**
         * Subject Alternative Name
         */
        public static readonly DerObjectIdentifier SubjectAlternativeName = new DerObjectIdentifier("2.5.29.17");

		/**
         * Issuer Alternative Name
         */
        public static readonly DerObjectIdentifier IssuerAlternativeName = new DerObjectIdentifier("2.5.29.18");

		/**
         * Basic Constraints
         */
        public static readonly DerObjectIdentifier BasicConstraints = new DerObjectIdentifier("2.5.29.19");

		/**
         * CRL Number
         */
        public static readonly DerObjectIdentifier CrlNumber = new DerObjectIdentifier("2.5.29.20");

		/**
         * Reason code
         */
        public static readonly DerObjectIdentifier ReasonCode = new DerObjectIdentifier("2.5.29.21");

		/**
         * Hold Instruction Code
         */
        public static readonly DerObjectIdentifier InstructionCode = new DerObjectIdentifier("2.5.29.23");

		/**
         * Invalidity Date
         */
        public static readonly DerObjectIdentifier InvalidityDate = new DerObjectIdentifier("2.5.29.24");

		/**
         * Delta CRL indicator
         */
        public static readonly DerObjectIdentifier DeltaCrlIndicator = new DerObjectIdentifier("2.5.29.27");

		/**
         * Issuing Distribution Point
         */
        public static readonly DerObjectIdentifier IssuingDistributionPoint = new DerObjectIdentifier("2.5.29.28");

		/**
         * Certificate Issuer
         */
        public static readonly DerObjectIdentifier CertificateIssuer = new DerObjectIdentifier("2.5.29.29");

		/**
         * Name Constraints
         */
        public static readonly DerObjectIdentifier NameConstraints = new DerObjectIdentifier("2.5.29.30");

		/**
         * CRL Distribution Points
         */
        public static readonly DerObjectIdentifier CrlDistributionPoints = new DerObjectIdentifier("2.5.29.31");

		/**
         * Certificate Policies
         */
        public static readonly DerObjectIdentifier CertificatePolicies = new DerObjectIdentifier("2.5.29.32");

		/**
         * Policy Mappings
         */
        public static readonly DerObjectIdentifier PolicyMappings = new DerObjectIdentifier("2.5.29.33");

		/**
         * Authority Key Identifier
         */
        public static readonly DerObjectIdentifier AuthorityKeyIdentifier = new DerObjectIdentifier("2.5.29.35");

		/**
         * Policy Constraints
         */
        public static readonly DerObjectIdentifier PolicyConstraints = new DerObjectIdentifier("2.5.29.36");

		/**
         * Extended Key Usage
         */
        public static readonly DerObjectIdentifier ExtendedKeyUsage = new DerObjectIdentifier("2.5.29.37");

		/**
		 * Freshest CRL
		 */
		public static readonly DerObjectIdentifier FreshestCrl = new DerObjectIdentifier("2.5.29.46");

		/**
         * Inhibit Any Policy
         */
        public static readonly DerObjectIdentifier InhibitAnyPolicy = new DerObjectIdentifier("2.5.29.54");

		/**
         * Authority Info Access
         */
		public static readonly DerObjectIdentifier AuthorityInfoAccess = new DerObjectIdentifier("1.3.6.1.5.5.7.1.1");

		/**
		 * Subject Info Access
		 */
		public static readonly DerObjectIdentifier SubjectInfoAccess = new DerObjectIdentifier("1.3.6.1.5.5.7.1.11");

		/**
		 * Logo Type
		 */
		public static readonly DerObjectIdentifier LogoType = new DerObjectIdentifier("1.3.6.1.5.5.7.1.12");

		/**
		 * BiometricInfo
		 */
		public static readonly DerObjectIdentifier BiometricInfo = new DerObjectIdentifier("1.3.6.1.5.5.7.1.2");

		/**
		 * QCStatements
		 */
		public static readonly DerObjectIdentifier QCStatements = new DerObjectIdentifier("1.3.6.1.5.5.7.1.3");

		/**
		 * Audit identity extension in attribute certificates.
		 */
		public static readonly DerObjectIdentifier AuditIdentity = new DerObjectIdentifier("1.3.6.1.5.5.7.1.4");

		/**
		 * NoRevAvail extension in attribute certificates.
		 */
		public static readonly DerObjectIdentifier NoRevAvail = new DerObjectIdentifier("2.5.29.56");

		/**
		 * TargetInformation extension in attribute certificates.
		 */
		public static readonly DerObjectIdentifier TargetInformation = new DerObjectIdentifier("2.5.29.55");

        /**
         * Expired Certificates on CRL extension
         */
        public static readonly DerObjectIdentifier ExpiredCertsOnCrl = new DerObjectIdentifier("2.5.29.60");

        private readonly Dictionary<DerObjectIdentifier, X509Extension> m_extensions =
            new Dictionary<DerObjectIdentifier, X509Extension>();
        private readonly List<DerObjectIdentifier> m_ordering;

        public static X509Extension GetExtension(X509Extensions extensions, DerObjectIdentifier oid)
        {
            return null == extensions ? null : extensions.GetExtension(oid);
        }

        public static Asn1Encodable GetExtensionParsedValue(X509Extensions extensions, DerObjectIdentifier oid)
        {
            return null == extensions ? null : extensions.GetExtensionParsedValue(oid);
        }

		public static X509Extensions GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(taggedObject, declaredExplicit));
        }

		public static X509Extensions GetInstance(
            object obj)
        {
            if (obj == null || obj is X509Extensions)
            {
                return (X509Extensions) obj;
            }

			if (obj is Asn1Sequence)
            {
                return new X509Extensions((Asn1Sequence) obj);
            }

			if (obj is Asn1TaggedObject)
            {
                return GetInstance(((Asn1TaggedObject) obj).GetObject());
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
         * Constructor from Asn1Sequence.
         *
         * the extensions are a list of constructed sequences, either with (Oid, OctetString) or (Oid, Boolean, OctetString)
         */
        private X509Extensions(Asn1Sequence seq)
        {
            m_ordering = new List<DerObjectIdentifier>();

			foreach (Asn1Encodable ae in seq)
			{
				Asn1Sequence s = Asn1Sequence.GetInstance(ae.ToAsn1Object());

				if (s.Count < 2 || s.Count > 3)
					throw new ArgumentException("Bad sequence size: " + s.Count);

				DerObjectIdentifier oid = DerObjectIdentifier.GetInstance(s[0].ToAsn1Object());

				bool isCritical = s.Count == 3
					&& DerBoolean.GetInstance(s[1].ToAsn1Object()).IsTrue;

				Asn1OctetString octets = Asn1OctetString.GetInstance(s[s.Count - 1].ToAsn1Object());

                if (m_extensions.ContainsKey(oid))
                    throw new ArgumentException("repeated extension found: " + oid);

                m_extensions.Add(oid, new X509Extension(isCritical, octets));
				m_ordering.Add(oid);
			}
        }

        /**
         * constructor from a table of extensions.
         * <p>
         * it's is assumed the table contains Oid/string pairs.</p>
         */
        public X509Extensions(IDictionary<DerObjectIdentifier, X509Extension> extensions)
            : this(null, extensions)
        {
        }

        /**
         * Constructor from a table of extensions with ordering.
         * <p>
         * It's is assumed the table contains Oid/string pairs.</p>
         */
        public X509Extensions(IList<DerObjectIdentifier> ordering,
            IDictionary<DerObjectIdentifier, X509Extension> extensions)
        {
            if (ordering == null)
            {
                m_ordering = new List<DerObjectIdentifier>(extensions.Keys);
            }
            else
            {
                m_ordering = new List<DerObjectIdentifier>(ordering);
            }

            foreach (DerObjectIdentifier oid in m_ordering)
            {
                m_extensions.Add(oid, extensions[oid]);
            }
        }

        /**
         * Constructor from two vectors
         *
         * @param objectIDs an ArrayList of the object identifiers.
         * @param values an ArrayList of the extension values.
         */
        public X509Extensions(IList<DerObjectIdentifier> oids, IList<X509Extension> values)
        {
            m_ordering = new List<DerObjectIdentifier>(oids);

            int count = 0;
            foreach (DerObjectIdentifier oid in m_ordering)
            {
                m_extensions.Add(oid, values[count++]);
            }
        }

		/**
		 * return an Enumeration of the extension field's object ids.
		 */
		public IEnumerable<DerObjectIdentifier> ExtensionOids
        {
			get { return CollectionUtilities.Proxy(m_ordering); }
        }

		/**
         * return the extension represented by the object identifier
         * passed in.
         *
         * @return the extension if it's present, null otherwise.
         */
        public X509Extension GetExtension(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(m_extensions, oid);
        }

        /**
         * return the parsed value of the extension represented by the object identifier
         * passed in.
         *
         * @return the parsed value of the extension if it's present, null otherwise.
         */
        public Asn1Encodable GetExtensionParsedValue(DerObjectIdentifier oid)
        {
            return GetExtension(oid)?.GetParsedValue();
        }

		/**
		 * <pre>
		 *     Extensions        ::=   SEQUENCE SIZE (1..MAX) OF Extension
		 *
		 *     Extension         ::=   SEQUENCE {
		 *        extnId            EXTENSION.&amp;id ({ExtensionSet}),
		 *        critical          BOOLEAN DEFAULT FALSE,
		 *        extnValue         OCTET STRING }
		 * </pre>
		 */
		public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector	v = new Asn1EncodableVector(m_ordering.Count);

			foreach (DerObjectIdentifier oid in m_ordering)
			{
                X509Extension ext = m_extensions[oid];
                if (ext.IsCritical)
                {
                    v.Add(new DerSequence(oid, DerBoolean.True, ext.Value));
                }
                else
                {
                    v.Add(new DerSequence(oid, ext.Value));
                }
            }

			return new DerSequence(v);
        }

		public bool Equivalent(X509Extensions other)
		{
			if (m_extensions.Count != other.m_extensions.Count)
				return false;

            foreach (var entry in m_extensions)
            {
                if (!entry.Value.Equals(other.GetExtension(entry.Key)))
                    return false;
            }

			return true;
		}

		public DerObjectIdentifier[] GetExtensionOids()
		{
            return m_ordering.ToArray();
		}

		public DerObjectIdentifier[] GetNonCriticalExtensionOids()
		{
			return GetExtensionOids(false);
		}

		public DerObjectIdentifier[] GetCriticalExtensionOids()
		{
			return GetExtensionOids(true);
		}

		private DerObjectIdentifier[] GetExtensionOids(bool isCritical)
		{
			var oids = new List<DerObjectIdentifier>();

			foreach (DerObjectIdentifier oid in m_ordering)
            {
				if (m_extensions[oid].IsCritical == isCritical)
				{
					oids.Add(oid);
				}
            }

            return oids.ToArray();
		}
	}
}
