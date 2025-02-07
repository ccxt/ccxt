using System;
using System.Text;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.X509
{
	/**
	 * <pre>
	 * IssuingDistributionPoint ::= SEQUENCE { 
	 *   distributionPoint          [0] DistributionPointName OPTIONAL, 
	 *   onlyContainsUserCerts      [1] BOOLEAN DEFAULT FALSE, 
	 *   onlyContainsCACerts        [2] BOOLEAN DEFAULT FALSE, 
	 *   onlySomeReasons            [3] ReasonFlags OPTIONAL, 
	 *   indirectCRL                [4] BOOLEAN DEFAULT FALSE,
	 *   onlyContainsAttributeCerts [5] BOOLEAN DEFAULT FALSE }
	 * </pre>
	 */
	public class IssuingDistributionPoint
        : Asn1Encodable
    {
		private readonly DistributionPointName	_distributionPoint;
		private readonly bool					_onlyContainsUserCerts;
        private readonly bool					_onlyContainsCACerts;
		private readonly ReasonFlags			_onlySomeReasons;
		private readonly bool					_indirectCRL;
        private readonly bool					_onlyContainsAttributeCerts;

		private readonly Asn1Sequence seq;

		public static IssuingDistributionPoint GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		public static IssuingDistributionPoint GetInstance(
            object obj)
        {
            if (obj == null || obj is IssuingDistributionPoint)
            {
                return (IssuingDistributionPoint) obj;
            }

			if (obj is Asn1Sequence)
            {
                return new IssuingDistributionPoint((Asn1Sequence) obj);
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		/**
		 * Constructor from given details.
		 * 
		 * @param distributionPoint
		 *            May contain an URI as pointer to most current CRL.
		 * @param onlyContainsUserCerts Covers revocation information for end certificates.
		 * @param onlyContainsCACerts Covers revocation information for CA certificates.
		 * 
		 * @param onlySomeReasons
		 *            Which revocation reasons does this point cover.
		 * @param indirectCRL
		 *            If <code>true</code> then the CRL contains revocation
		 *            information about certificates ssued by other CAs.
		 * @param onlyContainsAttributeCerts Covers revocation information for attribute certificates.
		 */
		public IssuingDistributionPoint(
			DistributionPointName	distributionPoint,
			bool					onlyContainsUserCerts,
			bool					onlyContainsCACerts,
			ReasonFlags				onlySomeReasons,
			bool					indirectCRL,
			bool					onlyContainsAttributeCerts)
		{
			this._distributionPoint = distributionPoint;
			this._indirectCRL = indirectCRL;
			this._onlyContainsAttributeCerts = onlyContainsAttributeCerts;
			this._onlyContainsCACerts = onlyContainsCACerts;
			this._onlyContainsUserCerts = onlyContainsUserCerts;
			this._onlySomeReasons = onlySomeReasons;

			Asn1EncodableVector vec = new Asn1EncodableVector();
			if (distributionPoint != null)
			{	// CHOICE item so explicitly tagged
				vec.Add(new DerTaggedObject(true, 0, distributionPoint));
			}
			if (onlyContainsUserCerts)
			{
				vec.Add(new DerTaggedObject(false, 1, DerBoolean.True));
			}
			if (onlyContainsCACerts)
			{
				vec.Add(new DerTaggedObject(false, 2, DerBoolean.True));
			}
			if (onlySomeReasons != null)
			{
				vec.Add(new DerTaggedObject(false, 3, onlySomeReasons));
			}
			if (indirectCRL)
			{
				vec.Add(new DerTaggedObject(false, 4, DerBoolean.True));
			}
			if (onlyContainsAttributeCerts)
			{
				vec.Add(new DerTaggedObject(false, 5, DerBoolean.True));
			}

			seq = new DerSequence(vec);
		}

		/**
         * Constructor from Asn1Sequence
         */
        private IssuingDistributionPoint(
            Asn1Sequence seq)
        {
            this.seq = seq;

			for (int i = 0; i != seq.Count; i++)
            {
				Asn1TaggedObject o = Asn1TaggedObject.GetInstance(seq[i]);

				switch (o.TagNo)
                {
					case 0:
						// CHOICE so explicit
						_distributionPoint = DistributionPointName.GetInstance(o, true);
						break;
					case 1:
						_onlyContainsUserCerts = DerBoolean.GetInstance(o, false).IsTrue;
						break;
					case 2:
						_onlyContainsCACerts = DerBoolean.GetInstance(o, false).IsTrue;
						break;
					case 3:
						_onlySomeReasons = new ReasonFlags(ReasonFlags.GetInstance(o, false));
						break;
					case 4:
						_indirectCRL = DerBoolean.GetInstance(o, false).IsTrue;
						break;
					case 5:
						_onlyContainsAttributeCerts = DerBoolean.GetInstance(o, false).IsTrue;
						break;
					default:
						throw new ArgumentException("unknown tag in IssuingDistributionPoint");
                }
            }
        }

		public bool OnlyContainsUserCerts
		{
			get { return _onlyContainsUserCerts; }
		}

		public bool OnlyContainsCACerts
		{
			get { return _onlyContainsCACerts; }
		}

		public bool IsIndirectCrl
		{
			get { return _indirectCRL; }
		}

		public bool OnlyContainsAttributeCerts
		{
			get { return _onlyContainsAttributeCerts; }
		}

		/**
		 * @return Returns the distributionPoint.
		 */
		public DistributionPointName DistributionPoint
		{
			get { return _distributionPoint; }
		}

		/**
		 * @return Returns the onlySomeReasons.
		 */
		public ReasonFlags OnlySomeReasons
		{
			get { return _onlySomeReasons; }
		}

		public override Asn1Object ToAsn1Object()
        {
            return seq;
        }

		public override string ToString()
		{
			StringBuilder buf = new StringBuilder();
			buf.AppendLine("IssuingDistributionPoint: [");
			if (_distributionPoint != null)
			{
				AppendObject(buf, "distributionPoint", _distributionPoint.ToString());
			}
			if (_onlyContainsUserCerts)
			{
				AppendObject(buf, "onlyContainsUserCerts", _onlyContainsUserCerts.ToString());
			}
			if (_onlyContainsCACerts)
			{
				AppendObject(buf, "onlyContainsCACerts", _onlyContainsCACerts.ToString());
			}
			if (_onlySomeReasons != null)
			{
				AppendObject(buf, "onlySomeReasons", _onlySomeReasons.ToString());
			}
			if (_onlyContainsAttributeCerts)
			{
				AppendObject(buf, "onlyContainsAttributeCerts", _onlyContainsAttributeCerts.ToString());
			}
			if (_indirectCRL)
			{
				AppendObject(buf, "indirectCRL", _indirectCRL.ToString());
			}
			buf.AppendLine("]");
			return buf.ToString();
		}

		private void AppendObject(StringBuilder buf, string name, string val)
		{
			string indent = "    ";
			buf.Append(indent);
			buf.Append(name);
			buf.AppendLine(":");
			buf.Append(indent);
			buf.Append(indent);
			buf.Append(val);
			buf.AppendLine();
		}
	}
}
