namespace Org.BouncyCastle.Asn1.X9
{
    /**
     * ASN.1 def for Diffie-Hellman key exchange KeySpecificInfo structure. See
     * RFC 2631, or X9.42, for further details.
     */
    public class KeySpecificInfo
        : Asn1Encodable
    {
        private DerObjectIdentifier	algorithm;
        private Asn1OctetString		counter;

		public KeySpecificInfo(
            DerObjectIdentifier	algorithm,
            Asn1OctetString		counter)
        {
            this.algorithm = algorithm;
            this.counter = counter;
        }

		public KeySpecificInfo(Asn1Sequence seq)
        {
            var e = seq.GetEnumerator();

			e.MoveNext();
            algorithm = (DerObjectIdentifier)e.Current;
            e.MoveNext();
            counter = (Asn1OctetString)e.Current;
        }

		public DerObjectIdentifier Algorithm
        {
            get { return algorithm; }
        }

		public Asn1OctetString Counter
        {
            get { return counter; }
        }

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  KeySpecificInfo ::= Sequence {
         *      algorithm OBJECT IDENTIFIER,
         *      counter OCTET STRING SIZE (4..4)
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(algorithm, counter);
        }
    }
}
