using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Pkix
{
	public abstract class PkixAttrCertChecker
	{
		/**
		 * Returns an immutable <code>Set</code> of X.509 attribute certificate
		 * extensions that this <code>PkixAttrCertChecker</code> supports or
		 * <code>null</code> if no extensions are supported.
		 * <p>
		 * Each element of the set is a <code>String</code> representing the
		 * Object Identifier (OID) of the X.509 extension that is supported.
		 * </p>
		 * <p>
		 * All X.509 attribute certificate extensions that a
		 * <code>PkixAttrCertChecker</code> might possibly be able to process
		 * should be included in the set.
		 * </p>
		 * 
		 * @return an immutable <code>Set</code> of X.509 extension OIDs (in
		 *         <code>String</code> format) supported by this
		 *         <code>PkixAttrCertChecker</code>, or <code>null</code> if no
		 *         extensions are supported
		 */
		public abstract ISet<DerObjectIdentifier> GetSupportedExtensions();

		/**
		* Performs checks on the specified attribute certificate. Every handled
		* extension is rmeoved from the <code>unresolvedCritExts</code>
		* collection.
		* 
		* @param attrCert The attribute certificate to be checked.
		* @param certPath The certificate path which belongs to the attribute
		*            certificate issuer public key certificate.
		* @param holderCertPath The certificate path which belongs to the holder
		*            certificate.
		* @param unresolvedCritExts a <code>Collection</code> of OID strings
		*            representing the current set of unresolved critical extensions
		* @throws CertPathValidatorException if the specified attribute certificate
		*             does not pass the check.
		*/
		public abstract void Check(X509V2AttributeCertificate attrCert, PkixCertPath certPath,
			PkixCertPath holderCertPath, ICollection<string> unresolvedCritExts);

		/**
		* Returns a clone of this object.
		* 
		* @return a copy of this <code>PkixAttrCertChecker</code>
		*/
		public abstract PkixAttrCertChecker Clone();
	}
}
