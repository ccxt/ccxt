using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;

namespace Org.BouncyCastle.Asn1.X9
{
    /**
     * Class for processing an ECFieldElement as a DER object.
     */
    public class X9FieldElement
        : Asn1Encodable
    {
        private ECFieldElement f;

        public X9FieldElement(
            ECFieldElement f)
        {
            this.f = f;
        }

        public ECFieldElement Value
        {
            get { return f; }
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  FieldElement ::= OCTET STRING
         * </pre>
         * <p>
         * <ol>
         * <li> if <i>q</i> is an odd prime then the field element is
         * processed as an Integer and converted to an octet string
         * according to x 9.62 4.3.1.</li>
         * <li> if <i>q</i> is 2<sup>m</sup> then the bit string
         * contained in the field element is converted into an octet
         * string with the same ordering padded at the front if necessary.
         * </li>
         * </ol>
         * </p>
         */
        public override Asn1Object ToAsn1Object()
        {
            int byteCount = X9IntegerConverter.GetByteLength(f);
            byte[] paddedBigInteger = X9IntegerConverter.IntegerToBytes(f.ToBigInteger(), byteCount);

            return new DerOctetString(paddedBigInteger);
        }
    }
}
