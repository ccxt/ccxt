using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Utilities.Collections
{
    /// <summary>A generic interface describing a simple store of objects.</summary>
    /// <typeparam name="T">The covariant type of stored objects.</typeparam>
    public interface IStore<out T>
    {
        /// <summary>Enumerate the (possibly empty) collection of objects matched by the given selector.</summary>
        /// <param name="selector">The <see cref="ISelector{T}"/> used to select matching objects.</param>
        /// <returns>An <see cref="IEnumerable{T}"/> of the matching objects.</returns>
        IEnumerable<T> EnumerateMatches(ISelector<T> selector);
    }
}
