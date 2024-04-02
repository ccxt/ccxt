using System;
using System.Runtime.Serialization;

using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pkix
{
	/**
	 * An exception indicating one of a variety of problems encountered when 
	 * validating a certification path. <br />
	 * <br />
	 * A <code>CertPathValidatorException</code> provides support for wrapping
	 * exceptions. The {@link #getCause getCause} method returns the throwable, 
	 * if any, that caused this exception to be thrown. <br />
	 * <br />
	 * A <code>CertPathValidatorException</code> may also include the 
	 * certification path that was being validated when the exception was thrown 
	 * and the index of the certificate in the certification path that caused the 
	 * exception to be thrown. Use the {@link #getCertPath getCertPath} and
	 * {@link #getIndex getIndex} methods to retrieve this information.<br />
	 * <br />
	 * <b>Concurrent Access</b><br />
	 * <br />
	 * Unless otherwise specified, the methods defined in this class are not
	 * thread-safe. Multiple threads that need to access a single
	 * object concurrently should synchronize amongst themselves and
	 * provide the necessary locking. Multiple threads each manipulating
	 * separate objects need not synchronize.
	 *
	 * @see CertPathValidator
	 **/
    [Serializable]
    public class PkixCertPathValidatorException
        : GeneralSecurityException
	{
		protected readonly int m_index = -1;

		public PkixCertPathValidatorException()
			: base()
		{
		}

		public PkixCertPathValidatorException(string message)
			: base(message)
		{
		}

		public PkixCertPathValidatorException(string message, Exception innerException)
			: base(message, innerException)
		{
		}

		/// <summary>
		/// Creates a <code>PkixCertPathValidatorException</code> with the specified
		/// detail message, cause, certification path, and index.
		/// </summary>
		/// <param name="message">the detail message (or <code>null</code> if none)</param>
		/// <param name="innerException">the cause (or <code>null</code> if none)</param>
		/// <param name="index">the index of the certificate in the certification path that</param>																																																																																   * 
		public PkixCertPathValidatorException(string message, Exception innerException, int index)
			: base(message, innerException)
		{
			if (index < -1)
				throw new ArgumentException("cannot be < -1", nameof(index));

			m_index = index;
		}

		protected PkixCertPathValidatorException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
			m_index = info.GetInt32("index");
		}

		public override void GetObjectData(SerializationInfo info, StreamingContext context)
		{
			base.GetObjectData(info, context);
			info.AddValue("index", m_index);
		}

		/// <summary> eturns the index of the certificate in the certification path that caused the exception to be
		/// thrown.</summary>
		/// <remarks>
		/// Note that the list of certificates in a <see cref="PkixCertPath"/> is zero based. If no index has been set,
		/// -1 is returned.
		/// </remarks>
		/// <returns>The index that has been set, or -1 if none has been set.</returns>
		public int Index
		{
			get { return m_index; }
		}
	}
}
