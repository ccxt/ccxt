using System;

using Org.BouncyCastle.X509;
using Org.BouncyCastle.X509.Store;

namespace Org.BouncyCastle.Pkix
{
	/**
	* CertPathValidatorSpi implementation for X.509 Attribute Certificates la RFC 3281.
	* 
	* @see org.bouncycastle.x509.ExtendedPkixParameters
	*/
	public class PkixAttrCertPathValidator
	//    extends CertPathValidatorSpi
	{
		/**
		* Validates an attribute certificate with the given certificate path.
		* 
		* <p>
		* <code>params</code> must be an instance of
		* <code>ExtendedPkixParameters</code>.
		* </p><p>
		* The target constraints in the <code>params</code> must be an
		* <code>X509AttrCertStoreSelector</code> with at least the attribute
		* certificate criterion set. Obey that also target informations may be
		* necessary to correctly validate this attribute certificate.
		* </p><p>
		* The attribute certificate issuer must be added to the trusted attribute
		* issuers with {@link ExtendedPkixParameters#setTrustedACIssuers(Set)}.
		* </p>
		* @param certPath The certificate path which belongs to the attribute
		*            certificate issuer public key certificate.
		* @param params The PKIX parameters.
		* @return A <code>PKIXCertPathValidatorResult</code> of the result of
		*         validating the <code>certPath</code>.
		* @throws InvalidAlgorithmParameterException if <code>params</code> is
		*             inappropriate for this validator.
		* @throws CertPathValidatorException if the verification fails.
		*/
		public virtual PkixCertPathValidatorResult Validate(PkixCertPath certPath, PkixParameters pkixParams)
		{
			if (!(pkixParams.GetTargetConstraintsAttrCert() is X509AttrCertStoreSelector attrCertSelector))
			{
				throw new ArgumentException(
					"TargetConstraints must be an instance of " + typeof(X509AttrCertStoreSelector).FullName,
					nameof(pkixParams));
			}

			var attrCert = attrCertSelector.AttributeCert;
			PkixCertPath holderCertPath = Rfc3281CertPathUtilities.ProcessAttrCert1(attrCert, pkixParams);
			PkixCertPathValidatorResult result = Rfc3281CertPathUtilities.ProcessAttrCert2(certPath, pkixParams);
			X509Certificate issuerCert = (X509Certificate)certPath.Certificates[0];
			Rfc3281CertPathUtilities.ProcessAttrCert3(issuerCert, pkixParams);
			Rfc3281CertPathUtilities.ProcessAttrCert4(issuerCert, pkixParams);
			Rfc3281CertPathUtilities.ProcessAttrCert5(attrCert, pkixParams);
			// 6 already done in X509AttrCertStoreSelector
			Rfc3281CertPathUtilities.ProcessAttrCert7(attrCert, certPath, holderCertPath, pkixParams);
			Rfc3281CertPathUtilities.AdditionalChecks(attrCert, pkixParams);
			DateTime date;
			try
			{
				date = PkixCertPathValidatorUtilities.GetValidCertDateFromValidityModel(pkixParams, null, -1);
			}
			catch (Exception e)
			{
				throw new PkixCertPathValidatorException(
					"Could not get validity date from attribute certificate.", e);
			}
			Rfc3281CertPathUtilities.CheckCrls(attrCert, pkixParams, issuerCert, date, certPath.Certificates);
			return result;
		}
	}
}
