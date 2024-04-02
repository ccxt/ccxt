using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class Request
        : Asn1Encodable
    {
        private readonly CertID			reqCert;
        private readonly X509Extensions	singleRequestExtensions;

		public static Request GetInstance(
			Asn1TaggedObject	obj,
			bool				explicitly)
		{
			return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
		}

		public static Request GetInstance(
			object obj)
		{
			if (obj == null || obj is Request)
			{
				return (Request)obj;
			}

			if (obj is Asn1Sequence)
			{
				return new Request((Asn1Sequence)obj);
			}

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		public Request(
            CertID			reqCert,
            X509Extensions	singleRequestExtensions)
        {
			if (reqCert == null)
				throw new ArgumentNullException("reqCert");

			this.reqCert = reqCert;
            this.singleRequestExtensions = singleRequestExtensions;
        }

		private Request(
			Asn1Sequence seq)
        {
			reqCert = CertID.GetInstance(seq[0]);

			if (seq.Count == 2)
            {
                singleRequestExtensions = X509Extensions.GetInstance(
					(Asn1TaggedObject)seq[1], true);
            }
        }

		public CertID ReqCert
		{
			get { return reqCert; }
		}

		public X509Extensions SingleRequestExtensions
		{
			get { return singleRequestExtensions; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * Request         ::=     Sequence {
         *     reqCert                     CertID,
         *     singleRequestExtensions     [0] EXPLICIT Extensions OPTIONAL }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(reqCert);
            v.AddOptionalTagged(true, 0, singleRequestExtensions);
            return new DerSequence(v);
        }
    }
}
