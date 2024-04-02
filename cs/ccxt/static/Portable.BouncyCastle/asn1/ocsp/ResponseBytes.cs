using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class ResponseBytes
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier responseType;
        private readonly Asn1OctetString response;

		public static ResponseBytes GetInstance(
			Asn1TaggedObject	obj,
			bool				explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

		public static ResponseBytes GetInstance(
			object obj)
		{
			if (obj == null || obj is ResponseBytes)
			{
				return (ResponseBytes)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new ResponseBytes((Asn1Sequence)obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public ResponseBytes(
            DerObjectIdentifier	responseType,
            Asn1OctetString		response)
        {
			if (responseType == null)
				throw new ArgumentNullException("responseType");
			if (response == null)
				throw new ArgumentNullException("response");

			this.responseType = responseType;
            this.response = response;
        }

		private ResponseBytes(
            Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			this.responseType = DerObjectIdentifier.GetInstance(seq[0]);
            this.response = Asn1OctetString.GetInstance(seq[1]);
        }

		public DerObjectIdentifier ResponseType
		{
			get { return responseType; }
		}

		public Asn1OctetString Response
		{
			get { return response; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * ResponseBytes ::=       Sequence {
         *     responseType   OBJECT IDENTIFIER,
         *     response       OCTET STRING }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(responseType, response);
        }
    }
}
