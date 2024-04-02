using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Date;
using Org.BouncyCastle.X509.Extension;

namespace Org.BouncyCastle.X509.Store
{
	/**
	* This class is an <code>Selector</code> like implementation to select
	* attribute certificates from a given set of criteria.
	*
	* @see org.bouncycastle.x509.X509AttributeCertificate
	* @see org.bouncycastle.x509.X509Store
	*/
	public class X509AttrCertStoreSelector
		: ISelector<X509V2AttributeCertificate>
	{
		// TODO: name constraints???

		private X509V2AttributeCertificate attributeCert;
		private DateTimeObject attributeCertificateValid;
		private AttributeCertificateHolder holder;
		private AttributeCertificateIssuer issuer;
		private BigInteger serialNumber;
		private ISet<GeneralName> targetNames = new HashSet<GeneralName>();
		private ISet<GeneralName> targetGroups = new HashSet<GeneralName>();

		public X509AttrCertStoreSelector()
		{
		}

		private X509AttrCertStoreSelector(
			X509AttrCertStoreSelector o)
		{
			this.attributeCert = o.attributeCert;
			this.attributeCertificateValid = o.attributeCertificateValid;
			this.holder = o.holder;
			this.issuer = o.issuer;
			this.serialNumber = o.serialNumber;
			this.targetGroups = new HashSet<GeneralName>(o.targetGroups);
			this.targetNames = new HashSet<GeneralName>(o.targetNames);
		}

		/// <summary>
		/// Decides if the given attribute certificate should be selected.
		/// </summary>
		/// <param name="attrCert">The attribute certificate to be checked.</param>
		/// <returns><code>true</code> if the object matches this selector.</returns>
		public bool Match(X509V2AttributeCertificate attrCert)
		{
			if (attrCert == null)
				return false;

			if (this.attributeCert != null && !this.attributeCert.Equals(attrCert))
				return false;

			if (serialNumber != null && !attrCert.SerialNumber.Equals(serialNumber))
				return false;

			if (holder != null && !attrCert.Holder.Equals(holder))
				return false;

			if (issuer != null && !attrCert.Issuer.Equals(issuer))
				return false;

			if (attributeCertificateValid != null && !attrCert.IsValid(attributeCertificateValid.Value))
				return false;

			if (targetNames.Count > 0 || targetGroups.Count > 0)
			{
				Asn1OctetString targetInfoExt = attrCert.GetExtensionValue(
					X509Extensions.TargetInformation);

				if (targetInfoExt != null)
				{
					TargetInformation targetinfo;
					try
					{
						targetinfo = TargetInformation.GetInstance(
							X509ExtensionUtilities.FromExtensionValue(targetInfoExt));
					}
					catch (Exception)
					{
						return false;
					}

					Targets[] targetss = targetinfo.GetTargetsObjects();

					if (targetNames.Count > 0)
					{
						bool found = false;

						for (int i = 0; i < targetss.Length && !found; i++)
						{
							Target[] targets = targetss[i].GetTargets();

							for (int j = 0; j < targets.Length; j++)
							{
								GeneralName targetName = targets[j].TargetName;

								if (targetName != null && targetNames.Contains(targetName))
								{
									found = true;
									break;
								}
							}
						}
						if (!found)
						{
							return false;
						}
					}

					if (targetGroups.Count > 0)
					{
						bool found = false;

						for (int i = 0; i < targetss.Length && !found; i++)
						{
							Target[] targets = targetss[i].GetTargets();

							for (int j = 0; j < targets.Length; j++)
							{
								GeneralName targetGroup = targets[j].TargetGroup;

								if (targetGroup != null && targetGroups.Contains(targetGroup))
								{
									found = true;
									break;
								}
							}
						}

						if (!found)
						{
							return false;
						}
					}
				}
			}

			return true;
		}

		public object Clone()
		{
			return new X509AttrCertStoreSelector(this);
		}

		/// <summary>The attribute certificate which must be matched.</summary>
		/// <remarks>If <c>null</c> is given, any will do.</remarks>
		public X509V2AttributeCertificate AttributeCert
		{
			get { return attributeCert; }
			set { this.attributeCert = value; }
		}

		/// <summary>The criteria for validity</summary>
		/// <remarks>If <c>null</c> is given any will do.</remarks>
		public DateTimeObject AttributeCertificateValid
		{
			get { return attributeCertificateValid; }
			set { this.attributeCertificateValid = value; }
		}

		/// <summary>The holder.</summary>
		/// <remarks>If <c>null</c> is given any will do.</remarks>
		public AttributeCertificateHolder Holder
		{
			get { return holder; }
			set { this.holder = value; }
		}

		/// <summary>The issuer.</summary>
		/// <remarks>If <c>null</c> is given any will do.</remarks>
		public AttributeCertificateIssuer Issuer
		{
			get { return issuer; }
			set { this.issuer = value; }
		}

		/// <summary>The serial number.</summary>
		/// <remarks>If <c>null</c> is given any will do.</remarks>
		public BigInteger SerialNumber
		{
			get { return serialNumber; }
			set { this.serialNumber = value; }
		}

		/**
		* Adds a target name criterion for the attribute certificate to the target
		* information extension criteria. The <code>X509AttributeCertificate</code>
		* must contain at least one of the specified target names.
		* <p>
		* Each attribute certificate may contain a target information extension
		* limiting the servers where this attribute certificate can be used. If
		* this extension is not present, the attribute certificate is not targeted
		* and may be accepted by any server.
		* </p>
		*
		* @param name The name as a GeneralName (not <code>null</code>)
		*/
		public void AddTargetName(
			GeneralName name)
		{
			targetNames.Add(name);
		}

		/**
		* Adds a target name criterion for the attribute certificate to the target
		* information extension criteria. The <code>X509AttributeCertificate</code>
		* must contain at least one of the specified target names.
		* <p>
		* Each attribute certificate may contain a target information extension
		* limiting the servers where this attribute certificate can be used. If
		* this extension is not present, the attribute certificate is not targeted
		* and may be accepted by any server.
		* </p>
		*
		* @param name a byte array containing the name in ASN.1 DER encoded form of a GeneralName
		* @throws IOException if a parsing error occurs.
		*/
		public void AddTargetName(byte[] name)
		{
			AddTargetName(GeneralName.GetInstance(Asn1Object.FromByteArray(name)));
		}

		/**
		* Adds a collection with target names criteria. If <code>null</code> is
		* given any will do.
		* <p>
		* The collection consists of either GeneralName objects or byte[] arrays representing
		* DER encoded GeneralName structures.
		* </p>
		* 
		* @param names A collection of target names.
		* @throws IOException if a parsing error occurs.
		* @see #AddTargetName(byte[])
		* @see #AddTargetName(GeneralName)
		*/
		public void SetTargetNames(IEnumerable<object> names)
		{
			targetNames = ExtractGeneralNames(names);
		}

		/**
		* Gets the target names. The collection consists of <code>List</code>s
		* made up of an <code>Integer</code> in the first entry and a DER encoded
		* byte array or a <code>String</code> in the second entry.
		* <p>The returned collection is immutable.</p>
		* 
		* @return The collection of target names
		* @see #setTargetNames(Collection)
		*/
		public IEnumerable<GeneralName> GetTargetNames()
		{
			return CollectionUtilities.Proxy(targetNames);
		}

		/**
		* Adds a target group criterion for the attribute certificate to the target
		* information extension criteria. The <code>X509AttributeCertificate</code>
		* must contain at least one of the specified target groups.
		* <p>
		* Each attribute certificate may contain a target information extension
		* limiting the servers where this attribute certificate can be used. If
		* this extension is not present, the attribute certificate is not targeted
		* and may be accepted by any server.
		* </p>
		*
		* @param group The group as GeneralName form (not <code>null</code>)
		*/
		public void AddTargetGroup(GeneralName group)
		{
			targetGroups.Add(group);
		}

		/**
		* Adds a target group criterion for the attribute certificate to the target
		* information extension criteria. The <code>X509AttributeCertificate</code>
		* must contain at least one of the specified target groups.
		* <p>
		* Each attribute certificate may contain a target information extension
		* limiting the servers where this attribute certificate can be used. If
		* this extension is not present, the attribute certificate is not targeted
		* and may be accepted by any server.
		* </p>
		*
		* @param name a byte array containing the group in ASN.1 DER encoded form of a GeneralName
		* @throws IOException if a parsing error occurs.
		*/
		public void AddTargetGroup(byte[] name)
		{
			AddTargetGroup(GeneralName.GetInstance(Asn1Object.FromByteArray(name)));
		}

		/**
		* Adds a collection with target groups criteria. If <code>null</code> is
		* given any will do.
		* <p>
		* The collection consists of <code>GeneralName</code> objects or <code>byte[]</code>
		* representing DER encoded GeneralNames.
		* </p>
		*
		* @param names A collection of target groups.
		* @throws IOException if a parsing error occurs.
		* @see #AddTargetGroup(byte[])
		* @see #AddTargetGroup(GeneralName)
		*/
		public void SetTargetGroups(IEnumerable<object> names)
		{
			targetGroups = ExtractGeneralNames(names);
		}

		/**
		* Gets the target groups. The collection consists of <code>List</code>s
		* made up of an <code>Integer</code> in the first entry and a DER encoded
		* byte array or a <code>String</code> in the second entry.
		* <p>The returned collection is immutable.</p>
		*
		* @return The collection of target groups.
		* @see #setTargetGroups(Collection)
		*/
		public IEnumerable<GeneralName> GetTargetGroups()
		{
			return CollectionUtilities.Proxy(targetGroups);
		}

		private ISet<GeneralName> ExtractGeneralNames(IEnumerable<object> names)
		{
			var result = new HashSet<GeneralName>();

			if (names != null)
			{
				foreach (object o in names)
				{
					if (o is GeneralName gn)
					{
						result.Add(gn);
					}
					else if (o is byte[] bs)
					{
						result.Add(GeneralName.GetInstance(Asn1Object.FromByteArray(bs)));
					}
					else
                    {
						throw new InvalidOperationException();
                    }
				}
			}

			return result;
		}
	}
}
