using System;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
	public interface Asn1TaggedObjectParser
		: IAsn1Convertible
	{
        int TagClass { get; }

		int TagNo { get; }

        bool HasContextTag(int tagNo);

        bool HasTag(int tagClass, int tagNo);

        /// <exception cref="IOException"/>
        IAsn1Convertible ParseBaseUniversal(bool declaredExplicit, int baseTagNo);

        /// <summary>Needed for open types, until we have better type-guided parsing support.</summary>
        /// <remarks>
        /// Use sparingly for other purposes, and prefer <see cref="ParseExplicitBaseTagged"/> or
        /// <see cref="ParseBaseUniversal(bool, int)"/> where possible. Before using, check for matching tag
        /// <see cref="TagClass">class</see> and <see cref="TagNo">number</see>.
        /// </remarks>
        /// <exception cref="IOException"/>
        IAsn1Convertible ParseExplicitBaseObject();

        /// <exception cref="IOException"/>
        Asn1TaggedObjectParser ParseExplicitBaseTagged();

        /// <exception cref="IOException"/>
        Asn1TaggedObjectParser ParseImplicitBaseTagged(int baseTagClass, int baseTagNo);
    }
}
