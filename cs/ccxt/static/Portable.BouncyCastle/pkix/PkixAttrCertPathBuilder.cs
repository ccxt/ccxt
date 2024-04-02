using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.X509.Store;

namespace Org.BouncyCastle.Pkix
{
	public class PkixAttrCertPathBuilder
	{
		/**
		* Build and validate a CertPath using the given parameter.
		*
		* @param params PKIXBuilderParameters object containing all information to
		*            build the CertPath
		*/
		public virtual PkixCertPathBuilderResult Build(PkixBuilderParameters pkixParams)
		{
			// search target certificates

			if (!(pkixParams.GetTargetConstraintsAttrCert() is X509AttrCertStoreSelector attrCertSelector))
			{
				throw new PkixCertPathBuilderException(
					"TargetConstraints must be an instance of "
					+ typeof(X509AttrCertStoreSelector).FullName
					+ " for "
					+ typeof(PkixAttrCertPathBuilder).FullName + " class.");
			}

			HashSet<X509V2AttributeCertificate> targets;
			try
			{
				targets = FindAttributeCertificates(attrCertSelector, pkixParams.GetStoresAttrCert());
			}
			catch (Exception e)
			{
				throw new PkixCertPathBuilderException("Error finding target attribute certificate.", e);
			}

			if (targets.Count == 0)
				throw new PkixCertPathBuilderException("No attribute certificate found matching targetConstraints.");

			PkixCertPathBuilderResult result = null;

			// check all potential target certificates
			foreach (var target in targets)
			{
				X509CertStoreSelector certSelector = new X509CertStoreSelector();
				X509Name[] principals = target.Issuer.GetPrincipals();
				var issuers = new HashSet<X509Certificate>();
				for (int i = 0; i < principals.Length; i++)
				{
					// TODO Replace loop with a single multiprincipal selector (or don't even use selector)
					try
					{
						certSelector.Subject = principals[i];

						CollectionUtilities.CollectMatches(issuers, certSelector, pkixParams.GetStoresCert());
					}
					catch (Exception e)
					{
						throw new PkixCertPathBuilderException(
							"Public key certificate for attribute certificate cannot be searched.",
							e);
					}
				}

				if (issuers.Count < 1)
					throw new PkixCertPathBuilderException("Public key certificate for attribute certificate cannot be found.");

                var certPathList = new List<X509Certificate>();

				foreach (X509Certificate issuer in issuers)
				{
					result = Build(target, issuer, pkixParams, certPathList);

					if (result != null)
						break;
				}

				if (result != null)
					break;
			}

			if (result == null && certPathException != null)
				throw new PkixCertPathBuilderException("Possible certificate chain could not be validated.",
					certPathException);

			if (result == null && certPathException == null)
				throw new PkixCertPathBuilderException("Unable to find certificate chain.");

			return result;
		}

		private Exception certPathException;

		private PkixCertPathBuilderResult Build(
			X509V2AttributeCertificate  attrCert,
			X509Certificate				tbvCert,
			PkixBuilderParameters		pkixParams,
			IList<X509Certificate>      tbvPath)
		{
			// If tbvCert is readily present in tbvPath, it indicates having run
			// into a cycle in the
			// PKI graph.
			if (tbvPath.Contains(tbvCert))
				return null;

			// step out, the certificate is not allowed to appear in a certification
			// chain
			if (pkixParams.GetExcludedCerts().Contains(tbvCert))
				return null;

			// test if certificate path exceeds maximum length
			if (pkixParams.MaxPathLength != -1)
			{
				if (tbvPath.Count - 1 > pkixParams.MaxPathLength)
					return null;
			}

			tbvPath.Add(tbvCert);

			PkixCertPathBuilderResult builderResult = null;

//			X509CertificateParser certParser = new X509CertificateParser();
			PkixAttrCertPathValidator validator = new PkixAttrCertPathValidator();

			try
			{
				// check whether the issuer of <tbvCert> is a TrustAnchor
				if (PkixCertPathValidatorUtilities.IsIssuerTrustAnchor(tbvCert, pkixParams.GetTrustAnchors()))
				{
					PkixCertPath certPath = new PkixCertPath(tbvPath);
					PkixCertPathValidatorResult result;

					try
					{
						result = validator.Validate(certPath, pkixParams);
					}
					catch (Exception e)
					{
						throw new Exception("Certification path could not be validated.", e);
					}

					return new PkixCertPathBuilderResult(certPath, result.TrustAnchor,
						result.PolicyTree, result.SubjectPublicKey);
				}
				else
				{
					// add additional X.509 stores from locations in certificate
					try
					{
						PkixCertPathValidatorUtilities.AddAdditionalStoresFromAltNames(tbvCert, pkixParams);
					}
					catch (CertificateParsingException e)
					{
						throw new Exception("No additional X.509 stores can be added from certificate locations.", e);
					}

					// try to get the issuer certificate from one of the stores
					ISet<X509Certificate> issuers;
					try
					{
						issuers = PkixCertPathValidatorUtilities.FindIssuerCerts(tbvCert, pkixParams);
					}
					catch (Exception e)
					{
						throw new Exception("Cannot find issuer certificate for certificate in certification path.", e);
					}

					if (issuers.Count < 1)
						throw new Exception("No issuer certificate for certificate in certification path found.");

					foreach (X509Certificate issuer in issuers)
					{
						// if untrusted self signed certificate continue
						if (PkixCertPathValidatorUtilities.IsSelfIssued(issuer))
							continue;

						builderResult = Build(attrCert, issuer, pkixParams, tbvPath);

						if (builderResult != null)
							break;
					}
				}
			}
			catch (Exception e)
			{
				certPathException = new Exception("No valid certification path could be build.", e);
			}

			if (builderResult == null)
			{
				tbvPath.Remove(tbvCert);
			}

			return builderResult;
		}

		internal static HashSet<X509V2AttributeCertificate> FindAttributeCertificates(
			ISelector<X509V2AttributeCertificate> attrCertSelector,
			IList<IStore<X509V2AttributeCertificate>> attrCertStores)
		{
			var attrCerts = new HashSet<X509V2AttributeCertificate>();

			foreach (var attrCertStore in attrCertStores)
			{
				try
				{
					attrCerts.UnionWith(attrCertStore.EnumerateMatches(attrCertSelector));
				}
				catch (Exception e)
				{
					throw new Exception("Problem while picking certificates from X.509 store.", e);
				}
			}

			return attrCerts;
		}
	}
}
