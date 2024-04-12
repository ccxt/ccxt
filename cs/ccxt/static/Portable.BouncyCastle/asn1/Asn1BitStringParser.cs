using System;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
    public interface Asn1BitStringParser
        : IAsn1Convertible
    {
        /// <summary>Return a <see cref="Stream"/> representing the contents of the BIT STRING. The final byte, if any,
        /// may include pad bits. See <see cref="PadBits"/>.</summary>
        /// <returns>A <see cref="Stream"/> with its source as the BIT STRING content.</returns>
        /// <exception cref="IOException"/>
        Stream GetBitStream();

        /// <summary>Return a <see cref="Stream"/> representing the contents of the BIT STRING, where the content is
        /// expected to be octet-aligned (this will be automatically checked during parsing).</summary>
        /// <returns>A <see cref="Stream"/> with its source as the BIT STRING content.</returns>
        /// <exception cref="IOException"/>
        Stream GetOctetStream();

        /// <summary>Return the number of pad bits, if any, in the final byte, if any, read from
        /// <see cref="GetBitStream"/>.</summary>
        /// <remarks>
        /// This number is in the range zero to seven. That number of the least significant bits of the final byte, if
        /// any, are not part of the contents and should be ignored. NOTE: Must be called AFTER the stream has been
        /// fully processed. (Does not need to be called if <see cref="GetOctetStream"/> was used instead of
        /// <see cref="GetBitStream"/>.
        /// </remarks>
        /// <returns>The number of pad bits. In the range zero to seven.</returns>
        int PadBits { get; }
    }
}
