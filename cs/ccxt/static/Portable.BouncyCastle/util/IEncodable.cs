using System.IO;

namespace Org.BouncyCastle.Utilities
{
    public interface IEncodable
    {
        /// <summary>Return a byte array representing the implementing object.</summary>
        /// <returns>An encoding of this object as a byte array.</returns>
        /// <exception cref="IOException"/>
        byte[] GetEncoded();
    }
}
