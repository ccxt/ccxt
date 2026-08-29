using System;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
    public abstract class Asn1Utilities
    {
        internal static Asn1TaggedObject CheckTag(Asn1TaggedObject taggedObject, int tagClass, int tagNo)
        {
            if (!taggedObject.HasTag(tagClass, tagNo))
            {
                string expected = GetTagText(tagClass, tagNo);
                string found = GetTagText(taggedObject);
                throw new InvalidOperationException("Expected " + expected + " tag but found " + found);
            }
            return taggedObject;
        }

        internal static Asn1TaggedObjectParser CheckTag(Asn1TaggedObjectParser taggedObjectParser, int tagClass,
            int tagNo)
        {
            if (!taggedObjectParser.HasTag(tagClass, tagNo))
            {
                string expected = GetTagText(tagClass, tagNo);
                string found = GetTagText(taggedObjectParser);
                throw new InvalidOperationException("Expected " + expected + " tag but found " + found);
            }
            return taggedObjectParser;
        }


        internal static string GetTagText(Asn1Tag tag)
        {
            return GetTagText(tag.TagClass, tag.TagNo);
        }

        public static string GetTagText(Asn1TaggedObject taggedObject)
        {
            return GetTagText(taggedObject.TagClass, taggedObject.TagNo);
        }

        public static string GetTagText(Asn1TaggedObjectParser taggedObjectParser)
        {
            return GetTagText(taggedObjectParser.TagClass, taggedObjectParser.TagNo);
        }

        public static string GetTagText(int tagClass, int tagNo)
        {
            switch (tagClass)
            {
            case Asn1Tags.Application:
                return "[APPLICATION " + tagNo + "]";
            case Asn1Tags.ContextSpecific:
                return "[CONTEXT " + tagNo + "]";
            case Asn1Tags.Private:
                return "[PRIVATE " + tagNo + "]";
            default:
                return "[UNIVERSAL " + tagNo + "]";
            }
        }


        /*
         * Wrappers for Asn1TaggedObject.GetExplicitBaseObject
         */

        public static Asn1Encodable GetExplicitBaseObject(Asn1TaggedObject taggedObject, int tagClass, int tagNo)
        {
            return CheckTag(taggedObject, tagClass, tagNo).GetExplicitBaseObject();
        }

        public static Asn1Encodable GetExplicitContextBaseObject(Asn1TaggedObject taggedObject, int tagNo)
        {
            return GetExplicitBaseObject(taggedObject, Asn1Tags.ContextSpecific, tagNo);
        }

        public static Asn1Encodable TryGetExplicitBaseObject(Asn1TaggedObject taggedObject, int tagClass, int tagNo)
        {
            if (!taggedObject.HasTag(tagClass, tagNo))
                return null;

            return taggedObject.GetExplicitBaseObject();
        }

        public static Asn1Encodable TryGetExplicitContextBaseObject(Asn1TaggedObject taggedObject, int tagNo)
        {
            return TryGetExplicitBaseObject(taggedObject, Asn1Tags.ContextSpecific, tagNo);
        }


        /*
         * Wrappers for Asn1TaggedObject.GetExplicitBaseTagged
         */

        public static Asn1TaggedObject GetExplicitBaseTagged(Asn1TaggedObject taggedObject, int tagClass, int tagNo)
        {
            return CheckTag(taggedObject, tagClass, tagNo).GetExplicitBaseTagged();
        }

        public static Asn1TaggedObject GetExplicitContextBaseTagged(Asn1TaggedObject taggedObject, int tagNo)
        {
            return GetExplicitBaseTagged(taggedObject, Asn1Tags.ContextSpecific, tagNo);
        }

        public static Asn1TaggedObject TryGetExplicitBaseTagged(Asn1TaggedObject taggedObject, int tagClass, int tagNo)
        {
            if (!taggedObject.HasTag(tagClass, tagNo))
                return null;

            return taggedObject.GetExplicitBaseTagged();
        }

        public static Asn1TaggedObject TryGetExplicitContextBaseTagged(Asn1TaggedObject taggedObject, int tagNo)
        {
            return TryGetExplicitBaseTagged(taggedObject, Asn1Tags.ContextSpecific, tagNo);
        }


        /*
         * Wrappers for Asn1TaggedObject.GetImplicitBaseTagged
         */

        public static Asn1TaggedObject GetImplicitBaseTagged(Asn1TaggedObject taggedObject, int tagClass, int tagNo,
            int baseTagClass, int baseTagNo)
        {
            return CheckTag(taggedObject, tagClass, tagNo).GetImplicitBaseTagged(baseTagClass, baseTagNo);
        }

        public static Asn1TaggedObject GetImplicitContextBaseTagged(Asn1TaggedObject taggedObject, int tagNo,
            int baseTagClass, int baseTagNo)
        {
            return GetImplicitBaseTagged(taggedObject, Asn1Tags.ContextSpecific, tagNo, baseTagClass, baseTagNo);
        }

        public static Asn1TaggedObject TryGetImplicitBaseTagged(Asn1TaggedObject taggedObject, int tagClass, int tagNo,
            int baseTagClass, int baseTagNo)
        {
            if (!taggedObject.HasTag(tagClass, tagNo))
                return null;

            return taggedObject.GetImplicitBaseTagged(baseTagClass, baseTagNo);
        }

        public static Asn1TaggedObject TryGetImplicitContextBaseTagged(Asn1TaggedObject taggedObject, int tagNo,
            int baseTagClass, int baseTagNo)
        {
            return TryGetImplicitBaseTagged(taggedObject, Asn1Tags.ContextSpecific, tagNo, baseTagClass, baseTagNo);
        }


        /*
         * Wrappers for Asn1TaggedObject.GetBaseUniversal
         */

        public static Asn1Object GetBaseUniversal(Asn1TaggedObject taggedObject, int tagClass, int tagNo,
            bool declaredExplicit, int baseTagNo)
        {
            return CheckTag(taggedObject, tagClass, tagNo).GetBaseUniversal(declaredExplicit, baseTagNo);
        }

        public static Asn1Object GetContextBaseUniversal(Asn1TaggedObject taggedObject, int tagNo,
            bool declaredExplicit, int baseTagNo)
        {
            return GetBaseUniversal(taggedObject, Asn1Tags.ContextSpecific, tagNo, declaredExplicit, baseTagNo);
        }

        public static Asn1Object TryGetBaseUniversal(Asn1TaggedObject taggedObject, int tagClass, int tagNo,
            bool declaredExplicit, int baseTagNo)
        {
            if (!taggedObject.HasTag(tagClass, tagNo))
                return null;

            return taggedObject.GetBaseUniversal(declaredExplicit, baseTagNo);
        }

        public static Asn1Object TryGetContextBaseUniversal(Asn1TaggedObject taggedObject, int tagNo,
            bool declaredExplicit, int baseTagNo)
        {
            return TryGetBaseUniversal(taggedObject, Asn1Tags.ContextSpecific, tagNo, declaredExplicit, baseTagNo);
        }


        /*
         * Wrappers for Asn1TaggedObjectParser.ParseExplicitBaseTagged
         */

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser ParseExplicitBaseTagged(Asn1TaggedObjectParser taggedObjectParser,
            int tagClass, int tagNo)
        {
            return CheckTag(taggedObjectParser, tagClass, tagNo).ParseExplicitBaseTagged();
        }

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser ParseExplicitContextBaseTagged(Asn1TaggedObjectParser taggedObjectParser,
            int tagNo)
        {
            return ParseExplicitBaseTagged(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo);
        }

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser TryParseExplicitBaseTagged(Asn1TaggedObjectParser taggedObjectParser,
            int tagClass, int tagNo)
        {
            if (!taggedObjectParser.HasTag(tagClass, tagNo))
                return null;

            return taggedObjectParser.ParseExplicitBaseTagged();
        }

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser TryParseExplicitContextBaseTagged(
            Asn1TaggedObjectParser taggedObjectParser, int tagNo)
        {
            return TryParseExplicitBaseTagged(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo);
        }


        /*
         * Wrappers for Asn1TaggedObjectParser.ParseImplicitBaseTagged
         */

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser ParseImplicitBaseTagged(Asn1TaggedObjectParser taggedObjectParser,
            int tagClass, int tagNo, int baseTagClass, int baseTagNo)
        {
            return CheckTag(taggedObjectParser, tagClass, tagNo).ParseImplicitBaseTagged(baseTagClass, baseTagNo);
        }

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser ParseImplicitContextBaseTagged(Asn1TaggedObjectParser taggedObjectParser,
            int tagNo, int baseTagClass, int baseTagNo)
        {
            return ParseImplicitBaseTagged(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo, baseTagClass,
                baseTagNo);
        }

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser TryParseImplicitBaseTagged(Asn1TaggedObjectParser taggedObjectParser,
            int tagClass, int tagNo, int baseTagClass, int baseTagNo)
        {
            if (!taggedObjectParser.HasTag(tagClass, tagNo))
                return null;

            return taggedObjectParser.ParseImplicitBaseTagged(baseTagClass, baseTagNo);
        }

        /// <exception cref="IOException"/>
        public static Asn1TaggedObjectParser TryParseImplicitContextBaseTagged(
            Asn1TaggedObjectParser taggedObjectParser, int tagNo, int baseTagClass, int baseTagNo)
        {
            return TryParseImplicitBaseTagged(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo, baseTagClass,
                baseTagNo);
        }


        /*
         * Wrappers for Asn1TaggedObjectParser.ParseBaseUniversal
         */

        /// <exception cref="IOException"/>
        public static IAsn1Convertible ParseBaseUniversal(Asn1TaggedObjectParser taggedObjectParser, int tagClass,
            int tagNo, bool declaredExplicit, int baseTagNo)
        {
            return CheckTag(taggedObjectParser, tagClass, tagNo).ParseBaseUniversal(declaredExplicit, baseTagNo);
        }

        /// <exception cref="IOException"/>
        public static IAsn1Convertible ParseContextBaseUniversal(Asn1TaggedObjectParser taggedObjectParser, int tagNo,
            bool declaredExplicit, int baseTagNo)
        {
            return ParseBaseUniversal(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo, declaredExplicit, baseTagNo);
        }

        /// <exception cref="IOException"/>
        public static IAsn1Convertible TryParseBaseUniversal(Asn1TaggedObjectParser taggedObjectParser, int tagClass,
            int tagNo, bool declaredExplicit, int baseTagNo)
        {
            if (!taggedObjectParser.HasTag(tagClass, tagNo))
                return null;

            return taggedObjectParser.ParseBaseUniversal(declaredExplicit, baseTagNo);
        }

        /// <exception cref="IOException"/>
        public static IAsn1Convertible TryParseContextBaseUniversal(Asn1TaggedObjectParser taggedObjectParser,
            int tagNo, bool declaredExplicit, int baseTagNo)
        {
            return TryParseBaseUniversal(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo, declaredExplicit,
                baseTagNo);
        }


        /*
         * Wrappers for Asn1TaggedObjectParser.ParseExplicitBaseObject
         */

        /// <exception cref="IOException"/>
        public static IAsn1Convertible ParseExplicitBaseObject(Asn1TaggedObjectParser taggedObjectParser, int tagClass,
            int tagNo)
        {
            return CheckTag(taggedObjectParser, tagClass, tagNo).ParseExplicitBaseObject();
        }

        /// <exception cref="IOException"/>
        public static IAsn1Convertible ParseExplicitContextBaseObject(Asn1TaggedObjectParser taggedObjectParser,
            int tagNo)
        {
            return ParseExplicitBaseObject(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo);
        }

        /// <exception cref="IOException"/>
        public static IAsn1Convertible TryParseExplicitBaseObject(Asn1TaggedObjectParser taggedObjectParser,
            int tagClass, int tagNo)
        {
            if (!taggedObjectParser.HasTag(tagClass, tagNo))
                return null;

            return taggedObjectParser.ParseExplicitBaseObject();
        }

        /// <exception cref="IOException"/>
        public static IAsn1Convertible TryParseExplicitContextBaseObject(Asn1TaggedObjectParser taggedObjectParser,
            int tagNo)
        {
            return TryParseExplicitBaseObject(taggedObjectParser, Asn1Tags.ContextSpecific, tagNo);
        }
    }
}
