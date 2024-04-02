using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.X509.Store;

namespace Org.BouncyCastle.Pkix
{
	internal static class Rfc3281CertPathUtilities
	{
		internal static void ProcessAttrCert7(
			X509V2AttributeCertificate	attrCert,
			PkixCertPath				certPath,
			PkixCertPath				holderCertPath,
			PkixParameters				pkixParams)
		{
			// TODO:
			// AA Controls
			// Attribute encryption
			// Proxy
			var critExtOids = attrCert.GetCriticalExtensionOids();

			// 7.1
			// process extensions

			// target information checked in step 6 / X509AttributeCertStoreSelector
			if (critExtOids.Contains(X509Extensions.TargetInformation.Id))
			{
				try
				{
					TargetInformation.GetInstance(PkixCertPathValidatorUtilities
						.GetExtensionValue(attrCert, X509Extensions.TargetInformation));
				}
				catch (Exception e)
				{
					throw new PkixCertPathValidatorException(
						"Target information extension could not be read.", e);
				}
			}
			critExtOids.Remove(X509Extensions.TargetInformation.Id);
			foreach (PkixAttrCertChecker checker in pkixParams.GetAttrCertCheckers())
			{
				checker.Check(attrCert, certPath, holderCertPath, critExtOids);
			}
			if (critExtOids.Count > 0)
			{
				throw new PkixCertPathValidatorException(
					"Attribute certificate contains unsupported critical extensions: " + critExtOids);
			}
		}

		/**
		* Checks if an attribute certificate is revoked.
		* 
		* @param attrCert Attribute certificate to check if it is revoked.
		* @param paramsPKIX PKIX parameters.
		* @param issuerCert The issuer certificate of the attribute certificate
		*            <code>attrCert</code>.
		* @param validDate The date when the certificate revocation status should
		*            be checked.
		* @param certPathCerts The certificates of the certification path to be
		*            checked.
		* 
		* @throws CertPathValidatorException if the certificate is revoked or the
		*             status cannot be checked or some error occurs.
		*/
		internal static void CheckCrls(
			X509V2AttributeCertificate  attrCert,
			PkixParameters				paramsPKIX,
			X509Certificate				issuerCert,
			DateTime					validDate,
			IList<X509Certificate>		certPathCerts)
		{
			if (!paramsPKIX.IsRevocationEnabled)
                return;

            // check if revocation is available
            if (attrCert.GetExtensionValue(X509Extensions.NoRevAvail) != null)
            {
                if (attrCert.GetExtensionValue(X509Extensions.CrlDistributionPoints) != null ||
                    attrCert.GetExtensionValue(X509Extensions.AuthorityInfoAccess) != null)
                {
                    throw new PkixCertPathValidatorException(
                        "No rev avail extension is set, but also an AC revocation pointer.");
                }

                return;
            }

            CrlDistPoint crldp;
			try
			{
				crldp = CrlDistPoint.GetInstance(
					PkixCertPathValidatorUtilities.GetExtensionValue(attrCert, X509Extensions.CrlDistributionPoints));
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException("CRL distribution point extension could not be read.", e);
			}

			try
			{
				PkixCertPathValidatorUtilities.AddAdditionalStoresFromCrlDistributionPoint(crldp, paramsPKIX);
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException(
					"No additional CRL locations could be decoded from CRL distribution point extension.", e);
			}

			CertStatus certStatus = new CertStatus();
			ReasonsMask reasonsMask = new ReasonsMask();

			Exception lastException = null;
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
					throw new PkixCertPathValidatorException("Distribution points could not be read.", e);
				}
				try
				{
					for (int i = 0;
						i < dps.Length && certStatus.Status == CertStatus.Unrevoked && !reasonsMask.IsAllReasons;
						i++)
					{
						PkixParameters paramsPKIXClone = (PkixParameters)paramsPKIX.Clone();
						CheckCrl(dps[i], attrCert, paramsPKIXClone,validDate, issuerCert, certStatus, reasonsMask,
							certPathCerts);
						validCrlFound = true;
					}
				}
				catch (Exception e)
				{
					lastException = new Exception("No valid CRL for distribution point found.", e);
				}
			}

			/*
			* If the revocation status has not been determined, repeat the
			* process above with any available CRLs not specified in a
			* distribution point but issued by the certificate issuer.
			*/

			if (certStatus.Status == CertStatus.Unrevoked && !reasonsMask.IsAllReasons)
			{
				try
				{
					/*
					* assume a DP with both the reasons and the cRLIssuer
					* fields omitted and a distribution point name of the
					* certificate issuer.
					*/
                    X509Name issuer;
                    try
                    {
                        issuer = X509Name.GetInstance(attrCert.Issuer.GetPrincipals()[0].GetEncoded());
                    }
                    catch (Exception e)
					{
						throw new Exception("Issuer from certificate for CRL could not be reencoded.", e);
					}
					DistributionPoint dp = new DistributionPoint(
						new DistributionPointName(0, new GeneralNames(
							new GeneralName(GeneralName.DirectoryName, issuer))), null, null);
					PkixParameters paramsPKIXClone = (PkixParameters) paramsPKIX.Clone();
					CheckCrl(dp, attrCert, paramsPKIXClone, validDate,
						issuerCert, certStatus, reasonsMask, certPathCerts);
					validCrlFound = true;
				}
				catch (Exception e)
				{
					lastException = new Exception("No valid CRL for distribution point found.", e);
				}
			}

			if (!validCrlFound)
				throw new PkixCertPathValidatorException("No valid CRL found.", lastException);

			if (certStatus.Status != CertStatus.Unrevoked)
			{
                // This format is enforced by the NistCertPath tests
                string formattedDate = certStatus.RevocationDate.Value.ToString("ddd MMM dd HH:mm:ss K yyyy");
                string message = "Attribute certificate revocation after " + formattedDate + ", reason: "
					+ Rfc3280CertPathUtilities.CrlReasons[certStatus.Status];
				throw new PkixCertPathValidatorException(message);
			}
			if (!reasonsMask.IsAllReasons
				&& certStatus.Status == CertStatus.Unrevoked)
			{
				certStatus.Status = CertStatus.Undetermined;
			}
			if (certStatus.Status == CertStatus.Undetermined)
			{
				throw new PkixCertPathValidatorException(
					"Attribute certificate status could not be determined.");
			}
		}

		internal static void AdditionalChecks(
			X509V2AttributeCertificate  attrCert,
			PkixParameters				pkixParams)
		{
			// 1
			foreach (string oid in pkixParams.GetProhibitedACAttributes())
			{
				if (attrCert.GetAttributes(oid) != null)
				{
					throw new PkixCertPathValidatorException(
						"Attribute certificate contains prohibited attribute: "
							+ oid + ".");
				}
			}
			foreach (string oid in pkixParams.GetNecessaryACAttributes())
			{
				if (attrCert.GetAttributes(oid) == null)
				{
					throw new PkixCertPathValidatorException(
						"Attribute certificate does not contain necessary attribute: "
							+ oid + ".");
				}
			}
		}

		internal static void ProcessAttrCert5(
			X509V2AttributeCertificate  attrCert,
			PkixParameters				pkixParams)
		{
			try
			{
				attrCert.CheckValidity(PkixCertPathValidatorUtilities.GetValidDate(pkixParams));
			}
			catch (CertificateExpiredException e)
			{
				throw new PkixCertPathValidatorException(
					"Attribute certificate is not valid.", e);
			}
			catch (CertificateNotYetValidException e)
			{
				throw new PkixCertPathValidatorException(
					"Attribute certificate is not valid.", e);
			}
		}

		internal static void ProcessAttrCert4(
			X509Certificate	acIssuerCert,
			PkixParameters	pkixParams)
		{
			var set = pkixParams.GetTrustedACIssuers();
			bool trusted = false;
			foreach (TrustAnchor anchor in set)
			{
                var symbols = X509Name.RFC2253Symbols;
                if (acIssuerCert.SubjectDN.ToString(false, symbols).Equals(anchor.CAName)
					|| acIssuerCert.Equals(anchor.TrustedCert))
				{
					trusted = true;
				}
			}
			if (!trusted)
			{
				throw new PkixCertPathValidatorException(
					"Attribute certificate issuer is not directly trusted.");
			}
		}

		internal static void ProcessAttrCert3(
			X509Certificate	acIssuerCert,
			PkixParameters	pkixParams)
		{
			if (acIssuerCert.GetKeyUsage() != null
				&& (!acIssuerCert.GetKeyUsage()[0] && !acIssuerCert.GetKeyUsage()[1]))
			{
				throw new PkixCertPathValidatorException(
					"Attribute certificate issuer public key cannot be used to validate digital signatures.");
			}
			if (acIssuerCert.GetBasicConstraints() != -1)
			{
				throw new PkixCertPathValidatorException(
					"Attribute certificate issuer is also a public key certificate issuer.");
			}
		}

		internal static PkixCertPathValidatorResult ProcessAttrCert2(
			PkixCertPath	certPath,
			PkixParameters	pkixParams)
		{
			PkixCertPathValidator validator = new PkixCertPathValidator();

			try
			{
				return validator.Validate(certPath, pkixParams);
			}
			catch (PkixCertPathValidatorException e)
			{
				throw new PkixCertPathValidatorException(
					"Certification path for issuer certificate of attribute certificate could not be validated.",
					e);
			}
		}

		/**
		* Searches for a holder public key certificate and verifies its
		* certification path.
		* 
		* @param attrCert the attribute certificate.
		* @param pkixParams The PKIX parameters.
		* @return The certificate path of the holder certificate.
		* @throws Exception if
		*             <ul>
		*             <li>no public key certificate can be found although holder
		*             information is given by an entity name or a base certificate
		*             ID</li>
		*             <li>support classes cannot be created</li>
		*             <li>no certification path for the public key certificate can
		*             be built</li>
		*             </ul>
		*/
		internal static PkixCertPath ProcessAttrCert1(
			X509V2AttributeCertificate  attrCert,
			PkixParameters				pkixParams)
		{
			PkixCertPathBuilderResult result = null;
			// find holder PKCs
			var holderPKCs = new HashSet<X509Certificate>();
			if (attrCert.Holder.GetIssuer() != null)
			{
				X509CertStoreSelector selector = new X509CertStoreSelector();
				selector.SerialNumber = attrCert.Holder.SerialNumber;
				X509Name[] principals = attrCert.Holder.GetIssuer();
				for (int i = 0; i < principals.Length; i++)
				{
					// TODO Replace loop with a single multiprincipal selector (or don't even use selector)
					try
					{
						selector.Issuer = principals[i];

						CollectionUtilities.CollectMatches(holderPKCs, selector, pkixParams.GetStoresCert());
					}
					catch (Exception e)
					{
						throw new PkixCertPathValidatorException(
							"Public key certificate for attribute certificate cannot be searched.",
							e);
					}
				}
				if (holderPKCs.Count < 1)
				{
					throw new PkixCertPathValidatorException(
						"Public key certificate specified in base certificate ID for attribute certificate cannot be found.");
				}
			}
			if (attrCert.Holder.GetEntityNames() != null)
			{
				X509CertStoreSelector selector = new X509CertStoreSelector();
				X509Name[] principals = attrCert.Holder.GetEntityNames();
				for (int i = 0; i < principals.Length; i++)
				{
					// TODO Replace loop with a single multiprincipal selector (or don't even use selector)
					try
					{
						selector.Issuer = principals[i];

						CollectionUtilities.CollectMatches(holderPKCs, selector, pkixParams.GetStoresCert());
					}
					catch (Exception e)
					{
						throw new PkixCertPathValidatorException(
							"Public key certificate for attribute certificate cannot be searched.",
							e);
					}
				}
				if (holderPKCs.Count < 1)
				{
					throw new PkixCertPathValidatorException(
						"Public key certificate specified in entity name for attribute certificate cannot be found.");
				}
			}

			// verify cert paths for PKCs
			PkixBuilderParameters parameters = PkixBuilderParameters.GetInstance(pkixParams);

			PkixCertPathValidatorException lastException = null;
			foreach (X509Certificate cert in holderPKCs)
			{
				X509CertStoreSelector certSelector = new X509CertStoreSelector();
				certSelector.Certificate = cert;

				parameters.SetTargetConstraintsCert(certSelector);

				PkixCertPathBuilder builder = new PkixCertPathBuilder();

				try
				{
					result = builder.Build(parameters);
				}
				catch (PkixCertPathBuilderException e)
				{
					lastException = new PkixCertPathValidatorException(
						"Certification path for public key certificate of attribute certificate could not be build.",
						e);
				}
			}
			if (lastException != null)
			{
				throw lastException;
			}
			return result.CertPath;
		}

		/**
		* 
		* Checks a distribution point for revocation information for the
		* certificate <code>attrCert</code>.
		* 
		* @param dp The distribution point to consider.
		* @param attrCert The attribute certificate which should be checked.
		* @param paramsPKIX PKIX parameters.
		* @param validDate The date when the certificate revocation status should
		*            be checked.
		* @param issuerCert Certificate to check if it is revoked.
		* @param reasonMask The reasons mask which is already checked.
		* @param certPathCerts The certificates of the certification path to be
		*            checked.
		* @throws Exception if the certificate is revoked or the status
		*             cannot be checked or some error occurs.
		*/
		private static void CheckCrl(
			DistributionPoint			dp,
			X509V2AttributeCertificate  attrCert,
			PkixParameters				paramsPKIX,
			DateTime					validDate,
			X509Certificate				issuerCert,
			CertStatus					certStatus,
			ReasonsMask					reasonMask,
			IList<X509Certificate>		certPathCerts)
		{
			/*
			* 4.3.6 No Revocation Available
			* 
			* The noRevAvail extension, defined in [X.509-2000], allows an AC
			* issuer to indicate that no revocation information will be made
			* available for this AC.
			*/
			if (attrCert.GetExtensionValue(X509Extensions.NoRevAvail) != null)
				return;

			DateTime currentDate = DateTime.UtcNow;
			if (validDate.CompareTo(currentDate) > 0)
				throw new Exception("Validation time is in future.");

			// (a)
			/*
			* We always get timely valid CRLs, so there is no step (a) (1).
			* "locally cached" CRLs are assumed to be in getStore(), additional
			* CRLs must be enabled in the ExtendedPkixParameters and are in
			* getAdditionalStore()
			*/
			var crls = PkixCertPathValidatorUtilities.GetCompleteCrls(dp, attrCert, currentDate, paramsPKIX);
			bool validCrlFound = false;
			Exception lastException = null;

			var crl_iter = crls.GetEnumerator();

			while (crl_iter.MoveNext()
				&& certStatus.Status == CertStatus.Unrevoked
				&& !reasonMask.IsAllReasons)
			{
				try
				{
					X509Crl crl = crl_iter.Current;

					// (d)
					ReasonsMask interimReasonsMask = Rfc3280CertPathUtilities.ProcessCrlD(crl, dp);

					// (e)
					/*
					* The reasons mask is updated at the end, so only valid CRLs
					* can update it. If this CRL does not contain new reasons it
					* must be ignored.
					*/
					if (!interimReasonsMask.HasNewReasons(reasonMask))
						continue;

					// (f)
					var keys = Rfc3280CertPathUtilities.ProcessCrlF(crl, attrCert,null, null, paramsPKIX,
						certPathCerts);

					// (g)
					AsymmetricKeyParameter pubKey = Rfc3280CertPathUtilities.ProcessCrlG(crl, keys);

					X509Crl deltaCRL = null;

					if (paramsPKIX.IsUseDeltasEnabled)
					{
						// get delta CRLs
						var deltaCRLs = PkixCertPathValidatorUtilities.GetDeltaCrls(currentDate, paramsPKIX, crl);

						// we only want one valid delta CRL
						// (h)
						deltaCRL = Rfc3280CertPathUtilities.ProcessCrlH(deltaCRLs, pubKey);
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
					* the CRL vality time
					*/
					if (paramsPKIX.ValidityModel != PkixParameters.ChainValidityModel)
					{
						/*
						* if a certificate has expired, but was revoked, it is not
						* more in the CRL, so it would be regarded as valid if the
						* first check is not done
						*/
						if (attrCert.NotAfter.CompareTo(crl.ThisUpdate) < 0)
							throw new Exception("No valid CRL for current time found.");
					}

					Rfc3280CertPathUtilities.ProcessCrlB1(dp, attrCert, crl);

					// (b) (2)
					Rfc3280CertPathUtilities.ProcessCrlB2(dp, attrCert, crl);

					// (c)
					Rfc3280CertPathUtilities.ProcessCrlC(deltaCRL, crl, paramsPKIX);

					// (i)
					Rfc3280CertPathUtilities.ProcessCrlI(validDate, deltaCRL,
						attrCert, certStatus, paramsPKIX);

					// (j)
					Rfc3280CertPathUtilities.ProcessCrlJ(validDate, crl, attrCert,
						certStatus);

					// (k)
					if (certStatus.Status == CrlReason.RemoveFromCrl)
					{
						certStatus.Status = CertStatus.Unrevoked;
					}

					// update reasons mask
					reasonMask.AddReasons(interimReasonsMask);
					validCrlFound = true;
				}
				catch (Exception e)
				{
					lastException = e;
				}
			}

			if (!validCrlFound)
				throw lastException;
		}
	}
}
