using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Asn1
{
    public abstract class Asn1Set
        : Asn1Object, IEnumerable<Asn1Encodable>
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(Asn1Set), Asn1Tags.Set) {}

            internal override Asn1Object FromImplicitConstructed(Asn1Sequence sequence)
            {
                return sequence.ToAsn1Set();
            }
        }

        /**
         * return an ASN1Set from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static Asn1Set GetInstance(object obj)
        {
            if (obj == null || obj is Asn1Set)
            {
                return (Asn1Set)obj;
            }
            //else if (obj is Asn1SetParser)
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is Asn1Set)
                    return (Asn1Set)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (Asn1Set)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct set from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj), "obj");
        }

        /**
         * Return an ASN1 set from a tagged object. There is a special
         * case here, if an object appears to have been explicitly tagged on
         * reading but we were expecting it to be implicitly tagged in the
         * normal course of events it indicates that we lost the surrounding
         * set - so we need to add it back (this will happen if the tagged
         * object is a sequence that contains other sequences). If you are
         * dealing with implicitly tagged sets you really <b>should</b>
         * be using this method.
         *
         * @param taggedObject the tagged object.
         * @param declaredExplicit true if the object is meant to be explicitly tagged false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static Asn1Set GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (Asn1Set)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        // NOTE: Only non-readonly to support LazyDLSet
        internal Asn1Encodable[] elements;
        internal bool isSorted;

        protected internal Asn1Set()
        {
            this.elements = Asn1EncodableVector.EmptyElements;
            this.isSorted = true;
        }

        protected internal Asn1Set(Asn1Encodable element)
        {
            if (null == element)
                throw new ArgumentNullException("element");

            this.elements = new Asn1Encodable[]{ element };
            this.isSorted = true;
        }

        protected internal Asn1Set(Asn1Encodable[] elements, bool doSort)
        {
            if (Arrays.IsNullOrContainsNull(elements))
                throw new NullReferenceException("'elements' cannot be null, or contain null");

            Asn1Encodable[] tmp = Asn1EncodableVector.CloneElements(elements);
            if (doSort && tmp.Length >= 2)
            {
                tmp = Sort(tmp);
            }

            this.elements = tmp;
            this.isSorted = doSort || tmp.Length < 2;
        }

        protected internal Asn1Set(Asn1EncodableVector elementVector, bool doSort)
        {
            if (null == elementVector)
                throw new ArgumentNullException("elementVector");

            Asn1Encodable[] tmp;
            if (doSort && elementVector.Count >= 2)
            {
                tmp = Sort(elementVector.CopyElements());
            }
            else
            {
                tmp = elementVector.TakeElements();
            }

            this.elements = tmp;
            this.isSorted = doSort || tmp.Length < 2;
        }

        protected internal Asn1Set(bool isSorted, Asn1Encodable[] elements)
        {
            this.elements = elements;
            this.isSorted = isSorted || elements.Length < 2;
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public virtual IEnumerator<Asn1Encodable> GetEnumerator()
        {
            IEnumerable<Asn1Encodable> e = elements;
            return e.GetEnumerator();
        }

        /**
         * return the object at the set position indicated by index.
         *
         * @param index the set number (starting at zero) of the object
         * @return the object at the set position indicated by index.
         */
        public virtual Asn1Encodable this[int index]
        {
            get { return elements[index]; }
        }

        public virtual int Count
        {
            get { return elements.Length; }
        }

        public virtual Asn1Encodable[] ToArray()
        {
            return Asn1EncodableVector.CloneElements(elements);
        }

        private class Asn1SetParserImpl
            : Asn1SetParser
        {
            private readonly Asn1Set outer;
            private readonly int max;
            private int index;

            public Asn1SetParserImpl(
                Asn1Set outer)
            {
                this.outer = outer;
                // NOTE: Call Count here to 'force' a LazyDerSet
                this.max = outer.Count;
            }

            public IAsn1Convertible ReadObject()
            {
                if (index == max)
                    return null;

                Asn1Encodable obj = outer[index++];
                if (obj is Asn1Sequence)
                    return ((Asn1Sequence)obj).Parser;

                if (obj is Asn1Set)
                    return ((Asn1Set)obj).Parser;

                // NB: Asn1OctetString implements Asn1OctetStringParser directly
//				if (obj is Asn1OctetString)
//					return ((Asn1OctetString)obj).Parser;

                return obj;
            }

            public virtual Asn1Object ToAsn1Object()
            {
                return outer;
            }
        }

        public Asn1SetParser Parser
        {
            get { return new Asn1SetParserImpl(this); }
        }

        protected override int Asn1GetHashCode()
        {
            // NOTE: Call Count here to 'force' a LazyDerSet
            int i = Count;
            int hc = i + 1;

            while (--i >= 0)
            {
                hc *= 257;
                hc ^= elements[i].ToAsn1Object().CallAsn1GetHashCode();
            }

            return hc;
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            Asn1Set that = asn1Object as Asn1Set;
            if (null == that)
                return false;

            // NOTE: Call Count here (on both) to 'force' a LazyDerSet
            int count = this.Count;
            if (that.Count != count)
                return false;

            for (int i = 0; i < count; ++i)
            {
                Asn1Object o1 = this.elements[i].ToAsn1Object();
                Asn1Object o2 = that.elements[i].ToAsn1Object();

                if (!o1.Equals(o2))
                    return false;
            }

            return true;
        }

        public override string ToString()
        {
            return CollectionUtilities.ToString(elements);
        }

        internal static Asn1Encodable[] Sort(Asn1Encodable[] elements)
        {
            int count = elements.Length;
            if (count < 2)
                return elements;

            byte[][] keys = new byte[count][];
            for (int i = 0; i < count; ++i)
            {
                keys[i] = elements[i].GetEncoded(Der);
            }
            Array.Sort(keys, elements, new DerComparer());
            return elements;
        }

        private class DerComparer
            : IComparer<byte[]>
        {
            public int Compare(byte[] a, byte[] b)
            {
                Debug.Assert(a.Length >= 2 && b.Length >= 2);

                /*
                 * NOTE: Set elements in DER encodings are ordered first according to their tags (class and
                 * number); the CONSTRUCTED bit is not part of the tag.
                 * 
                 * For SET-OF, this is unimportant. All elements have the same tag and DER requires them to
                 * either all be in constructed form or all in primitive form, according to that tag. The
                 * elements are effectively ordered according to their content octets.
                 * 
                 * For SET, the elements will have distinct tags, and each will be in constructed or
                 * primitive form accordingly. Failing to ignore the CONSTRUCTED bit could therefore lead to
                 * ordering inversions.
                 */
                int a0 = a[0] & ~Asn1Tags.Constructed;
                int b0 = b[0] & ~Asn1Tags.Constructed;
                if (a0 != b0)
                    return a0 < b0 ? -1 : 1;

                int len = System.Math.Min(a.Length, b.Length);
                for (int i = 1; i < len; ++i)
                {
                    byte ai = a[i], bi = b[i];
                    if (ai != bi)
                        return ai < bi ? -1 : 1;
                }
                Debug.Assert(a.Length == b.Length);
                return 0;
            }
        }
    }
}
