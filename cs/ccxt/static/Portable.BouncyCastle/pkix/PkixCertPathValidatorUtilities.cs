using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.IsisMtt;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Date;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.X509.Extension;
using Org.BouncyCastle.X509.Store;

namespace Org.BouncyCastle.Pkix
{
	/// <summary>
	/// Summary description for PkixCertPathValidatorUtilities.
	/// </summary>
	internal static class PkixCertPathValidatorUtilities
	{
		private static readonly PkixCrlUtilities CrlUtilities = new PkixCrlUtilities();

		internal static readonly string ANY_POLICY = "2.5.29.32.0";

		internal static readonly string CRL_NUMBER = X509Extensions.CrlNumber.Id;

		/// <summary>
		/// key usage bits
		/// </summary>
		internal static readonly int KEY_CERT_SIGN = 5;
		internal static readonly int CRL_SIGN = 6;

		//internal static readonly string[] crlReasons = new string[]
		//{
		//	"unspecified",
		//	"keyCompromise",
		//	"cACompromise",
		//	"affiliationChanged",
		//	"superseded",
		//	"cessationOfOperation",
		//	"certificateHold",
		//	"unknown",
		//	"removeFromCRL",
		//	"privilegeWithdrawn",
		//	"aACompromise"
		//};

		/// <summary>
		/// Search the given Set of TrustAnchor's for one that is the
		/// issuer of the given X509 certificate.
		/// </summary>
		/// <param name="cert">the X509 certificate</param>
		/// <param name="trustAnchors">a Set of TrustAnchor's</param>
		/// <returns>the <code>TrustAnchor</code> object if found or
		/// <code>null</code> if not.
		/// </returns>
		/// @exception
		internal static TrustAnchor FindTrustAnchor(X509Certificate	cert, ISet<TrustAnchor> trustAnchors)
		{
			var iter = trustAnchors.GetEnumerator();
			TrustAnchor trust = null;
			AsymmetricKeyParameter trustPublicKey = null;
			Exception invalidKeyEx = null;

			X509CertStoreSelector certSelectX509 = new X509CertStoreSelector();

			try
			{
				certSelectX509.Subject = GetIssuerPrincipal(cert);
			}
			catch (IOException ex)
			{
				throw new Exception("Cannot set subject search criteria for trust anchor.", ex);
			}

			while (iter.MoveNext() && trust == null)
			{
				trust = iter.Current;
				if (trust.TrustedCert != null)
				{
					if (certSelectX509.Match(trust.TrustedCert))
					{
						trustPublicKey = trust.TrustedCert.GetPublicKey();
					}
					else
					{
						trust = null;
					}
				}
				else if (trust.CAName != null && trust.CAPublicKey != null)
				{
					try
					{
						X509Name certIssuer = GetIssuerPrincipal(cert);
						X509Name caName = new X509Name(trust.CAName);

						if (certIssuer.Equivalent(caName, true))
						{
							trustPublicKey = trust.CAPublicKey;
						}
						else
						{
							trust = null;
						}
					}
					catch (InvalidParameterException)
					{
						trust = null;
					}
				}
				else
				{
					trust = null;
				}

				if (trustPublicKey != null)
				{
					try
					{
						cert.Verify(trustPublicKey);
					}
					catch (Exception ex)
					{
						invalidKeyEx = ex;
						trust = null;
					}
				}
			}

			if (trust == null && invalidKeyEx != null)
			{
				throw new Exception("TrustAnchor found but certificate validation failed.", invalidKeyEx);
			}

			return trust;
		}

        internal static bool IsIssuerTrustAnchor(X509Certificate cert, ISet<TrustAnchor> trustAnchors)
        {
            try
            {
                return FindTrustAnchor(cert, trustAnchors) != null;
            }
            catch (Exception)
            {
                return false;
            }
        }

		internal static void AddAdditionalStoresFromAltNames(X509Certificate cert, PkixParameters pkixParams)
		{
			// if in the IssuerAltName extension an URI
			// is given, add an additinal X.509 store
			var issuerAltNames = cert.GetIssuerAlternativeNames();
			if (issuerAltNames != null)
			{
				foreach (var list in issuerAltNames)
				{
					// look for URI
					if (list.Count >= 2 && list[0].Equals(GeneralName.UniformResourceIdentifier))
					{
						string location = (string)list[1];
						AddAdditionalStoreFromLocation(location, pkixParams);
					}
				}
			}
		}

		internal static DateTime GetValidDate(PkixParameters paramsPKIX)
		{
			DateTimeObject validDate = paramsPKIX.Date;

			if (validDate == null)
				return DateTime.UtcNow;

			return validDate.Value;
		}

		/// <summary>
		/// Returns the issuer of an attribute certificate or certificate.
		/// </summary>
		/// <param name="obj">The attribute certificate or certificate.</param>
		/// <returns>The issuer as <code>X500Principal</code>.</returns>
		internal static X509Name GetIssuerPrincipal(object obj)
		{
			if (obj is X509Certificate cert)
				return cert.IssuerDN;
			if (obj is X509V2AttributeCertificate attrCert)
				return attrCert.Issuer.GetPrincipals()[0];
			throw new InvalidOperationException();
		}

		internal static X509Name GetIssuerPrincipal(X509V2AttributeCertificate attrCert)
		{
			return attrCert.Issuer.GetPrincipals()[0];
		}

		internal static X509Name GetIssuerPrincipal(X509Certificate cert)
		{
			return cert.IssuerDN;
		}

		internal static bool IsSelfIssued(
			X509Certificate cert)
		{
			return cert.SubjectDN.Equivalent(cert.IssuerDN, true);
		}

		internal static AlgorithmIdentifier GetAlgorithmIdentifier(
			AsymmetricKeyParameter key)
		{
			try
			{
				SubjectPublicKeyInfo info = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(key);

				return info.AlgorithmID;
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Subject public key cannot be decoded.", e);
			}
		}

		internal static bool IsAnyPolicy(ISet<string> policySet)
		{
			return policySet == null || policySet.Count < 1 || policySet.Contains(ANY_POLICY);
		}

		internal static void AddAdditionalStoreFromLocation(
			string			location,
			PkixParameters	pkixParams)
		{
			if (pkixParams.IsAdditionalLocationsEnabled)
			{
				try
				{
					if (Platform.StartsWith(location, "ldap://"))
					{
						// ldap://directory.d-trust.net/CN=D-TRUST
						// Qualified CA 2003 1:PN,O=D-Trust GmbH,C=DE
						// skip "ldap://"
						location = location.Substring(7);
						// after first / baseDN starts
						string url;//, baseDN;
						int slashPos = location.IndexOf('/');
						if (slashPos != -1)
						{
							url = "ldap://" + location.Substring(0, slashPos);
//							baseDN = location.Substring(slashPos);
						}
						else
						{
							url = "ldap://" + location;
//							baseDN = nsull;
						}

						throw new NotImplementedException("LDAP cert/CRL stores");

						// use all purpose parameters
						//X509LDAPCertStoreParameters ldapParams = new X509LDAPCertStoreParameters.Builder(
						//                                url, baseDN).build();
						//pkixParams.AddAdditionalStore(X509Store.getInstance(
						//    "CERTIFICATE/LDAP", ldapParams));
						//pkixParams.AddAdditionalStore(X509Store.getInstance(
						//    "CRL/LDAP", ldapParams));
						//pkixParams.AddAdditionalStore(X509Store.getInstance(
						//    "ATTRIBUTECERTIFICATE/LDAP", ldapParams));
						//pkixParams.AddAdditionalStore(X509Store.getInstance(
						//    "CERTIFICATEPAIR/LDAP", ldapParams));
					}
				}
				catch (Exception)
				{
					// cannot happen
					throw new Exception("Exception adding X.509 stores.");
				}
			}
		}

		private static BigInteger GetSerialNumber(
			object cert)
		{
			if (cert is X509Certificate)
			{
				return ((X509Certificate)cert).SerialNumber;
			}
			else
			{
				return ((X509V2AttributeCertificate)cert).SerialNumber;
			}
		}

		//
		// policy checking
		//

		internal static ISet<PolicyQualifierInfo> GetQualifierSet(Asn1Sequence qualifiers)
		{
			var pq = new HashSet<PolicyQualifierInfo>();

			if (qualifiers != null)
            {
				foreach (Asn1Encodable ae in qualifiers)
				{
					try
					{
                        pq.Add(PolicyQualifierInfo.GetInstance(ae.ToAsn1Object()));
                    }
					catch (IOException ex)
					{
						throw new PkixCertPathValidatorException("Policy qualifier info cannot be decoded.", ex);
					}
				}
			}

			return pq;
		}

		internal static PkixPolicyNode RemovePolicyNode(PkixPolicyNode validPolicyTree,
			IList<PkixPolicyNode>[] policyNodes, PkixPolicyNode _node)
		{
			PkixPolicyNode _parent = _node.Parent;

			if (validPolicyTree == null)
			{
				return null;
			}

			if (_parent == null)
			{
				for (int j = 0; j < policyNodes.Length; j++)
				{
					policyNodes[j] = new List<PkixPolicyNode>();
				}

				return null;
			}
			else
			{
				_parent.RemoveChild(_node);
				RemovePolicyNodeRecurse(policyNodes, _node);

				return validPolicyTree;
			}
		}

		private static void RemovePolicyNodeRecurse(IList<PkixPolicyNode>[] policyNodes, PkixPolicyNode _node)
		{
			policyNodes[_node.Depth].Remove(_node);

			if (_node.HasChildren)
			{
				foreach (PkixPolicyNode _child in _node.Children)
				{
					RemovePolicyNodeRecurse(policyNodes, _child);
				}
			}
		}

		internal static void PrepareNextCertB1(int i, IList<PkixPolicyNode>[] policyNodes, string id_p,
			IDictionary<string, ISet<string>> m_idp, X509Certificate cert)
		{
			foreach (var node in policyNodes[i])
			{
				if (node.ValidPolicy.Equals(id_p))
				{
					node.ExpectedPolicies = CollectionUtilities.GetValueOrNull(m_idp, id_p);
					return;
				}
			}

			foreach (var node in policyNodes[i])
			{
				if (ANY_POLICY.Equals(node.ValidPolicy))
				{
					Asn1Sequence policies;
					try
					{
						policies = Asn1Sequence.GetInstance(
							GetExtensionValue(cert, X509Extensions.CertificatePolicies));
					}
					catch (Exception e)
					{
						throw new Exception("Certificate policies cannot be decoded.", e);
					}

					ISet<PolicyQualifierInfo> pq = null;

					foreach (var policy in policies)
					{
						PolicyInformation pinfo;
						try
						{
							pinfo = PolicyInformation.GetInstance(policy);
						}
						catch (Exception ex)
						{
							throw new Exception("Policy information cannot be decoded.", ex);
						}

						if (ANY_POLICY.Equals(pinfo.PolicyIdentifier.Id))
						{
							try
							{
								pq = GetQualifierSet(pinfo.PolicyQualifiers);
							}
							catch (PkixCertPathValidatorException ex)
							{
								throw new PkixCertPathValidatorException(
									"Policy qualifier info set could not be built.", ex);
							}
							break;
						}
					}

					bool ci = false;
					var critExtOids = cert.GetCriticalExtensionOids();
					if (critExtOids != null)
					{
						ci = critExtOids.Contains(X509Extensions.CertificatePolicies.Id);
					}

					PkixPolicyNode p_node = node.Parent;
					if (ANY_POLICY.Equals(p_node.ValidPolicy))
					{
						PkixPolicyNode c_node = new PkixPolicyNode(new List<PkixPolicyNode>(), i,
							CollectionUtilities.GetValueOrNull(m_idp, id_p), p_node, pq, id_p, ci);
						p_node.AddChild(c_node);
						policyNodes[i].Add(c_node);
					}
					break;
				}
			}
		}

		internal static PkixPolicyNode PrepareNextCertB2(int i, IList<PkixPolicyNode>[] policyNodes, string id_p,
			PkixPolicyNode validPolicyTree)
		{
			int pos = 0;

			// Copy to avoid RemoveAt calls interfering with enumeration
            foreach (var node in new List<PkixPolicyNode>(policyNodes[i]))
			{
				if (!node.ValidPolicy.Equals(id_p))
                {
					++pos;
					continue;
                }

				node.Parent.RemoveChild(node);

				policyNodes[i].RemoveAt(pos);

				for (int k = i - 1; k >= 0; k--)
				{
					var nodes = policyNodes[k];

					for (int l = 0; l < nodes.Count; l++)
					{
						var node2 = nodes[l];
						if (!node2.HasChildren)
						{
							validPolicyTree = RemovePolicyNode(validPolicyTree, policyNodes, node2);
							if (validPolicyTree == null)
								break;
						}
					}
				}
			}
			return validPolicyTree;
		}

		internal static void GetCertStatus(
			DateTime validDate,
			X509Crl crl,
			object cert,
			CertStatus certStatus)
		{
			X509Crl bcCRL;

			try
			{
				bcCRL = new X509Crl(CertificateList.GetInstance((Asn1Sequence)Asn1Sequence.FromByteArray(crl.GetEncoded())));
			}
			catch (Exception exception)
			{
				throw new Exception("X509Crl could not be created.", exception);
			}

			X509CrlEntry crl_entry = (X509CrlEntry)bcCRL.GetRevokedCertificate(GetSerialNumber(cert));

			if (crl_entry == null)
				return;

			X509Name issuer = GetIssuerPrincipal(cert);

			if (!issuer.Equivalent(crl_entry.GetCertificateIssuer(), true)
				&& !issuer.Equivalent(crl.IssuerDN, true))
            {
                return;
            }

            int reasonCodeValue = CrlReason.Unspecified;

            if (crl_entry.HasExtensions)
            {
                try
                {
                    Asn1Object extValue = GetExtensionValue(crl_entry, X509Extensions.ReasonCode);
                    DerEnumerated reasonCode = DerEnumerated.GetInstance(extValue);
                    if (null != reasonCode)
                    {
                        reasonCodeValue = reasonCode.IntValueExact;
                    }
                }
                catch (Exception e)
                {
                    throw new Exception("Reason code CRL entry extension could not be decoded.", e);
                }
            }

            DateTime revocationDate = crl_entry.RevocationDate;
            if (validDate.Ticks < revocationDate.Ticks)
            {
                switch (reasonCodeValue)
                {
                case CrlReason.Unspecified:
                case CrlReason.KeyCompromise:
                case CrlReason.CACompromise:
                case CrlReason.AACompromise:
                    break;
                default:
                    return;
                }
            }

            // (i) or (j)
            certStatus.Status = reasonCodeValue;
            certStatus.RevocationDate = new DateTimeObject(revocationDate);
        }

		/**
		* Return the next working key inheriting DSA parameters if necessary.
		* <p>
		* This methods inherits DSA parameters from the indexed certificate or
		* previous certificates in the certificate chain to the returned
		* <code>PublicKey</code>. The list is searched upwards, meaning the end
		* certificate is at position 0 and previous certificates are following.
		* </p>
		* <p>
		* If the indexed certificate does not contain a DSA key this method simply
		* returns the public key. If the DSA key already contains DSA parameters
		* the key is also only returned.
		* </p>
		*
		* @param certs The certification path.
		* @param index The index of the certificate which contains the public key
		*            which should be extended with DSA parameters.
		* @return The public key of the certificate in list position
		*         <code>index</code> extended with DSA parameters if applicable.
		* @throws Exception if DSA parameters cannot be inherited.
		*/
		internal static AsymmetricKeyParameter GetNextWorkingKey(IList<X509Certificate> certs, int index)
		{
			X509Certificate cert = certs[index];

			AsymmetricKeyParameter pubKey = cert.GetPublicKey();

			if (!(pubKey is DsaPublicKeyParameters))
				return pubKey;

			DsaPublicKeyParameters dsaPubKey = (DsaPublicKeyParameters)pubKey;

			if (dsaPubKey.Parameters != null)
				return dsaPubKey;

			for (int i = index + 1; i < certs.Count; i++)
			{
				X509Certificate parentCert = certs[i];
				pubKey = parentCert.GetPublicKey();

				if (!(pubKey is DsaPublicKeyParameters))
				{
					throw new PkixCertPathValidatorException(
						"DSA parameters cannot be inherited from previous certificate.");
				}

				DsaPublicKeyParameters prevDSAPubKey = (DsaPublicKeyParameters)pubKey;

				if (prevDSAPubKey.Parameters == null)
					continue;

				DsaParameters dsaParams = prevDSAPubKey.Parameters;

				try
				{
					return new DsaPublicKeyParameters(dsaPubKey.Y, dsaParams);
				}
				catch (Exception exception)
				{
					throw new Exception(exception.Message);
				}
			}

			throw new PkixCertPathValidatorException("DSA parameters cannot be inherited from previous certificate.");
		}

		internal static DateTime GetValidCertDateFromValidityModel(
			PkixParameters	paramsPkix,
			PkixCertPath	certPath,
			int				index)
		{
			if (paramsPkix.ValidityModel != PkixParameters.ChainValidityModel)
			{
				return GetValidDate(paramsPkix);
			}

			// if end cert use given signing/encryption/... time
			if (index <= 0)
			{
				return GetValidDate(paramsPkix);
				// else use time when previous cert was created
			}

			var cert = certPath.Certificates[index - 1];

			if (index - 1 == 0)
			{
				DerGeneralizedTime dateOfCertgen;
				try
				{
					Asn1OctetString extVal = cert.GetExtensionValue(IsisMttObjectIdentifiers.IdIsisMttATDateOfCertGen);
					dateOfCertgen = DerGeneralizedTime.GetInstance(extVal);
				}
				catch (ArgumentException)
				{
					throw new Exception(
						"Date of cert gen extension could not be read.");
				}
				if (dateOfCertgen != null)
				{
					try
					{
						return dateOfCertgen.ToDateTime();
					}
					catch (ArgumentException e)
					{
						throw new Exception(
							"Date from date of cert gen extension could not be parsed.",
							e);
					}
				}
			}

			return cert.NotBefore;
		}

		/**
		* Add the CRL issuers from the cRLIssuer field of the distribution point or
		* from the certificate if not given to the issuer criterion of the
		* <code>selector</code>.
		* <p>
		* The <code>issuerPrincipals</code> are a collection with a single
		* <code>X500Principal</code> for <code>X509Certificate</code>s. For
		* {@link X509AttributeCertificate}s the issuer may contain more than one
		* <code>X500Principal</code>.
		* </p>
		*
		* @param dp The distribution point.
		* @param issuerPrincipals The issuers of the certificate or attribute
		*            certificate which contains the distribution point.
		* @param selector The CRL selector.
		* @param pkixParams The PKIX parameters containing the cert stores.
		* @throws Exception if an exception occurs while processing.
		* @throws ClassCastException if <code>issuerPrincipals</code> does not
		* contain only <code>X500Principal</code>s.
		*/
		internal static void GetCrlIssuersFromDistributionPoint(
			DistributionPoint		dp,
			ICollection<X509Name>	issuerPrincipals,
			X509CrlStoreSelector	selector,
			PkixParameters			pkixParams)
		{
            var issuers = new List<X509Name>();
			// indirect CRL
			if (dp.CrlIssuer != null)
			{
				GeneralName[] genNames = dp.CrlIssuer.GetNames();
				// look for a DN
				for (int j = 0; j < genNames.Length; j++)
				{
					if (genNames[j].TagNo == GeneralName.DirectoryName)
					{
						try
						{
							issuers.Add(X509Name.GetInstance(genNames[j].Name.ToAsn1Object()));
						}
						catch (IOException e)
						{
							throw new Exception("CRL issuer information from distribution point cannot be decoded.", e);
						}
					}
				}
			}
			else
			{
				/*
				 * certificate issuer is CRL issuer, distributionPoint field MUST be
				 * present.
				 */
				if (dp.DistributionPointName == null)
				{
					throw new Exception(
						"CRL issuer is omitted from distribution point but no distributionPoint field present.");
				}

				// add and check issuer principals
				issuers.AddRange(issuerPrincipals);
			}
			// TODO: is not found although this should correctly add the rel name. selector of Sun is buggy here or PKI test case is invalid
			// distributionPoint
			//        if (dp.getDistributionPoint() != null)
			//        {
			//            // look for nameRelativeToCRLIssuer
			//            if (dp.getDistributionPoint().getType() == DistributionPointName.NAME_RELATIVE_TO_CRL_ISSUER)
			//            {
			//                // append fragment to issuer, only one
			//                // issuer can be there, if this is given
			//                if (issuers.size() != 1)
			//                {
			//                    throw new AnnotatedException(
			//                        "nameRelativeToCRLIssuer field is given but more than one CRL issuer is given.");
			//                }
			//                DEREncodable relName = dp.getDistributionPoint().getName();
			//                Iterator it = issuers.iterator();
			//                List issuersTemp = new ArrayList(issuers.size());
			//                while (it.hasNext())
			//                {
			//                    Enumeration e = null;
			//                    try
			//                    {
			//                        e = ASN1Sequence.getInstance(
			//                            new ASN1InputStream(((X500Principal) it.next())
			//                                .getEncoded()).readObject()).getObjects();
			//                    }
			//                    catch (IOException ex)
			//                    {
			//                        throw new AnnotatedException(
			//                            "Cannot decode CRL issuer information.", ex);
			//                    }
			//                    ASN1EncodableVector v = new ASN1EncodableVector();
			//                    while (e.hasMoreElements())
			//                    {
			//                        v.add((DEREncodable) e.nextElement());
			//                    }
			//                    v.add(relName);
			//                    issuersTemp.add(new X500Principal(new DERSequence(v)
			//                        .getDEREncoded()));
			//                }
			//                issuers.clear();
			//                issuers.addAll(issuersTemp);
			//            }
			//        }

			selector.Issuers = issuers;
		}

		/**
		 * Fetches complete CRLs according to RFC 3280.
		 *
		 * @param dp The distribution point for which the complete CRL
		 * @param cert The <code>X509Certificate</code> or
		 *            {@link org.bouncycastle.x509.X509AttributeCertificate} for
		 *            which the CRL should be searched.
		 * @param currentDate The date for which the delta CRLs must be valid.
		 * @param paramsPKIX The extended PKIX parameters.
		 * @return A <code>Set</code> of <code>X509CRL</code>s with complete
		 *         CRLs.
		 * @throws Exception if an exception occurs while picking the CRLs
		 *             or no CRLs are found.
		 */
		internal static ISet<X509Crl> GetCompleteCrls(DistributionPoint dp, object certObj, DateTime currentDate,
			PkixParameters paramsPKIX)
		{
			var certObjIssuer = GetIssuerPrincipal(certObj);

			X509CrlStoreSelector crlselect = new X509CrlStoreSelector();
			try
			{
				var issuers = new HashSet<X509Name>();
				issuers.Add(certObjIssuer);

				GetCrlIssuersFromDistributionPoint(dp, issuers, crlselect, paramsPKIX);
			}
			catch (Exception e)
			{
				throw new Exception("Could not get issuer information from distribution point.", e);
			}

            {
				if (certObj is X509Certificate cert)
				{
					crlselect.CertificateChecking = cert;
				}
				else if (certObj is X509V2AttributeCertificate attrCert)
				{
					crlselect.AttrCertChecking = attrCert;
				}
			}

			crlselect.CompleteCrlEnabled = true;

			ISet<X509Crl> crls = CrlUtilities.FindCrls(crlselect, paramsPKIX, currentDate);
			if (crls.Count < 1)
				throw new Exception("No CRLs found for issuer \"" + certObjIssuer + "\"");

			return crls;
		}

		/**
		 * Fetches delta CRLs according to RFC 3280 section 5.2.4.
		 *
		 * @param currentDate The date for which the delta CRLs must be valid.
		 * @param paramsPKIX The extended PKIX parameters.
		 * @param completeCRL The complete CRL the delta CRL is for.
		 * @return A <code>Set</code> of <code>X509CRL</code>s with delta CRLs.
		 * @throws Exception if an exception occurs while picking the delta
		 *             CRLs.
		 */
		internal static ISet<X509Crl> GetDeltaCrls(
			DateTime		currentDate,
			PkixParameters	paramsPKIX,
			X509Crl			completeCRL)
		{
			X509CrlStoreSelector deltaSelect = new X509CrlStoreSelector();

			// 5.2.4 (a)
			try
			{
				var deltaSelectIssuer = new List<X509Name>();
				deltaSelectIssuer.Add(completeCRL.IssuerDN);
				deltaSelect.Issuers = deltaSelectIssuer;
			}
			catch (IOException e)
			{
				throw new Exception("Cannot extract issuer from CRL.", e);
			}

			BigInteger completeCRLNumber = null;
			try
			{
				Asn1Object asn1Object = GetExtensionValue(completeCRL, X509Extensions.CrlNumber);
				if (asn1Object != null)
				{
					completeCRLNumber = CrlNumber.GetInstance(asn1Object).PositiveValue;
				}
			}
			catch (Exception e)
			{
				throw new Exception(
					"CRL number extension could not be extracted from CRL.", e);
			}

			// 5.2.4 (b)
			byte[] idp = null;

			try
			{
				Asn1Object obj = GetExtensionValue(completeCRL, X509Extensions.IssuingDistributionPoint);
				if (obj != null)
				{
					idp = obj.GetDerEncoded();
				}
			}
			catch (Exception e)
			{
				throw new Exception(
					"Issuing distribution point extension value could not be read.",
					e);
			}

			// 5.2.4 (d)

			deltaSelect.MinCrlNumber = (completeCRLNumber == null)
				?	null
				:	completeCRLNumber.Add(BigInteger.One);

			deltaSelect.IssuingDistributionPoint = idp;
			deltaSelect.IssuingDistributionPointEnabled = true;

			// 5.2.4 (c)
			deltaSelect.MaxBaseCrlNumber = completeCRLNumber;

			// find delta CRLs
			ISet<X509Crl> temp = CrlUtilities.FindCrls(deltaSelect, paramsPKIX, currentDate);

			var result = new HashSet<X509Crl>();

			foreach (X509Crl crl in temp)
			{
				if (IsDeltaCrl(crl))
				{
					result.Add(crl);
				}
			}

			return result;
		}

		private static bool IsDeltaCrl(X509Crl crl)
		{
			var critical = crl.GetCriticalExtensionOids();

			return critical.Contains(X509Extensions.DeltaCrlIndicator.Id);
		}

		internal static void AddAdditionalStoresFromCrlDistributionPoint(
			CrlDistPoint	crldp,
			PkixParameters	pkixParams)
		{
			if (crldp != null)
			{
				DistributionPoint[] dps = null;
				try
				{
					dps = crldp.GetDistributionPoints();
				}
				catch (Exception e)
				{
					throw new Exception(
						"Distribution points could not be read.", e);
				}
				for (int i = 0; i < dps.Length; i++)
				{
					DistributionPointName dpn = dps[i].DistributionPointName;
					// look for URIs in fullName
					if (dpn != null)
					{
						if (dpn.PointType == DistributionPointName.FullName)
						{
							GeneralName[] genNames = GeneralNames.GetInstance(
								dpn.Name).GetNames();
							// look for an URI
							for (int j = 0; j < genNames.Length; j++)
							{
								if (genNames[j].TagNo == GeneralName.UniformResourceIdentifier)
								{
									string location = DerIA5String.GetInstance(genNames[j].Name).GetString();
									AddAdditionalStoreFromLocation(location, pkixParams);
								}
							}
						}
					}
				}
			}
		}

		internal static bool ProcessCertD1i(int index, IList<PkixPolicyNode>[] policyNodes, DerObjectIdentifier	pOid,
			ISet<PolicyQualifierInfo> pq)
		{
			foreach (var node in policyNodes[index - 1])
			{
				if (node.ExpectedPolicies.Contains(pOid.Id))
				{
					var childExpectedPolicies = new HashSet<string>();
					childExpectedPolicies.Add(pOid.Id);

                    var child = new PkixPolicyNode(new List<PkixPolicyNode>(), index, childExpectedPolicies, node, pq,
						pOid.Id, false);
					node.AddChild(child);
					policyNodes[index].Add(child);

					return true;
				}
			}

			return false;
		}

		internal static void ProcessCertD1ii(int index, IList<PkixPolicyNode>[] policyNodes,
			DerObjectIdentifier _poid, ISet<PolicyQualifierInfo> _pq)
		{
			foreach (var _node in policyNodes[index - 1])
			{
				if (ANY_POLICY.Equals(_node.ValidPolicy))
				{
					var _childExpectedPolicies = new HashSet<string>();
					_childExpectedPolicies.Add(_poid.Id);

                    var _child = new PkixPolicyNode(new List<PkixPolicyNode>(), index, _childExpectedPolicies, _node,
						_pq, _poid.Id, false);
					_node.AddChild(_child);
					policyNodes[index].Add(_child);

					return;
				}
			}
		}

		/**
		* Find the issuer certificates of a given certificate.
		*
		* @param cert
		*            The certificate for which an issuer should be found.
		* @param pkixParams
		* @return A <code>Collection</code> object containing the issuer
		*         <code>X509Certificate</code>s. Never <code>null</code>.
		*
		* @exception Exception
		*                if an error occurs.
		*/
		internal static HashSet<X509Certificate> FindIssuerCerts(
			X509Certificate			cert,
			PkixBuilderParameters	pkixParams)
		{
			X509CertStoreSelector certSelector = new X509CertStoreSelector();
			try
			{
				certSelector.Subject = cert.IssuerDN;
			}
			catch (IOException ex)
			{
				throw new Exception(
					"Subject criteria for certificate selector to find issuer certificate could not be set.", ex);
			}

			var certs = new HashSet<X509Certificate>();
			try
			{
				CollectionUtilities.CollectMatches(certs, certSelector, pkixParams.GetStoresCert());
			}
			catch (Exception e)
			{
				throw new Exception("Issuer certificate cannot be searched.", e);
			}

			return certs;
		}

		internal static Asn1Object GetExtensionValue(IX509Extension extensions, DerObjectIdentifier oid)
		{
			return X509ExtensionUtilities.FromExtensionValue(extensions, oid);
		}
	}
}
