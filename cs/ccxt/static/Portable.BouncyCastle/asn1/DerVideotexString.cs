using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    public class DerVideotexString
        : DerStringBase
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(DerVideotexString), Asn1Tags.VideotexString) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return CreatePrimitive(octetString.GetOctets());
            }
        }

        /**
         * return a videotex string from the passed in object
         *
         * @param obj a DERVideotexString or an object that can be converted into one.
         * @exception IllegalArgumentException if the object cannot be converted.
         * @return a DERVideotexString instance, or null.
         */
        public static DerVideotexString GetInstance(object obj)
        {
            if (obj == null || obj is DerVideotexString)
            {
                return (DerVideotexString)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is DerVideotexString)
                    return (DerVideotexString)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (DerVideotexString)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct videotex string from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj), "obj");
        }

        /**
         * return a videotex string from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception IllegalArgumentException if the tagged object cannot be converted.
         * @return a DERVideotexString instance, or null.
         */
        public static DerVideotexString GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (DerVideotexString)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly byte[] m_contents;

        public DerVideotexString(byte[] contents)
            : this(contents, true)
        {
        }

        internal DerVideotexString(byte[] contents, bool clone)
        {
            if (null == contents)
                throw new ArgumentNullException("contents");

            m_contents = clone ? Arrays.Clone(contents) : contents;
        }

        public override string GetString()
        {
            return Strings.FromByteArray(m_contents);
        }

        public byte[] GetOctets()
        {
            return Arrays.Clone(m_contents);
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.VideotexString, m_contents);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new PrimitiveEncoding(tagClass, tagNo, m_contents);
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            DerVideotexString that = asn1Object as DerVideotexString;
            return null != that
                && Arrays.AreEqual(this.m_contents, that.m_contents);
        }

        protected override int Asn1GetHashCode()
        {
            return Arrays.GetHashCode(m_contents);
        }

        internal static DerVideotexString CreatePrimitive(byte[] contents)
        {
            return new DerVideotexString(contents, false);
        }
    }
}
