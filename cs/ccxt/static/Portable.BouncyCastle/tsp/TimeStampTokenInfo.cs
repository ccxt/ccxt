using System;

using Org.BouncyCastle.Asn1.Tsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Tsp
{
	public class TimeStampTokenInfo
	{
		private TstInfo		tstInfo;
		private DateTime	genTime;

		public TimeStampTokenInfo(
			TstInfo tstInfo)
		{
			this.tstInfo = tstInfo;

			try
			{
				this.genTime = tstInfo.GenTime.ToDateTime();
			}
			catch (Exception e)
			{
				throw new TspException("unable to parse genTime field: " + e.Message);
			}
		}

		public bool IsOrdered
		{
			get { return tstInfo.Ordering.IsTrue; }
		}

		public Accuracy Accuracy
		{
			get { return tstInfo.Accuracy; }
		}

		public DateTime GenTime
		{
			get { return genTime; }
		}

		public GenTimeAccuracy GenTimeAccuracy
		{
			get
			{
				return this.Accuracy == null
					?	null
					:	new GenTimeAccuracy(this.Accuracy);
			}
		}

		public string Policy
		{
			get { return tstInfo.Policy.Id; }
		}

		public BigInteger SerialNumber
		{
			get { return tstInfo.SerialNumber.Value; }
		}

		public GeneralName Tsa
		{
			get { return tstInfo.Tsa; }
		}

		/**
		 * @return the nonce value, null if there isn't one.
		 */
		public BigInteger Nonce
		{
			get
			{
				return tstInfo.Nonce == null
					?	null
					:	tstInfo.Nonce.Value;
			}
		}

		public AlgorithmIdentifier HashAlgorithm
		{
			get { return tstInfo.MessageImprint.HashAlgorithm; }
		}

		public string MessageImprintAlgOid
		{
            get { return tstInfo.MessageImprint.HashAlgorithm.Algorithm.Id; }
		}

		public byte[] GetMessageImprintDigest()
		{
			return tstInfo.MessageImprint.GetHashedMessage();
		}

		public byte[] GetEncoded()
		{
			return tstInfo.GetEncoded();
		}

		public TstInfo TstInfo
		{
			get { return tstInfo; }
		}
	}
}
