using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Pkix
{
	/**
	 * An immutable sequence of certificates (a certification path).<br />
	 * <br />
	 * This is an abstract class that defines the methods common to all CertPaths.
	 * Subclasses can handle different kinds of certificates (X.509, PGP, etc.).<br />
	 * <br />
	 * All CertPath objects have a type, a list of Certificates, and one or more
	 * supported encodings. Because the CertPath class is immutable, a CertPath
	 * cannot change in any externally visible way after being constructed. This
	 * stipulation applies to all public fields and methods of this class and any
	 * added or overridden by subclasses.<br />
	 * <br />
	 * The type is a string that identifies the type of Certificates in the
	 * certification path. For each certificate cert in a certification path
	 * certPath, cert.getType().equals(certPath.getType()) must be true.<br />
	 * <br />
	 * The list of Certificates is an ordered List of zero or more Certificates.
	 * This List and all of the Certificates contained in it must be immutable.<br />
	 * <br />
	 * Each CertPath object must support one or more encodings so that the object
	 * can be translated into a byte array for storage or transmission to other
	 * parties. Preferably, these encodings should be well-documented standards
	 * (such as PKCS#7). One of the encodings supported by a CertPath is considered
	 * the default encoding. This encoding is used if no encoding is explicitly
	 * requested (for the {@link #getEncoded()} method, for instance).<br />
	 * <br />
	 * All CertPath objects are also Serializable. CertPath objects are resolved
	 * into an alternate {@link CertPathRep} object during serialization. This
	 * allows a CertPath object to be serialized into an equivalent representation
	 * regardless of its underlying implementation.<br />
	 * <br />
	 * CertPath objects can be created with a CertificateFactory or they can be
	 * returned by other classes, such as a CertPathBuilder.<br />
	 * <br />
	 * By convention, X.509 CertPaths (consisting of X509Certificates), are ordered
	 * starting with the target certificate and ending with a certificate issued by
	 * the trust anchor. That is, the issuer of one certificate is the subject of
	 * the following one. The certificate representing the
	 * {@link TrustAnchor TrustAnchor} should not be included in the certification
	 * path. Unvalidated X.509 CertPaths may not follow these conventions. PKIX
	 * CertPathValidators will detect any departure from these conventions that
	 * cause the certification path to be invalid and throw a
	 * CertPathValidatorException.<br />
	 * <br />
	 * <strong>Concurrent Access</strong><br />
	 * <br />
	 * All CertPath objects must be thread-safe. That is, multiple threads may
	 * concurrently invoke the methods defined in this class on a single CertPath
	 * object (or more than one) with no ill effects. This is also true for the List
	 * returned by CertPath.getCertificates.<br />
	 * <br />
	 * Requiring CertPath objects to be immutable and thread-safe allows them to be
	 * passed around to various pieces of code without worrying about coordinating
	 * access. Providing this thread-safety is generally not difficult, since the
	 * CertPath and List objects in question are immutable.
	 *
	 * @see CertificateFactory
	 * @see CertPathBuilder
	 */
	/// <summary>
	/// CertPath implementation for X.509 certificates.
	/// </summary>
	public class PkixCertPath
//		: CertPath
	{
		internal static readonly List<string> m_encodings = new List<string>{ "PkiPath", "PEM", "PKCS7" };

        private readonly IList<X509Certificate> m_certificates;

		private static IList<X509Certificate> SortCerts(IList<X509Certificate> certs)
		{
			if (certs.Count < 2)
				return certs;

			X509Name issuer = certs[0].IssuerDN;
			bool okay = true;

			for (int i = 1; i != certs.Count; i++)
			{
				X509Certificate cert = certs[i];

				if (issuer.Equivalent(cert.SubjectDN, true))
				{
					issuer = cert.IssuerDN;
				}
				else
				{
					okay = false;
					break;
				}
			}

			if (okay)
				return certs;

			// find end-entity cert
            var retList = new List<X509Certificate>(certs.Count);
            var orig = new List<X509Certificate>(certs);

			for (int i = 0; i < certs.Count; i++)
			{
				X509Certificate cert = certs[i];
				bool found = false;

				X509Name subject = cert.SubjectDN;
				foreach (X509Certificate c in certs)
				{
					if (c.IssuerDN.Equivalent(subject, true))
					{
						found = true;
						break;
					}
				}

				if (!found)
				{
					retList.Add(cert);
					certs.RemoveAt(i);
				}
			}

			// can only have one end entity cert - something's wrong, give up.
			if (retList.Count > 1)
				return orig;

			for (int i = 0; i != retList.Count; i++)
			{
				issuer = retList[i].IssuerDN;

				for (int j = 0; j < certs.Count; j++)
				{
					X509Certificate c = certs[j];
					if (issuer.Equivalent(c.SubjectDN, true))
					{
						retList.Add(c);
						certs.RemoveAt(j);
						break;
					}
				}
			}

			// make sure all certificates are accounted for.
			if (certs.Count > 0)
				return orig;

			return retList;
		}

		/**
		 * Creates a CertPath of the specified type.
		 * This constructor is protected because most users should use
		 * a CertificateFactory to create CertPaths.
		 * @param type the standard name of the type of Certificatesin this path
		 **/
		public PkixCertPath(IList<X509Certificate> certificates)
		{
			m_certificates = SortCerts(new List<X509Certificate>(certificates));
		}

		public PkixCertPath(Stream inStream)
			: this(inStream, "PkiPath")
		{
		}

		/**
		 * Creates a CertPath of the specified type.
		 * This constructor is protected because most users should use
		 * a CertificateFactory to create CertPaths.
		 *
		 * @param type the standard name of the type of Certificatesin this path
		 **/
		public PkixCertPath(Stream inStream, string encoding)
		{
            //string upper = Platform.ToUpperInvariant(encoding);

            IList<X509Certificate> certs;
			try
			{
				if (Platform.EqualsIgnoreCase("PkiPath", encoding))
				{
					Asn1InputStream derInStream = new Asn1InputStream(inStream);
					Asn1Object derObject = derInStream.ReadObject();
					if (!(derObject is Asn1Sequence))
					{
						throw new CertificateException(
							"input stream does not contain a ASN1 SEQUENCE while reading PkiPath encoded data to load CertPath");
					}

					certs = new List<X509Certificate>();

                    foreach (Asn1Encodable ae in (Asn1Sequence)derObject)
                    {
                        byte[] derBytes = ae.GetEncoded(Asn1Encodable.Der);
                        Stream certInStream = new MemoryStream(derBytes, false);

                        // TODO Is inserting at the front important (list will be sorted later anyway)?
                        certs.Insert(0, new X509CertificateParser().ReadCertificate(certInStream));
					}
				}
				else if (Platform.EqualsIgnoreCase("PEM", encoding) ||
					     Platform.EqualsIgnoreCase("PKCS7", encoding))
				{
                    certs = new X509CertificateParser().ReadCertificates(inStream);
				}
				else
				{
					throw new CertificateException("unsupported encoding: " + encoding);
				}
			}
			catch (IOException ex)
			{
				throw new CertificateException(
					"IOException throw while decoding CertPath:\n"
					+ ex.ToString());
			}

			m_certificates = SortCerts(certs);
		}

		/**
		 * Returns an iteration of the encodings supported by this
		 * certification path, with the default encoding
		 * first. Attempts to modify the returned Iterator via its
		 * remove method result in an UnsupportedOperationException.
		 *
		 * @return an Iterator over the names of the supported encodings (as Strings)
		 **/
		public virtual IEnumerable<string> Encodings
		{
            get { return CollectionUtilities.Proxy(m_encodings); }
		}

		/**
		* Compares this certification path for equality with the specified object.
		* Two CertPaths are equal if and only if their types are equal and their
		* certificate Lists (and by implication the Certificates in those Lists)
		* are equal. A CertPath is never equal to an object that is not a CertPath.<br />
		* <br />
		* This algorithm is implemented by this method. If it is overridden, the
		* behavior specified here must be maintained.
		*
		* @param other
		*            the object to test for equality with this certification path
		*
		* @return true if the specified object is equal to this certification path,
		*         false otherwise
		*
		* @see Object#hashCode() Object.hashCode()
		*/
		public override bool Equals(object obj)
		{
			if (this == obj)
				return true;

			if (!(obj is PkixCertPath that))
				return false;

			var thisCerts = this.Certificates;
			var thatCerts = that.Certificates;

			if (thisCerts.Count != thatCerts.Count)
				return false;

			var e1 = thisCerts.GetEnumerator();
			var e2 = thatCerts.GetEnumerator();

			while (e1.MoveNext())
			{
				e2.MoveNext();

				if (!Equals(e1.Current, e2.Current))
					return false;
			}

			return true;
		}

		public override int GetHashCode()
		{
			return m_certificates.GetHashCode();
		}

		/**
		 * Returns the encoded form of this certification path, using
		 * the default encoding.
		 *
		 * @return the encoded bytes
		 * @exception CertificateEncodingException if an encoding error occurs
		 **/
		public virtual byte[] GetEncoded()
		{
			return GetEncoded(m_encodings[0]);
		}

		/**
		 * Returns the encoded form of this certification path, using
		 * the specified encoding.
		 *
		 * @param encoding the name of the encoding to use
		 * @return the encoded bytes
		 * @exception CertificateEncodingException if an encoding error
		 * occurs or the encoding requested is not supported
		 *
		 */
		public virtual byte[] GetEncoded(string encoding)
		{
			if (Platform.EqualsIgnoreCase(encoding, "PkiPath"))
			{
				Asn1EncodableVector v = new Asn1EncodableVector(m_certificates.Count);
				for (int i = m_certificates.Count - 1; i >= 0; i--)
				{
					v.Add(ToAsn1Object(m_certificates[i]));
				}

				return ToDerEncoded(new DerSequence(v));
			}
            else if (Platform.EqualsIgnoreCase(encoding, "PKCS7"))
			{
				ContentInfo encInfo = new ContentInfo(PkcsObjectIdentifiers.Data, null);

				Asn1EncodableVector v = new Asn1EncodableVector(m_certificates.Count);
				foreach (var cert in m_certificates)
                {
                    v.Add(ToAsn1Object(cert));
                }

                SignedData sd = new SignedData(
					new DerInteger(1),
					new DerSet(),
					encInfo,
					new DerSet(v),
					null,
					new DerSet());

				return ToDerEncoded(new ContentInfo(PkcsObjectIdentifiers.SignedData, sd));
			}
            else if (Platform.EqualsIgnoreCase(encoding, "PEM"))
			{
				MemoryStream bOut = new MemoryStream();
				PemWriter pWrt = new PemWriter(new StreamWriter(bOut));

				try
				{
					foreach (var cert in m_certificates)
					{
						pWrt.WriteObject(cert);
					}

                    Platform.Dispose(pWrt.Writer);
				}
				catch (Exception)
				{
					throw new CertificateEncodingException("can't encode certificate for PEM encoded path");
				}

				return bOut.ToArray();
			}
			else
			{
				throw new CertificateEncodingException("unsupported encoding: " + encoding);
			}
		}

		/// <summary>
		/// Returns the list of certificates in this certification
		/// path.
		/// </summary>
		public virtual IList<X509Certificate> Certificates
		{
            get { return CollectionUtilities.ReadOnly(m_certificates); }
		}

		/**
		 * Return a DERObject containing the encoded certificate.
		 *
		 * @param cert the X509Certificate object to be encoded
		 *
		 * @return the DERObject
		 **/
		private Asn1Object ToAsn1Object(X509Certificate cert)
		{
			try
			{
				return cert.CertificateStructure.ToAsn1Object();
			}
			catch (Exception e)
			{
				throw new CertificateEncodingException("Exception while encoding certificate", e);
			}
		}

		private byte[] ToDerEncoded(Asn1Encodable obj)
		{
			try
			{
				return obj.GetEncoded(Asn1Encodable.Der);
			}
			catch (IOException e)
			{
				throw new CertificateEncodingException("Exception thrown", e);
			}
		}
	}
}
