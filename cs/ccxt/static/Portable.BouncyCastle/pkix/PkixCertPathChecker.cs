using System.Collections.Generic;

using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Pkix
{
    public abstract class PkixCertPathChecker
    {
        protected PkixCertPathChecker()
        {
        }

        /**
         * Initializes the internal state of this <code>PKIXCertPathChecker</code>.
         * <p>
         * The <code>forward</code> flag specifies the order that certificates
         * will be passed to the {@link #check check} method (forward or reverse). A
         * <code>PKIXCertPathChecker</code> <b>must</b> support reverse checking
         * and <b>may</b> support forward checking.
		 * </p>
         * 
         * @param forward
         *            the order that certificates are presented to the
         *            <code>check</code> method. If <code>true</code>,
         *            certificates are presented from target to most-trusted CA
         *            (forward); if <code>false</code>, from most-trusted CA to
         *            target (reverse).
         * @exception CertPathValidatorException
         *                if this <code>PKIXCertPathChecker</code> is unable to
         *                check certificates in the specified order; it should never
         *                be thrown if the forward flag is false since reverse
         *                checking must be supported
         */
        public abstract void Init(bool forward);
        //throws CertPathValidatorException;

        /**
         * Indicates if forward checking is supported. Forward checking refers to
         * the ability of the <code>PKIXCertPathChecker</code> to perform its
         * checks when certificates are presented to the <code>check</code> method
         * in the forward direction (from target to most-trusted CA).
         * 
         * @return <code>true</code> if forward checking is supported,
         *         <code>false</code> otherwise
         */
        public abstract bool IsForwardCheckingSupported();

        /**
         * Returns an immutable <code>Set</code> of X.509 certificate extensions
         * that this <code>PKIXCertPathChecker</code> supports (i.e. recognizes,
         * is able to process), or <code>null</code> if no extensions are
         * supported.
         * <p>
         * Each element of the set is a <code>String</code> representing the
         * Object Identifier (OID) of the X.509 extension that is supported. The OID
         * is represented by a set of nonnegative integers separated by periods.
         * </p><p>
         * All X.509 certificate extensions that a <code>PKIXCertPathChecker</code>
         * might possibly be able to process should be included in the set.
		 * </p>
         * 
         * @return an immutable <code>Set</code> of X.509 extension OIDs (in
         *         <code>String</code> format) supported by this
         *         <code>PKIXCertPathChecker</code>, or <code>null</code> if no
         *         extensions are supported
         */
        public abstract ISet<string> GetSupportedExtensions();

        /**
         * Performs the check(s) on the specified certificate using its internal
         * state and removes any critical extensions that it processes from the
         * specified collection of OID strings that represent the unresolved
         * critical extensions. The certificates are presented in the order
         * specified by the <code>init</code> method.
         * 
         * @param cert
         *            the <code>Certificate</code> to be checked
         * @param unresolvedCritExts
         *            a <code>Collection</code> of OID strings representing the
         *            current set of unresolved critical extensions
         * @exception CertPathValidatorException
         *                if the specified certificate does not pass the check
         */
        public abstract void Check(X509Certificate cert, ISet<string> unresolvedCritExts);
        //throws CertPathValidatorException;

        /**
         * Returns a clone of this object. Calls the <code>Object.clone()</code>
         * method. All subclasses which maintain state must support and override
         * this method, if necessary.
         * 
         * @return a copy of this <code>PKIXCertPathChecker</code>
         */
        public virtual object Clone()
        {
			// TODO Check this
			return base.MemberwiseClone();
        }
    }
}
