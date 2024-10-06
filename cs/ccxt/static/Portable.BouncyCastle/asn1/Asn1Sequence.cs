using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Asn1
{
    public abstract class Asn1Sequence
        : Asn1Object, IEnumerable<Asn1Encodable>
    {
        internal class Meta : Asn1UniversalType
        {
            internal static readonly Asn1UniversalType Instance = new Meta();

            private Meta() : base(typeof(Asn1Sequence), Asn1Tags.Sequence) {}

            internal override Asn1Object FromImplicitConstructed(Asn1Sequence sequence)
            {
                return sequence;
            }
        }

        /**
         * return an Asn1Sequence from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static Asn1Sequence GetInstance(object obj)
        {
            if (obj == null || obj is Asn1Sequence)
            {
                return (Asn1Sequence)obj;
            }
            //else if (obj is Asn1SequenceParser)
            else if (obj is IAsn1Convertible)
            {
                Asn1Object asn1Object = ((IAsn1Convertible)obj).ToAsn1Object();
                if (asn1Object is Asn1Sequence)
                    return (Asn1Sequence)asn1Object;
            }
            else if (obj is byte[])
            {
                try
                {
                    return (Asn1Sequence)Meta.Instance.FromByteArray((byte[])obj);
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct sequence from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj), "obj");
        }

        /**
         * Return an ASN1 sequence from a tagged object. There is a special
         * case here, if an object appears to have been explicitly tagged on
         * reading but we were expecting it to be implicitly tagged in the
         * normal course of events it indicates that we lost the surrounding
         * sequence - so we need to add it back (this will happen if the tagged
         * object is a sequence that contains other sequences). If you are
         * dealing with implicitly tagged sequences you really <b>should</b>
         * be using this method.
         *
         * @param taggedObject the tagged object.
         * @param declaredExplicit true if the object is meant to be explicitly tagged, false otherwise.
         * @exception ArgumentException if the tagged object cannot be converted.
         */
        public static Asn1Sequence GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            return (Asn1Sequence)Meta.Instance.GetContextInstance(taggedObject, declaredExplicit);
        }

        // NOTE: Only non-readonly to support LazyDLSequence
        internal Asn1Encodable[] elements;

        protected internal Asn1Sequence()
        {
            this.elements = Asn1EncodableVector.EmptyElements;
        }

        protected internal Asn1Sequence(Asn1Encodable element)
        {
            if (null == element)
                throw new ArgumentNullException(nameof(element));

            this.elements = new Asn1Encodable[]{ element };
        }

        protected internal Asn1Sequence(Asn1Encodable element1, Asn1Encodable element2)
        {
            if (null == element1)
                throw new ArgumentNullException(nameof(element1));
            if (null == element2)
                throw new ArgumentNullException(nameof(element2));

            this.elements = new Asn1Encodable[]{ element1, element2 };
        }

        protected internal Asn1Sequence(params Asn1Encodable[] elements)
        {
            if (Arrays.IsNullOrContainsNull(elements))
                throw new NullReferenceException("'elements' cannot be null, or contain null");

            this.elements = Asn1EncodableVector.CloneElements(elements);
        }

        internal Asn1Sequence(Asn1Encodable[] elements, bool clone)
        {
            this.elements = clone ? Asn1EncodableVector.CloneElements(elements) : elements;
        }

        protected internal Asn1Sequence(Asn1EncodableVector elementVector)
        {
            if (null == elementVector)
                throw new ArgumentNullException("elementVector");

            this.elements = elementVector.TakeElements();
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

        private class Asn1SequenceParserImpl
            : Asn1SequenceParser
        {
            private readonly Asn1Sequence outer;
            private readonly int max;
            private int index;

            public Asn1SequenceParserImpl(
                Asn1Sequence outer)
            {
                this.outer = outer;
                // NOTE: Call Count here to 'force' a LazyDerSequence
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

            public Asn1Object ToAsn1Object()
            {
                return outer;
            }
        }

        public virtual Asn1SequenceParser Parser
        {
            get { return new Asn1SequenceParserImpl(this); }
        }

        /**
         * return the object at the sequence position indicated by index.
         *
         * @param index the sequence number (starting at zero) of the object
         * @return the object at the sequence position indicated by index.
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

        protected override int Asn1GetHashCode()
        {
            // NOTE: Call Count here to 'force' a LazyDerSequence
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
            Asn1Sequence that = asn1Object as Asn1Sequence;
            if (null == that)
                return false;

            // NOTE: Call Count here (on both) to 'force' a LazyDerSequence
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

        // TODO[asn1] Preferably return an Asn1BitString[] (doesn't exist yet)
        internal DerBitString[] GetConstructedBitStrings()
        {
            // NOTE: Call Count here to 'force' a LazyDerSequence
            int count = Count;
            DerBitString[] bitStrings = new DerBitString[count];
            for (int i = 0; i < count; ++i)
            {
                bitStrings[i] = DerBitString.GetInstance(elements[i]);
            }
            return bitStrings;
        }

        internal Asn1OctetString[] GetConstructedOctetStrings()
        {
            // NOTE: Call Count here to 'force' a LazyDerSequence
            int count = Count;
            Asn1OctetString[] octetStrings = new Asn1OctetString[count];
            for (int i = 0; i < count; ++i)
            {
                octetStrings[i] = Asn1OctetString.GetInstance(elements[i]);
            }
            return octetStrings;
        }

        // TODO[asn1] Preferably return an Asn1BitString (doesn't exist yet)
        internal abstract DerBitString ToAsn1BitString();

        // TODO[asn1] Preferably return an Asn1External (doesn't exist yet)
        internal abstract DerExternal ToAsn1External();

        internal abstract Asn1OctetString ToAsn1OctetString();

        internal abstract Asn1Set ToAsn1Set();
    }
}
