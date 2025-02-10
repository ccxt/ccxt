using System;
using System.IO;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    public class DerEnumerated
        : Asn1Object
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerEnumerated), Asn1Tags.Enumerated) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets(), false);
            }
        }

        /**
         * return an integer from the passed in object
         *
         * @exception ArgumentException if the object cannot be converted.
         */
        public static DerEnumerated GetInstance(object obj)
        {
            if (obj == null || obj is DerEnumerated)
            {
                return (DerEnumerated)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerEnumerated)
                    return (DerEnumerated)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerEnumerated)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct enumerated from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj));
        }

        /**
         * return an Enumerated from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static DerEnumerated GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerEnumerated)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly byte[] contents;
        private readonly int start;

        public DerEnumerated(int val)
        {
            if (val < 0)
                throw new ArgumentException("enumerated must be non-negative", "val");

            this.contents = BigInteger.ValueOf(val).ToByteArray();
            this.start = 0;
        }

        public DerEnumerated(long val)
        {
            if (val < 0L)
                throw new ArgumentException("enumerated must be non-negative", "val");

            this.contents = BigInteger.ValueOf(val).ToByteArray();
            this.start = 0;
        }

        public DerEnumerated(BigInteger val)
        {
            if (val.SignValue < 0)
                throw new ArgumentException("enumerated must be non-negative", "val");

            this.contents = val.ToByteArray();
            this.start = 0;
        }

        public DerEnumerated(byte[] contents)
            : this(contents, true)
        {
        }

        internal DerEnumerated(byte[] contents, bool clone)
        {
            if (DerInteger.IsMalformed(contents))
                throw new ArgumentException("malformed enumerated", "contents");
            if (0 != (contents[0] & 0x80))
                throw new ArgumentException("enumerated must be non-negative", "contents");

            this.contents = clone ? Arrays.Clone(contents) : contents;
            this.start = DerInteger.SignBytesToSkip(this.contents);
        }

        public BigInteger Value
        {
            get { return new BigInteger(contents); }
        }

        public bool HasValue(int x)
        {
            return (contents.Length - start) <= 4
                && DerInteger.IntValue(contents, start, DerInteger.SignExtSigned) == x;
        }

        public bool HasValue(BigInteger x)
        {
            return null != x
                // Fast check to avoid allocation
                && DerInteger.IntValue(contents, start, DerInteger.SignExtSigned) == x.IntValue
                && Value.Equals(x);
        }

        public int IntValueExact
        {
            get
            {
                int count = contents.Length - start;
                if (count > 4)
                    throw new ArithmeticException("ASN.1 Enumerated out of int range");

                return DerInteger.IntValue(contents, start, DerInteger.SignExtSigned);
            }
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.Enumerated, contents);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, contents);
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            DerEnumerated other = asn1Object as DerEnumerated;
            if (other == null)
                return false;

            return Arrays.AreEqual(this.contents, other.contents);
        }

        protected override int Asn1GetHashCode()
        {
            return Arrays.GetHashCode(contents);
        }

        private static readonly DerEnumerated[] cache = new DerEnumerated[12];

        internal static DerEnumerated CreatePrimitive(byte[] contents, bool clone)
        {
            if (contents.Length > 1)
                return new DerEnumerated(contents, clone);
            if (contents.Length == 0)
                throw new ArgumentException("ENUMERATED has zero length", "contents");

            int value = contents[0];
            if (value >= cache.Length)
                return new DerEnumerated(contents, clone);

            DerEnumerated possibleMatch = cache[value];
            if (possibleMatch == null)
            {
                cache[value] = possibleMatch = new DerEnumerated(contents, clone);
            }
            return possibleMatch;
        }
    }
}
