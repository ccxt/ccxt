using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class OcspRequest
        : Asn1Encodable
    {
        private readonly TbsRequest	tbsRequest;
        private readonly Signature	optionalSignature;

		public static OcspRequest GetInstance(
			Asn1TaggedObject	obj,
			bool				explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

		public static OcspRequest GetInstance(
			object obj)
		{
			if (obj == null || obj is OcspRequest)
			{
				return (OcspRequest)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new OcspRequest((Asn1Sequence)obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public OcspRequest(
            TbsRequest	tbsRequest,
            Signature	optionalSignature)
        {
			if (tbsRequest == null)
				throw new ArgumentNullException("tbsRequest");

			this.tbsRequest = tbsRequest;
            this.optionalSignature = optionalSignature;
        }

		private OcspRequest(
            Asn1Sequence seq)
        {
            tbsRequest = TbsRequest.GetInstance(seq[0]);

			if (seq.Count == 2)
            {
                optionalSignature = Signature.GetInstance(
					(Asn1TaggedObject)seq[1], true);
            }
        }

		public TbsRequest TbsRequest
		{
			get { return tbsRequest; }
		}

		public Signature OptionalSignature
		{
			get { return optionalSignature; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * OcspRequest     ::=     Sequence {
         *     tbsRequest                  TBSRequest,
         *     optionalSignature   [0]     EXPLICIT Signature OPTIONAL }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(tbsRequest);
            v.AddOptionalTagged(true, 0, optionalSignature);
            return new DerSequence(v);
        }
    }
}
