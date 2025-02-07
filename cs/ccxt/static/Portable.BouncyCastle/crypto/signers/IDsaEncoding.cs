using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Signers
{
    /// <summary>
    /// An interface for different encoding formats for DSA signatures.
    /// </summary>
    public interface IDsaEncoding
    {
        /// <summary>Decode the (r, s) pair of a DSA signature.</summary>
        /// <param name="n">The order of the group that r, s belong to.</param>
        /// <param name="encoding">An encoding of the (r, s) pair of a DSA signature.</param>
        /// <returns>The (r, s) of a DSA signature, stored in an array of exactly two elements, r followed by s.</returns>
        BigInteger[] Decode(BigInteger n, byte[] encoding);

        /// <summary>Encode the (r, s) pair of a DSA signature.</summary>
        /// <param name="n">The order of the group that r, s belong to.</param>
        /// <param name="r">The r value of a DSA signature.</param>
        /// <param name="s">The s value of a DSA signature.</param>
        /// <returns>An encoding of the DSA signature given by the provided (r, s) pair.</returns>
        byte[] Encode(BigInteger n, BigInteger r, BigInteger s);
    }
}
