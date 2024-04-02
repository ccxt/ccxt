using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms.Ecc
{
	public class MQVuserKeyingMaterial
		: Asn1Encodable
	{
		private OriginatorPublicKey	ephemeralPublicKey;
		private Asn1OctetString		addedukm;

		public MQVuserKeyingMaterial(
			OriginatorPublicKey	ephemeralPublicKey,
			Asn1OctetString		addedukm)
		{
			// TODO Check ephemeralPublicKey not null

			this.ephemeralPublicKey = ephemeralPublicKey;
			this.addedukm = addedukm;
		}

		private MQVuserKeyingMaterial(
			Asn1Sequence seq)
		{
			// TODO Check seq has either 1 or 2 elements

			this.ephemeralPublicKey = OriginatorPublicKey.GetInstance(seq[0]);

			if (seq.Count > 1)
			{
				this.addedukm = Asn1OctetString.GetInstance(
					(Asn1TaggedObject)seq[1], true);
			}
		}

		/**
		 * return an AuthEnvelopedData object from a tagged object.
		 *
		 * @param obj      the tagged object holding the object we want.
		 * @param isExplicit true if the object is meant to be explicitly
		 *                 tagged false otherwise.
		 * @throws ArgumentException if the object held by the
		 *                                  tagged object cannot be converted.
		 */
		public static MQVuserKeyingMaterial GetInstance(
			Asn1TaggedObject	obj,
			bool				isExplicit)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
		}

		/**
		 * return an AuthEnvelopedData object from the given object.
		 *
		 * @param obj the object we want converted.
		 * @throws ArgumentException if the object cannot be converted.
		 */
		public static MQVuserKeyingMaterial GetInstance(
			object	obj)
		{
			if (obj == null || obj is MQVuserKeyingMaterial)
			{
				return (MQVuserKeyingMaterial)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new MQVuserKeyingMaterial((Asn1Sequence)obj);
			}

            throw new ArgumentException("Invalid MQVuserKeyingMaterial: " + Platform.GetTypeName(obj));
		}
		
		public OriginatorPublicKey EphemeralPublicKey
		{
			get { return ephemeralPublicKey; }
		}

		public Asn1OctetString AddedUkm
		{
			get { return addedukm; }
		}

		/**
		* Produce an object suitable for an Asn1OutputStream.
		* <pre>
		* MQVuserKeyingMaterial ::= SEQUENCE {
		*   ephemeralPublicKey OriginatorPublicKey,
		*   addedukm [0] EXPLICIT UserKeyingMaterial OPTIONAL  }
		* </pre>
		*/
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(ephemeralPublicKey);
            v.AddOptionalTagged(true, 0, addedukm);
			return new DerSequence(v);
		}
	}
}
