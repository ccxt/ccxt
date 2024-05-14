using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Asn1.X509
{
	/**
	 * Class for containing a restriction object subtrees in NameConstraints. See
	 * RFC 3280.
	 *
	 * <pre>
	 *
	 *       GeneralSubtree ::= SEQUENCE
	 *       {
	 *         baseName                    GeneralName,
	 *         minimum         [0]     BaseDistance DEFAULT 0,
	 *         maximum         [1]     BaseDistance OPTIONAL
	 *       }
	 * </pre>
	 *
	 * @see org.bouncycastle.asn1.x509.NameConstraints
	 *
	 */
	public class GeneralSubtree
		: Asn1Encodable
	{
		private readonly GeneralName	baseName;
		private readonly DerInteger		minimum;
		private readonly DerInteger		maximum;

		private GeneralSubtree(
			Asn1Sequence seq)
		{
			baseName = GeneralName.GetInstance(seq[0]);

			switch (seq.Count)
			{
				case 1:
					break;
				case 2:
				{
					Asn1TaggedObject o = Asn1TaggedObject.GetInstance(seq[1]);
					switch (o.TagNo)
					{
						case 0:
							minimum = DerInteger.GetInstance(o, false);
							break;
						case 1:
							maximum = DerInteger.GetInstance(o, false);
							break;
						default:
							throw new ArgumentException("Bad tag number: " + o.TagNo);
					}
					break;
				}
				case 3:
				{
					{
						Asn1TaggedObject oMin = Asn1TaggedObject.GetInstance(seq[1]);
						if (oMin.TagNo != 0)
							throw new ArgumentException("Bad tag number for 'minimum': " + oMin.TagNo);
						minimum = DerInteger.GetInstance(oMin, false);
					}

					{
						Asn1TaggedObject oMax = Asn1TaggedObject.GetInstance(seq[2]);
						if (oMax.TagNo != 1)
							throw new ArgumentException("Bad tag number for 'maximum': " + oMax.TagNo);
						maximum = DerInteger.GetInstance(oMax, false);
					}

					break;
				}
				default:
					throw new ArgumentException("Bad sequence size: " + seq.Count);
			}
		}

		/**
		 * Constructor from a given details.
		 *
		 * According RFC 3280, the minimum and maximum fields are not used with any
		 * name forms, thus minimum MUST be zero, and maximum MUST be absent.
		 * <p>
		 * If minimum is <code>null</code>, zero is assumed, if
		 * maximum is <code>null</code>, maximum is absent.</p>
		 *
		 * @param baseName
		 *            A restriction.
		 * @param minimum
		 *            Minimum
		 *
		 * @param maximum
		 *            Maximum
		 */
		public GeneralSubtree(
			GeneralName	baseName,
			BigInteger	minimum,
			BigInteger	maximum)
		{
			this.baseName = baseName;
			if (minimum != null)
			{
				this.minimum = new DerInteger(minimum);
			}
			if (maximum != null)
			{
				this.maximum = new DerInteger(maximum);
			}
		}

		public GeneralSubtree(
			GeneralName baseName)
			: this(baseName, null, null)
		{
		}

		public static GeneralSubtree GetInstance(
			Asn1TaggedObject	o,
			bool				isExplicit)
		{
			return new GeneralSubtree(Asn1Sequence.GetInstance(o, isExplicit));
		}

		public static GeneralSubtree GetInstance(
			object obj)
		{
			if (obj == null)
			{
				return null;
			}

			if (obj is GeneralSubtree)
			{
				return (GeneralSubtree) obj;
			}

			return new GeneralSubtree(Asn1Sequence.GetInstance(obj));
		}

		public GeneralName Base
		{
			get { return baseName; }
		}

		public BigInteger Minimum
		{
			get { return minimum == null ? BigInteger.Zero : minimum.Value; }
		}

		public BigInteger Maximum
		{
			get { return maximum == null ? null : maximum.Value; }
		}

		/**
		 * Produce an object suitable for an Asn1OutputStream.
		 *
		 * Returns:
		 *
		 * <pre>
		 *       GeneralSubtree ::= SEQUENCE
		 *       {
		 *         baseName                    GeneralName,
		 *         minimum         [0]     BaseDistance DEFAULT 0,
		 *         maximum         [1]     BaseDistance OPTIONAL
		 *       }
		 * </pre>
		 *
		 * @return a DERObject
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(baseName);

			if (minimum != null && !minimum.HasValue(0))
			{
				v.Add(new DerTaggedObject(false, 0, minimum));
			}

            v.AddOptionalTagged(false, 1, maximum);
			return new DerSequence(v);
		}
	}
}
