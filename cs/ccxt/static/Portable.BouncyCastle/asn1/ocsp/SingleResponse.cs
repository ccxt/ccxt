using System;

using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Ocsp
{
    public class SingleResponse
        : Asn1Encodable
    {
        private readonly CertID              certID;
        private readonly CertStatus          certStatus;
        private readonly DerGeneralizedTime  thisUpdate;
        private readonly DerGeneralizedTime  nextUpdate;
        private readonly X509Extensions      singleExtensions;

		public SingleResponse(
            CertID              certID,
            CertStatus          certStatus,
            DerGeneralizedTime  thisUpdate,
            DerGeneralizedTime  nextUpdate,
            X509Extensions      singleExtensions)
        {
            this.certID = certID;
            this.certStatus = certStatus;
            this.thisUpdate = thisUpdate;
            this.nextUpdate = nextUpdate;
            this.singleExtensions = singleExtensions;
        }

		public SingleResponse(
            Asn1Sequence seq)
        {
            this.certID = CertID.GetInstance(seq[0]);
            this.certStatus = CertStatus.GetInstance(seq[1]);
            this.thisUpdate = (DerGeneralizedTime)seq[2];

			if (seq.Count > 4)
            {
                this.nextUpdate = DerGeneralizedTime.GetInstance(
					(Asn1TaggedObject) seq[3], true);
                this.singleExtensions = X509Extensions.GetInstance(
					(Asn1TaggedObject) seq[4], true);
            }
            else if (seq.Count > 3)
            {
                Asn1TaggedObject o = (Asn1TaggedObject) seq[3];

				if (o.TagNo == 0)
                {
                    this.nextUpdate = DerGeneralizedTime.GetInstance(o, true);
                }
                else
                {
                    this.singleExtensions = X509Extensions.GetInstance(o, true);
                }
            }
        }

		public static SingleResponse GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		public static SingleResponse GetInstance(
            object obj)
        {
            if (obj == null || obj is SingleResponse)
            {
                return (SingleResponse)obj;
            }

			if (obj is Asn1Sequence)
            {
                return new SingleResponse((Asn1Sequence)obj);
            }

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
        }

		public CertID CertId
		{
			get { return certID; }
		}

		public CertStatus CertStatus
		{
			get { return certStatus; }
		}

		public DerGeneralizedTime ThisUpdate
		{
			get { return thisUpdate; }
		}

		public DerGeneralizedTime NextUpdate
		{
			get { return nextUpdate; }
		}

		public X509Extensions SingleExtensions
		{
			get { return singleExtensions; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  SingleResponse ::= Sequence {
         *          certID                       CertID,
         *          certStatus                   CertStatus,
         *          thisUpdate                   GeneralizedTime,
         *          nextUpdate         [0]       EXPLICIT GeneralizedTime OPTIONAL,
         *          singleExtensions   [1]       EXPLICIT Extensions OPTIONAL }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(certID, certStatus, thisUpdate);
            v.AddOptionalTagged(true, 0, nextUpdate);
            v.AddOptionalTagged(true, 1, singleExtensions);
            return new DerSequence(v);
        }
    }
}
