using System;
using System.Runtime.Serialization;

namespace Org.BouncyCastle.Tsp
{
	/**
	 * Exception thrown if a TSP request or response fails to validate.
	 * <p>
	 * If a failure code is associated with the exception it can be retrieved using
	 * the getFailureCode() method.</p>
	 */
    [Serializable]
    public class TspValidationException
		: TspException
	{
		protected readonly int m_failureCode;

		public TspValidationException(string message)
			: this(message, -1)
		{
		}

		public TspValidationException(string message, int failureCode)
			: base(message)
		{
			m_failureCode = failureCode;
		}

		protected TspValidationException(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
			m_failureCode = info.GetInt32("failureCode");
		}

		public override void GetObjectData(SerializationInfo info, StreamingContext context)
		{
			base.GetObjectData(info, context);
			info.AddValue("failureCode", m_failureCode);
		}

		/// <returns>The failure code associated with this exception, if one is set.</returns>
		public int FailureCode
		{
			get { return m_failureCode; }
		}
	}
}
