using System;

namespace Org.BouncyCastle.Crypto
{
    /// <summary>
    /// A cipher builder that can also return the key it was initialized with.
    /// </summary>
    public interface ICipherBuilderWithKey
        : ICipherBuilder
    {
        /// <summary>
        /// Return the key we were initialized with.
        /// </summary>
        ICipherParameters Key { get; }
    }
}
