using System;

namespace Org.BouncyCastle.Crypto
{
/**
 * Base interface for mapping from an alphabet to a set of indexes
 * suitable for use with FPE.
 */
public interface IAlphabetMapper
{
    /// <summary>
    /// Return the number of characters in the alphabet.
    /// </summary>
    /// <returns>the radix for the alphabet.</returns>
    int Radix { get; }

    /// <summary>
    /// Return the passed in char[] as a byte array of indexes (indexes
    /// can be more than 1 byte)
    /// </summary>
    /// <returns>an index array.</returns>
    /// <param name="input">characters to be mapped.</param>   
    byte[] ConvertToIndexes(char[] input);

    /// <summary>
    /// Return a char[] for this alphabet based on the indexes passed.
    /// </summary>
    /// <returns>an array of char corresponding to the index values.</returns>
    /// <param name="input">input array of indexes.</param>   
    char[] ConvertToChars(byte[] input);
}
}
