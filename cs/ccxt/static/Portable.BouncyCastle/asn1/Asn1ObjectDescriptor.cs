using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    public sealed class Asn1ObjectDescriptor
        : Asn1Object
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(Asn1ObjectDescriptor), Asn1Tags.ObjectDescriptor) {}

            internal override Asn1Object FromImplicitPrimitive(DerOctetString octetString)
            {
                return new Asn1ObjectDescriptor(
                    (DerGraphicString)DerGraphicString.Meta.Instance.FromImplicitPrimitive(octetString));
            }

            internal override Asn1Object FromImplicitConstructed(Asn1Sequence sequence)
            {
                return new Asn1ObjectDescriptor(
                    (DerGraphicString)DerGraphicString.Meta.Instance.FromImplicitConstructed(sequence));
            }
        }

        /**
         * Return an ObjectDescriptor from the passed in object.
         *
         * @param obj an ASN1ObjectDescriptor or an object that can be converted into one.
         * @exception IllegalArgumentException if the object cannot be converted.
         * @return an ASN1ObjectDescriptor instance, or null.
         */
        public static Asn1ObjectDescriptor GetInstance(object obj)
        {
            if (obj == null || obj is Asn1ObjectDescriptor)
            {
                return (Asn1ObjectDescriptor)obj;
            }
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is Asn1ObjectDescriptor)
                    return (Asn1ObjectDescriptor)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (Asn1ObjectDescriptor)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct object descriptor from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj), "obj");
        }

        /**
         * Return an ObjectDescriptor from a tagged object.
         *
         * @param taggedObject the tagged object holding the object we want.
         * @param declaredExplicit true if the object is meant to be explicitly tagged, false otherwise.
         * @exception IllegalArgumentException if the tagged object cannot be converted.
         * @return an ASN1ObjectDescriptor instance, or null.
         */
        public static Asn1ObjectDescriptor GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (Asn1ObjectDescriptor)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        private readonly DerGraphicString m_baseGraphicString;

        public Asn1ObjectDescriptor(DerGraphicString baseGraphicString)
        {
            if (null == baseGraphicString)
                throw new ArgumentNullException("baseGraphicString");

            this.m_baseGraphicString = baseGraphicString;
        }

        public DerGraphicString BaseGraphicString
        {
            get { return m_baseGraphicString; }
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return m_baseGraphicString.GetEncodingImplicit(encoding, Asn1Tags.Universal, Asn1Tags.ObjectDescriptor);
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return m_baseGraphicString.GetEncodingImplicit(encoding, tagClass, tagNo);
        }

        protected override int Asn1GetHashCode()
        {
            return ~m_baseGraphicString.CallAsn1GetHashCode();
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            Asn1ObjectDescriptor that = asn1Object as Asn1ObjectDescriptor;
            return null != that
                && this.m_baseGraphicString.Equals(that.m_baseGraphicString);
        }

        internal static Asn1ObjectDescriptor CreatePrimitive(byte[] contents)
        {
            return new Asn1ObjectDescriptor(DerGraphicString.CreatePrimitive(contents));
        }
    }
}
