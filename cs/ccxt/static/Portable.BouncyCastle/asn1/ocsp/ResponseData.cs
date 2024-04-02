using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
	public class ResponseData
		: Asn1Encodable
	{
		private static readonly DerInteger V1 = new DerInteger(0);

		private readonly bool                versionPresent;
		private readonly DerInteger          version;
		private readonly ResponderID         responderID;
		private readonly DerGeneralizedTime  producedAt;
		private readonly Asn1Sequence        responses;
		private readonly X509Extensions      responseExtensions;

		public static ResponseData GetInstance(
			Asn1TaggedObject	obj,
			bool				explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

		public static ResponseData GetInstance(
			object  obj)
		{
			if (obj == null || obj is ResponseData)
			{
				return (ResponseData)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new ResponseData((Asn1Sequence)obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public ResponseData(
			DerInteger          version,
			ResponderID         responderID,
			DerGeneralizedTime  producedAt,
			Asn1Sequence        responses,
			X509Extensions      responseExtensions)
		{
			this.version = version;
			this.responderID = responderID;
			this.producedAt = producedAt;
			this.responses = responses;
			this.responseExtensions = responseExtensions;
		}

		public ResponseData(
			ResponderID         responderID,
			DerGeneralizedTime  producedAt,
			Asn1Sequence        responses,
			X509Extensions      responseExtensions)
			: this(V1, responderID, producedAt, responses, responseExtensions)
		{
		}

		private ResponseData(
			Asn1Sequence seq)
		{
			int index = 0;

			Asn1Encodable enc = seq[0];
			if (enc is Asn1TaggedObject)
			{
				Asn1TaggedObject o = (Asn1TaggedObject)enc;

				if (o.TagNo == 0)
				{
					this.versionPresent = true;
					this.version = DerInteger.GetInstance(o, true);
					index++;
				}
				else
				{
					this.version = V1;
				}
			}
			else
			{
				this.version = V1;
			}

			this.responderID = ResponderID.GetInstance(seq[index++]);
			this.producedAt = (DerGeneralizedTime)seq[index++];
			this.responses = (Asn1Sequence)seq[index++];

			if (seq.Count > index)
			{
				this.responseExtensions = X509Extensions.GetInstance(
					(Asn1TaggedObject)seq[index], true);
			}
		}

		public DerInteger Version
		{
			get { return version; }
		}

		public ResponderID ResponderID
		{
			get { return responderID; }
		}

		public DerGeneralizedTime ProducedAt
		{
			get { return producedAt; }
		}

		public Asn1Sequence Responses
		{
			get { return responses; }
		}

		public X509Extensions ResponseExtensions
		{
			get { return responseExtensions; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * ResponseData ::= Sequence {
         *     version              [0] EXPLICIT Version DEFAULT v1,
         *     responderID              ResponderID,
         *     producedAt               GeneralizedTime,
         *     responses                Sequence OF SingleResponse,
         *     responseExtensions   [1] EXPLICIT Extensions OPTIONAL }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();

            if (versionPresent || !version.Equals(V1))
            {
                v.Add(new DerTaggedObject(true, 0, version));
            }

            v.Add(responderID, producedAt, responses);
            v.AddOptionalTagged(true, 1, responseExtensions);
            return new DerSequence(v);
        }
    }
}
