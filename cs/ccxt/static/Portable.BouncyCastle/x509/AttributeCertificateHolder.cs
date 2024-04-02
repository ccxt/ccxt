using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.X509
{
	/// <remarks>
	/// The Holder object.
	/// <pre>
 	/// Holder ::= SEQUENCE {
 	///		baseCertificateID   [0] IssuerSerial OPTIONAL,
 	///			-- the issuer and serial number of
 	///			-- the holder's Public Key Certificate
 	///		entityName          [1] GeneralNames OPTIONAL,
 	///			-- the name of the claimant or role
 	///		objectDigestInfo    [2] ObjectDigestInfo OPTIONAL
 	///			-- used to directly authenticate the holder,
 	///			-- for example, an executable
 	/// }
	/// </pre>
	/// </remarks>
	public class AttributeCertificateHolder
		//: CertSelector, Selector
		: ISelector<X509Certificate>
	{
		internal readonly Holder holder;

		internal AttributeCertificateHolder(
			Asn1Sequence seq)
		{
			holder = Holder.GetInstance(seq);
		}

		public AttributeCertificateHolder(
			X509Name	issuerName,
			BigInteger	serialNumber)
		{
			holder = new Holder(
				new IssuerSerial(
					GenerateGeneralNames(issuerName),
					new DerInteger(serialNumber)));
		}

		public AttributeCertificateHolder(
			X509Certificate	cert)
		{
			X509Name name;
			try
			{
				name = PrincipalUtilities.GetIssuerX509Principal(cert);
			}
			catch (Exception e)
			{
				throw new CertificateParsingException(e.Message);
			}

			holder = new Holder(new IssuerSerial(GenerateGeneralNames(name), new DerInteger(cert.SerialNumber)));
		}

		public AttributeCertificateHolder(
			X509Name principal)
		{
			holder = new Holder(GenerateGeneralNames(principal));
		}

		/**
		 * Constructs a holder for v2 attribute certificates with a hash value for
		 * some type of object.
		 * <p>
		 * <code>digestedObjectType</code> can be one of the following:
		 * <ul>
		 * <li>0 - publicKey - A hash of the public key of the holder must be
		 * passed.</li>
		 * <li>1 - publicKeyCert - A hash of the public key certificate of the
		 * holder must be passed.</li>
		 * <li>2 - otherObjectDigest - A hash of some other object type must be
		 * passed. <code>otherObjectTypeID</code> must not be empty.</li>
		 * </ul>
		 * </p>
		 * <p>This cannot be used if a v1 attribute certificate is used.</p>
		 *
		 * @param digestedObjectType The digest object type.
		 * @param digestAlgorithm The algorithm identifier for the hash.
		 * @param otherObjectTypeID The object type ID if
		 *            <code>digestedObjectType</code> is
		 *            <code>otherObjectDigest</code>.
		 * @param objectDigest The hash value.
		 */
		public AttributeCertificateHolder(
			int		digestedObjectType,
			string	digestAlgorithm,
			string	otherObjectTypeID,
			byte[]	objectDigest)
		{
			// TODO Allow 'objectDigest' to be null?

			holder = new Holder(new ObjectDigestInfo(digestedObjectType, otherObjectTypeID,
				new AlgorithmIdentifier(new DerObjectIdentifier(digestAlgorithm)), Arrays.Clone(objectDigest)));
		}

		/**
		 * Returns the digest object type if an object digest info is used.
		 * <p>
		 * <ul>
		 * <li>0 - publicKey - A hash of the public key of the holder must be
		 * passed.</li>
		 * <li>1 - publicKeyCert - A hash of the public key certificate of the
		 * holder must be passed.</li>
		 * <li>2 - otherObjectDigest - A hash of some other object type must be
		 * passed. <code>otherObjectTypeID</code> must not be empty.</li>
		 * </ul>
		 * </p>
		 *
		 * @return The digest object type or -1 if no object digest info is set.
		 */
		public int DigestedObjectType
		{
			get
			{
				ObjectDigestInfo odi = holder.ObjectDigestInfo;

				return odi == null
					?   -1
                    :   odi.DigestedObjectType.IntValueExact;
			}
		}

		/**
		 * Returns the other object type ID if an object digest info is used.
		 *
		 * @return The other object type ID or <code>null</code> if no object
		 *         digest info is set.
		 */
		public string DigestAlgorithm
		{
			get
			{
				ObjectDigestInfo odi = holder.ObjectDigestInfo;

				return odi == null
					?	null
					:	odi.DigestAlgorithm.Algorithm.Id;
			}
		}

		/**
		 * Returns the hash if an object digest info is used.
		 *
		 * @return The hash or <code>null</code> if no object digest info is set.
		 */
		public byte[] GetObjectDigest()
		{
			ObjectDigestInfo odi = holder.ObjectDigestInfo;

			return odi == null
				?	null
				:	odi.ObjectDigest.GetBytes();
		}

		/**
		 * Returns the digest algorithm ID if an object digest info is used.
		 *
		 * @return The digest algorithm ID or <code>null</code> if no object
		 *         digest info is set.
		 */
		public string OtherObjectTypeID
		{
			get
			{
				ObjectDigestInfo odi = holder.ObjectDigestInfo;

				return odi == null
					?	null
					:	odi.OtherObjectTypeID.Id;
			}
		}

		private GeneralNames GenerateGeneralNames(
			X509Name principal)
		{
//			return GeneralNames.GetInstance(new DerSequence(new GeneralName(principal)));
			return new GeneralNames(new GeneralName(principal));
		}

		private bool MatchesDN(
			X509Name		subject,
			GeneralNames	targets)
		{
			GeneralName[] names = targets.GetNames();

			for (int i = 0; i != names.Length; i++)
			{
				GeneralName gn = names[i];

				if (gn.TagNo == GeneralName.DirectoryName)
				{
					try
					{
						if (X509Name.GetInstance(gn.Name).Equivalent(subject))
						{
							return true;
						}
					}
					catch (Exception)
					{
					}
				}
			}

			return false;
		}

		private object[] GetNames(
			GeneralName[] names)
		{
            int count = 0;
            for (int i = 0; i != names.Length; i++)
            {
                if (names[i].TagNo == GeneralName.DirectoryName)
                {
                    ++count;
                }
            }

            object[] result = new object[count];

            int pos = 0;
            for (int i = 0; i != names.Length; i++)
            {
                if (names[i].TagNo == GeneralName.DirectoryName)
                {
                    result[pos++] = X509Name.GetInstance(names[i].Name);
                }
            }

            return result;
        }

		private X509Name[] GetPrincipals(
			GeneralNames names)
		{
			object[] p = this.GetNames(names.GetNames());

            int count = 0;

            for (int i = 0; i != p.Length; i++)
			{
				if (p[i] is X509Name)
				{
                    ++count;
				}
			}

            X509Name[] result = new X509Name[count];

            int pos = 0;
            for (int i = 0; i != p.Length; i++)
            {
                if (p[i] is X509Name)
                {
                    result[pos++] = (X509Name)p[i];
                }
            }

            return result;
        }

		/**
		 * Return any principal objects inside the attribute certificate holder entity names field.
		 *
		 * @return an array of IPrincipal objects (usually X509Name), null if no entity names field is set.
		 */
		public X509Name[] GetEntityNames()
		{
			if (holder.EntityName != null)
			{
				return GetPrincipals(holder.EntityName);
			}

			return null;
		}

		/**
		 * Return the principals associated with the issuer attached to this holder
		 *
		 * @return an array of principals, null if no BaseCertificateID is set.
		 */
		public X509Name[] GetIssuer()
		{
			if (holder.BaseCertificateID != null)
			{
				return GetPrincipals(holder.BaseCertificateID.Issuer);
			}

			return null;
		}

		/**
		 * Return the serial number associated with the issuer attached to this holder.
		 *
		 * @return the certificate serial number, null if no BaseCertificateID is set.
		 */
		public BigInteger SerialNumber
		{
			get
			{
				if (holder.BaseCertificateID != null)
				{
					return holder.BaseCertificateID.Serial.Value;
				}

				return null;
			}
		}

		public object Clone()
		{
			return new AttributeCertificateHolder((Asn1Sequence)holder.ToAsn1Object());
		}

		public bool Match(X509Certificate x509Cert)
		{
			if (x509Cert == null)
				return false;

			try
			{
				if (holder.BaseCertificateID != null)
				{
					return holder.BaseCertificateID.Serial.HasValue(x509Cert.SerialNumber)
						&& MatchesDN(PrincipalUtilities.GetIssuerX509Principal(x509Cert), holder.BaseCertificateID.Issuer);
				}

				if (holder.EntityName != null)
				{
					if (MatchesDN(PrincipalUtilities.GetSubjectX509Principal(x509Cert), holder.EntityName))
					{
						return true;
					}
				}

				if (holder.ObjectDigestInfo != null)
				{
					IDigest md = null;
					try
					{
						md = DigestUtilities.GetDigest(DigestAlgorithm);
					}
					catch (Exception)
					{
						return false;
					}

					switch (DigestedObjectType)
					{
						case ObjectDigestInfo.PublicKey:
						{
							// TODO: DSA Dss-parms

							//byte[] b = x509Cert.GetPublicKey().getEncoded();
							// TODO Is this the right way to encode?
							byte[] b = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(
								x509Cert.GetPublicKey()).GetEncoded();
							md.BlockUpdate(b, 0, b.Length);
							break;
						}

						case ObjectDigestInfo.PublicKeyCert:
						{
							byte[] b = x509Cert.GetEncoded();
							md.BlockUpdate(b, 0, b.Length);
							break;
						}

						// TODO Default handler?
					}

					// TODO Shouldn't this be the other way around?
					if (!Arrays.AreEqual(DigestUtilities.DoFinal(md), GetObjectDigest()))
					{
						return false;
					}
				}
			}
			catch (CertificateEncodingException)
			{
				return false;
			}

			return false;
		}

		public override bool Equals(
			object obj)
		{
			if (obj == this)
			{
				return true;
			}

			if (!(obj is AttributeCertificateHolder))
			{
				return false;
			}

			AttributeCertificateHolder other = (AttributeCertificateHolder)obj;

			return this.holder.Equals(other.holder);
		}

		public override int GetHashCode()
		{
			return this.holder.GetHashCode();
		}
	}
}
