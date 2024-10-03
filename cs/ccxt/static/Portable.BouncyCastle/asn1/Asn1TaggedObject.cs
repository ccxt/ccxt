using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    /**
     * ASN.1 TaggedObject - in ASN.1 notation this is any object preceded by
     * a [n] where n is some number - these are assumed to follow the construction
     * rules (as with sequences).
     */
    public abstract class Asn1TaggedObject
		: Asn1Object, Asn1TaggedObjectParser
    {
        private const int DeclaredExplicit = 1;
        private const int DeclaredImplicit = 2;
        // TODO It will probably be better to track parsing constructed vs primitive instead
        private const int ParsedExplicit = 3;
        private const int ParsedImplicit = 4;

        public static Asn1TaggedObject GetInstance(object obj)
		{
            if (obj == null || obj is Asn1TaggedObject) 
            {
                return (Asn1TaggedObject)obj;
            }
            //else if (obj is Asn1TaggedObjectParser)
            else if (obj is IAsn1Convertible asn1Convertible)
            {
                Asn1Object asn1Object = asn1Convertible.ToAsn1Object();
                if (asn1Object is Asn1TaggedObject taggedObject)
                    return taggedObject;
            }
            else if (obj is byte[] byteArray)
            {
                try
                {
                    return CheckedCast(FromByteArray(byteArray));
                }
                catch (IOException e)
                {
                    throw new ArgumentException("failed to construct tagged object from byte[]: " + e.Message);
                }
            }

            throw new ArgumentException("illegal object in GetInstance: " + Platform.GetTypeName(obj), "obj");
		}

        public static Asn1TaggedObject GetInstance(object obj, int tagClass)
        {
            if (obj == null)
                throw new ArgumentNullException(nameof(obj));

            Asn1TaggedObject taggedObject = GetInstance(obj);
            if (tagClass != taggedObject.TagClass)
                throw new ArgumentException("unexpected tag in GetInstance: " + Asn1Utilities.GetTagText(taggedObject));

            return taggedObject;
        }

        public static Asn1TaggedObject GetInstance(object obj, int tagClass, int tagNo)
        {
            if (obj == null)
                throw new ArgumentNullException(nameof(obj));

            Asn1TaggedObject taggedObject = GetInstance(obj);
            if (!taggedObject.HasTag(tagClass, tagNo))
                throw new ArgumentException("unexpected tag in GetInstance: " + Asn1Utilities.GetTagText(taggedObject));

            return taggedObject;
        }

        public static Asn1TaggedObject GetInstance(Asn1TaggedObject taggedObject, bool declaredExplicit)
        {
            if (Asn1Tags.ContextSpecific != taggedObject.TagClass)
                throw new InvalidOperationException("this method only valid for CONTEXT_SPECIFIC tags");

            if (declaredExplicit)
                return taggedObject.GetExplicitBaseTagged();

            throw new ArgumentException("this method not valid for implicitly tagged tagged objects");
        }

        internal readonly int explicitness;
        internal readonly int tagClass;
        internal readonly int tagNo;
        internal readonly Asn1Encodable obj;

		/**
         * @param explicitly true if the object is explicitly tagged.
         * @param tagNo the tag number for this object.
         * @param obj the tagged object.
         */
        protected Asn1TaggedObject(bool isExplicit, int tagNo, Asn1Encodable obj)
            : this(isExplicit, Asn1Tags.ContextSpecific, tagNo, obj)
        {
        }

        protected Asn1TaggedObject(bool isExplicit, int tagClass, int tagNo, Asn1Encodable obj)
            : this(isExplicit ? DeclaredExplicit : DeclaredImplicit, tagClass, tagNo, obj)
        {
        }

        internal Asn1TaggedObject(int explicitness, int tagClass, int tagNo, Asn1Encodable obj)
        {
            if (null == obj)
                throw new ArgumentNullException("obj");
            if (Asn1Tags.Universal == tagClass || (tagClass & Asn1Tags.Private) != tagClass)
                throw new ArgumentException("invalid tag class: " + tagClass, "tagClass");

            this.explicitness = (obj is IAsn1Choice) ? DeclaredExplicit : explicitness;
            this.tagClass = tagClass;
            this.tagNo = tagNo;
            this.obj = obj;
        }

        protected override bool Asn1Equals(Asn1Object asn1Object)
        {
            Asn1TaggedObject that = asn1Object as Asn1TaggedObject;
            if (null == that || this.tagNo != that.tagNo || this.tagClass != that.tagClass)
                return false;

            if (this.explicitness != that.explicitness)
            {
                /*
                 * TODO This seems incorrect for some cases of implicit tags e.g. if one is a
                 * declared-implicit SET and the other a parsed object.
                 */
                if (this.IsExplicit() != that.IsExplicit())
                    return false;
            }

            Asn1Object p1 = this.obj.ToAsn1Object();
            Asn1Object p2 = that.obj.ToAsn1Object();

            if (p1 == p2)
                return true;

            if (!this.IsExplicit())
            {
                try
                {
                    byte[] d1 = this.GetEncoded();
                    byte[] d2 = that.GetEncoded();

                    return Arrays.AreEqual(d1, d2);
                }
                catch (IOException)
                {
                    return false;
                }
            }

            return p1.CallAsn1Equals(p2);
		}

		protected override int Asn1GetHashCode()
		{
            return (tagClass * 7919) ^ tagNo ^ (IsExplicit() ? 0x0F : 0xF0) ^ obj.ToAsn1Object().CallAsn1GetHashCode();
        }

        public int TagClass
        {
            get { return tagClass; }
        }

		public int TagNo
        {
			get { return tagNo; }
        }

        public bool HasContextTag(int tagNo)
        {
            return this.tagClass == Asn1Tags.ContextSpecific && this.tagNo == tagNo;
        }

        public bool HasTag(int tagClass, int tagNo)
        {
            return this.tagClass == tagClass && this.tagNo == tagNo;
        }

        /**
         * return whether or not the object may be explicitly tagged.
         * <p>
         * Note: if the object has been read from an input stream, the only
         * time you can be sure if isExplicit is returning the true state of
         * affairs is if it returns false. An implicitly tagged object may appear
         * to be explicitly tagged, so you need to understand the context under
         * which the reading was done as well, see GetObject below.</p>
         */
        public bool IsExplicit()
        {
            // TODO New methods like 'IsKnownExplicit' etc. to distinguish uncertain cases?
            switch (explicitness)
            {
            case DeclaredExplicit:
            case ParsedExplicit:
                return true;
            default:
                return false;
            }
        }

        internal bool IsParsed()
        {
            switch (explicitness)
            {
            case ParsedExplicit:
            case ParsedImplicit:
                return true;
            default:
                return false;
            }
        }

        /**
         * return whatever was following the tag.
         * <p>
         * Note: tagged objects are generally context dependent if you're
         * trying to extract a tagged object you should be going via the
         * appropriate GetInstance method.</p>
         */
        public Asn1Object GetObject()
        {
            if (Asn1Tags.ContextSpecific != TagClass)
                throw new InvalidOperationException("this method only valid for CONTEXT_SPECIFIC tags");

            return obj.ToAsn1Object();
        }

        /**
         * Needed for open types, until we have better type-guided parsing support. Use sparingly for other
         * purposes, and prefer {@link #getExplicitBaseTagged()}, {@link #getImplicitBaseTagged(int, int)} or
         * {@link #getBaseUniversal(boolean, int)} where possible. Before using, check for matching tag
         * {@link #getTagClass() class} and {@link #getTagNo() number}.
         */
        public Asn1Encodable GetBaseObject()
        {
            return obj;
        }

        /**
         * Needed for open types, until we have better type-guided parsing support. Use
         * sparingly for other purposes, and prefer {@link #getExplicitBaseTagged()} or
         * {@link #getBaseUniversal(boolean, int)} where possible. Before using, check
         * for matching tag {@link #getTagClass() class} and {@link #getTagNo() number}.
         */
        public Asn1Encodable GetExplicitBaseObject()
        {
            if (!IsExplicit())
                throw new InvalidOperationException("object implicit - explicit expected.");

            return obj;
        }

        public Asn1TaggedObject GetExplicitBaseTagged()
        {
            if (!IsExplicit())
                throw new InvalidOperationException("object implicit - explicit expected.");

            return CheckedCast(obj.ToAsn1Object());
        }

        public Asn1TaggedObject GetImplicitBaseTagged(int baseTagClass, int baseTagNo)
        {
            if (Asn1Tags.Universal == baseTagClass || (baseTagClass & Asn1Tags.Private) != baseTagClass)
                throw new ArgumentException("invalid base tag class: " + baseTagClass, "baseTagClass");

            switch (explicitness)
            {
            case DeclaredExplicit:
                throw new InvalidOperationException("object explicit - implicit expected.");

            case DeclaredImplicit:
            {
                Asn1TaggedObject declared = CheckedCast(obj.ToAsn1Object());
                return Asn1Utilities.CheckTag(declared, baseTagClass, baseTagNo);
            }

            // Parsed; return a virtual tag (i.e. that couldn't have been present in the encoding)
            default:
                return ReplaceTag(baseTagClass, baseTagNo);
            }
        }

        public Asn1Object GetBaseUniversal(bool declaredExplicit, int tagNo)
        {
            Asn1UniversalType universalType = Asn1UniversalTypes.Get(tagNo);
            if (null == universalType)
                throw new ArgumentException("unsupported UNIVERSAL tag number: " + tagNo, "tagNo");

            return GetBaseUniversal(declaredExplicit, universalType);
        }

        internal Asn1Object GetBaseUniversal(bool declaredExplicit, Asn1UniversalType universalType)
        {
            if (declaredExplicit)
            {
                if (!IsExplicit())
                    throw new InvalidOperationException("object explicit - implicit expected.");

                return universalType.CheckedCast(obj.ToAsn1Object());
            }

            if (DeclaredExplicit == explicitness)
                throw new InvalidOperationException("object explicit - implicit expected.");

            Asn1Object baseObject = obj.ToAsn1Object();
            switch (explicitness)
            {
            case ParsedExplicit:
                return universalType.FromImplicitConstructed(RebuildConstructed(baseObject));
            case ParsedImplicit:
            {
                if (baseObject is Asn1Sequence asn1Sequence)
                    return universalType.FromImplicitConstructed(asn1Sequence);

                return universalType.FromImplicitPrimitive((DerOctetString)baseObject);
            }
            default:
                return universalType.CheckedCast(baseObject);
            }
        }

        public IAsn1Convertible ParseBaseUniversal(bool declaredExplicit, int baseTagNo)
        {
            Asn1Object asn1Object = GetBaseUniversal(declaredExplicit, baseTagNo);

            switch (baseTagNo)
            {
            case Asn1Tags.BitString:
                return ((DerBitString)asn1Object).Parser;
            case Asn1Tags.OctetString:
                return ((Asn1OctetString)asn1Object).Parser;
            case Asn1Tags.Sequence:
                return ((Asn1Sequence)asn1Object).Parser;
            case Asn1Tags.Set:
                return ((Asn1Set)asn1Object).Parser;
            }

            return asn1Object;
        }

        public IAsn1Convertible ParseExplicitBaseObject()
        {
            return GetExplicitBaseObject();
        }

        public Asn1TaggedObjectParser ParseExplicitBaseTagged()
        {
            return GetExplicitBaseTagged();
        }

        public Asn1TaggedObjectParser ParseImplicitBaseTagged(int baseTagClass, int baseTagNo)
        {
            return GetImplicitBaseTagged(baseTagClass, baseTagNo);
        }

		public override string ToString()
		{
            return Asn1Utilities.GetTagText(tagClass, tagNo) + obj;
		}

        internal abstract string Asn1Encoding { get; }

        internal abstract Asn1Sequence RebuildConstructed(Asn1Object asn1Object);

        internal abstract Asn1TaggedObject ReplaceTag(int tagClass, int tagNo);

        internal static Asn1Object CreateConstructedDL(int tagClass, int tagNo, Asn1EncodableVector contentsElements)
        {
            bool maybeExplicit = (contentsElements.Count == 1);

            return maybeExplicit
                ? new DLTaggedObject(ParsedExplicit, tagClass, tagNo, contentsElements[0])
                : new DLTaggedObject(ParsedImplicit, tagClass, tagNo, DLSequence.FromVector(contentsElements));
        }

        internal static Asn1Object CreateConstructedIL(int tagClass, int tagNo, Asn1EncodableVector contentsElements)
        {
            bool maybeExplicit = (contentsElements.Count == 1);

            return maybeExplicit
                ? new BerTaggedObject(ParsedExplicit, tagClass, tagNo, contentsElements[0])
                : new BerTaggedObject(ParsedImplicit, tagClass, tagNo, BerSequence.FromVector(contentsElements));
        }

        internal static Asn1Object CreatePrimitive(int tagClass, int tagNo, byte[] contentsOctets)
        {
            // Note: !CONSTRUCTED => IMPLICIT
            return new DLTaggedObject(ParsedImplicit, tagClass, tagNo, new DerOctetString(contentsOctets));
        }

        private static Asn1TaggedObject CheckedCast(Asn1Object asn1Object)
        {
            Asn1TaggedObject taggedObject = asn1Object as Asn1TaggedObject;
            if (null != taggedObject)
                return taggedObject;

            throw new InvalidOperationException("unexpected object: " + Platform.GetTypeName(asn1Object));
        }
    }
}
