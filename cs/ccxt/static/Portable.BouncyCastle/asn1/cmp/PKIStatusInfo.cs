using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class PkiStatusInfo
		: Asn1Encodable
	{
		DerInteger      status;
		PkiFreeText     statusString;
		DerBitString    failInfo;

		public static PkiStatusInfo GetInstance(
			Asn1TaggedObject obj,
			bool isExplicit)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
		}

		public static PkiStatusInfo GetInstance(
			object obj)
		{
			if (obj is PkiStatusInfo)
			{
				return (PkiStatusInfo)obj;
			}
			else if (obj is Asn1Sequence)
			{
				return new PkiStatusInfo((Asn1Sequence)obj);
			}

            throw new ArgumentException("Unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public PkiStatusInfo(
			Asn1Sequence seq)
		{
			this.status = DerInteger.GetInstance(seq[0]);

			this.statusString = null;
			this.failInfo = null;

			if (seq.Count > 2)
			{
				this.statusString = PkiFreeText.GetInstance(seq[1]);
				this.failInfo = DerBitString.GetInstance(seq[2]);
			}
			else if (seq.Count > 1)
			{
				object obj = seq[1];
				if (obj is DerBitString)
				{
					this.failInfo = DerBitString.GetInstance(obj);
				}
				else
				{
					this.statusString = PkiFreeText.GetInstance(obj);
				}
			}
		}

		/**
		 * @param status
		 */
		public PkiStatusInfo(int status)
		{
			this.status = new DerInteger(status);
		}

		/**
		 * @param status
		 * @param statusString
		 */
		public PkiStatusInfo(
			int			status,
			PkiFreeText	statusString)
		{
			this.status = new DerInteger(status);
			this.statusString = statusString;
		}

		public PkiStatusInfo(
			int				status,
			PkiFreeText		statusString,
			PkiFailureInfo	failInfo)
		{
			this.status = new DerInteger(status);
			this.statusString = statusString;
			this.failInfo = failInfo;
		}

		public BigInteger Status
		{
			get
			{
				return status.Value;
			}
		}

		public PkiFreeText StatusString
		{
			get
			{
				return statusString;
			}
		}

		public DerBitString FailInfo
		{
			get
			{
				return failInfo;
			}
		}

		/**
		 * <pre>
		 * PkiStatusInfo ::= SEQUENCE {
		 *     status        PKIStatus,                (INTEGER)
		 *     statusString  PkiFreeText     OPTIONAL,
		 *     failInfo      PkiFailureInfo  OPTIONAL  (BIT STRING)
		 * }
		 *
		 * PKIStatus:
		 *   granted                (0), -- you got exactly what you asked for
		 *   grantedWithMods        (1), -- you got something like what you asked for
		 *   rejection              (2), -- you don't get it, more information elsewhere in the message
		 *   waiting                (3), -- the request body part has not yet been processed, expect to hear more later
		 *   revocationWarning      (4), -- this message contains a warning that a revocation is imminent
		 *   revocationNotification (5), -- notification that a revocation has occurred
		 *   keyUpdateWarning       (6)  -- update already done for the oldCertId specified in CertReqMsg
		 *
		 * PkiFailureInfo:
		 *   badAlg           (0), -- unrecognized or unsupported Algorithm Identifier
		 *   badMessageCheck  (1), -- integrity check failed (e.g., signature did not verify)
		 *   badRequest       (2), -- transaction not permitted or supported
		 *   badTime          (3), -- messageTime was not sufficiently close to the system time, as defined by local policy
		 *   badCertId        (4), -- no certificate could be found matching the provided criteria
		 *   badDataFormat    (5), -- the data submitted has the wrong format
		 *   wrongAuthority   (6), -- the authority indicated in the request is different from the one creating the response token
		 *   incorrectData    (7), -- the requester's data is incorrect (for notary services)
		 *   missingTimeStamp (8), -- when the timestamp is missing but should be there (by policy)
		 *   badPOP           (9)  -- the proof-of-possession failed
		 *
		 * </pre>
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(status);
            v.AddOptional(statusString, failInfo);
			return new DerSequence(v);
		}
	}
}
