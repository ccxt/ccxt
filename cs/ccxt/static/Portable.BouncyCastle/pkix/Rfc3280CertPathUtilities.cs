using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.X509.Store;

namespace Org.BouncyCastle.Pkix
{
	internal static class Rfc3280CertPathUtilities
	{
		private static readonly PkixCrlUtilities CrlUtilities = new PkixCrlUtilities();

		internal static readonly string ANY_POLICY = "2.5.29.32.0";

		// key usage bits
		internal static readonly int KEY_CERT_SIGN = 5;
		internal static readonly int CRL_SIGN = 6;

		/**
		* If the complete CRL includes an issuing distribution point (IDP) CRL
		* extension check the following:
		* <p>
		* (i) If the distribution point name is present in the IDP CRL extension
		* and the distribution field is present in the DP, then verify that one of
		* the names in the IDP matches one of the names in the DP. If the
		* distribution point name is present in the IDP CRL extension and the
		* distribution field is omitted from the DP, then verify that one of the
		* names in the IDP matches one of the names in the cRLIssuer field of the
		* DP.
		* </p>
		* <p>
		* (ii) If the onlyContainsUserCerts boolean is asserted in the IDP CRL
		* extension, verify that the certificate does not include the basic
		* constraints extension with the cA boolean asserted.
		* </p>
		* <p>
		* (iii) If the onlyContainsCACerts boolean is asserted in the IDP CRL
		* extension, verify that the certificate includes the basic constraints
		* extension with the cA boolean asserted.
		* </p>
		* <p>
		* (iv) Verify that the onlyContainsAttributeCerts boolean is not asserted.
		* </p>
		*
		* @param dp   The distribution point.
		* @param cert The certificate.
		* @param crl  The CRL.
		* @throws AnnotatedException if one of the conditions is not met or an error occurs.
		*/
		internal static void ProcessCrlB2(DistributionPoint dp, object cert, X509Crl crl)
		{
			IssuingDistributionPoint idp;
			try
			{
				idp = IssuingDistributionPoint.GetInstance(PkixCertPathValidatorUtilities.GetExtensionValue(crl, X509Extensions.IssuingDistributionPoint));
			}
			catch (Exception e)
			{
				throw new Exception("0 Issuing distribution point extension could not be decoded.", e);
			}

			// (b) (2) (i)
			// distribution point name is present
			if (idp != null)
			{
				if (idp.DistributionPoint != null)
				{
					// make list of names
					DistributionPointName dpName = IssuingDistributionPoint.GetInstance(idp).DistributionPoint;
					var names = new List<GeneralName>();

					if (dpName.PointType == DistributionPointName.FullName)
					{
						GeneralName[] genNames = GeneralNames.GetInstance(dpName.Name).GetNames();
						for (int j = 0; j < genNames.Length; j++)
						{
							names.Add(genNames[j]);
						}
					}
					if (dpName.PointType == DistributionPointName.NameRelativeToCrlIssuer)
					{
						var seq = Asn1Sequence.GetInstance(crl.IssuerDN.ToAsn1Object());

						Asn1EncodableVector vec = new Asn1EncodableVector(seq.Count + 1);
						foreach (var element in seq)
						{
							vec.Add(element);
						}
						vec.Add(dpName.Name);

						names.Add(new GeneralName(X509Name.GetInstance(new DerSequence(vec))));
					}
					bool matches = false;
					// verify that one of the names in the IDP matches one
					// of the names in the DP.
					if (dp.DistributionPointName != null)
					{
						dpName = dp.DistributionPointName;
						GeneralName[] genNames = null;
						if (dpName.PointType == DistributionPointName.FullName)
						{
							genNames = GeneralNames.GetInstance(dpName.Name).GetNames();
						}
						if (dpName.PointType == DistributionPointName.NameRelativeToCrlIssuer)
						{
							if (dp.CrlIssuer != null)
							{
								genNames = dp.CrlIssuer.GetNames();
							}
							else
							{
								genNames = new GeneralName[1];
								try
								{
									genNames[0] = new GeneralName(
										PkixCertPathValidatorUtilities.GetIssuerPrincipal(cert));
								}
								catch (IOException e)
								{
									throw new Exception("Could not read certificate issuer.", e);
								}
							}
							for (int j = 0; j < genNames.Length; j++)
							{
								var seq = Asn1Sequence.GetInstance(genNames[j].Name.ToAsn1Object());

								Asn1EncodableVector vec = new Asn1EncodableVector(seq.Count + 1);
								foreach (var element in seq)
								{
									vec.Add(element);
								}
								vec.Add(dpName.Name);

								genNames[j] = new GeneralName(X509Name.GetInstance(new DerSequence(vec)));
							}
						}
						if (genNames != null)
						{
							for (int j = 0; j < genNames.Length; j++)
							{
								if (names.Contains(genNames[j]))
								{
									matches = true;
									break;
								}
							}
						}
						if (!matches)
						{
							throw new Exception(
								"No match for certificate CRL issuing distribution point name to cRLIssuer CRL distribution point.");
						}
					}
						// verify that one of the names in
						// the IDP matches one of the names in the cRLIssuer field of
						// the DP
					else
					{
						if (dp.CrlIssuer == null)
						{
							throw new Exception("Either the cRLIssuer or the distributionPoint field must "
								+ "be contained in DistributionPoint.");
						}
						GeneralName[] genNames = dp.CrlIssuer.GetNames();
						for (int j = 0; j < genNames.Length; j++)
						{
							if (names.Contains(genNames[j]))
							{
								matches = true;
								break;
							}
						}
						if (!matches)
						{
							throw new Exception(
								"No match for certificate CRL issuing distribution point name to cRLIssuer CRL distribution point.");
						}
					}
				}
				BasicConstraints bc = null;
				try
				{
					bc = BasicConstraints.GetInstance(PkixCertPathValidatorUtilities.GetExtensionValue(
						(IX509Extension)cert, X509Extensions.BasicConstraints));
				}
				catch (Exception e)
				{
					throw new Exception("Basic constraints extension could not be decoded.", e);
				}

				//if (cert is X509Certificate)
				{
					// (b) (2) (ii)
					if (idp.OnlyContainsUserCerts && ((bc != null) && bc.IsCA()))
					{
						throw new Exception("CA Cert CRL only contains user certificates.");
					}

					// (b) (2) (iii)
					if (idp.OnlyContainsCACerts && (bc == null || !bc.IsCA()))
					{
						throw new Exception("End CRL only contains CA certificates.");
					}
				}

				// (b) (2) (iv)
				if (idp.OnlyContainsAttributeCerts)
				{
					throw new Exception("onlyContainsAttributeCerts boolean is asserted.");
				}
			}
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static void ProcessCertBC(
			PkixCertPath				certPath,
			int							index,
			PkixNameConstraintValidator	nameConstraintValidator)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			int n = certs.Count;
			// i as defined in the algorithm description
			int i = n - index;
			//
			// (b), (c) permitted and excluded subtree checking.
			//
			if (!(PkixCertPathValidatorUtilities.IsSelfIssued(cert) && (i < n)))
			{
				X509Name principal = cert.SubjectDN;
				Asn1Sequence dns;

				try
				{
					dns = Asn1Sequence.GetInstance(principal.GetEncoded());
				}
				catch (Exception e)
				{
					throw new PkixCertPathValidatorException(
						"Exception extracting subject name when checking subtrees.", e, index);
				}

				try
				{
					nameConstraintValidator.CheckPermittedDN(dns);
					nameConstraintValidator.CheckExcludedDN(dns);
				}
				catch (PkixNameConstraintValidatorException e)
				{
					throw new PkixCertPathValidatorException(
						"Subtree check for certificate subject failed.", e, index);
				}

				GeneralNames altName = null;
				try
				{
					altName = GeneralNames.GetInstance(
						PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.SubjectAlternativeName));
				}
				catch (Exception e)
				{
					throw new PkixCertPathValidatorException(
						"Subject alternative name extension could not be decoded.", e, index);
				}

				var emails = X509Name.GetInstance(dns).GetValueList(X509Name.EmailAddress);
				foreach (string email in emails)
				{
					GeneralName emailAsGeneralName = new GeneralName(GeneralName.Rfc822Name, email);
					try
					{
						nameConstraintValidator.checkPermitted(emailAsGeneralName);
						nameConstraintValidator.checkExcluded(emailAsGeneralName);
					}
					catch (PkixNameConstraintValidatorException ex)
					{
						throw new PkixCertPathValidatorException(
							"Subtree check for certificate subject alternative email failed.", ex, index);
					}
				}
				if (altName != null)
				{
					GeneralName[] genNames = null;
					try
					{
						genNames = altName.GetNames();
					}
					catch (Exception e)
					{
						throw new PkixCertPathValidatorException(
							"Subject alternative name contents could not be decoded.", e, index);
					}
					foreach (GeneralName genName in genNames)
					{
						try
						{
							nameConstraintValidator.checkPermitted(genName);
							nameConstraintValidator.checkExcluded(genName);
						}
						catch (PkixNameConstraintValidatorException e)
						{
							throw new PkixCertPathValidatorException(
								"Subtree check for certificate subject alternative name failed.", e, index);
						}
					}
				}
			}
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static void PrepareNextCertA(PkixCertPath certPath, int index)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			//
			//
			// (a) check the policy mappings
			//
			Asn1Sequence pm;
			try
			{
				pm = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.PolicyMappings));
			}
			catch (Exception ex)
			{
				throw new PkixCertPathValidatorException(
					"Policy mappings extension could not be decoded.", ex, index);
			}
			if (pm != null)
			{
				Asn1Sequence mappings = pm;

				for (int j = 0; j < mappings.Count; j++)
				{
					DerObjectIdentifier issuerDomainPolicy;
					DerObjectIdentifier subjectDomainPolicy;
					try
					{
                        Asn1Sequence mapping = Asn1Sequence.GetInstance(mappings[j]);

						issuerDomainPolicy = DerObjectIdentifier.GetInstance(mapping[0]);
						subjectDomainPolicy = DerObjectIdentifier.GetInstance(mapping[1]);
					}
					catch (Exception e)
					{
						throw new PkixCertPathValidatorException(
							"Policy mappings extension contents could not be decoded.", e, index);
					}

					if (ANY_POLICY.Equals(issuerDomainPolicy.Id))
						throw new PkixCertPathValidatorException(
							"IssuerDomainPolicy is anyPolicy", null, index);

					if (ANY_POLICY.Equals(subjectDomainPolicy.Id))
						throw new PkixCertPathValidatorException(
							"SubjectDomainPolicy is anyPolicy,", null, index);
				}
			}
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static PkixPolicyNode ProcessCertD(PkixCertPath certPath, int index, ISet<string> acceptablePolicies,
			PkixPolicyNode validPolicyTree, IList<PkixPolicyNode>[] policyNodes, int inhibitAnyPolicy)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			int n = certs.Count;
			// i as defined in the algorithm description
			int i = n - index;
			//
			// (d) policy Information checking against initial policy and
			// policy mapping
			//
			Asn1Sequence certPolicies;
			try
			{
				certPolicies = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.CertificatePolicies));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException(
					"Could not read certificate policies extension from certificate.", e, index);
			}
			if (certPolicies != null && validPolicyTree != null)
			{
				//
				// (d) (1)
				//
				var pols = new HashSet<string>();

				foreach (Asn1Encodable ae in certPolicies)
				{
					PolicyInformation pInfo = PolicyInformation.GetInstance(ae.ToAsn1Object());
					DerObjectIdentifier pOid = pInfo.PolicyIdentifier;

					pols.Add(pOid.Id);

					if (!ANY_POLICY.Equals(pOid.Id))
					{
						ISet<PolicyQualifierInfo> pq;
						try
						{
							pq = PkixCertPathValidatorUtilities.GetQualifierSet(pInfo.PolicyQualifiers);
						}
						catch (PkixCertPathValidatorException ex)
						{
							throw new PkixCertPathValidatorException(
								"Policy qualifier info set could not be build.", ex, index);
						}

						bool match = PkixCertPathValidatorUtilities.ProcessCertD1i(i, policyNodes, pOid, pq);

						if (!match)
						{
							PkixCertPathValidatorUtilities.ProcessCertD1ii(i, policyNodes, pOid, pq);
						}
					}
				}

				if (acceptablePolicies.Count < 1 || acceptablePolicies.Contains(ANY_POLICY))
				{
					acceptablePolicies.Clear();
					acceptablePolicies.UnionWith(pols);
				}
				else
				{
					var t1 = new HashSet<string>();

					foreach (var o in acceptablePolicies)
					{
						if (pols.Contains(o))
						{
							t1.Add(o);
						}
					}
					acceptablePolicies.Clear();
					acceptablePolicies.UnionWith(t1);
				}

				//
				// (d) (2)
				//
				if ((inhibitAnyPolicy > 0) || ((i < n) && PkixCertPathValidatorUtilities.IsSelfIssued(cert)))
				{
					foreach (Asn1Encodable ae in certPolicies)
					{
						PolicyInformation pInfo = PolicyInformation.GetInstance(ae.ToAsn1Object());
						if (ANY_POLICY.Equals(pInfo.PolicyIdentifier.Id))
						{
							var _apq = PkixCertPathValidatorUtilities.GetQualifierSet(pInfo.PolicyQualifiers);

							foreach (var _node in policyNodes[i - 1])
							{
								foreach (var _policy in _node.ExpectedPolicies)
								{
									bool _found = false;

									foreach (PkixPolicyNode _child in _node.Children)
									{
										if (_policy.Equals(_child.ValidPolicy))
										{
											_found = true;
											break;
										}
									}

									if (!_found)
									{
										var _newChildExpectedPolicies = new HashSet<string>();
										_newChildExpectedPolicies.Add(_policy);

										var _newChild = new PkixPolicyNode(new List<PkixPolicyNode>(), i,
											_newChildExpectedPolicies, _node, _apq, _policy, false);
										_node.AddChild(_newChild);
										policyNodes[i].Add(_newChild);
									}
								}
							}
							break;
						}
					}
				}

				PkixPolicyNode _validPolicyTree = validPolicyTree;
				//
				// (d) (3)
				//
				for (int j = i - 1; j >= 0; j--)
				{
					var nodes = policyNodes[j];

					for (int k = 0; k < nodes.Count; k++)
					{
						var node = nodes[k];
						if (!node.HasChildren)
						{
							_validPolicyTree = PkixCertPathValidatorUtilities.RemovePolicyNode(_validPolicyTree,
								policyNodes, node);
							if (_validPolicyTree == null)
								break;
						}
					}
				}

				//
				// d (4)
				//
				var criticalExtensionOids = cert.GetCriticalExtensionOids();

				if (criticalExtensionOids != null)
				{
					bool critical = criticalExtensionOids.Contains(X509Extensions.CertificatePolicies.Id);

					foreach (var node in policyNodes[i])
					{
						node.IsCritical = critical;
					}
				}
				return _validPolicyTree;
			}
			return null;
		}

		/**
		* If the DP includes cRLIssuer, then verify that the issuer field in the
		* complete CRL matches cRLIssuer in the DP and that the complete CRL
		* contains an
		*      g distribution point extension with the indirectCRL
		* boolean asserted. Otherwise, verify that the CRL issuer matches the
		* certificate issuer.
		*
		* @param dp   The distribution point.
		* @param cert The certificate ot attribute certificate.
		* @param crl  The CRL for <code>cert</code>.
		* @throws AnnotatedException if one of the above conditions does not apply or an error
		*                            occurs.
		*/
		internal static void ProcessCrlB1(DistributionPoint dp, object cert, X509Crl crl)
		{
			Asn1Object idp = PkixCertPathValidatorUtilities.GetExtensionValue(
				crl, X509Extensions.IssuingDistributionPoint);

			bool isIndirect = false;
			if (idp != null)
			{
				if (IssuingDistributionPoint.GetInstance(idp).IsIndirectCrl)
				{
					isIndirect = true;
				}
			}

			byte[] issuerBytes = crl.IssuerDN.GetEncoded();

			bool matchIssuer = false;
			if (dp.CrlIssuer != null)
			{
				GeneralName[] genNames = dp.CrlIssuer.GetNames();
				for (int j = 0; j < genNames.Length; j++)
				{
					if (genNames[j].TagNo == GeneralName.DirectoryName)
					{
						try
						{
							if (Arrays.AreEqual(genNames[j].Name.GetEncoded(), issuerBytes))
							{
								matchIssuer = true;
							}
						}
						catch (IOException e)
						{
							throw new Exception(
								"CRL issuer information from distribution point cannot be decoded.", e);
						}
					}
				}
				if (matchIssuer && !isIndirect)
				{
					throw new Exception("Distribution point contains cRLIssuer field but CRL is not indirect.");
				}
				if (!matchIssuer)
				{
					throw new Exception("CRL issuer of CRL does not match CRL issuer of distribution point.");
				}
			}
			else
			{
				if (crl.IssuerDN.Equivalent(PkixCertPathValidatorUtilities.GetIssuerPrincipal(cert), true))
				{
					matchIssuer = true;
				}
			}
			if (!matchIssuer)
			{
				throw new Exception("Cannot find matching CRL issuer for certificate.");
			}
		}

		internal static ReasonsMask ProcessCrlD(X509Crl crl, DistributionPoint dp)
			//throws AnnotatedException
		{
			IssuingDistributionPoint idp;
			try
			{
				idp = IssuingDistributionPoint.GetInstance(PkixCertPathValidatorUtilities.GetExtensionValue(crl, X509Extensions.IssuingDistributionPoint));
			}
			catch (Exception e)
			{
				throw new Exception("issuing distribution point extension could not be decoded.", e);
			}

			// (d) (1)
			if (idp != null && idp.OnlySomeReasons != null && dp.Reasons != null)
			{
				return new ReasonsMask(dp.Reasons.IntValue).Intersect(new ReasonsMask(idp.OnlySomeReasons.IntValue));
			}
			// (d) (4)
			if ((idp == null || idp.OnlySomeReasons == null) && dp.Reasons == null)
			{
				return ReasonsMask.AllReasons;
			}

			// (d) (2) and (d)(3)

			ReasonsMask dpReasons;
			if (dp.Reasons == null)
			{
				dpReasons = ReasonsMask.AllReasons;
			}
			else
			{
				dpReasons = new ReasonsMask(dp.Reasons.IntValue);
			}

			ReasonsMask idpReasons;
			if (idp == null)
			{
				idpReasons = ReasonsMask.AllReasons;
			}
			else
			{
				idpReasons = new ReasonsMask(idp.OnlySomeReasons.IntValue);
			}

			return dpReasons.Intersect(idpReasons);
		}

		/**
		* Obtain and validate the certification path for the complete CRL issuer.
		* If a key usage extension is present in the CRL issuer's certificate,
		* verify that the cRLSign bit is set.
		*
		* @param crl                CRL which contains revocation information for the certificate
		*                           <code>cert</code>.
		* @param cert               The attribute certificate or certificate to check if it is
		*                           revoked.
		* @param defaultCRLSignCert The issuer certificate of the certificate <code>cert</code>.
		* @param defaultCRLSignKey  The public key of the issuer certificate
		*                           <code>defaultCRLSignCert</code>.
		* @param paramsPKIX         paramsPKIX PKIX parameters.
		* @param certPathCerts      The certificates on the certification path.
		* @return A <code>Set</code> with all keys of possible CRL issuer
		*         certificates.
		* @throws AnnotatedException if the CRL is not valid or the status cannot be checked or
		*                            some error occurs.
		*/
		internal static ISet<AsymmetricKeyParameter> ProcessCrlF(
			X509Crl					crl,
			object					cert,
			X509Certificate			defaultCRLSignCert,
			AsymmetricKeyParameter	defaultCRLSignKey,
			PkixParameters			paramsPKIX,
			IList<X509Certificate>	certPathCerts)
		{
			// (f)

			// get issuer from CRL
			X509CertStoreSelector certSelector = new X509CertStoreSelector();
			try
			{
				certSelector.Subject = crl.IssuerDN;
			}
			catch (IOException e)
			{
				throw new Exception(
					"Subject criteria for certificate selector to find issuer certificate for CRL could not be set.", e);
			}

			// get CRL signing certs
			var signingCerts = new HashSet<X509Certificate>();

			try
			{
				CollectionUtilities.CollectMatches(signingCerts, certSelector, paramsPKIX.GetStoresCert());
			}
			catch (Exception e)
			{
				throw new Exception("Issuer certificate for CRL cannot be searched.", e);
			}

			signingCerts.Add(defaultCRLSignCert);


            var validCerts = new List<X509Certificate>();
			var validKeys = new List<AsymmetricKeyParameter>();

			foreach (X509Certificate signingCert in signingCerts)
			{
				/*
				 * CA of the certificate, for which this CRL is checked, has also
				 * signed CRL, so skip the path validation, because is already done
				 */
				if (signingCert.Equals(defaultCRLSignCert))
				{
					validCerts.Add(signingCert);
					validKeys.Add(defaultCRLSignKey);
					continue;
				}
				try
				{
					PkixCertPathBuilder builder = new PkixCertPathBuilder();

					certSelector = new X509CertStoreSelector();
					certSelector.Certificate = signingCert;

					PkixBuilderParameters parameters = PkixBuilderParameters.GetInstance(paramsPKIX);
					parameters.SetTargetConstraintsCert(certSelector);

					/*
					 * if signingCert is placed not higher on the cert path a
					 * dependency loop results. CRL for cert is checked, but
					 * signingCert is needed for checking the CRL which is dependent
					 * on checking cert because it is higher in the cert path and so
					 * signing signingCert transitively. so, revocation is disabled,
					 * forgery attacks of the CRL are detected in this outer loop
					 * for all other it must be enabled to prevent forgery attacks
					 */
					if (certPathCerts.Contains(signingCert))
					{
						parameters.IsRevocationEnabled = false;
					}
					else
					{
						parameters.IsRevocationEnabled = true;
					}
					var certs = builder.Build(parameters).CertPath.Certificates;
					validCerts.Add(signingCert);
					validKeys.Add(PkixCertPathValidatorUtilities.GetNextWorkingKey(certs, 0));
				}
                catch (PkixCertPathBuilderException e)
                {
                    throw new Exception("CertPath for CRL signer failed to validate.", e);
                }
                catch (PkixCertPathValidatorException e)
                {
                    throw new Exception("Public key of issuer certificate of CRL could not be retrieved.", e);
                }
			}

			var checkKeys = new HashSet<AsymmetricKeyParameter>();

			Exception lastException = null;
			for (int i = 0; i < validCerts.Count; i++)
			{
				X509Certificate signCert = (X509Certificate)validCerts[i];
				bool[] keyusage = signCert.GetKeyUsage();

				if (keyusage != null && (keyusage.Length < 7 || !keyusage[CRL_SIGN]))
				{
					lastException = new Exception(
						"Issuer certificate key usage extension does not permit CRL signing.");
				}
				else
				{
					checkKeys.Add(validKeys[i]);
				}
			}

			if ((checkKeys.Count == 0) && lastException == null)
			{
				throw new Exception("Cannot find a valid issuer certificate.");
			}
			if ((checkKeys.Count == 0) && lastException != null)
			{
				throw lastException;
			}

			return checkKeys;
		}

		internal static AsymmetricKeyParameter ProcessCrlG(X509Crl crl, ISet<AsymmetricKeyParameter> keys)
		{
			Exception lastException = null;
			foreach (AsymmetricKeyParameter key in keys)
			{
				try
				{
					crl.Verify(key);
					return key;
				}
				catch (Exception e)
				{
					lastException = e;
				}
			}
			throw new Exception("Cannot verify CRL.", lastException);
		}

		internal static X509Crl ProcessCrlH(ISet<X509Crl> deltaCrls, AsymmetricKeyParameter key)
		{
			Exception lastException = null;
			foreach (X509Crl crl in deltaCrls)
			{
				try
				{
					crl.Verify(key);
					return crl;
				}
				catch (Exception e)
				{
					lastException = e;
				}
			}
			if (lastException != null)
			{
				throw new Exception("Cannot verify delta CRL.", lastException);
			}
			return null;
		}

		/**
		* Checks a distribution point for revocation information for the
		* certificate <code>cert</code>.
		*
		* @param dp                 The distribution point to consider.
		* @param paramsPKIX         PKIX parameters.
		* @param cert               Certificate to check if it is revoked.
		* @param validDate          The date when the certificate revocation status should be
		*                           checked.
		* @param defaultCRLSignCert The issuer certificate of the certificate <code>cert</code>.
		* @param defaultCRLSignKey  The public key of the issuer certificate
		*                           <code>defaultCRLSignCert</code>.
		* @param certStatus         The current certificate revocation status.
		* @param reasonMask         The reasons mask which is already checked.
		* @param certPathCerts      The certificates of the certification path.
		* @throws AnnotatedException if the certificate is revoked or the status cannot be checked
		*                            or some error occurs.
		*/
		private static void CheckCrl(
			DistributionPoint dp,
			PkixParameters paramsPKIX,
			X509Certificate cert,
			DateTime validDate,
			X509Certificate defaultCRLSignCert,
			AsymmetricKeyParameter defaultCRLSignKey,
			CertStatus certStatus,
			ReasonsMask reasonMask,
			IList<X509Certificate> certPathCerts)
		{
			DateTime currentDate = DateTime.UtcNow;

			if (validDate.Ticks > currentDate.Ticks)
			{
				throw new Exception("Validation time is in future.");
			}

			// (a)
			/*
			 * We always get timely valid CRLs, so there is no step (a) (1).
			 * "locally cached" CRLs are assumed to be in getStore(), additional
			 * CRLs must be enabled in the ExtendedPKIXParameters and are in
			 * getAdditionalStore()
			 */

			ISet<X509Crl> crls = PkixCertPathValidatorUtilities.GetCompleteCrls(dp, cert, currentDate, paramsPKIX);
			bool validCrlFound = false;
			Exception lastException = null;

			var crl_iter = crls.GetEnumerator();

			while (crl_iter.MoveNext() && certStatus.Status == CertStatus.Unrevoked && !reasonMask.IsAllReasons)
			{
				try
				{
					X509Crl crl = crl_iter.Current;

					// (d)
					ReasonsMask interimReasonsMask = ProcessCrlD(crl, dp);

					// (e)
					/*
					 * The reasons mask is updated at the end, so only valid CRLs
					 * can update it. If this CRL does not contain new reasons it
					 * must be ignored.
					 */
					if (!interimReasonsMask.HasNewReasons(reasonMask))
					{
						continue;
					}

					// (f)
					var keys = ProcessCrlF(crl, cert, defaultCRLSignCert, defaultCRLSignKey, paramsPKIX, certPathCerts);
					// (g)
					AsymmetricKeyParameter key = ProcessCrlG(crl, keys);

					X509Crl deltaCRL = null;

					if (paramsPKIX.IsUseDeltasEnabled)
					{
						// get delta CRLs
						ISet<X509Crl> deltaCRLs = PkixCertPathValidatorUtilities.GetDeltaCrls(currentDate, paramsPKIX, crl);
						// we only want one valid delta CRL
						// (h)
						deltaCRL = ProcessCrlH(deltaCRLs, key);
					}

					/*
					 * CRL must be be valid at the current time, not the validation
					 * time. If a certificate is revoked with reason keyCompromise,
					 * cACompromise, it can be used for forgery, also for the past.
					 * This reason may not be contained in older CRLs.
					 */

					/*
					 * in the chain model signatures stay valid also after the
					 * certificate has been expired, so they do not have to be in
					 * the CRL validity time
					 */

					if (paramsPKIX.ValidityModel != PkixParameters.ChainValidityModel)
					{
						/*
						 * if a certificate has expired, but was revoked, it is not
						 * more in the CRL, so it would be regarded as valid if the
						 * first check is not done
						 */
						if (cert.NotAfter.Ticks < crl.ThisUpdate.Ticks)
						{
							throw new Exception("No valid CRL for current time found.");
						}
					}

					ProcessCrlB1(dp, cert, crl);

					// (b) (2)
					ProcessCrlB2(dp, cert, crl);

					// (c)
					ProcessCrlC(deltaCRL, crl, paramsPKIX);

					// (i)
					ProcessCrlI(validDate, deltaCRL, cert, certStatus, paramsPKIX);

					// (j)
					ProcessCrlJ(validDate, crl, cert, certStatus);

					// (k)
					if (certStatus.Status == CrlReason.RemoveFromCrl)
					{
						certStatus.Status = CertStatus.Unrevoked;
					}

					// update reasons mask
					reasonMask.AddReasons(interimReasonsMask);

					var criticalExtensions = crl.GetCriticalExtensionOids();

					if (criticalExtensions != null)
					{
						criticalExtensions = new HashSet<string>(criticalExtensions);
						criticalExtensions.Remove(X509Extensions.IssuingDistributionPoint.Id);
						criticalExtensions.Remove(X509Extensions.DeltaCrlIndicator.Id);

						if (criticalExtensions.Count > 0)
							throw new Exception("CRL contains unsupported critical extensions.");
					}

					if (deltaCRL != null)
					{
						criticalExtensions = deltaCRL.GetCriticalExtensionOids();
						if (criticalExtensions != null)
						{
							criticalExtensions = new HashSet<string>(criticalExtensions);
							criticalExtensions.Remove(X509Extensions.IssuingDistributionPoint.Id);
							criticalExtensions.Remove(X509Extensions.DeltaCrlIndicator.Id);

							if (criticalExtensions.Count > 0)
								throw new Exception("Delta CRL contains unsupported critical extension.");
						}
					}

					validCrlFound = true;
				}
				catch (Exception e)
				{
					lastException = e;
				}
			}
			if (!validCrlFound)
			{
				throw lastException;
			}
		}

		/**
		 * Checks a certificate if it is revoked.
		 *
		 * @param paramsPKIX       PKIX parameters.
		 * @param cert             Certificate to check if it is revoked.
		 * @param validDate        The date when the certificate revocation status should be
		 *                         checked.
		 * @param sign             The issuer certificate of the certificate <code>cert</code>.
		 * @param workingPublicKey The public key of the issuer certificate <code>sign</code>.
		 * @param certPathCerts    The certificates of the certification path.
		 * @throws AnnotatedException if the certificate is revoked or the status cannot be checked
		 *                            or some error occurs.
		 */
		internal static void CheckCrls(
			PkixParameters			paramsPKIX,
			X509Certificate			cert,
			DateTime				validDate,
			X509Certificate			sign,
			AsymmetricKeyParameter	workingPublicKey,
			IList<X509Certificate>	certPathCerts)
		{
			Exception lastException = null;
			CrlDistPoint crldp;

			try
			{
				crldp = CrlDistPoint.GetInstance(PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.CrlDistributionPoints));
			}
			catch (Exception e)
			{
				throw new Exception("CRL distribution point extension could not be read.", e);
			}

			try
			{
				PkixCertPathValidatorUtilities.AddAdditionalStoresFromCrlDistributionPoint(crldp, paramsPKIX);
			}
			catch (Exception e)
			{
				throw new Exception(
					"No additional CRL locations could be decoded from CRL distribution point extension.", e);
			}
			CertStatus certStatus = new CertStatus();
			ReasonsMask reasonsMask = new ReasonsMask();

			bool validCrlFound = false;

			// for each distribution point
			if (crldp != null)
			{
				DistributionPoint[] dps;
				try
				{
					dps = crldp.GetDistributionPoints();
				}
				catch (Exception e)
				{
					throw new Exception("Distribution points could not be read.", e);
				}
				if (dps != null)
				{
					for (int i = 0; i < dps.Length && certStatus.Status == CertStatus.Unrevoked && !reasonsMask.IsAllReasons; i++)
					{
						PkixParameters paramsPKIXClone = (PkixParameters)paramsPKIX.Clone();
						try
						{
							CheckCrl(dps[i], paramsPKIXClone, cert, validDate, sign, workingPublicKey, certStatus,
								reasonsMask, certPathCerts);
							validCrlFound = true;
						}
						catch (Exception e)
						{
							lastException = e;
						}
					}
				}
			}

			/*
			 * If the revocation status has not been determined, repeat the process
			 * above with any available CRLs not specified in a distribution point
			 * but issued by the certificate issuer.
			 */

			if (certStatus.Status == CertStatus.Unrevoked && !reasonsMask.IsAllReasons)
			{
				try
				{
					/*
					 * assume a DP with both the reasons and the cRLIssuer fields
					 * omitted and a distribution point name of the certificate
					 * issuer.
					 */
					X509Name issuer;
					try
					{
						issuer = X509Name.GetInstance(cert.IssuerDN.GetEncoded());
					}
					catch (Exception e)
					{
						throw new Exception("Issuer from certificate for CRL could not be reencoded.", e);
					}
					DistributionPoint dp = new DistributionPoint(new DistributionPointName(0, new GeneralNames(
						new GeneralName(GeneralName.DirectoryName, issuer))), null, null);
					PkixParameters paramsPKIXClone = (PkixParameters)paramsPKIX.Clone();

					CheckCrl(dp, paramsPKIXClone, cert, validDate, sign, workingPublicKey, certStatus, reasonsMask,
						certPathCerts);

					validCrlFound = true;
				}
				catch (Exception e)
				{
					lastException = e;
				}
			}

			if (!validCrlFound)
			{
				throw lastException;
			}
			if (certStatus.Status != CertStatus.Unrevoked)
			{
				// This format is enforced by the NistCertPath tests
                string formattedDate = certStatus.RevocationDate.Value.ToString(
                    "ddd MMM dd HH:mm:ss K yyyy");
                string message = "Certificate revocation after " + formattedDate;
				message += ", reason: " + CrlReasons[certStatus.Status];
				throw new Exception(message);
			}

			if (!reasonsMask.IsAllReasons && certStatus.Status == CertStatus.Unrevoked)
			{
				certStatus.Status = CertStatus.Undetermined;
			}

			if (certStatus.Status == CertStatus.Undetermined)
			{
				throw new Exception("Certificate status could not be determined.");
			}
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static PkixPolicyNode PrepareCertB(PkixCertPath certPath, int index,
			IList<PkixPolicyNode>[] policyNodes, PkixPolicyNode validPolicyTree, int policyMapping)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			int n = certs.Count;
			// i as defined in the algorithm description
			int i = n - index;
			// (b)
			//
			Asn1Sequence pm;
			try
			{
				pm = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.PolicyMappings));
			}
			catch (Exception ex)
			{
				throw new PkixCertPathValidatorException(
					"Policy mappings extension could not be decoded.", ex, index);
			}
			PkixPolicyNode _validPolicyTree = validPolicyTree;
			if (pm != null)
			{
				Asn1Sequence mappings = pm;
				var m_idp = new Dictionary<string, ISet<string>>();
				var s_idp = new HashSet<string>();

				for (int j = 0; j < mappings.Count; j++)
				{
					Asn1Sequence mapping = (Asn1Sequence)mappings[j];
					string id_p = ((DerObjectIdentifier)mapping[0]).Id;
					string sd_p = ((DerObjectIdentifier)mapping[1]).Id;

					ISet<string> tmp;
					if (m_idp.TryGetValue(id_p, out tmp))
                    {
                        tmp.Add(sd_p);
                    }
					else
                    {
                        tmp = new HashSet<string>();
                        tmp.Add(sd_p);
                        m_idp[id_p] = tmp;
                        s_idp.Add(id_p);
                    }
				}

				foreach (var id_p in s_idp)
				{
					//
					// (1)
					//
					if (policyMapping > 0)
					{
						bool idp_found = false;

						foreach (PkixPolicyNode node in policyNodes[i])
						{
							if (node.ValidPolicy.Equals(id_p))
							{
								idp_found = true;
								node.ExpectedPolicies = CollectionUtilities.GetValueOrNull(m_idp, id_p);
								break;
							}
						}

						if (!idp_found)
						{
							foreach (PkixPolicyNode node in policyNodes[i])
							{
								if (ANY_POLICY.Equals(node.ValidPolicy))
								{
									Asn1Sequence policies = null;
									try
									{
										policies = (Asn1Sequence)PkixCertPathValidatorUtilities.GetExtensionValue(cert,
											X509Extensions.CertificatePolicies);
									}
									catch (Exception e)
									{
										throw new PkixCertPathValidatorException(
											"Certificate policies extension could not be decoded.", e, index);
									}

									ISet<PolicyQualifierInfo> pq = null;

									foreach (Asn1Encodable ae in policies)
									{
										PolicyInformation pinfo = null;
										try
										{
											pinfo = PolicyInformation.GetInstance(ae.ToAsn1Object());
										}
										catch (Exception ex)
										{
											throw new PkixCertPathValidatorException(
												"Policy information could not be decoded.", ex, index);
										}
										if (ANY_POLICY.Equals(pinfo.PolicyIdentifier.Id))
										{
											try
											{
												pq = PkixCertPathValidatorUtilities
													.GetQualifierSet(pinfo.PolicyQualifiers);
											}
											catch (PkixCertPathValidatorException ex)
											{
												throw new PkixCertPathValidatorException(
													"Policy qualifier info set could not be decoded.", ex, index);
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
										var c_node = new PkixPolicyNode(new List<PkixPolicyNode>(), i,
											CollectionUtilities.GetValueOrNull(m_idp, id_p), p_node, pq, id_p, ci);
										p_node.AddChild(c_node);
										policyNodes[i].Add(c_node);
									}
									break;
								}
							}
						}

						//
						// (2)
						//
					}
					else if (policyMapping <= 0)
					{
                        foreach (var node in new List<PkixPolicyNode>(policyNodes[i]))
                        {
							if (node.ValidPolicy.Equals(id_p))
							{
								node.Parent.RemoveChild(node);

                                for (int k = i - 1; k >= 0; k--)
								{
                                    foreach (var node2 in new List<PkixPolicyNode>(policyNodes[k]))
									{
										if (!node2.HasChildren)
										{
											_validPolicyTree = PkixCertPathValidatorUtilities.RemovePolicyNode(
												_validPolicyTree, policyNodes, node2);

                                            if (_validPolicyTree == null)
												break;
										}
									}
								}
							}
						}
					}
				}
			}
			return _validPolicyTree;
		}

		internal static ISet<X509Crl>[] ProcessCrlA1ii(
			DateTime		currentDate,
			PkixParameters	paramsPKIX,
			X509Certificate	cert,
			X509Crl			crl)
		{
			X509CrlStoreSelector crlselect = new X509CrlStoreSelector();
			crlselect.CertificateChecking = cert;

			try
			{
				var issuer = new List<X509Name>();
				issuer.Add(crl.IssuerDN);
				crlselect.Issuers = issuer;
			}
			catch (IOException e)
			{
				throw new Exception("Cannot extract issuer from CRL." + e, e);
			}

			crlselect.CompleteCrlEnabled = true;
			ISet<X509Crl> completeSet = CrlUtilities.FindCrls(crlselect, paramsPKIX, currentDate);
			var deltaSet = new HashSet<X509Crl>();

			if (paramsPKIX.IsUseDeltasEnabled)
			{
				// get delta CRL(s)
				try
				{
					deltaSet.UnionWith(PkixCertPathValidatorUtilities.GetDeltaCrls(currentDate, paramsPKIX, crl));
				}
				catch (Exception e)
				{
					throw new Exception("Exception obtaining delta CRLs.", e);
				}
			}

			return new []{ completeSet, deltaSet };
		}

		internal static ISet<X509Crl> ProcessCrlA1i(
			DateTime		currentDate,
			PkixParameters	paramsPKIX,
			X509Certificate	cert,
			X509Crl			crl)
		{
			var deltaSet = new HashSet<X509Crl>();
			if (paramsPKIX.IsUseDeltasEnabled)
			{
				CrlDistPoint freshestCRL;
				try
				{
					freshestCRL = CrlDistPoint.GetInstance(
						PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.FreshestCrl));
				}
				catch (Exception e)
				{
					throw new Exception("Freshest CRL extension could not be decoded from certificate.", e);
				}

				if (freshestCRL == null)
				{
					try
					{
						freshestCRL = CrlDistPoint.GetInstance(PkixCertPathValidatorUtilities.GetExtensionValue(crl,
							X509Extensions.FreshestCrl));
					}
					catch (Exception e)
					{
						throw new Exception("Freshest CRL extension could not be decoded from CRL.", e);
					}
				}
				if (freshestCRL != null)
				{
					try
					{
						PkixCertPathValidatorUtilities.AddAdditionalStoresFromCrlDistributionPoint(freshestCRL,
							paramsPKIX);
					}
					catch (Exception e)
					{
						throw new Exception(
							"No new delta CRL locations could be added from Freshest CRL extension.", e);
					}
					// get delta CRL(s)
					try
					{
						deltaSet.UnionWith(PkixCertPathValidatorUtilities.GetDeltaCrls(currentDate, paramsPKIX, crl));
					}
					catch (Exception e)
					{
						throw new Exception("Exception obtaining delta CRLs.", e);
					}
				}
			}
			return deltaSet;
		}

		internal static void ProcessCertF(
			PkixCertPath	certPath,
			int				index,
			PkixPolicyNode	validPolicyTree,
			int				explicitPolicy)
		{
			//
			// (f)
			//
			if (explicitPolicy <= 0 && validPolicyTree == null)
			{
				throw new PkixCertPathValidatorException(
					"No valid policy tree found when one expected.", null, index);
			}
		}

		internal static void ProcessCertA(
			PkixCertPath			certPath,
			PkixParameters			paramsPKIX,
			int						index,
			AsymmetricKeyParameter	workingPublicKey,
			X509Name				workingIssuerName,
			X509Certificate			sign)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			//
			// (a) verify
			//
			try
			{
				// (a) (1)
				//
				cert.Verify(workingPublicKey);
			}
			catch (GeneralSecurityException e)
			{
				throw new PkixCertPathValidatorException("Could not validate certificate signature.", e, index);
			}

			try
			{
				// (a) (2)
				//
				cert.CheckValidity(PkixCertPathValidatorUtilities
					.GetValidCertDateFromValidityModel(paramsPKIX, certPath, index));
			}
			catch (CertificateExpiredException e)
			{
				throw new PkixCertPathValidatorException("Could not validate certificate: " + e.Message, e, index);
			}
			catch (CertificateNotYetValidException e)
			{
				throw new PkixCertPathValidatorException("Could not validate certificate: " + e.Message, e, index);
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Could not validate time of certificate.", e, index);
			}

			//
			// (a) (3)
			//
			if (paramsPKIX.IsRevocationEnabled)
			{
				try
				{
					CheckCrls(paramsPKIX, cert, PkixCertPathValidatorUtilities.GetValidCertDateFromValidityModel(paramsPKIX,
						certPath, index), sign, workingPublicKey, certs);
				}
				catch (Exception e)
				{
					Exception cause = e.InnerException;
					if (cause == null)
					{
						cause = e;
					}
					throw new PkixCertPathValidatorException(e.Message, cause, index);
				}
			}

			//
			// (a) (4) name chaining
			//
			X509Name issuer = PkixCertPathValidatorUtilities.GetIssuerPrincipal(cert);
			if (!issuer.Equivalent(workingIssuerName, true))
			{
				throw new PkixCertPathValidatorException("IssuerName(" + issuer
					+ ") does not match SubjectName(" + workingIssuerName + ") of signing certificate.", null, index);
			}
		}

		internal static int PrepareNextCertI1(PkixCertPath certPath, int index, int explicitPolicy)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			//
			// (i)
			//
			Asn1Sequence pc;
			try
			{
                pc = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.PolicyConstraints));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException(
					"Policy constraints extension cannot be decoded.", e, index);
			}

			if (pc != null)
			{
				foreach (var policyConstraint in pc)
				{
					try
					{
						Asn1TaggedObject constraint = Asn1TaggedObject.GetInstance(policyConstraint);
						if (constraint.HasContextTag(0))
						{
                            int tmpInt = DerInteger.GetInstance(constraint, false).IntValueExact;
							if (tmpInt < explicitPolicy)
								return tmpInt;

							break;
						}
					}
					catch (ArgumentException e)
					{
						throw new PkixCertPathValidatorException(
							"Policy constraints extension contents cannot be decoded.", e, index);
					}
				}
			}
			return explicitPolicy;
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static int PrepareNextCertI2(
			PkixCertPath	certPath,
			int				index,
			int				policyMapping)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (i)
			//
			Asn1Sequence pc = null;
			try
			{
                pc = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.PolicyConstraints));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Policy constraints extension cannot be decoded.", e, index);
			}

			if (pc != null)
			{
				foreach (var policyConstraint in pc)
				{
					try
					{
						Asn1TaggedObject constraint = Asn1TaggedObject.GetInstance(policyConstraint);
						if (constraint.HasContextTag(1))
						{
                            int tmpInt = DerInteger.GetInstance(constraint, false).IntValueExact;
							if (tmpInt < policyMapping)
								return tmpInt;

							break;
						}
					}
					catch (ArgumentException e)
					{
						throw new PkixCertPathValidatorException(
							"Policy constraints extension contents cannot be decoded.", e, index);
					}
				}
			}
			return policyMapping;
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static void PrepareNextCertG(
			PkixCertPath				certPath,
			int							index,
			PkixNameConstraintValidator	nameConstraintValidator)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (g) handle the name constraints extension
			//
			NameConstraints nc = null;
			try
			{
                Asn1Sequence ncSeq = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.NameConstraints));
				if (ncSeq != null)
				{
					nc = new NameConstraints(ncSeq);
				}
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException(
					"Name constraints extension could not be decoded.", e, index);
			}
			if (nc != null)
			{
				//
				// (g) (1) permitted subtrees
				//
				Asn1Sequence permitted = nc.PermittedSubtrees;
				if (permitted != null)
				{
					try
					{
						nameConstraintValidator.IntersectPermittedSubtree(permitted);
					}
					catch (Exception ex)
					{
						throw new PkixCertPathValidatorException(
							"Permitted subtrees cannot be build from name constraints extension.", ex, index);
					}
				}

				//
				// (g) (2) excluded subtrees
				//
				Asn1Sequence excluded = nc.ExcludedSubtrees;
				if (excluded != null)
				{
					try
					{
						foreach (var excludedSubtree in excluded)
						{
							GeneralSubtree subtree = GeneralSubtree.GetInstance(excludedSubtree);
							nameConstraintValidator.AddExcludedSubtree(subtree);
						}
					}
					catch (Exception ex)
					{
						throw new PkixCertPathValidatorException(
							"Excluded subtrees cannot be build from name constraints extension.", ex, index);
					}
				}
			}
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static int PrepareNextCertJ(
			PkixCertPath	certPath,
			int				index,
			int				inhibitAnyPolicy)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (j)
			//
			DerInteger iap = null;
			try
			{
				iap = DerInteger.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.InhibitAnyPolicy));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Inhibit any-policy extension cannot be decoded.", e, index);
			}

			if (iap != null)
			{
                int _inhibitAnyPolicy = iap.IntValueExact;

				if (_inhibitAnyPolicy < inhibitAnyPolicy)
					return _inhibitAnyPolicy;
			}
			return inhibitAnyPolicy;
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static void PrepareNextCertK(
			PkixCertPath	certPath,
			int				index)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			//
			// (k)
			//
			BasicConstraints bc;
			try
			{
				bc = BasicConstraints.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.BasicConstraints));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Basic constraints extension cannot be decoded.", e, index);
			}
			if (bc != null)
			{
				if (!(bc.IsCA()))
					throw new PkixCertPathValidatorException("Not a CA certificate");
			}
			else
			{
				throw new PkixCertPathValidatorException("Intermediate certificate lacks BasicConstraints");
			}
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static int PrepareNextCertL(
			PkixCertPath	certPath,
			int				index,
			int				maxPathLength)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];
			//
			// (l)
			//
			if (!PkixCertPathValidatorUtilities.IsSelfIssued(cert))
			{
				if (maxPathLength <= 0)
					throw new PkixCertPathValidatorException("Max path length not greater than zero", null, index);

				return maxPathLength - 1;
			}
			return maxPathLength;
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static int PrepareNextCertM(
			PkixCertPath	certPath,
			int				index,
			int				maxPathLength)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (m)
			//
			BasicConstraints bc;
			try
			{
				bc = BasicConstraints.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.BasicConstraints));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Basic constraints extension cannot be decoded.", e, index);
			}
			if (bc != null)
			{
				BigInteger _pathLengthConstraint = bc.PathLenConstraint;

				if (_pathLengthConstraint != null)
				{
					int _plc = _pathLengthConstraint.IntValue;

					if (_plc < maxPathLength)
					{
						return _plc;
					}
				}
			}
			return maxPathLength;
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static void PrepareNextCertN(
			PkixCertPath	certPath,
			int				index)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (n)
			//
			bool[] _usage = cert.GetKeyUsage();

			if ((_usage != null) && !_usage[KEY_CERT_SIGN])
			{
				throw new PkixCertPathValidatorException(
					"Issuer certificate keyusage extension is critical and does not permit key signing.", null, index);
			}
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static void PrepareNextCertO(PkixCertPath certPath, int index, ISet<string> criticalExtensions,
			IList<PkixCertPathChecker> checkers)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (o)
			//
			foreach (var checker in checkers)
			{
				try
				{
					checker.Check(cert, criticalExtensions);
				}
				catch (PkixCertPathValidatorException e)
				{
					throw new PkixCertPathValidatorException(e.Message, e.InnerException, index);
				}
			}
			if (criticalExtensions.Count > 0)
			{
				throw new PkixCertPathValidatorException("Certificate has unsupported critical extension.", null, index);
			}
		}

		internal static int PrepareNextCertH1(
			PkixCertPath	certPath,
			int				index,
			int				explicitPolicy)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (h)
			//
			if (!PkixCertPathValidatorUtilities.IsSelfIssued(cert))
			{
				//
				// (1)
				//
				if (explicitPolicy != 0)
					return explicitPolicy - 1;
			}
			return explicitPolicy;
		}

		internal static int PrepareNextCertH2(
			PkixCertPath	certPath,
			int				index,
			int				policyMapping)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (h)
			//
			if (!PkixCertPathValidatorUtilities.IsSelfIssued(cert))
			{
				//
				// (2)
				//
				if (policyMapping != 0)
					return policyMapping - 1;
			}
			return policyMapping;
		}


		internal static int PrepareNextCertH3(
			PkixCertPath	certPath,
			int				index,
			int				inhibitAnyPolicy)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (h)
			//
			if (!PkixCertPathValidatorUtilities.IsSelfIssued(cert))
			{
				//
				// (3)
				//
				if (inhibitAnyPolicy != 0)
					return inhibitAnyPolicy - 1;
			}
			return inhibitAnyPolicy;
		}

		internal static int WrapupCertA(
			int				explicitPolicy,
			X509Certificate	cert)
		{
			//
			// (a)
			//
			if (!PkixCertPathValidatorUtilities.IsSelfIssued(cert) && (explicitPolicy != 0))
			{
				explicitPolicy--;
			}
			return explicitPolicy;
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static int WrapupCertB(
			PkixCertPath	certPath,
			int				index,
			int				explicitPolicy)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (b)
			//
			Asn1Sequence pc;
			try
			{
                pc = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.PolicyConstraints));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Policy constraints could not be decoded.", e, index);
			}

			if (pc != null)
			{
				foreach (var policyConstraint in pc)
				{
					Asn1TaggedObject constraint = Asn1TaggedObject.GetInstance(policyConstraint);
					if (constraint.HasContextTag(0))
                    {
						int tmpInt;
						try
						{
							tmpInt = DerInteger.GetInstance(constraint, false).IntValueExact;
						}
						catch (Exception e)
						{
							throw new PkixCertPathValidatorException(
								"Policy constraints requireExplicitPolicy field could not be decoded.", e, index);
						}
						if (tmpInt == 0)
							return 0;

						break;
					}
				}
			}
			return explicitPolicy;
		}

		/// <exception cref="PkixCertPathValidatorException"/>
		internal static void WrapupCertF(PkixCertPath certPath, int index, IList<PkixCertPathChecker> checkers,
			ISet<string> criticalExtensions)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			foreach (var checker in checkers)
			{
				try
				{
					checker.Check(cert, criticalExtensions);
				}
				catch (PkixCertPathValidatorException e)
				{
					throw new PkixCertPathValidatorException("Additional certificate path checker failed.", e, index);
				}
			}

			if (criticalExtensions.Count > 0)
			{
				throw new PkixCertPathValidatorException("Certificate has unsupported critical extension",
					null, index);
			}
		}

		internal static PkixPolicyNode WrapupCertG(PkixCertPath certPath, PkixParameters paramsPKIX,
			ISet<string> userInitialPolicySet, int index, IList<PkixPolicyNode>[] policyNodes,
			PkixPolicyNode validPolicyTree, ISet<string> acceptablePolicies)
		{
			int n = certPath.Certificates.Count;

			//
			// (g)
			//
			PkixPolicyNode intersection;

			//
			// (g) (i)
			//
			if (validPolicyTree == null)
			{
				if (paramsPKIX.IsExplicitPolicyRequired)
				{
					throw new PkixCertPathValidatorException(
						"Explicit policy requested but none available.", null, index);
				}
				intersection = null;
			}
			else if (PkixCertPathValidatorUtilities.IsAnyPolicy(userInitialPolicySet)) // (g) (ii)
			{
				if (paramsPKIX.IsExplicitPolicyRequired)
				{
					if (acceptablePolicies.Count < 1)
					{
						throw new PkixCertPathValidatorException(
							"Explicit policy requested but none available.", null, index);
					}

					var _validPolicyNodeSet = new HashSet<PkixPolicyNode>();

					foreach (var _nodeDepth in policyNodes)
					{
                        foreach (var _node in _nodeDepth)
                        {
							if (ANY_POLICY.Equals(_node.ValidPolicy))
							{
								foreach (var o in _node.Children)
								{
									_validPolicyNodeSet.Add(o);
								}
							}
						}
					}

					foreach (var _node in _validPolicyNodeSet)
					{
						if (!acceptablePolicies.Contains(_node.ValidPolicy))
						{
							// TODO?
							// validPolicyTree =
							// removePolicyNode(validPolicyTree, policyNodes,
							// _node);
						}
					}
					if (validPolicyTree != null)
					{
						for (int j = n - 1; j >= 0; j--)
						{
							var nodes = policyNodes[j];

							for (int k = 0; k < nodes.Count; k++)
							{
								var node = nodes[k];
								if (!node.HasChildren)
								{
									validPolicyTree = PkixCertPathValidatorUtilities.RemovePolicyNode(
										validPolicyTree, policyNodes, node);
								}
							}
						}
					}
				}

				intersection = validPolicyTree;
			}
			else
			{
				//
				// (g) (iii)
				//
				// This implementation is not exactly same as the one described in
				// RFC3280.
				// However, as far as the validation result is concerned, both
				// produce
				// adequate result. The only difference is whether AnyPolicy is
				// remain
				// in the policy tree or not.
				//
				// (g) (iii) 1
				//
				var _validPolicyNodeSet = new HashSet<PkixPolicyNode>();

				foreach (var _nodeDepth in policyNodes)
				{
					foreach (var _node in _nodeDepth)
					{
						if (ANY_POLICY.Equals(_node.ValidPolicy))
						{
							foreach (PkixPolicyNode _c_node in _node.Children)
							{
								if (!ANY_POLICY.Equals(_c_node.ValidPolicy))
								{
									_validPolicyNodeSet.Add(_c_node);
								}
							}
						}
					}
				}

				//
				// (g) (iii) 2
				//
				foreach (var _node in _validPolicyNodeSet)
				{
					if (!userInitialPolicySet.Contains(_node.ValidPolicy))
					{
						validPolicyTree = PkixCertPathValidatorUtilities.RemovePolicyNode(validPolicyTree, policyNodes,
							_node);
					}
				}

				//
				// (g) (iii) 4
				//
				if (validPolicyTree != null)
				{
					for (int j = n - 1; j >= 0; j--)
					{
						var nodes = policyNodes[j];

						for (int k = 0; k < nodes.Count; k++)
						{
							var node = nodes[k];
							if (!node.HasChildren)
							{
								validPolicyTree = PkixCertPathValidatorUtilities.RemovePolicyNode(validPolicyTree,
									policyNodes, node);
							}
						}
					}
				}

				intersection = validPolicyTree;
			}
			return intersection;
		}

		/**
		* If use-deltas is set, verify the issuer and scope of the delta CRL.
		*
		* @param deltaCRL    The delta CRL.
		* @param completeCRL The complete CRL.
		* @param pkixParams  The PKIX paramaters.
		* @throws AnnotatedException if an exception occurs.
		*/
		internal static void ProcessCrlC(
			X509Crl			deltaCRL,
			X509Crl			completeCRL,
			PkixParameters	pkixParams)
		{
			if (deltaCRL == null)
				return;

			IssuingDistributionPoint completeidp = null;
			try
			{
				completeidp = IssuingDistributionPoint.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(completeCRL, X509Extensions.IssuingDistributionPoint));
			}
			catch (Exception e)
			{
				throw new Exception("000 Issuing distribution point extension could not be decoded.", e);
			}

			if (pkixParams.IsUseDeltasEnabled)
			{
				// (c) (1)
				if (!deltaCRL.IssuerDN.Equivalent(completeCRL.IssuerDN, true))
					throw new Exception("Complete CRL issuer does not match delta CRL issuer.");

				// (c) (2)
				IssuingDistributionPoint deltaidp = null;
				try
				{
					deltaidp = IssuingDistributionPoint.GetInstance(
						PkixCertPathValidatorUtilities.GetExtensionValue(deltaCRL, X509Extensions.IssuingDistributionPoint));
				}
				catch (Exception e)
				{
					throw new Exception(
						"Issuing distribution point extension from delta CRL could not be decoded.", e);
				}

				if (!Platform.Equals(completeidp, deltaidp))
				{
					throw new Exception(
						"Issuing distribution point extension from delta CRL and complete CRL does not match.");
				}

				// (c) (3)
				Asn1Object completeKeyIdentifier = null;
				try
				{
					completeKeyIdentifier = PkixCertPathValidatorUtilities.GetExtensionValue(
						completeCRL, X509Extensions.AuthorityKeyIdentifier);
				}
				catch (Exception e)
				{
					throw new Exception(
						"Authority key identifier extension could not be extracted from complete CRL.", e);
				}

				Asn1Object deltaKeyIdentifier = null;
				try
				{
					deltaKeyIdentifier = PkixCertPathValidatorUtilities.GetExtensionValue(
						deltaCRL, X509Extensions.AuthorityKeyIdentifier);
				}
				catch (Exception e)
				{
					throw new Exception(
						"Authority key identifier extension could not be extracted from delta CRL.", e);
				}

				if (completeKeyIdentifier == null)
					throw new Exception("CRL authority key identifier is null.");

				if (deltaKeyIdentifier == null)
					throw new Exception("Delta CRL authority key identifier is null.");

				if (!completeKeyIdentifier.Equals(deltaKeyIdentifier))
				{
					throw new Exception(
						"Delta CRL authority key identifier does not match complete CRL authority key identifier.");
				}
			}
		}

		internal static void ProcessCrlI(
			DateTime		validDate,
			X509Crl			deltacrl,
			object			cert,
			CertStatus		certStatus,
			PkixParameters	pkixParams)
		{
			if (pkixParams.IsUseDeltasEnabled && deltacrl != null)
			{
				PkixCertPathValidatorUtilities.GetCertStatus(validDate, deltacrl, cert, certStatus);
			}
		}

		internal static void ProcessCrlJ(
			DateTime	validDate,
			X509Crl		completecrl,
			object		cert,
			CertStatus	certStatus)
		{
			if (certStatus.Status == CertStatus.Unrevoked)
			{
				PkixCertPathValidatorUtilities.GetCertStatus(validDate, completecrl, cert, certStatus);
			}
		}

		internal static PkixPolicyNode ProcessCertE(
			PkixCertPath	certPath,
			int				index,
			PkixPolicyNode	validPolicyTree)
		{
			var certs = certPath.Certificates;
			X509Certificate cert = certs[index];

			//
			// (e)
			//
			Asn1Sequence certPolicies = null;
			try
			{
                certPolicies = Asn1Sequence.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(cert, X509Extensions.CertificatePolicies));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("Could not read certificate policies extension from certificate.",
					e, index);
			}
			if (certPolicies == null)
			{
				validPolicyTree = null;
			}
			return validPolicyTree;
		}

		internal static readonly string[] CrlReasons = new string[]
		{
			"unspecified",
			"keyCompromise",
			"cACompromise",
			"affiliationChanged",
			"superseded",
			"cessationOfOperation",
			"certificateHold",
			"unknown",
			"removeFromCRL",
			"privilegeWithdrawn",
			"aACompromise"
		};
	}
}
